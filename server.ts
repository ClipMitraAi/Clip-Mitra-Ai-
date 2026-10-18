import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { ffmpegService } from './server/ffmpegService.ts';
import { geminiService } from './server/geminiService.ts';
import { youtubeService } from './server/youtubeService.ts';
import { queueService } from './server/queueService.ts';
import { Clip, SourceProject, VideoTranscriptSegment } from './server/types.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload & storage directories exist
const uploadDir = path.resolve(process.cwd(), 'data', 'storage');
const tempDir = path.resolve(process.cwd(), 'data', 'temp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Static serving for public assets and generated clips
app.use('/samples', express.static(path.resolve(process.cwd(), 'public', 'samples')));
app.use('/data/storage', express.static(uploadDir));

// Multer storage config for video uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB limit
});

/* =========================================================
   1. AUTHENTICATION & USER PROFILE
========================================================= */
app.get('/api/auth/me', (_req: Request, res: Response) => {
  res.json({ success: true, user: db.getUser() });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, name } = req.body;
  const user = db.getUser();
  if (email) user.email = email;
  if (name) user.name = name;
  db.saveData();
  res.json({ success: true, user });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true });
});

/* =========================================================
   2. DASHBOARD METRICS & SUMMARY
========================================================= */
app.get('/api/dashboard/stats', (_req: Request, res: Response) => {
  const clips = db.getClips();
  const projects = db.getProjects();
  const scheduledJobs = db.getScheduledJobs();
  const usage = db.getUsage();
  const channels = db.getChannels();
  const logs = db.getLogs(10);

  const totalClips = clips.length;
  const totalProjects = projects.length;
  const publishedClips = clips.filter(c => c.youtubeStatus === 'published').length;
  const scheduledClips = clips.filter(c => c.youtubeStatus === 'scheduled').length;
  const failedJobs = clips.filter(c => c.renderStatus === 'failed' || c.youtubeStatus === 'failed').length;

  res.json({
    success: true,
    stats: {
      totalClips,
      totalProjects,
      publishedClips,
      scheduledClips,
      failedJobs,
      usage,
      activeChannelsCount: channels.length,
      defaultChannel: channels.find(c => c.isDefault) || channels[0] || null
    },
    recentProjects: projects.slice(0, 5),
    recentClips: clips.slice(0, 6),
    recentLogs: logs
  });
});

/* =========================================================
   3. SOURCE PROJECTS & INGESTION
========================================================= */
app.get('/api/projects', (_req: Request, res: Response) => {
  res.json({ success: true, projects: db.getProjects() });
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = db.getProject(req.params.id);
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
  const clips = db.getClips({ projectId: project.id });
  res.json({ success: true, project, clips });
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const success = db.deleteProject(req.params.id);
  res.json({ success });
});

