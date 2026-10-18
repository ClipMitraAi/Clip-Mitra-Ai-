import fs from 'fs';
import path from 'path';
import {
  User,
  SourceProject,
  Clip,
  YouTubeChannel,
  AutomationRule,
  ScheduledUploadJob,
  ActivityLog,
  SystemUsage,
  SystemSettings
} from './types.ts';

interface DatabaseSchema {
  user: User;
  projects: SourceProject[];
  clips: Clip[];
  channels: YouTubeChannel[];
  automation: AutomationRule;
  scheduledJobs: ScheduledUploadJob[];
  logs: ActivityLog[];
  usage: SystemUsage;
  settings: SystemSettings;
}

const DB_PATH = path.resolve(process.cwd(), 'data', 'clipmitra.json');

const INITIAL_DATA: DatabaseSchema = {
  user: {
    id: 'usr_clipmitra_prime',
    name: 'Bittu Kumar (Creator)',
    email: 'bittubam349@gmail.com',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  channels: [
    {
      id: 'chan_techpulse_official',
      channelId: 'UC_TechPulseAI_Official',
      title: 'TechPulse Clips & AI Insights',
      customUrl: '@techpulse_clips',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      subscriberCount: '142,500',
      videoCount: '286',
      connectedAt: '2026-03-12T10:00:00.000Z',
      isDefault: true,
      tokenExpiresAt: Date.now() + 86400000 * 30,
      scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
      ],
      isDemo: true
    },
    {
      id: 'chan_mindset_shorts',
      channelId: 'UC_MindsetHustleShorts',
      title: 'Hustle & Mindset Shorts',
      customUrl: '@mindset_shorts_daily',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      subscriberCount: '58,200',
      videoCount: '112',
      connectedAt: '2026-04-01T14:30:00.000Z',
      isDefault: false,
      tokenExpiresAt: Date.now() + 86400000 * 15,
      scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
      ],
      isDemo: true
    }
  ],
  projects: [
    {
      id: 'proj_ai_revolution_podcast',
      title: 'The AI Revolution & Why 90% of Creators Are Sleeping on Shorts',
      sourceType: 'sample',
      sourceUrl: 'https://www.youtube.com/watch?v=sample_ai_revolution',
      videoId: 'sample_ai_revolution',
      originalFilePath: '/samples/podcast_sample.mp4',
      duration: 45,
      resolution: '1280x720',
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
      status: 'ready',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      transcript: [
        {
          id: 'seg_1',
          start: 0,
          end: 15,
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
          id: 'seg_2',
          start: 15,
          end: 32,
          text: 'If you optimize the first three seconds with an undeniable visual hook and dynamic captions, your retention doubles automatically.',
          words: [
            { word: 'If', start: 15.2, end: 15.5 },
            { word: 'you', start: 15.5, end: 15.8 },
            { word: 'optimize', start: 15.8, end: 16.6 },
            { word: 'the', start: 16.6, end: 16.9 },
            { word: 'first', start: 16.9, end: 17.5 },
            { word: 'three', start: 17.5, end: 18.1 },
            { word: 'seconds', start: 18.1, end: 18.9 },
            { word: 'with', start: 18.9, end: 19.2 },
            { word: 'an', start: 19.2, end: 19.4 },
            { word: 'undeniable', start: 19.4, end: 20.3 },
            { word: 'visual', start: 20.3, end: 20.9 },
            { word: 'hook', start: 20.9, end: 21.6 },
            { word: 'and', start: 21.6, end: 21.9 },
            { word: 'dynamic', start: 21.9, end: 22.7 },
            { word: 'captions,', start: 22.7, end: 23.6 },
            { word: 'your', start: 23.8, end: 24.2 },
            { word: 'retention', start: 24.2, end: 25.1 },
            { word: 'doubles', start: 25.1, end: 26.0 },
            { word: 'automatically.', start: 26.0, end: 27.5 }
          ]
        }
      ]
    }
  ],
  clips: [
    {
      id: 'clip_hook_first_3_seconds',
      projectId: 'proj_ai_revolution_podcast',
      title: 'Stop Wasting Time on YouTube Shorts (Secret Hack)',
      startTime: 0,
      endTime: 28,
      duration: 28,
      hookText: '⚠️ NEVER post a Short before doing THIS!',
      transcriptText: 'The biggest mistake creators make with YouTube Shorts is waiting for the perfect video instead of posting high-retention clips every day. If you optimize the first three seconds with an undeniable visual hook and dynamic captions, your retention doubles automatically.',
      transcriptWords: [
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
      ],
      editorConfig: {
        framingMode: 'blur_background',
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
          text: '⚠️ NEVER POST A SHORT WITHOUT THIS!',
          subText: 'Watch till the end for the algorithm trick',
          position: 'top',
          backgroundColor: '#DC2626',
          textColor: '#FFFFFF',
          fontSize: 22
        },
        watermark: {
          enabled: true,
          text: '@ClipMitra',
          position: 'top-right',
          opacity: 0.8
        },
        audio: {
          originalAudioVolume: 1.0,
          normalizeAudio: true,
          backgroundMusicTrack: 'lofi_ambient',
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
        language: 'en'
      },
      seoMetadata: {
        title: 'Stop Making This YouTube Shorts Mistake in 2026! 🚀 #shorts',
        description: 'Are you posting YouTube Shorts with zero views? Here is why your retention drops after 3 seconds and how to double your watch time instantly.\n\nSubscribe for daily creator growth tips!',
        tags: ['youtube shorts tips', 'how to grow on shorts', 'viral clips generator', 'clipmitra ai', 'youtube algorithm 2026', 'content creator'],
        hashtags: ['#shorts', '#viral', '#creatorhacks', '#youtubegrowth', '#clipmitra'],
        pinnedComment: 'What is your current average retention rate on Shorts? Drop it below and I will audit your hook! 👇',
        category: 'Howto & Style',
        categoryId: '26',
        language: 'English',
        viralityScore: 94,
        viralityReasoning: 'Strong polarizing opening statement that challenges creator behavior, immediate value delivery, and actionable 3-second hook lesson.'
      },
      renderStatus: 'ready',
      renderProgress: 100,
      outputVideoPath: '/samples/podcast_sample.mp4',
      outputVideoUrl: '/samples/podcast_sample.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      youtubeStatus: 'published',
      youtubeVideoId: 'dQw4w9WgXcQ_demo',
      youtubeVideoUrl: 'https://youtube.com/shorts/dQw4w9WgXcQ_demo',
      publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      destinationChannelId: 'chan_techpulse_official',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'clip_retention_formula',
      projectId: 'proj_ai_revolution_podcast',
      title: 'The 3-Second Retention Rule for YouTube Algorithms',
      startTime: 15,
      endTime: 38,
      duration: 23,
      hookText: '🧠 The Secret Retention Formula Top Creators Hide',
      transcriptText: 'If you optimize the first three seconds with an undeniable visual hook and dynamic captions, your retention doubles automatically.',
      transcriptWords: [
        { word: 'If', start: 15.2, end: 15.5 },
        { word: 'you', start: 15.5, end: 15.8 },
        { word: 'optimize', start: 15.8, end: 16.6 },
        { word: 'the', start: 16.6, end: 16.9 },
        { word: 'first', start: 16.9, end: 17.5 },
        { word: 'three', start: 17.5, end: 18.1 },
        { word: 'seconds', start: 18.1, end: 18.9 },
        { word: 'with', start: 18.9, end: 19.2 },
        { word: 'an', start: 19.2, end: 19.4 },
        { word: 'undeniable', start: 19.4, end: 20.3 },
        { word: 'visual', start: 20.3, end: 20.9 },
        { word: 'hook', start: 20.9, end: 21.6 }
      ],
      editorConfig: {
        framingMode: 'blur_background',
        targetResolution: '1080p',
        subtitles: {
          enabled: true,
          fontFamily: 'Montserrat',
          fontSize: 32,
          textColor: '#FFFFFF',
          highlightColor: '#38BDF8',
          strokeColor: '#000000',
          strokeWidth: 4,
          backgroundColor: '#0f172a',
          hasBackgroundPill: true,
          positionY: 70,
          animationType: 'karaoke_word',
          textTransform: 'uppercase'
        },
        hookOverlay: {
          enabled: true,
          text: '🔥 3 SECONDS TO GO VIRAL',
          subText: 'The retention trick tested on 10M views',
          position: 'top',
          backgroundColor: '#7C3AED',
          textColor: '#FFFFFF',
          fontSize: 22
        },
        watermark: {
          enabled: true,
          text: 'ClipMitra.ai',
          position: 'top-left',
          opacity: 0.8
        },
        audio: {
          originalAudioVolume: 1.0,
          normalizeAudio: true,
          backgroundMusicVolume: 0.2,
          fadeInOut: true
        },
        progressBar: {
          enabled: true,
          color: '#06B6D4',
          height: 6,
          position: 'bottom'
        },
        showSafeZones: true,
        language: 'en'
      },
      seoMetadata: {
        title: 'Master the 3-Second Retention Formula on Shorts! 📈 #shorts',
        description: 'How to hook viewers in the first 3 seconds before they swipe away. The complete breakdown.\n\n#algorithm #growthtips #creator',
        tags: ['youtube shorts', 'viewer retention', 'hook strategy', 'shorts viral tips'],
        hashtags: ['#shorts', '#algorithm', '#growth', '#videotips'],
        pinnedComment: 'Try this on your next 3 shorts and comment back with your results! 🚀',
        category: 'Education',
        categoryId: '27',
        language: 'English',
        viralityScore: 91,
        viralityReasoning: 'Clear promise with high utility for creators. High swipe-away prevention factor.'
      },
      renderStatus: 'ready',
      renderProgress: 100,
      outputVideoPath: '/samples/podcast_sample.mp4',
      outputVideoUrl: '/samples/podcast_sample.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80',
      youtubeStatus: 'scheduled',
      scheduledFor: new Date(Date.now() + 86400000 * 1.5).toISOString(),
      destinationChannelId: 'chan_techpulse_official',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ],
  automation: {
    enabled: true,
    clipsPerVideo: 3,
    maxDailyClips: 10,
    defaultDurationSec: 45,
    defaultResolution: '1080p',
    defaultLanguage: 'en',
    framingMode: 'blur_background',
    autoPublish: false, // Requires user review by default for safety
    defaultPrivacy: 'public',
    destinationChannelId: 'chan_techpulse_official',
    burnWatermark: true,
    watermarkText: 'ClipMitra AI',
    safeZoneCompliance: true
  },
  scheduledJobs: [
    {
      id: 'job_sched_01',
      clipId: 'clip_retention_formula',
      channelId: 'chan_techpulse_official',
      scheduledTime: new Date(Date.now() + 86400000 * 1.5).toISOString(),
      privacy: 'public',
      status: 'pending',
      retryCount: 0,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ],
  logs: [
    {
      id: 'log_01',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      category: 'ingestion',
      level: 'success',
      title: 'Source Video Ingested Successfully',
      details: 'Ingested "The AI Revolution & Why 90% of Creators Are Sleeping on Shorts" (45s, 1280x720 30fps).',
      entityId: 'proj_ai_revolution_podcast'
    },
    {
      id: 'log_02',
      timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString(),
      category: 'ai_analysis',
      level: 'success',
      title: 'AI Transcript & Viral Moments Detected',
      details: 'Identified 2 high-scoring viral segments (94/100 and 91/100 virality potential).',
      entityId: 'proj_ai_revolution_podcast'
    },
    {
      id: 'log_03',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      category: 'render',
      level: 'success',
      title: 'FFmpeg 9:16 Vertical Encode Completed',
      details: 'Rendered vertical 1080x1920 MP4 with blurred background and burned animated captions.',
      entityId: 'clip_hook_first_3_seconds'
    },
    {
      id: 'log_04',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      category: 'youtube_upload',
      level: 'success',
      title: 'YouTube Short Published',
      details: 'Published to @techpulse_clips as Public. Video ID: dQw4w9WgXcQ_demo.',
      entityId: 'clip_hook_first_3_seconds'
    }
  ],
  usage: {
    todayClipsGenerated: 2,
    todayUploadsCount: 1,
    storageUsedBytes: 42 * 1024 * 1024, // 42MB
    youtubeApiUnitsUsed: 1600, // 1 upload = 1600 units
    maxDailyClipsQuota: 25,
    youtubeDailyQuotaLimit: 10000
  },
  settings: {
    geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY,
    googleOAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    storagePath: './data/storage',
    activeAiProvider: process.env.GEMINI_API_KEY ? 'gemini' : 'free_heuristic',
    renderPreset: 'fast',
    enableAudioNormalization: true
  }
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...INITIAL_DATA,
          ...parsed,
          settings: {
            ...INITIAL_DATA.settings,
            ...parsed.settings,
            geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY,
            googleOAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
          }
        };
      }
    } catch (err) {
      console.warn('Failed to read db file, initializing default:', err);
    }
    this.saveData(INITIAL_DATA);
    return INITIAL_DATA;
  }

  public saveData(data?: DatabaseSchema) {
    if (data) this.data = data;
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save db data:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // User
  public getUser(): User {
    return this.data.user;
  }

  // Projects
  public getProjects(): SourceProject[] {
    return this.data.projects;
  }

  public getProject(id: string): SourceProject | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  public addProject(project: SourceProject): SourceProject {
    this.data.projects.unshift(project);
    this.saveData();
    return project;
  }

  public deleteProject(id: string): boolean {
    const index = this.data.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.projects.splice(index, 1);
      // delete associated clips
      this.data.clips = this.data.clips.filter(c => c.projectId !== id);
      this.saveData();
      return true;
    }
    return false;
  }

  // Clips
  public getClips(filter?: { projectId?: string; youtubeStatus?: string }): Clip[] {
    let list = this.data.clips;
    if (filter?.projectId) list = list.filter(c => c.projectId === filter.projectId);
    if (filter?.youtubeStatus) list = list.filter(c => c.youtubeStatus === filter.youtubeStatus);
    return list;
  }

  public getClip(id: string): Clip | undefined {
    return this.data.clips.find(c => c.id === id);
  }

  public addClip(clip: Clip): Clip {
    this.data.clips.unshift(clip);
    this.data.usage.todayClipsGenerated += 1;
    this.saveData();
    return clip;
  }

  public updateClip(id: string, updates: Partial<Clip>): Clip | undefined {
    const clip = this.data.clips.find(c => c.id === id);
    if (clip) {
      Object.assign(clip, updates, { updatedAt: new Date().toISOString() });
      this.saveData();
      return clip;
    }
    return undefined;
  }

  public deleteClip(id: string): boolean {
    const index = this.data.clips.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.clips.splice(index, 1);
      this.data.scheduledJobs = this.data.scheduledJobs.filter(j => j.clipId !== id);
      this.saveData();
      return true;
    }
    return false;
  }

  // Channels
  public getChannels(): YouTubeChannel[] {
    return this.data.channels;
  }

  public getChannel(id: string): YouTubeChannel | undefined {
    return this.data.channels.find(c => c.id === id || c.channelId === id);
  }

  public addOrUpdateChannel(channel: YouTubeChannel): YouTubeChannel {
    const idx = this.data.channels.findIndex(c => c.id === channel.id || c.channelId === channel.channelId);
    if (idx !== -1) {
      this.data.channels[idx] = { ...this.data.channels[idx], ...channel };
    } else {
      this.data.channels.push(channel);
    }
    this.saveData();
    return channel;
  }

  public removeChannel(id: string): boolean {
    const idx = this.data.channels.findIndex(c => c.id === id || c.channelId === id);
    if (idx !== -1) {
      this.data.channels.splice(idx, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Automation
  public getAutomation(): AutomationRule {
    return this.data.automation;
  }

  public updateAutomation(rule: Partial<AutomationRule>): AutomationRule {
    this.data.automation = { ...this.data.automation, ...rule };
    this.saveData();
    return this.data.automation;
  }

  // Scheduled Jobs
  public getScheduledJobs(): ScheduledUploadJob[] {
    return this.data.scheduledJobs;
  }

  public addScheduledJob(job: ScheduledUploadJob): ScheduledUploadJob {
    this.data.scheduledJobs.push(job);
    this.saveData();
    return job;
  }

  public updateScheduledJob(id: string, updates: Partial<ScheduledUploadJob>): ScheduledUploadJob | undefined {
    const job = this.data.scheduledJobs.find(j => j.id === id);
    if (job) {
      Object.assign(job, updates);
      this.saveData();
      return job;
    }
    return undefined;
  }

  public deleteScheduledJob(id: string): boolean {
    const idx = this.data.scheduledJobs.findIndex(j => j.id === id);
    if (idx !== -1) {
      this.data.scheduledJobs.splice(idx, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Activity Logs
  public getLogs(limit = 50): ActivityLog[] {
    return this.data.logs.slice(0, limit);
  }

  public logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    const entry: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log
    };
    this.data.logs.unshift(entry);
    if (this.data.logs.length > 200) {
      this.data.logs = this.data.logs.slice(0, 200);
    }
    this.saveData();
    return entry;
  }

  // System Usage & Storage
  public getUsage(): SystemUsage {
    return this.data.usage;
  }

  public recordUploadQuota(units = 1600) {
    this.data.usage.youtubeApiUnitsUsed += units;
    this.data.usage.todayUploadsCount += 1;
    this.saveData();
  }

  public updateStorageUsed(bytes: number) {
    this.data.usage.storageUsedBytes = bytes;
    this.saveData();
  }

  // Settings
  public getSettings(): SystemSettings {
    return {
      ...this.data.settings,
      geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY,
      googleOAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    };
  }

  public updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
    return this.getSettings();
  }
}

export const db = new Database();
