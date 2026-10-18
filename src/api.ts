import {
  User,
  SourceProject,
  Clip,
  YouTubeChannel,
  AutomationRule,
  ScheduledUploadJob,
  ActivityLog,
  SystemUsage,
  SystemSettings,
  SEOMetadata
} from './types.ts';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errMsg = data.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async getMe(): Promise<{ success: boolean; user: User }> {
    return fetchJson('/api/auth/me');
  },
  async login(name: string, email: string): Promise<{ success: boolean; user: User }> {
    return fetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
  },

  // Dashboard
  async getDashboardStats(): Promise<{
    success: boolean;
    stats: {
      totalClips: number;
      totalProjects: number;
      publishedClips: number;
      scheduledClips: number;
      failedJobs: number;
      usage: SystemUsage;
      activeChannelsCount: number;
      defaultChannel: YouTubeChannel | null;
    };
    recentProjects: SourceProject[];
    recentClips: Clip[];
    recentLogs: ActivityLog[];
  }> {
    return fetchJson('/api/dashboard/stats');
  },

  // Projects
  async getProjects(): Promise<{ success: boolean; projects: SourceProject[] }> {
    return fetchJson('/api/projects');
  },
  async getProject(id: string): Promise<{ success: boolean; project: SourceProject; clips: Clip[] }> {
    return fetchJson(`/api/projects/${id}`);
  },
  async importYouTube(url: string, videoId?: string, customTitle?: string): Promise<{ success: boolean; project: SourceProject }> {
    return fetchJson('/api/projects/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, videoId, customTitle })
    });
  },
  async loadSampleProject(sampleType: 'podcast' | 'tech_talk'): Promise<{ success: boolean; project: SourceProject }> {
    return fetchJson('/api/projects/sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleType })
    });
  },
  async uploadVideo(file: File, title?: string): Promise<{ success: boolean; project: SourceProject }> {
    const formData = new FormData();
    formData.append('video', file);
    if (title) formData.append('title', title);
    const res = await fetch('/api/projects/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Upload failed');
    }
    return res.json();
  },
  async deleteProject(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/projects/${id}`, { method: 'DELETE' });
  },

  // AI Clip Generation & Metadata
  async generateClips(params: {
    projectId: string;
    duration?: string;
    clipCount?: number;
    language?: 'en' | 'hi' | 'hinglish';
    framingMode?: string;
  }): Promise<{ success: boolean; clips: Clip[] }> {
    return fetchJson('/api/ai/generate-clips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  },
  async generateMetadata(params: {
    clipId?: string;
    title: string;
    hookText?: string;
    transcriptText?: string;
    language?: string;
  }): Promise<{ success: boolean; metadata: SEOMetadata }> {
    return fetchJson('/api/ai/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  },

  // Clips
  async getClips(filter?: { projectId?: string; youtubeStatus?: string }): Promise<{ success: boolean; clips: Clip[] }> {
    const q = new URLSearchParams();
    if (filter?.projectId) q.set('projectId', filter.projectId);
    if (filter?.youtubeStatus) q.set('youtubeStatus', filter.youtubeStatus);
    return fetchJson(`/api/clips?${q.toString()}`);
  },
  async getClip(id: string): Promise<{ success: boolean; clip: Clip; project: SourceProject }> {
    return fetchJson(`/api/clips/${id}`);
  },
  async updateClip(id: string, updates: Partial<Clip>): Promise<{ success: boolean; clip: Clip }> {
    return fetchJson(`/api/clips/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  },
  async deleteClip(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/clips/${id}`, { method: 'DELETE' });
  },

  // Rendering
  async startRender(clipId: string): Promise<{ success: boolean; job: { jobId: string; status: string } }> {
    return fetchJson('/api/render/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clipId })
    });
  },
  async getRenderStatus(jobId: string): Promise<{
    success: boolean;
    job: {
      jobId: string;
      clipId: string;
      progress: number;
      status: string;
      error?: string;
      outputUrl?: string;
    };
  }> {
    return fetchJson(`/api/render/status/${jobId}`);
  },

  // YouTube
  async getAuthUrl(): Promise<{ success: boolean; isConfigured: boolean; authUrl: string }> {
    return fetchJson('/api/youtube/auth-url');
  },
  async getChannels(): Promise<{ success: boolean; channels: YouTubeChannel[] }> {
    return fetchJson('/api/youtube/channels');
  },
  async disconnectChannel(channelId: string): Promise<{ success: boolean }> {
    return fetchJson('/api/youtube/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId })
    });
  },
  async publishToYouTube(params: {
    clipId: string;
    channelId: string;
    privacy?: 'public' | 'unlisted' | 'private';
    scheduledFor?: string;
  }): Promise<{ success: boolean; result?: any; scheduled?: boolean }> {
    return fetchJson('/api/youtube/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  },

  // Automation
  async getAutomationRules(): Promise<{ success: boolean; rules: AutomationRule }> {
    return fetchJson('/api/automation/rules');
  },
  async updateAutomationRules(rules: Partial<AutomationRule>): Promise<{ success: boolean; rules: AutomationRule }> {
    return fetchJson('/api/automation/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rules)
    });
  },

  // Scheduler
  async getScheduledJobs(): Promise<{ success: boolean; jobs: ScheduledUploadJob[] }> {
    return fetchJson('/api/scheduler/jobs');
  },
  async cancelScheduledJob(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/scheduler/jobs/${id}`, { method: 'DELETE' });
  },

  // System & Settings
  async getStorageInfo(): Promise<{
    success: boolean;
    storageSize: number;
    fileCount: number;
    usage: SystemUsage;
    storageDir: string;
  }> {
    return fetchJson('/api/system/storage');
  },
  async cleanTempStorage(): Promise<{ success: boolean; cleanedCount: number }> {
    return fetchJson('/api/system/storage/clean', { method: 'POST' });
  },
  async getSettings(): Promise<{ success: boolean; settings: SystemSettings }> {
    return fetchJson('/api/system/settings');
  },
  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    return fetchJson('/api/system/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  },
  async getLogs(limit = 50): Promise<{ success: boolean; logs: ActivityLog[] }> {
    return fetchJson(`/api/system/logs?limit=${limit}`);
  }
};
