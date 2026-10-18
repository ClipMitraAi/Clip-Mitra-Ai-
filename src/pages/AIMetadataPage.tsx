import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCw,
  Youtube,
  Tag,
  Hash,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Sliders,
  Send
} from 'lucide-react';
import { api } from '../api.ts';
import { Clip, SEOMetadata, AppView, YouTubeChannel } from '../types.ts';

interface AIMetadataPageProps {
  clip: Clip | null;
  channels: YouTubeChannel[];
  onUpdateClip: (clip: Clip) => void;
  setCurrentView: (view: AppView) => void;
}

export const AIMetadataPage: React.FC<AIMetadataPageProps> = ({
  clip,
  channels,
  onUpdateClip,
  setCurrentView
}) => {
  if (!clip) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <h3 className="text-lg font-bold text-white">No Clip Selected</h3>
        <p className="text-xs text-slate-400">
          Select a clip from the library or generate one first to optimize its YouTube SEO metadata.
        </p>
        <button
          onClick={() => setCurrentView('clip_library')}
          className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white"
        >
          Open Clip Library
        </button>
      </div>
    );
  }

  const [metadata, setMetadata] = useState<SEOMetadata>(clip.seoMetadata);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    clip.destinationChannelId || channels[0]?.id || ''
  );
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save changes
  const handleSaveMetadata = async () => {
    const updated = await api.updateClip(clip.id, { seoMetadata: metadata });
    if (updated.clip) onUpdateClip(updated.clip);
  };

  // Re-generate with Gemini AI
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await api.generateMetadata({
        clipId: clip.id,
        title: metadata.title || clip.title,
        hookText: clip.hookText,
        transcriptText: clip.transcriptText,
        language: metadata.language
      });
      if (res.metadata) {
        setMetadata(res.metadata);
        const updated = await api.updateClip(clip.id, { seoMetadata: res.metadata });
        if (updated.clip) onUpdateClip(updated.clip);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Direct Publish to YouTube
  const handlePublishNow = async () => {
    if (!selectedChannelId) {
      setPublishError('Please select a destination YouTube channel.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      // First save metadata
      await api.updateClip(clip.id, { seoMetadata: metadata });

      const res = await api.publishToYouTube({
        clipId: clip.id,
        channelId: selectedChannelId,
        privacy
      });

      if (res.success) {
        setPublishSuccess(res.result?.videoUrl || 'Published successfully!');
        const updated = await api.getClip(clip.id);
        if (updated.clip) onUpdateClip(updated.clip);
      }
    } catch (err: any) {
      setPublishError(err.message || 'YouTube upload failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedChannel = channels.find(c => c.id === selectedChannelId) || channels[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-purple-400 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI SEO Studio & YouTube Publisher</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Metadata & Publishing Optimization</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tuned to maximize search ranking, click-through rate, and YouTube algorithm recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate with AI</span>
          </button>

          <button
            onClick={() => setCurrentView('video_editor')}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200"
          >
            Back to Editor
          </button>
        </div>
      </div>

      {/* Virality Indicator Banner */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-slate-900/60 to-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex flex-col items-center justify-center text-red-400 flex-shrink-0">
            <span className="text-xl font-black">{metadata.viralityScore}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">Score</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">High Virality Potential</h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 font-bold">TOP 5%</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">{metadata.viralityReasoning}</p>
          </div>
        </div>
      </div>

      {/* Main Metadata Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* YouTube Shorts Title */}
          <div className="rounded-xl border border-slate-800 bg-[#0d121f] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <FileText className="h-4 w-4 text-purple-400" />
                <span>YouTube Shorts Title (under 100 characters)</span>
              </label>
              <span
                className={`text-[10px] font-mono font-bold ${
                  metadata.title.length > 95 ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {metadata.title.length}/100 chars
              </span>
            </div>
            <input
              type="text"
              value={metadata.title}
              onChange={e => setMetadata({ ...metadata, title: e.target.value })}
              onBlur={handleSaveMetadata}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="rounded-xl border border-slate-800 bg-[#0d121f] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Video Description & Call to Actions</label>
              <button
                onClick={() => copyToClipboard(metadata.description, 'desc')}
                className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                {copiedKey === 'desc' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'desc' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={metadata.description}
              onChange={e => setMetadata({ ...metadata, description: e.target.value })}
              onBlur={handleSaveMetadata}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-white focus:border-purple-500 focus:outline-none font-mono"
            />
          </div>

          {/* Hashtags */}
          <div className="rounded-xl border border-slate-800 bg-[#0d121f] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Hash className="h-4 w-4 text-cyan-400" />
                <span>Viral Hashtags</span>
              </label>
              <button
                onClick={() => copyToClipboard(metadata.hashtags.join(' '), 'hash')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                {copiedKey === 'hash' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'hash' ? 'Copied All' : 'Copy All'}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {metadata.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 text-xs font-medium text-cyan-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* YouTube Search Tags */}
          <div className="rounded-xl border border-slate-800 bg-[#0d121f] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Tag className="h-4 w-4 text-emerald-400" />
                <span>Search Keywords & Tags (Comma Separated)</span>
              </label>
              <button
                onClick={() => copyToClipboard(metadata.tags.join(', '), 'tags')}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                {copiedKey === 'tags' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'tags' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {metadata.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pinned Comment Draft */}
          <div className="rounded-xl border border-slate-800 bg-[#0d121f] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <MessageSquare className="h-4 w-4 text-amber-400" />
                <span>High-Engagement Pinned Comment Draft</span>
              </label>
              <button
                onClick={() => copyToClipboard(metadata.pinnedComment, 'pinned')}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                {copiedKey === 'pinned' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'pinned' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={metadata.pinnedComment}
              onChange={e => setMetadata({ ...metadata, pinnedComment: e.target.value })}
              onBlur={handleSaveMetadata}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Form: YouTube Channel & Publishing Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-purple-500/30 bg-[#0c101b] p-5 space-y-5 shadow-xl">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <Youtube className="h-5 w-5 text-red-500" />
              <span>Official YouTube Publishing</span>
            </div>

            {/* Channel Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Authorized Destination Channel</label>
              <select
                value={selectedChannelId}
                onChange={e => setSelectedChannelId(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {channels.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.customUrl})
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Video Visibility</label>
              <div className="grid grid-cols-3 gap-2">
                {(['public', 'unlisted', 'private'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPrivacy(mode)}
                    className={`rounded-xl py-2 text-xs font-bold capitalize transition-all border ${
                      privacy === mode
                        ? 'border-red-500 bg-red-600 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">YouTube Category</label>
              <select
                value={metadata.category}
                onChange={e => setMetadata({ ...metadata, category: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white"
              >
                <option value="Education">Education (Cat 27)</option>
                <option value="Howto & Style">Howto & Style (Cat 26)</option>
                <option value="Entertainment">Entertainment (Cat 24)</option>
                <option value="Science & Technology">Science & Technology (Cat 28)</option>
                <option value="People & Blogs">People & Blogs (Cat 22)</option>
              </select>
            </div>

            {/* Publish Action Button */}
            <div className="pt-2">
              <button
                onClick={handlePublishNow}
                disabled={isPublishing}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 py-3 text-xs font-bold text-white shadow-xl shadow-red-600/30 transition-all hover:scale-102"
              >
                {isPublishing ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Uploading to YouTube API...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish Short Now ({privacy.toUpperCase()})</span>
                  </>
                )}
              </button>
            </div>

            {/* Schedule Alternate Action */}
            <button
              onClick={() => setCurrentView('scheduler')}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-colors"
            >
              Or Schedule for Specific Date & Time →
            </button>

            {/* Result Alerts */}
            {publishSuccess && (
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 text-xs text-emerald-200 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Confirmed by YouTube API!</span>
                </div>
                <a
                  href={publishSuccess}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline block truncate"
                >
                  {publishSuccess}
                </a>
              </div>
            )}

            {publishError && (
              <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-3 text-xs text-rose-200">
                {publishError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
