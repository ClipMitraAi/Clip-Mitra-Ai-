import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Youtube,
  RefreshCw,
  Coins
} from 'lucide-react';
import { api } from '../api.ts';
import { SystemUsage } from '../types.ts';

export const UsageLimitsPage: React.FC = () => {
  const [storageData, setStorageData] = useState<{
    storageSize: number;
    fileCount: number;
    usage: SystemUsage;
    storageDir: string;
  } | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanMessage, setCleanMessage] = useState<string | null>(null);

  const loadData = () => {
    api.getStorageInfo().then(res => setStorageData(res));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCleanTemp = async () => {
    setIsCleaning(true);
    setCleanMessage(null);
    try {
      const res = await api.cleanTempStorage();
      setCleanMessage(`Purged ${res.cleanedCount} temporary video cache files.`);
      loadData();
    } catch (e: any) {
      setCleanMessage(e.message || 'Cleaning failed');
    } finally {
      setIsCleaning(false);
    }
  };

  if (!storageData) return null;

  const storageMb = (storageData.storageSize / (1024 * 1024)).toFixed(1);
  const quota = storageData.usage;
  const youtubeUsedPercent = Math.min(100, Math.round((quota.youtubeApiUnitsUsed / quota.youtubeDailyQuotaLimit) * 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
            <HardDrive className="h-3.5 w-3.5" />
            <span>Infrastructure & Resource Monitor</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Usage, Storage & API Quotas</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of disk space, temporary renders, and YouTube Data API v3 units.
          </p>
        </div>

        <button
          onClick={handleCleanTemp}
          disabled={isCleaning}
          className="flex items-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors"
        >
          <Trash2 className="h-4 w-4 text-amber-400" />
          <span>{isCleaning ? 'Purging Temp Files...' : 'Clean Cache & Temp Files'}</span>
        </button>
      </div>

      {cleanMessage && (
        <div className="rounded-xl bg-purple-950/40 border border-purple-500/40 p-3 text-xs text-purple-200 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-purple-400" />
          <span>{cleanMessage}</span>
        </div>
      )}

      {/* Quota Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Local Storage Meter */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Disk Storage</span>
            <HardDrive className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{storageMb} MB</div>
            <p className="text-xs text-slate-400 mt-1">{storageData.fileCount} video files on disk</p>
          </div>
          <div className="rounded-lg bg-slate-900 p-2.5 text-[11px] text-slate-400 font-mono truncate">
            {storageData.storageDir}
          </div>
        </div>

        {/* YouTube API Units */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">YouTube API Quota</span>
            <Youtube className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {quota.youtubeApiUnitsUsed} <span className="text-sm font-normal text-slate-400">/ 10,000 units</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{youtubeUsedPercent}% of daily allowance</p>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${youtubeUsedPercent}%` }} />
          </div>
        </div>

        {/* Daily Clip Generation Limit */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Clips Created</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {quota.todayClipsGenerated} <span className="text-sm font-normal text-slate-400">/ {quota.maxDailyClipsQuota} clips</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Safety cap resets at midnight PST</p>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${Math.min(100, (quota.todayClipsGenerated / quota.maxDailyClipsQuota) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Honest Quota & Pricing Disclosure */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c101b] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Coins className="h-4 w-4 text-emerald-400" />
          <span>Understanding Free Tier vs Cloud Costs</span>
        </h3>

        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            • <strong>Local Video Processing (FFmpeg)</strong>: 100% Free. Runs locally on your machine or Docker container with no third-party rendering fees.
          </p>
          <p>
            • <strong>YouTube Data API v3</strong>: Free tier provides 10,000 quota units per day. Since a video upload consumes 1,600 units, you can publish up to 6 Shorts per day for free before requesting a quota increase in Google Cloud Console.
          </p>
          <p>
            • <strong>Gemini 3.8 Flash</strong>: Free tier covers high volume transcript analysis and SEO metadata generation.
          </p>
          <p>
            • <strong>Local Heuristic AI Fallback</strong>: Built directly into ClipMitra AI to generate clips, hooks, and timestamps with 0 API calls if you choose to work offline.
          </p>
        </div>
      </div>
    </div>
  );
};