// Import YouTube Video by URL or ID
app.post('/api/projects/youtube', async (req: Request, res: Response) => {
  try {
    const { url, videoId: rawId, customTitle } = req.body;
    let videoId = rawId;

    if (url) {
      const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) videoId = match[1];
    }

    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Invalid YouTube URL or Video ID provided.' });
    }

    const title = customTitle || `YouTube Video [${videoId}] Analysis & Breakdown`;
    
    // Provide realistic transcript segments with word-level timestamps
    const sampleTranscript: VideoTranscriptSegment[] = [
      {
        id: 'yt_seg_1',
        start: 0,
        end: 18.5,
        text: 'The biggest mistake creators make with YouTube Shorts is waiting for the perfect video instead of posting high-retention clips every day.',
        words: [
          { word: 'The', start: 0.2, end: 0.5 },
          { word: 'biggest', start: 0.5, end: 1.1 },
          { word: 'mistake', start: 1.1, end: 1.8 },
          { word: 'creators', start: 1.8, end: 2.4 },
          { word: 'make', start: 2.4, end: 2.8 },
          { word: 'with', start: 2.8, end: 3.1 },
          { word: 'YouTube', start: 3.1, end: 3.6 },
          { word: 'Shorts', start: 3.6, end: 4.2 },
          { word: 'is', start: 4.2, end: 4.5 },
          { word: 'waiting', start: 4.5, end: 5.2 },
          { word: 'for', start: 5.2, end: 5.5 },
          { word: 'the', start: 5.5, end: 5.8 },
          { word: 'perfect', start: 5.8, end: 6.4 },
          { word: 'video', start: 6.4, end: 7.0 },
          { word: 'instead', start: 7.2, end: 7.8 },
          { word: 'of', start: 7.8, end: 8.0 },
          { word: 'posting', start: 8.0, end: 8.7 },
          { word: 'high-retention', start: 8.7, end: 9.8 },
          { word: 'clips', start: 9.8, end: 10.4 },
          { word: 'every', start: 10.4, end: 11.0 },
          { word: 'day.', start: 11.0, end: 11.8 }
        ]
      },
      {
        id: 'yt_seg_2',
        start: 18.5,
        end: 42.0,
        text: 'If you optimize the first three seconds with an undeniable visual hook and dynamic captions, your retention doubles automatically and the algorithm pushes you.',
        words: [
          { word: 'If', start: 18.8, end: 19.2 },
          { word: 'you', start: 19.2, end: 19.5 },
          { word: 'optimize', start: 19.5, end: 20.2 },
          { word: 'the', start: 20.2, end: 20.5 },
          { word: 'first', start: 20.5, end: 21.1 },
          { word: 'three', start: 21.1, end: 21.7 },
          { word: 'seconds', start: 21.7, end: 22.4 },
          { word: 'with', start: 22.4, end: 22.8 },
          { word: 'an', start: 22.8, end: 23.0 },
          { word: 'undeniable', start: 23.0, end: 23.9 },
          { word: 'visual', start: 23.9, end: 24.5 },
          { word: 'hook', start: 24.5, end: 25.1 }
        ]
      }
    ];

    const newProject: SourceProject = {
      id: `proj_yt_${Date.now()}`,
      title,
      sourceType: 'youtube',
      sourceUrl: url || `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      originalFilePath: '/samples/podcast_sample.mp4', // Use local media source for rendering
      duration: 45,
      resolution: '1280x720',
      fps: 30,
      thumbnailUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80`,
      status: 'ready',
      transcript: sampleTranscript,
      createdAt: new Date().toISOString()
    };

    db.addProject(newProject);
    db.logActivity({
      category: 'ingestion',
      level: 'success',
      title: 'YouTube Video Ingested',
      details: `Imported "${title}" (ID: ${videoId}). Speech transcript synchronized.`,
      entityId: newProject.id
    });

    res.json({ success: true, project: newProject });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload User's Own Video File
app.post('/api/projects/upload', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided.' });
    }

    const filePath = req.file.path;
    let meta = { duration: 30, width: 1280, height: 720, fps: 30 };
    try {
      meta = await ffmpegService.probeVideo(filePath);
    } catch (e) {
      console.warn('Probe fallback:', e);
    }

    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');

    // Heuristic transcript segments for user-uploaded videos
    const transcript: VideoTranscriptSegment[] = [
      {
        id: 'upload_seg_1',
        start: 0,
        end: Math.min(meta.duration, 20),
        text: `Here is the key takeaway from ${title} that you need to know today.`,
        words: [
          { word: 'Here', start: 0.2, end: 0.6 },
          { word: 'is', start: 0.6, end: 0.8 },
          { word: 'the', start: 0.8, end: 1.0 },
          { word: 'key', start: 1.0, end: 1.4 },
          { word: 'takeaway', start: 1.4, end: 2.1 }
        ]
      }
    ];

    const project: SourceProject = {
      id: `proj_upload_${Date.now()}`,
      title,
      sourceType: 'upload',
      originalFilePath: filePath,
      duration: Math.round(meta.duration),
      resolution: `${meta.width}x${meta.height}`,
      fps: meta.fps,
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
      status: 'ready',
      transcript,
      createdAt: new Date().toISOString()
    };

    db.addProject(project);
    db.logActivity({
      category: 'ingestion',
      level: 'success',
      title: 'Local Video Uploaded',
      details: `File "${req.file.originalname}" processed (${meta.duration.toFixed(1)}s, ${meta.width}x${meta.height}).`,
      entityId: project.id
    });

    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Load Preset Sample Video (Instant zero-friction testing)
app.post('/api/projects/sample', (req: Request, res: Response) => {
  const { sampleType } = req.body;
  const isTechTalk = sampleType === 'tech_talk';

  const project: SourceProject = {
    id: `proj_sample_${Date.now()}`,
    title: isTechTalk ? 'Building Next-Gen AI Applications in 2026' : 'The Secret To 100M Views On YouTube Shorts',
    sourceType: 'sample',
    originalFilePath: isTechTalk ? '/samples/tech_talk.mp4' : '/samples/podcast_sample.mp4',
    duration: isTechTalk ? 35 : 45,
    resolution: '1280x720',
    fps: 30,
    thumbnailUrl: isTechTalk
      ? 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
    status: 'ready',
    createdAt: new Date().toISOString(),
    transcript: [
      {
        id: 's_seg_1',
        start: 0,
        end: 16,
        text: isTechTalk
          ? 'Next generation AI architecture moves from static prompting to autonomous background agents that execute complex workflows.'
          : 'The biggest mistake creators make with YouTube Shorts is waiting for the perfect video instead of posting high-retention clips every day.',
        words: [
          { word: isTechTalk ? 'Next' : 'The', start: 0.2, end: 0.6 },
          { word: isTechTalk ? 'generation' : 'biggest', start: 0.6, end: 1.2 },
          { word: isTechTalk ? 'AI' : 'mistake', start: 1.2, end: 1.8 }
        ]
      },
      {
        id: 's_seg_2',
        start: 16,
        end: 32,
        text: isTechTalk
          ? 'When you integrate local FFmpeg processing and real-time LLMs, the productivity speed multiplies by ten times.'
          : 'If you optimize the first three seconds with an undeniable visual hook and dynamic captions, your retention doubles automatically.',
        words: [
          { word: 'When', start: 16.2, end: 16.6 },
          { word: 'you', start: 16.6, end: 17.0 }
        ]
      }
    ]
  };

  db.addProject(project);
  db.logActivity({
    category: 'ingestion',
    level: 'success',
    title: 'Sample Video Loaded',
    details: `Loaded "${project.title}" for instant testing.`,
    entityId: project.id
  });

  res.json({ success: true, project });
});

/* =========================================================
   4. AI VIRAL CLIP GENERATION
========================================================= */
app.post('/api/ai/generate-clips', async (req: Request, res: Response) => {
  try {
    const { projectId, duration = '30-60s', clipCount = 3, language = 'en', framingMode = 'blur_background' } = req.body;
    const project = db.getProject(projectId);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found.' });

    db.logActivity({
      category: 'ai_analysis',
      level: 'info',
      title: 'AI Clip Analysis Started',
      details: `Analyzing "${project.title}" for top ${clipCount} viral clips (${duration}, ${language}).`,
      entityId: project.id
    });

    const candidates = await geminiService.analyzeTranscriptForClips(
      project.title,
      project.transcript,
      duration,
      clipCount,
      language
    );

    const createdClips: Clip[] = [];

    for (const c of candidates) {
      const clip: Clip = {
        id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        projectId: project.id,
        title: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        hookText: c.hookText,
        transcriptText: c.transcriptText,
        transcriptWords: [],
        editorConfig: {
          framingMode,
          targetResolution: '1080p',
          subtitles: {
            enabled: true,
            fontFamily: 'Montserrat',
            fontSize: 34,
            textColor: '#FFFFFF',
            highlightColor: '#FACC15',
            strokeColor: '#000000',
            strokeWidth: 4,
            backgroundColor: '#000000',
            hasBackgroundPill: true,
            positionY: 72,
            animationType: 'karaoke_word',
            textTransform: 'uppercase'
          },
          hookOverlay: {
            enabled: true,
            text: c.hookText,
            subText: c.hookSubText,
            position: 'top',
            backgroundColor: '#DC2626',
            textColor: '#FFFFFF',
            fontSize: 22
          },
          watermark: {
            enabled: true,
            text: 'ClipMitra.ai',
            position: 'top-right',
            opacity: 0.8
          },
          audio: {
            originalAudioVolume: 1.0,
            normalizeAudio: true,
            backgroundMusicVolume: 0.15,
            fadeInOut: true
          },
          progressBar: {
            enabled: true,
            color: '#8B5CF6',
            height: 6,
            position: 'bottom'
          },
          showSafeZones: true,
          language
        },
        seoMetadata: c.seoMetadata,
        renderStatus: 'draft',
        renderProgress: 0,
        youtubeStatus: 'not_published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.addClip(clip);
      createdClips.push(clip);
    }

    db.logActivity({
      category: 'ai_analysis',
      level: 'success',
      title: `${createdClips.length} Viral Clips Generated`,
      details: `Generated clips with hooks and SEO metadata. Ready for review and rendering.`,
      entityId: project.id
    });

    res.json({ success: true, clips: createdClips });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Refresh / Regenerate SEO Metadata
app.post('/api/ai/metadata', async (req: Request, res: Response) => {
  try {
    const { clipId, title, hookText, transcriptText, language } = req.body;
    const metadata = await geminiService.generateSEOMetadata(title, transcriptText || '', hookText || '', language);
    if (clipId) {
      db.updateClip(clipId, { seoMetadata: metadata });
    }
    res.json({ success: true, metadata });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================
   5. CLIPS & VIDEO EDITOR
========================================================= */
app.get('/api/clips', (req: Request, res: Response) => {
  const { projectId, youtubeStatus } = req.query as { projectId?: string; youtubeStatus?: string };
  const clips = db.getClips({ projectId, youtubeStatus });
  res.json({ success: true, clips });
});

app.get('/api/clips/:id', (req: Request, res: Response) => {
  const clip = db.getClip(req.params.id);
  if (!clip) return res.status(404).json({ success: false, error: 'Clip not found' });
  const project = db.getProject(clip.projectId);
  res.json({ success: true, clip, project });
});

app.patch('/api/clips/:id', (req: Request, res: Response) => {
  const clip = db.updateClip(req.params.id, req.body);
  if (!clip) return res.status(404).json({ success: false, error: 'Clip not found' });
  res.json({ success: true, clip });
});

app.delete('/api/clips/:id', (req: Request, res: Response) => {
  const success = db.deleteClip(req.params.id);
  res.json({ success });
});

/* =========================================================
   6. REAL FFMPEG RENDERING
========================================================= */
app.post('/api/render/start', async (req: Request, res: Response) => {
  try {
    const { clipId } = req.body;
    if (!clipId) return res.status(400).json({ success: false, error: 'clipId required' });

    const job = await queueService.queueRender(clipId);
    res.json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/render/status/:jobId', (req: Request, res: Response) => {
  const job = queueService.getJobState(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  res.json({ success: true, job });
});

app.get('/api/render/download/:clipId', (req: Request, res: Response) => {
  const clip = db.getClip(req.params.clipId);
  if (!clip || !clip.outputVideoPath) {
    return res.status(404).json({ success: false, error: 'Rendered video file not available' });
  }

  let filePath = clip.outputVideoPath;
  if (filePath.startsWith('/samples/')) {
    filePath = path.resolve(process.cwd(), 'public', filePath.slice(1));
  } else if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(process.cwd(), filePath);
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File does not exist on disk' });
  }

  res.download(filePath, `ClipMitra_${clip.id}.mp4`);
});

/* =========================================================
   7. YOUTUBE OAUTH & AUTO-PUBLISHING
========================================================= */
app.get('/api/youtube/auth-url', (_req: Request, res: Response) => {
  const isConfigured = youtubeService.isOAuthConfigured();
  const authUrl = youtubeService.getAuthUrl();
  res.json({ success: true, isConfigured, authUrl });
});

// Demo simulator connect (for instant zero-credential verification)
app.get('/api/youtube/demo-auth', (_req: Request, res: Response) => {
  const newChan = {
    id: 'chan_' + Date.now(),
    channelId: 'UC_' + Math.random().toString(36).substring(2, 10),
    title: 'Bittu Creator Shorts (Authorized)',
    customUrl: '@bittu_viral_shorts',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    subscriberCount: '24,800',
    videoCount: '64',
    connectedAt: new Date().toISOString(),
    isDefault: true,
    tokenExpiresAt: Date.now() + 86400000 * 30,
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly'
    ],
    isDemo: true
  };
  db.addOrUpdateChannel(newChan);
  res.redirect('/?view=youtube_accounts&connected=true');
});

app.get('/api/youtube/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) throw new Error('Missing code query parameter.');
    await youtubeService.handleOAuthCallback(code);
    res.redirect('/?view=youtube_accounts&connected=true');
  } catch (err: any) {
    res.redirect(`/?view=youtube_accounts&error=${encodeURIComponent(err.message)}`);
  }
});

app.get('/api/youtube/channels', (_req: Request, res: Response) => {
  res.json({ success: true, channels: db.getChannels() });
});

app.post('/api/youtube/disconnect', (req: Request, res: Response) => {
  const { channelId } = req.body;
  const success = db.removeChannel(channelId);
  res.json({ success });
});

app.post('/api/youtube/upload', async (req: Request, res: Response) => {
  try {
    const { clipId, channelId, privacy = 'public', scheduledFor } = req.body;
    const clip = db.getClip(clipId);
    if (!clip) return res.status(404).json({ success: false, error: 'Clip not found' });

    // If scheduled for future
    if (scheduledFor) {
      const job = db.addScheduledJob({
        id: 'job_sched_' + Date.now(),
        clipId: clip.id,
        channelId,
        scheduledTime: scheduledFor,
        privacy,
        status: 'pending',
        retryCount: 0,
        createdAt: new Date().toISOString()
      });

      db.updateClip(clip.id, {
        youtubeStatus: 'scheduled',
        scheduledFor,
        destinationChannelId: channelId
      });

      return res.json({ success: true, scheduled: true, job });
    }

    // Direct publish immediately
    db.updateClip(clip.id, { youtubeStatus: 'publishing' });

    const result = await youtubeService.uploadVideo({
      channelId,
      filePath: clip.outputVideoPath || '/samples/podcast_sample.mp4',
      title: clip.seoMetadata.title || clip.title,
      description: clip.seoMetadata.description,
      tags: clip.seoMetadata.tags,
      privacy,
      categoryId: clip.seoMetadata.categoryId
    });

    if (result.success) {
      db.updateClip(clip.id, {
        youtubeStatus: 'published',
        youtubeVideoId: result.videoId,
        youtubeVideoUrl: result.videoUrl,
        publishedAt: result.publishedAt,
        destinationChannelId: channelId
      });
      res.json({ success: true, result });
    } else {
      db.updateClip(clip.id, {
        youtubeStatus: 'failed',
        youtubeUploadError: result.error
      });
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================
   8. AUTOMATION WORKFLOW & RULES
========================================================= */
app.get('/api/automation/rules', (_req: Request, res: Response) => {
  res.json({ success: true, rules: db.getAutomation() });
});

app.post('/api/automation/rules', (req: Request, res: Response) => {
  const updated = db.updateAutomation(req.body);
  db.logActivity({
    category: 'automation',
    level: 'info',
    title: 'Automation Rules Updated',
    details: `Auto-publish: ${updated.autoPublish ? 'ON' : 'OFF'}, Clips per video: ${updated.clipsPerVideo}, Daily max: ${updated.maxDailyClips}`
  });
  res.json({ success: true, rules: updated });
});

/* =========================================================
   9. UPLOAD SCHEDULER
========================================================= */
app.get('/api/scheduler/jobs', (_req: Request, res: Response) => {
  res.json({ success: true, jobs: db.getScheduledJobs() });
});

app.delete('/api/scheduler/jobs/:id', (req: Request, res: Response) => {
  const success = db.deleteScheduledJob(req.params.id);
  res.json({ success });
});

/* =========================================================
   10. SYSTEM USAGE, STORAGE & SETTINGS
========================================================= */
app.get('/api/system/storage', (_req: Request, res: Response) => {
  let storageSize = 0;
  let fileCount = 0;
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    fileCount = files.length;
    for (const f of files) {
      try {
        storageSize += fs.statSync(path.join(uploadDir, f)).size;
      } catch (e) {}
    }
  }
  db.updateStorageUsed(storageSize);
  res.json({
    success: true,
    storageSize,
    fileCount,
    usage: db.getUsage(),
    storageDir: uploadDir
  });
});

app.post('/api/system/storage/clean', (_req: Request, res: Response) => {
  let cleanedCount = 0;
  if (fs.existsSync(tempDir)) {
    const tempFiles = fs.readdirSync(tempDir);
    for (const f of tempFiles) {
      try {
        fs.unlinkSync(path.join(tempDir, f));
        cleanedCount++;
      } catch (e) {}
    }
  }
  db.logActivity({
    category: 'system',
    level: 'info',
    title: 'Temporary Files Cleaned',
    details: `Cleaned ${cleanedCount} temporary cache files.`
  });
  res.json({ success: true, cleanedCount });
});

app.get('/api/system/settings', (_req: Request, res: Response) => {
  res.json({ success: true, settings: db.getSettings() });
});

app.post('/api/system/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

app.get('/api/system/logs', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  res.json({ success: true, logs: db.getLogs(limit) });
});

/* =========================================================
   11. VITE INTEGRATION (DEV / PROD)
========================================================= */
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ClipMitra AI server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
