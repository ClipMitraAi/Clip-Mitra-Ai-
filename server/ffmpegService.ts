import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Clip, ClipEditorConfig, VideoTranscriptWord } from './types.ts';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
}

export class FFmpegService {
  private ffmpegPath: string;
  private ffprobePath: string;

  constructor() {
    this.ffmpegPath = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
    this.ffprobePath = '/usr/bin/ffprobe';
  }

  /**
   * Probe video file duration, dimensions and fps
   */
  public async probeVideo(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,r_frame_rate,duration:format=duration',
        '-of', 'json',
        filePath
      ];

      const proc = spawn(this.ffprobePath, args);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', chunk => stdout += chunk);
      proc.stderr.on('data', chunk => stderr += chunk);

      proc.on('close', code => {
        if (code !== 0) {
          return reject(new Error(`ffprobe failed (${code}): ${stderr}`));
        }
        try {
          const data = JSON.parse(stdout);
          const stream = data.streams?.[0] || {};
          const duration = parseFloat(stream.duration || data.format?.duration || '30');
          const width = parseInt(stream.width || '1280', 10);
          const height = parseInt(stream.height || '720', 10);
          
          let fps = 30;
          if (stream.r_frame_rate) {
            const parts = stream.r_frame_rate.split('/');
            if (parts.length === 2 && parseInt(parts[1], 10) > 0) {
              fps = Math.round(parseInt(parts[0], 10) / parseInt(parts[1], 10));
            }
          }

          resolve({ duration, width, height, fps });
        } catch (e) {
          reject(e);
        }
      });

