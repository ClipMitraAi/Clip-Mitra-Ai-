export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'creator';
  avatarUrl?: string;
  createdAt: string;
}

export interface VideoTranscriptWord {
  word: string;
  start: number; // in seconds
  end: number;
}

export interface VideoTranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: VideoTranscriptWord[];
}

export interface SourceProject {
  id: string;
  title: string;
  sourceType: 'youtube' | 'upload' | 'sample';
  sourceUrl?: string;
  videoId?: string;
  originalFilePath?: string;
  duration: number; // in seconds
  resolution: string; // e.g., '1920x1080'
  fps: number;
  thumbnailUrl: string;
  transcript: VideoTranscriptSegment[];
  status: 'ready' | 'processing' | 'failed';
  createdAt: string;
}

export type FramingMode = 'blur_background' | 'crop_center' | 'fit_with_bars';

export interface SubtitleStyle {
  enabled: boolean;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  hasBackgroundPill: boolean;
  positionY: number; // percentage from top, 0-100, e.g. 70
  animationType: 'karaoke_word' | 'pop' | 'fade' | 'none';
  textTransform: 'uppercase' | 'none';
}

export interface HookOverlayConfig {
  enabled: boolean;
  text: string;
  subText?: string;
  position: 'top' | 'middle';
  backgroundColor: string;
  textColor: string;
  fontSize: number;
}

export interface WatermarkConfig {
  enabled: boolean;
  text?: string;
  logoUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity: number;
}

export interface AudioConfig {
  originalAudioVolume: number; // 0 to 1
  normalizeAudio: boolean;
  backgroundMusicTrack?: string;
  backgroundMusicVolume: number; // 0 to 1
  fadeInOut: boolean;
}

export interface ProgressBarConfig {
  enabled: boolean;
  color: string;
  height: number;
  position: 'bottom' | 'subtitles';
}

export interface ClipEditorConfig {
  framingMode: FramingMode;
  targetResolution: '720p' | '1080p' | '2k' | '4k';
  subtitles: SubtitleStyle;
  hookOverlay: HookOverlayConfig;
  watermark: WatermarkConfig;
  audio: AudioConfig;
  progressBar: ProgressBarConfig;
  showSafeZones: boolean;
  language: 'en' | 'hi' | 'hinglish';
}

export interface SEOMetadata {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  pinnedComment: string;
  category: string;
  categoryId: string;
  language: string;
  viralityScore: number; // 1 to 100
  viralityReasoning: string;
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  duration: number; // seconds
  hookText: string;
  transcriptText: string;
  transcriptWords: VideoTranscriptWord[];
  editorConfig: ClipEditorConfig;
  seoMetadata: SEOMetadata;
  renderStatus: 'draft' | 'rendering' | 'ready' | 'failed';
  renderProgress: number; // 0-100
  renderError?: string;
  outputVideoPath?: string;
  outputVideoUrl?: string;
  thumbnailUrl?: string;
  youtubeStatus: 'not_published' | 'scheduled' | 'publishing' | 'published' | 'failed';
  youtubeVideoId?: string;
  youtubeVideoUrl?: string;
  youtubeUploadError?: string;
  publishedAt?: string;
  scheduledFor?: string;
  destinationChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeChannel {
  id: string;
  channelId: string;
  title: string;
  customUrl: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  connectedAt: string;
  isDefault: boolean;
  tokenExpiresAt: number;
  scopes: string[];
  isDemo?: boolean;
}

export interface AutomationRule {
  enabled: boolean;
  clipsPerVideo: number;
  maxDailyClips: number;
  defaultDurationSec: number;
  defaultResolution: '720p' | '1080p';
  defaultLanguage: 'en' | 'hi' | 'hinglish';
  framingMode: FramingMode;
  autoPublish: boolean; // if false, requires manual approval
  defaultPrivacy: 'public' | 'unlisted' | 'private';
  destinationChannelId?: string;
  burnWatermark: boolean;
  watermarkText: string;
  safeZoneCompliance: boolean;
}

export interface ScheduledUploadJob {
  id: string;
  clipId: string;
  channelId: string;
  scheduledTime: string;
  privacy: 'public' | 'unlisted' | 'private';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: 'ingestion' | 'ai_analysis' | 'render' | 'youtube_upload' | 'automation' | 'system';
  level: 'info' | 'warn' | 'error' | 'success';
  title: string;
  details?: string;
  entityId?: string;
}

export interface SystemUsage {
  todayClipsGenerated: number;
  todayUploadsCount: number;
  storageUsedBytes: number;
  youtubeApiUnitsUsed: number;
  maxDailyClipsQuota: number;
  youtubeDailyQuotaLimit: number;
}

export interface SystemSettings {
  geminiApiKeyConfigured: boolean;
  googleOAuthConfigured: boolean;
  googleClientId?: string;
  storagePath: string;
  activeAiProvider: 'gemini' | 'free_heuristic';
  renderPreset: 'ultrafast' | 'fast' | 'medium';
  enableAudioNormalization: boolean;
}
