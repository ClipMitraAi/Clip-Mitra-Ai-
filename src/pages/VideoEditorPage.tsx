import React, { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Youtube,
  Eye,
  EyeOff,
  Sliders,
  Type,
  Palette,
  Layers,
  Check,
  AlertCircle,
  Loader2,
  Music,
  Shield,
  HelpCircle,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { api } from '../api.ts';
import { Clip, ClipEditorConfig, FramingMode, AppView, SourceProject } from '../types.ts';

interface VideoEditorPageProps {
  clip: Clip | null;
  onUpdateClip: (clip: Clip) => void;
  setCurrentView: (view: AppView) => void;
}

export const VideoEditorPage: React.FC<VideoEditorPageProps> = ({
  clip,
  onUpdateClip,
  setCurrentView
}) => {
  if (!clip) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Scissors className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Clip Selected</h3>
        <p className="text-xs text-slate-400">
          Please select or generate a clip from the library or dashboard to open the 9:16 Vertical Video Editor.
        </p>
        <button
          onClick={() => setCurrentView('create_clips')}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold text-white"
        >
          Generate Clips Now
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'framing' | 'subtitles' | 'hook' | 'audio_wm'>('subtitles');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(clip.startTime);
  const [isRendering, setIsRendering] = useState(clip.renderStatus === 'rendering');
  const [renderProgress, setRenderProgress] = useState(clip.renderProgress || 0);
  const [renderError, setRenderError] = useState<string | null>(clip.renderError || null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Local editor state synchronized with clip
  const [editorConfig, setEditorConfig] = useState<ClipEditorConfig>(clip.editorConfig);
  const [startTime, setStartTime] = useState(clip.startTime);
  const [endTime, setEndTime] = useState(clip.endTime);
  const duration = Math.max(1, Math.round(endTime - startTime));

  // Video source resolution check
  const sourceQualityWarning = editorConfig.targetResolution === '4k' || editorConfig.targetResolution === '2k';

  // Keep video looped within startTime and endTime
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (time >= endTime) {
      videoRef.current.currentTime = startTime;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play().catch(e => console.warn(e));
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Sync state changes back to parent & backend
  const updateConfig = (newConfig: Partial<ClipEditorConfig>) => {
    const updated = { ...editorConfig, ...newConfig };
    setEditorConfig(updated);
    api.updateClip(clip.id, { editorConfig: updated }).then(res => {
      if (res.clip) onUpdateClip(res.clip);
    });
  };

  const handleSaveTimes = (newStart: number, newEnd: number) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    api.updateClip(clip.id, {
      startTime: newStart,
      endTime: newEnd,
      duration: Math.round(newEnd - newStart)
    }).then(res => {
      if (res.clip) onUpdateClip(res.clip);
    });
  };

  // Start Real FFmpeg Render
  const handleStartRender = async () => {
    setIsRendering(true);
    setRenderProgress(5);
    setRenderError(null);

    try {
      const res = await api.startRender(clip.id);
      if (res.job?.jobId) {
        setActiveJobId(res.job.jobId);
      }
    } catch (err: any) {
      setIsRendering(false);
      setRenderError(err.message || 'Render failed to start');
    }
  };

  // Poll progress if job is active
  useEffect(() => {
    if (!activeJobId || !isRendering) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getRenderStatus(activeJobId);
        if (res.job) {
          setRenderProgress(res.job.progress);
          if (res.job.status === 'completed') {
            setIsRendering(false);
            setRenderProgress(100);
            clearInterval(interval);
            // Refresh clip
            const updated = await api.getClip(clip.id);
            if (updated.clip) onUpdateClip(updated.clip);
          } else if (res.job.status === 'failed') {
            setIsRendering(false);
            setRenderError(res.job.error || 'FFmpeg render error');
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.warn('Poll status error:', e);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeJobId, isRendering]);

  // Video source path
  const videoSrc = clip.outputVideoPath && clip.renderStatus === 'ready'
    ? clip.outputVideoPath
    : '/samples/podcast_sample.mp4';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-purple-400 mb-1">
            <Scissors className="h-3.5 w-3.5" />
            <span>9:16 Vertical Video Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">{clip.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Duration: <span className="text-slate-200 font-mono font-bold">{duration}s</span> ({startTime}s - {endTime}s) • Aspect Ratio: 9:16 Vertical Short
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Render with FFmpeg Button */}
          <button
            onClick={handleStartRender}
            disabled={isRendering}
            className="flex items-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all"
          >
            {isRendering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Encoding FFmpeg ({renderProgress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{clip.renderStatus === 'ready' ? 'Re-Render MP4' : 'Render 9:16 with FFmpeg'}</span>
              </>
            )}
          </button>

          {/* Download button */}
          {clip.renderStatus === 'ready' && (
            <a
              href={`/api/render/download/${clip.id}`}
              download
              className="flex items-center space-x-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Download MP4</span>
            </a>
          )}

          {/* Proceed to SEO */}
          <button
            onClick={() => setCurrentView('ai_metadata')}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-4 py-2 text-xs font-bold text-white shadow transition-all"
          >
            <Youtube className="h-3.5 w-3.5" />
            <span>SEO & Publish</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 9:16 Canvas & Player (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[320px] rounded-3xl border-4 border-slate-800 bg-black overflow-hidden shadow-2xl relative select-none">
            {/* Phone Top Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
            </div>

            {/* 9:16 Ratio Container */}
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
              {/* Blur Background Layer */}
              {editorConfig.framingMode === 'blur_background' && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <video
                    src={videoSrc}
                    className="w-full h-full object-cover filter blur-xl scale-125 opacity-50"
                    muted
                    loop
                  />
                </div>
              )}

              {/* Main Video Element */}
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                className={`z-10 cursor-pointer ${
                  editorConfig.framingMode === 'crop_center'
                    ? 'w-full h-full object-cover'
                    : editorConfig.framingMode === 'fit_with_bars'
                    ? 'w-full object-contain'
                    : 'w-full shadow-2xl'
                }`}
                playsInline
              />

              {/* Top Hook Banner Overlay */}
              {editorConfig.hookOverlay.enabled && editorConfig.hookOverlay.text && (
                <div
                  className={`absolute z-20 left-4 right-4 text-center px-3 py-1.5 rounded-lg shadow-xl font-black uppercase tracking-wide leading-tight transition-all`}
                  style={{
                    top: editorConfig.hookOverlay.position === 'top' ? '12%' : '42%',
                    backgroundColor: editorConfig.hookOverlay.backgroundColor || '#DC2626',
                    color: editorConfig.hookOverlay.textColor || '#FFFFFF',
                    fontSize: `${editorConfig.hookOverlay.fontSize * 0.75}px`
                  }}
                >
                  <div>{editorConfig.hookOverlay.text}</div>
                  {editorConfig.hookOverlay.subText && (
                    <div className="text-[10px] opacity-90 mt-0.5 font-semibold text-yellow-300">
                      {editorConfig.hookOverlay.subText}
                    </div>
                  )}
                </div>
              )}

              {/* Watermark Overlay */}
              {editorConfig.watermark.enabled && editorConfig.watermark.text && (
                <div
                  className={`absolute z-20 px-2 py-0.5 rounded text-[10px] font-bold text-white bg-black/60 border border-slate-700/60 shadow`}
                  style={{
                    top: editorConfig.watermark.position.includes('top') ? '7%' : undefined,
                    bottom: editorConfig.watermark.position.includes('bottom') ? '16%' : undefined,
                    left: editorConfig.watermark.position.includes('left') ? '4%' : undefined,
                    right: editorConfig.watermark.position.includes('right') ? '4%' : undefined,
                    opacity: editorConfig.watermark.opacity
                  }}
                >
                  {editorConfig.watermark.text}
                </div>
              )}

              {/* Subtitles Overlay (Dynamic Animated Karaoke) */}
              {editorConfig.subtitles.enabled && clip.transcriptText && (
                <div
                  className="absolute z-20 inset-x-3 text-center pointer-events-none transition-all px-2"
                  style={{ top: `${editorConfig.subtitles.positionY}%` }}
                >
                  <div
                    className={`inline-block px-3 py-1.5 rounded-lg font-black leading-tight ${
                      editorConfig.subtitles.fontFamily === 'Anton'
                        ? 'font-anton'
                        : editorConfig.subtitles.fontFamily === 'Bebas Neue'
                        ? 'font-bebas'
                        : editorConfig.subtitles.fontFamily === 'Bangers'
                        ? 'font-bangers'
                        : 'font-montserrat'
                    }`}
                    style={{
                      backgroundColor: editorConfig.subtitles.hasBackgroundPill
                        ? editorConfig.subtitles.backgroundColor
                        : 'transparent',
                      color: editorConfig.subtitles.textColor,
                      fontSize: `${Math.round(editorConfig.subtitles.fontSize * 0.55)}px`,
                      textShadow: `0 2px 8px ${editorConfig.subtitles.strokeColor}`,
                      textTransform: editorConfig.subtitles.textTransform
                    }}
                  >
                    <span>
                      {clip.transcriptText.slice(0, 55)}
                    </span>
                    <span
                      className="ml-1.5 animate-pop-word font-black"
                      style={{ color: editorConfig.subtitles.highlightColor }}
                    >
                      🔥 VIRAL
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Bar Overlay */}
              {editorConfig.progressBar.enabled && (
                <div
                  className="absolute z-20 inset-x-0 bottom-0 bg-slate-900/60 overflow-hidden"
                  style={{ height: `${editorConfig.progressBar.height}px` }}
                >
                  <div
                    className="h-full transition-all duration-100"
                    style={{
                      width: `${Math.min(100, ((currentTime - startTime) / duration) * 100)}%`,
                      backgroundColor: editorConfig.progressBar.color
                    }}
                  />
                </div>
              )}

              {/* YouTube Shorts Safe Zones Overlay Guide */}
              {editorConfig.showSafeZones && (
                <div className="absolute inset-0 z-25 pointer-events-none border border-cyan-500/30">
                  {/* Top Safe Area indicator */}
                  <div className="absolute top-0 inset-x-0 h-14 bg-cyan-500/10 border-b border-dashed border-cyan-400/40 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-cyan-300">SHORTS TOP HEADER ZONE</span>
                  </div>

                  {/* Right Action Buttons Safe Area (Like, Comment, Share, Sound) */}
                  <div className="absolute right-0 top-1/3 bottom-14 w-14 bg-cyan-500/10 border-l border-dashed border-cyan-400/40 flex flex-col items-center justify-center space-y-3 py-2">
                    <div className="h-6 w-6 rounded-full bg-cyan-500/30 text-[8px] flex items-center justify-center text-cyan-200">Like</div>
                    <div className="h-6 w-6 rounded-full bg-cyan-500/30 text-[8px] flex items-center justify-center text-cyan-200">Chat</div>
                    <div className="h-6 w-6 rounded-full bg-cyan-500/30 text-[8px] flex items-center justify-center text-cyan-200">Share</div>
                  </div>

                  {/* Bottom Channel Title & Audio Zone */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-cyan-500/10 border-t border-dashed border-cyan-400/40 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-cyan-300">TITLE & AUDIO DISC ZONE</span>
                  </div>
                </div>
              )}

              {/* Play / Pause Center Flash Icon */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute z-30 h-12 w-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                >
                  <Play className="h-6 w-6 fill-white ml-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* Player Mini Controls */}
          <div className="w-full max-w-[320px] mt-3 flex items-center justify-between text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <button onClick={togglePlay} className="hover:text-white">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <span className="font-mono text-[11px]">
              {currentTime.toFixed(1)}s / {endTime}s
            </span>
            <button onClick={() => seekTo(startTime)} className="hover:text-white" title="Restart Loop">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => updateConfig({ showSafeZones: !editorConfig.showSafeZones })}
              className={`flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded ${
                editorConfig.showSafeZones ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              <Shield className="h-3 w-3" />
              <span>Safe Zones</span>
            </button>
          </div>
        </div>

        {/* Right Column: Editor Controls & Tabs (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-6">
          {/* Timeline Trimmer */}
          <div className="space-y-2 rounded-xl bg-slate-900/80 border border-slate-800 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Scissors className="h-3.5 w-3.5 text-purple-400" />
                <span>Video Clip Trimmer</span>
              </span>
              <span className="font-mono text-purple-300 font-bold">
                Length: {duration}s
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Start Time (seconds)</label>
                <input
                  type="number"
                  min="0"
                  max={endTime - 1}
                  value={startTime}
                  onChange={e => handleSaveTimes(Math.max(0, Number(e.target.value)), endTime)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">End Time (seconds)</label>
                <input
                  type="number"
                  min={startTime + 1}
                  value={endTime}
                  onChange={e => handleSaveTimes(startTime, Math.max(startTime + 1, Number(e.target.value)))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Tabbed Control Switcher */}
          <div className="flex border-b border-slate-800 space-x-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('subtitles')}
              className={`pb-2.5 px-3 border-b-2 transition-all ${
                activeTab === 'subtitles'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Captions & Style
            </button>
            <button
              onClick={() => setActiveTab('hook')}
              className={`pb-2.5 px-3 border-b-2 transition-all ${
                activeTab === 'hook'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Hook Banner
            </button>
            <button
              onClick={() => setActiveTab('framing')}
              className={`pb-2.5 px-3 border-b-2 transition-all ${
                activeTab === 'framing'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              9:16 Framing & Resolution
            </button>
            <button
              onClick={() => setActiveTab('audio_wm')}
              className={`pb-2.5 px-3 border-b-2 transition-all ${
                activeTab === 'audio_wm'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Audio & Branding
            </button>
          </div>

          {/* Subtitles Tab */}
          {activeTab === 'subtitles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center space-x-2">
                  <Type className="h-4 w-4 text-purple-400" />
                  <span>Burn Dynamic Animated Captions</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorConfig.subtitles.enabled}
                  onChange={e =>
                    updateConfig({
                      subtitles: { ...editorConfig.subtitles, enabled: e.target.checked }
                    })
                  }
                  className="h-4 w-4 rounded accent-purple-600"
                />
              </div>

              {editorConfig.subtitles.enabled && (
                <div className="space-y-4 pt-2">
                  {/* Font Family */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Font Family</label>
                      <select
                        value={editorConfig.subtitles.fontFamily}
                        onChange={e =>
                          updateConfig({
                            subtitles: { ...editorConfig.subtitles, fontFamily: e.target.value }
                          })
                        }
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                      >
                        <option value="Montserrat">Montserrat (Modern Bold)</option>
                        <option value="Anton">Anton (Viral Impact)</option>
                        <option value="Bebas Neue">Bebas Neue (Tall Clean)</option>
                        <option value="Bangers">Bangers (Comic / Punchy)</option>
                        <option value="Inter">Inter (Minimalist)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Font Size: {editorConfig.subtitles.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="52"
                        value={editorConfig.subtitles.fontSize}
                        onChange={e =>
                          updateConfig({
                            subtitles: { ...editorConfig.subtitles, fontSize: Number(e.target.value) }
                          })
                        }
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Text Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={editorConfig.subtitles.textColor}
                          onChange={e =>
                            updateConfig({
                              subtitles: { ...editorConfig.subtitles, textColor: e.target.value }
                            })
                          }
                          className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-slate-400">{editorConfig.subtitles.textColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Highlight Word</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={editorConfig.subtitles.highlightColor}
                          onChange={e =>
                            updateConfig({
                              subtitles: { ...editorConfig.subtitles, highlightColor: e.target.value }
                            })
                          }
                          className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-yellow-400">{editorConfig.subtitles.highlightColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Box Pill Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={editorConfig.subtitles.backgroundColor}
                          onChange={e =>
                            updateConfig({
                              subtitles: { ...editorConfig.subtitles, backgroundColor: e.target.value }
                            })
                          }
                          className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-slate-400">{editorConfig.subtitles.backgroundColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Position Slider */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Vertical Position: {editorConfig.subtitles.positionY}% from top
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="85"
                      value={editorConfig.subtitles.positionY}
                      onChange={e =>
                        updateConfig({
                          subtitles: { ...editorConfig.subtitles, positionY: Number(e.target.value) }
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Upper Third (30%)</span>
                      <span>Middle (50%)</span>
                      <span>Lower Third Safe (72%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hook Banner Tab */}
          {activeTab === 'hook' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-red-500" />
                  <span>Display Opening Hook Banner</span>
                </label>
                <input
                  type="checkbox"
                  checked={editorConfig.hookOverlay.enabled}
                  onChange={e =>
                    updateConfig({
                      hookOverlay: { ...editorConfig.hookOverlay, enabled: e.target.checked }
                    })
                  }
                  className="h-4 w-4 rounded accent-purple-600"
                />
              </div>

              {editorConfig.hookOverlay.enabled && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Hook Headline (First 3-5 seconds attention grabber)
                    </label>
                    <input
                      type="text"
                      value={editorConfig.hookOverlay.text}
                      onChange={e =>
                        updateConfig({
                          hookOverlay: { ...editorConfig.hookOverlay, text: e.target.value }
                        })
                      }
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white"
                      placeholder="e.g. ⚠️ STOP POSTING BEFORE DOING THIS!"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Subtext / Retention Promise
                    </label>
                    <input
                      type="text"
                      value={editorConfig.hookOverlay.subText || ''}
                      onChange={e =>
                        updateConfig({
                          hookOverlay: { ...editorConfig.hookOverlay, subText: e.target.value }
                        })
                      }
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white"
                      placeholder="e.g. Watch until the end for the algorithm trick"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Banner Placement</label>
                      <select
                        value={editorConfig.hookOverlay.position}
                        onChange={e =>
                          updateConfig({
                            hookOverlay: { ...editorConfig.hookOverlay, position: e.target.value as any }
                          })
                        }
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                      >
                        <option value="top">Top Header (Safe Zone 12%)</option>
                        <option value="middle">Center Attention (42%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Banner Background Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={editorConfig.hookOverlay.backgroundColor}
                          onChange={e =>
                            updateConfig({
                              hookOverlay: { ...editorConfig.hookOverlay, backgroundColor: e.target.value }
                            })
                          }
                          className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-slate-400">
                          {editorConfig.hookOverlay.backgroundColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Framing & Resolution Tab */}
          {activeTab === 'framing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-2">9:16 Aspect Framing Strategy</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => updateConfig({ framingMode: 'blur_background' })}
                    className={`rounded-xl p-3 border text-left transition-all ${
                      editorConfig.framingMode === 'blur_background'
                        ? 'border-purple-500 bg-purple-950/20 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">Blurred Background</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Viral standard: scale & blur sides with centered subject.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateConfig({ framingMode: 'crop_center' })}
                    className={`rounded-xl p-3 border text-left transition-all ${
                      editorConfig.framingMode === 'crop_center'
                        ? 'border-purple-500 bg-purple-950/20 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">Center Crop</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Crop 9:16 slice from video center. Best for single speakers.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateConfig({ framingMode: 'fit_with_bars' })}
                    className={`rounded-xl p-3 border text-left transition-all ${
                      editorConfig.framingMode === 'fit_with_bars'
                        ? 'border-purple-500 bg-purple-950/20 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">Fit with Bars</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Full landscape video with top & bottom black canvas.
                    </p>
                  </button>
                </div>
              </div>

              {/* Output Resolution Selection */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Output Resolution</label>
                <select
                  value={editorConfig.targetResolution}
                  onChange={e => updateConfig({ targetResolution: e.target.value as any })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                >
                  <option value="720p">720p HD (720x1280 - Ultra-fast encoding)</option>
                  <option value="1080p">1080p Full HD (1080x1920 - Recommended for YouTube Shorts)</option>
                  <option value="2k">2K Quad HD (1440x2560 - High bitrate)</option>
                  <option value="4k">4K Ultra HD (2160x3840 - Highest quality)</option>
                </select>

                {sourceQualityWarning && (
                  <div className="mt-2 flex items-start space-x-2 rounded-xl bg-amber-950/30 border border-amber-500/40 p-2.5 text-[11px] text-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Notice: If the original source video is 720p or 1080p, upscaling to 2K/4K will produce a larger file without adding genuine camera detail. 1080p is recommended.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audio & Branding Tab */}
          {activeTab === 'audio_wm' && (
            <div className="space-y-4">
              {/* Audio Normalization */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">Audio Loudness Normalization</p>
                  <p className="text-[10px] text-slate-400">
                    Applies FFmpeg EBU R128 (-16 LUFS) to ensure dialogue is loud and crisp on mobile speakers.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editorConfig.audio.normalizeAudio}
                  onChange={e =>
                    updateConfig({
                      audio: { ...editorConfig.audio, normalizeAudio: e.target.checked }
                    })
                  }
                  className="h-4 w-4 rounded accent-purple-600"
                />
              </div>

              {/* Progress Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">Bottom Progress Bar</p>
                  <p className="text-[10px] text-slate-400">
                    Animated scrub bar showing viewer progression to reduce drop-offs.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editorConfig.progressBar.enabled}
                  onChange={e =>
                    updateConfig({
                      progressBar: { ...editorConfig.progressBar, enabled: e.target.checked }
                    })
                  }
                  className="h-4 w-4 rounded accent-purple-600"
                />
              </div>

              {/* Watermark Branding */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">Channel Watermark</p>
                  <input
                    type="checkbox"
                    checked={editorConfig.watermark.enabled}
                    onChange={e =>
                      updateConfig({
                        watermark: { ...editorConfig.watermark, enabled: e.target.checked }
                      })
                    }
                    className="h-4 w-4 rounded accent-purple-600"
                  />
                </div>
                {editorConfig.watermark.enabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={editorConfig.watermark.text || ''}
                      onChange={e =>
                        updateConfig({
                          watermark: { ...editorConfig.watermark, text: e.target.value }
                        })
                      }
                      placeholder="@ClipMitra"
                      className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                    />
                    <select
                      value={editorConfig.watermark.position}
                      onChange={e =>
                        updateConfig({
                          watermark: { ...editorConfig.watermark, position: e.target.value as any }
                        })
                      }
                      className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                    >
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Render progress banner if encoding */}
          {isRendering && (
            <div className="rounded-xl bg-purple-950/40 border border-purple-500/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-200">
                <span className="font-bold flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  <span>FFmpeg Background Rendering in Progress...</span>
                </span>
                <span className="font-mono font-bold text-purple-300">{renderProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          )}

          {renderError && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-3 text-xs text-rose-200 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <span>{renderError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