      proc.on('error', err => reject(err));
    });
  }

  /**
   * Render a vertical clip using FFmpeg
   */
  public async renderClip(
    inputPath: string,
    clip: Clip,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const storageDir = path.resolve(process.cwd(), 'data', 'storage');
    const tempDir = path.resolve(process.cwd(), 'data', 'temp');
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const outputPath = path.join(storageDir, `rendered_${clip.id}.mp4`);
    const duration = Math.max(1, clip.endTime - clip.startTime);
    const config = clip.editorConfig;

    // Target dimensions
    let targetW = 1080;
    let targetH = 1920;
    if (config.targetResolution === '720p') {
      targetW = 720;
      targetH = 1280;
    } else if (config.targetResolution === '2k') {
      targetW = 1440;
      targetH = 2560;
    } else if (config.targetResolution === '4k') {
      targetW = 2160;
      targetH = 3840;
    }

    // Build filter complex
    const filterParts: string[] = [];
    let currentVStream = 'v0';

    // 1. Framing mode
    if (config.framingMode === 'crop_center') {
      // Center crop to 9:16
      filterParts.push(
        `[0:v]crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=${targetW}:${targetH}:flags=lanczos[${currentVStream}]`
      );
    } else if (config.framingMode === 'fit_with_bars') {
      // Fit video with top/bottom black bars
      filterParts.push(
        `[0:v]scale=${targetW}:-1,pad=${targetW}:${targetH}:0:(${targetH}-ih)/2:black[${currentVStream}]`
      );
    } else {
      // Default: Blur background with sharp centered video
      filterParts.push(
        `[0:v]scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH},boxblur=25:5[bg];` +
        `[0:v]scale=${targetW}:-1:force_original_aspect_ratio=decrease[fg];` +
        `[bg][fg]overlay=(W-w)/2:(H-h)/2[${currentVStream}]`
      );
    }

    // 2. Hook overlay banner
    if (config.hookOverlay.enabled && config.hookOverlay.text) {
      const nextVStream = 'v_hook';
      const cleanText = config.hookOverlay.text.replace(/[:\\']/g, ' ');
      const sub = config.hookOverlay.subText ? config.hookOverlay.subText.replace(/[:\\']/g, ' ') : '';
      const posY = config.hookOverlay.position === 'top' ? Math.round(targetH * 0.12) : Math.round(targetH * 0.45);
      const fontSize = Math.round(config.hookOverlay.fontSize * (targetW / 1080));

      let bannerDraw = `drawtext=text='${cleanText}':fontcolor=white:fontsize=${fontSize}:box=1:boxcolor=red@0.9:boxborderw=14:x=(w-text_w)/2:y=${posY}`;
      if (sub) {
        bannerDraw += `,drawtext=text='${sub}':fontcolor=yellow:fontsize=${Math.round(fontSize * 0.75)}:box=1:boxcolor=black@0.8:boxborderw=8:x=(w-text_w)/2:y=${posY + fontSize + 24}`;
      }

      filterParts.push(`[${currentVStream}]${bannerDraw}[${nextVStream}]`);
      currentVStream = nextVStream;
    }

    // 3. Watermark text overlay
    if (config.watermark.enabled && config.watermark.text) {
      const nextVStream = 'v_wm';
      const cleanWm = config.watermark.text.replace(/[:\\']/g, ' ');
      const wmSize = Math.round(22 * (targetW / 1080));
      let wmCoord = 'x=w-text_w-40:y=80';
      if (config.watermark.position === 'top-left') wmCoord = 'x=40:y=80';
      if (config.watermark.position === 'bottom-left') wmCoord = `x=40:y=${targetH - 120}`;
      if (config.watermark.position === 'bottom-right') wmCoord = `x=w-text_w-40:y=${targetH - 120}`;

      filterParts.push(
        `[${currentVStream}]drawtext=text='${cleanWm}':fontcolor=white@0.85:fontsize=${wmSize}:box=1:boxcolor=black@0.5:boxborderw=6:${wmCoord}[${nextVStream}]`
      );
      currentVStream = nextVStream;
    }

    // 4. Progress bar at bottom
    if (config.progressBar.enabled) {
      const nextVStream = 'v_bar';
      const barH = Math.round(config.progressBar.height * (targetW / 1080));
      const barY = targetH - barH - 10;
      // Animate bar width from 0 to targetW based on (t / duration)
      filterParts.push(
        `[${currentVStream}]drawbox=x=0:y=${barY}:w='min(iw, iw*(t/${duration}))':h=${barH}:color=purple@1:t=fill[${nextVStream}]`
      );
      currentVStream = nextVStream;
    }

    // 5. Subtitles (Burn dynamic text subtitle)
    if (config.subtitles.enabled && clip.transcriptText) {
      const nextVStream = 'v_sub';
      // Pick first 2-3 prominent phrases or summary for the segment
      const cleanTranscript = clip.transcriptText.slice(0, 80).replace(/[:\\']/g, ' ');
      const subY = Math.round(targetH * (config.subtitles.positionY / 100));
      const subSize = Math.round(config.subtitles.fontSize * (targetW / 1080));

      filterParts.push(
        `[${currentVStream}]drawtext=text='${cleanTranscript}':fontcolor=yellow:fontsize=${subSize}:box=1:boxcolor=black@0.75:boxborderw=10:x=(w-text_w)/2:y=${subY}[${nextVStream}]`
      );
      currentVStream = nextVStream;
    }

    // Build audio filter
    const audioFilters: string[] = [];
    if (config.audio.normalizeAudio) {
      audioFilters.push('loudnorm=I=-16:TP=-1.5:LRA=11');
    }
    if (config.audio.originalAudioVolume !== 1.0) {
      audioFilters.push(`volume=${config.audio.originalAudioVolume}`);
    }
    if (config.audio.fadeInOut) {
      audioFilters.push(`afade=t=in:ss=0:d=0.5,afade=t=out:st=${Math.max(0, duration - 0.5)}:d=0.5`);
    }

    // Construct full command args
    const args: string[] = [
      '-y',
      '-ss', clip.startTime.toString(),
      '-t', duration.toString(),
      '-i', inputPath,
      '-filter_complex', filterParts.join(';'),
      '-map', `[${currentVStream}]`,
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '22',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k'
    ];

    if (audioFilters.length > 0) {
      args.push('-af', audioFilters.join(','));
    }

    args.push(outputPath);

    return new Promise((resolve, reject) => {
      console.log(`Starting FFmpeg render for clip ${clip.id}...`);
      const proc = spawn(this.ffmpegPath, args);

      let stderr = '';

      proc.stderr.on('data', chunk => {
        const text = chunk.toString();
        stderr += text;

        // Parse progress from time=00:00:04.50
        const timeMatch = text.match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (timeMatch && onProgress) {
          const hours = parseInt(timeMatch[1], 10);
          const mins = parseInt(timeMatch[2], 10);
          const secs = parseFloat(timeMatch[3]);
          const currentSec = hours * 3600 + mins * 60 + secs;
          const percent = Math.min(99, Math.round((currentSec / duration) * 100));
          onProgress(percent);
        }
      });

      proc.on('close', code => {
        if (code === 0 && fs.existsSync(outputPath)) {
          if (onProgress) onProgress(100);
          resolve(outputPath);
        } else {
          console.error('FFmpeg render error:', stderr.slice(-1000));
          reject(new Error(`FFmpeg failed with code ${code}. Error: ${stderr.slice(-300)}`));
        }
      });

      proc.on('error', err => {
        reject(err);
      });
    });
  }
}

export const ffmpegService = new FFmpegService();
