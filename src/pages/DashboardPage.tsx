import React from 'react';
import {
  Scissors,
  Video,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  HardDrive,
  Play,
  ArrowRight,
  Youtube,
  Zap,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { AppView, Clip, SourceProject, ActivityLog, SystemUsage, YouTubeChannel } from '../types.ts';

interface DashboardPageProps {
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
  setCurrentView: (view: AppView) => void;
  onSelectClip: (clip: Clip) => void;
  onSelectProject: (proj: SourceProject) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  recentProjects,
  recentClips,
  recentLogs,
  setCurrentView,
  onSelectClip,
  onSelectProject
}) => {
  const usage = stats.usage;
  const quotaPercent = Math.min(100, Math.round((usage.youtubeApiUnitsUsed / usage.youtubeDailyQuotaLimit) * 100));
  const dailyClipsPercent = Math.min(100, Math.round((usage.todayClipsGenerated / usage.maxDailyClipsQuota) * 100));

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/30 via-slate-900/60 to-slate-900/80 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/20 border border-purple-500/40 px-3 py-1 text-xs font-semibold text-purple-300 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
              <span>AI Viral Clipping & Publishing Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ClipMitra Creator Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transform long YouTube podcasts, tutorials, and speeches into viral 9:16 Shorts with automated subtitles, hooks, and 1-click publishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentView('create_clips')}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-102"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate New Clips</span>
            </button>

            <button
              onClick={() => setCurrentView('automation')}
              className="flex items-center space-x-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-4 py-3 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Automation Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Clips */}
        <div className="rounded-xl border border-slate-800/90 bg-[#0d121f] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Clips</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Scissors className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.totalClips}</div>
            <div className="text-[10px] text-emerald-400 flex items-center space-x-1 mt-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+3 new today</span>
            </div>
          </div>
        </div>

        {/* Videos Processed */}
        <div className="rounded-xl border border-slate-800/90 bg-[#0d121f] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Videos Processed</span>
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.totalProjects}</div>
            <div className="text-[10px] text-slate-400 mt-1">Source library</div>
          </div>
        </div>

        {/* Scheduled Uploads */}
        <div className="rounded-xl border border-slate-800/90 bg-[#0d121f] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Scheduled</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.scheduledClips}</div>
            <div className="text-[10px] text-amber-300 mt-1">Auto-queue active</div>
          </div>
        </div>

        {/* Published Videos */}
        <div className="rounded-xl border border-slate-800/90 bg-[#0d121f] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Published</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.publishedClips}</div>
            <div className="text-[10px] text-emerald-400 mt-1">Confirmed on YouTube</div>
          </div>
        </div>

        {/* Failed Jobs */}
        <div className="rounded-xl border border-slate-800/90 bg-[#0d121f] p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Failed Jobs</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.failedJobs}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {stats.failedJobs === 0 ? 'All pipelines healthy' : 'Action required'}
            </div>
          </div>
        </div>
      </div>

      {/* Quotas & Channel Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Generation Quota */}
        <div className="rounded-xl border border-slate-800 bg-[#0c101b] p-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-200">Daily Clip Generation Quota</span>
            <span className="font-mono text-purple-300">
              {usage.todayClipsGenerated} / {usage.maxDailyClipsQuota} clips
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${dailyClipsPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Resets at midnight. Unlimited clips available in self-hosted free mode.
          </p>
        </div>

        {/* YouTube API Daily Quota */}
        <div className="rounded-xl border border-slate-800 bg-[#0c101b] p-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-200">YouTube Data API v3 Daily Quota</span>
            <span className="font-mono text-cyan-300">
              {usage.youtubeApiUnitsUsed} / {usage.youtubeDailyQuotaLimit} units ({quotaPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaPercent > 80 ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            1 Short upload = 1,600 units. Free tier grants 10,000 units/day (~6 uploads).
          </p>
        </div>
      </div>

      {/* Recent Viral Clips Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Scissors className="h-4 w-4 text-purple-400" />
              <span>Recent Generated Clips</span>
            </h2>
            <p className="text-xs text-slate-400">Ready for editing, preview, and YouTube publishing</p>
          </div>
          <button
            onClick={() => setCurrentView('clip_library')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
          >
            <span>View All Clips ({stats.totalClips})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentClips.map(clip => (
            <div
              key={clip.id}
              className="rounded-xl border border-slate-800 bg-[#0d121f] overflow-hidden hover:border-purple-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Top preview frame */}
                <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src={clip.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}
                    alt={clip.title}
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Virality score badge */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1 rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-black text-white shadow">
                    <span>🔥 {clip.seoMetadata.viralityScore}% VIRAL</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {clip.youtubeStatus === 'published' ? (
                      <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        Published
                      </span>
                    ) : clip.youtubeStatus === 'scheduled' ? (
                      <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        Scheduled
                      </span>
                    ) : (
                      <span className="rounded bg-slate-800/80 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Duration pill */}
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white">
                    {clip.duration}s (9:16)
                  </div>
                </div>

                {/* Content info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {clip.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    Hook: {clip.hookText}
                  </p>
                </div>
              </div>

              {/* Actions footer */}
              <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-800/60 mt-1">
                <button
                  onClick={() => {
                    onSelectClip(clip);
                    setCurrentView('video_editor');
                  }}
                  className="flex items-center space-x-1 text-xs font-bold text-purple-400 hover:text-purple-300"
                >
                  <Scissors className="h-3.5 w-3.5" />
                  <span>Open in Editor</span>
                </button>

                {clip.youtubeVideoUrl && (
                  <a
                    href={clip.youtubeVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <span>Watch</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Section: Recent Source Videos & Activity Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Source Projects */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0c101b] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Video className="h-4 w-4 text-cyan-400" />
              <span>Source Videos Ingested</span>
            </h3>
            <button
              onClick={() => setCurrentView('create_clips')}
              className="text-xs text-purple-400 hover:underline font-semibold"
            >
              + Ingest Video
            </button>
          </div>

          <div className="space-y-3">
            {recentProjects.map(proj => (
              <div
                key={proj.id}
                className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 flex items-center justify-between hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <img
                    src={proj.thumbnailUrl}
                    alt={proj.title}
                    className="h-12 w-20 rounded-lg object-cover ring-1 ring-slate-800 flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-200 truncate">{proj.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {proj.sourceType.toUpperCase()} • {proj.duration}s • {proj.resolution}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectProject(proj);
                    setCurrentView('create_clips');
                  }}
                  className="flex-shrink-0 ml-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 px-3 py-1.5 text-xs font-semibold text-purple-300 transition-colors"
                >
                  Generate
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Audit Trail */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0c101b] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>System Activity Log</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Real-time audit</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {recentLogs.map(log => (
              <div key={log.id} className="text-xs border-l-2 border-slate-700 pl-3 py-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{log.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {log.details && <p className="text-[11px] text-slate-400 leading-tight">{log.details}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
