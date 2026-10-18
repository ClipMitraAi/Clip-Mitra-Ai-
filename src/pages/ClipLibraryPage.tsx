import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Scissors,
  Download,
  Trash2,
  ExternalLink,
  Play,
  RotateCw,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api.ts';
import { Clip, AppView } from '../types.ts';

interface ClipLibraryPageProps {
  clips: Clip[];
  onSelectClip: (clip: Clip) => void;
  onRefreshClips: () => void;
  setCurrentView: (view: AppView) => void;
}

export const ClipLibraryPage: React.FC<ClipLibraryPageProps> = ({
  clips,
  onSelectClip,
  onRefreshClips,
  setCurrentView
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'scheduled' | 'published' | 'draft'>('all');
  const [previewClip, setPreviewClip] = useState<Clip | null>(null);

  const filteredClips = clips.filter(clip => {
    const matchesSearch =
      clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clip.hookText.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'published') return clip.youtubeStatus === 'published';
    if (statusFilter === 'scheduled') return clip.youtubeStatus === 'scheduled';
    if (statusFilter === 'ready') return clip.renderStatus === 'ready';
    if (statusFilter === 'draft') return clip.renderStatus === 'draft';
    return true;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this clip?')) {
      await api.deleteClip(id);
      onRefreshClips();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-purple-400 mb-1">
            <Layers className="h-3.5 w-3.5" />
            <span>Content Library</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Generated Shorts Library</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, preview, download, re-render, and publish all your extracted video clips.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('create_clips')}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all"
        >
          + Extract New Clips
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search clips by title, hook..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'ready', 'scheduled', 'published', 'draft'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Clips Grid */}
      {filteredClips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 space-y-3">
          <Layers className="h-10 w-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">No clips found matching your filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="text-xs text-purple-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClips.map(clip => (
            <div
              key={clip.id}
              onClick={() => {
                onSelectClip(clip);
                setCurrentView('video_editor');
              }}
              className="rounded-2xl border border-slate-800 bg-[#0d121f] overflow-hidden hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail banner with play overlay */}
                <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src={clip.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}
                    alt={clip.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Play preview icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="h-5 w-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Virality score badge */}
                  <div className="absolute top-2 left-2 rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-black text-white shadow">
                    🔥 {clip.seoMetadata.viralityScore}% VIRAL
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
                    ) : clip.renderStatus === 'ready' ? (
                      <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        MP4 Ready
                      </span>
                    ) : (
                      <span className="rounded bg-slate-800/80 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Duration and Resolution */}
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-white">
                    {clip.duration}s • {clip.editorConfig.targetResolution}
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 space-y-2">
                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {clip.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    Hook: {clip.hookText}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {clip.transcriptText}
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-purple-400 font-bold flex items-center space-x-1 hover:underline">
                  <Scissors className="h-3.5 w-3.5" />
                  <span>Edit in Studio</span>
                </span>

                <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                  {clip.outputVideoPath && (
                    <a
                      href={`/api/render/download/${clip.id}`}
                      download
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Download MP4"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  )}

                  {clip.youtubeVideoUrl && (
                    <a
                      href={clip.youtubeVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Watch Short on YouTube"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    onClick={e => handleDelete(clip.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete clip"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
