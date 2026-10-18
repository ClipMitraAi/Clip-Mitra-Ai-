import React, { useState } from 'react';
import {
  Youtube,
  Upload,
  Sparkles,
  Play,
  FileVideo,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Sliders,
  Flame,
  ArrowRight
} from 'lucide-react';
import { api } from '../api.ts';
import { AppView, SourceProject, Clip } from '../types.ts';

interface CreateClipsPageProps {
  projects: SourceProject[];
  selectedProject: SourceProject | null;
  setSelectedProject: (proj: SourceProject | null) => void;
  onClipsGenerated: (clips: Clip[]) => void;
  setCurrentView: (view: AppView) => void;
  onSelectClip: (clip: Clip) => void;
}

export const CreateClipsPage: React.FC<CreateClipsPageProps> = ({
  projects,
  selectedProject,
  setSelectedProject,
  onClipsGenerated,
  setCurrentView,
  onSelectClip
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'sample'>('url');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Configuration Parameters
  const [durationOption, setDurationOption] = useState<'30s' | '60s' | '30-60s' | '60-120s' | 'custom'>('30-60s');
  const [customDurationSec, setCustomDurationSec] = useState(45);
  const [clipCount, setClipCount] = useState(3);
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [framingMode, setFramingMode] = useState<'blur_background' | 'crop_center' | 'fit_with_bars'>('blur_background');

  // Handle YouTube URL ingestion
  const handleImportYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsSubmitting(true);
    setStatusMessage('Validating YouTube video & synchronizing transcript...');
    setErrorMessage(null);

    try {
      const res = await api.importYouTube(youtubeUrl, undefined, customTitle || undefined);
      if (res.project) {
        setSelectedProject(res.project);
        setStatusMessage('Video imported successfully. Ready to detect viral clips!');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to import YouTube video.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Video file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsSubmitting(true);
    setStatusMessage('Uploading video & running FFmpeg probe...');
    setErrorMessage(null);

    try {
      const res = await api.uploadVideo(uploadFile, customTitle || uploadFile.name);
      if (res.project) {
        setSelectedProject(res.project);
        setStatusMessage('Local video uploaded and probed successfully.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload video.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sample Video Load
  const handleLoadSample = async (type: 'podcast' | 'tech_talk') => {
    setIsSubmitting(true);
    setStatusMessage('Loading preset test video...');
    setErrorMessage(null);

    try {
      const res = await api.loadSampleProject(type);
      if (res.project) {
        setSelectedProject(res.project);
        setStatusMessage('Sample video loaded with pre-aligned word transcript.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load sample.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run AI Viral Clip Generation on Selected Project
  const handleGenerateViralClips = async () => {
    if (!selectedProject) return;

    setIsSubmitting(true);
    setStatusMessage('Gemini AI analyzing transcript, emotional peaks & virality hooks...');
    setErrorMessage(null);

    try {
      const res = await api.generateClips({
        projectId: selectedProject.id,
        duration: durationOption,
        clipCount,
        language,
        framingMode
      });

      if (res.clips && res.clips.length > 0) {
        onClipsGenerated(res.clips);
        onSelectClip(res.clips[0]);
        setStatusMessage(`Successfully created ${res.clips.length} viral clips! Redirecting to Editor...`);
        setTimeout(() => {
          setCurrentView('video_editor');
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'AI clip generation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-300 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Stage 1: Source Ingestion & AI Clip Extraction</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Import Video & Generate Viral Clips
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Paste a YouTube URL, upload your own video file, or test immediately using preset samples.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center space-x-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'url'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Youtube className="h-4 w-4 text-red-500" />
          <span>YouTube Video URL</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center space-x-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'upload'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="h-4 w-4 text-cyan-400" />
          <span>Upload File (MP4/WebM/MOV)</span>
        </button>

        <button
          onClick={() => setActiveTab('sample')}
          className={`flex items-center space-x-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'sample'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Play className="h-4 w-4 text-emerald-400" />
          <span>Instant Sample Videos</span>
        </button>
      </div>

      {/* Form Panels */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 space-y-6">
        {activeTab === 'url' && (
          <form onSubmit={handleImportYouTube} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Public YouTube Video URL or Video ID
              </label>
              <div className="relative">
                <Youtube className="absolute left-3.5 top-3 h-5 w-5 text-red-500" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or video ID"
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Complies with YouTube Data API v3 terms. Fetches metadata and public speech transcripts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Custom Project Title (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave blank to use original YouTube title"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !youtubeUrl.trim()}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validating & Ingesting Video...</span>
                </>
              ) : (
                <>
                  <Youtube className="h-4 w-4" />
                  <span>Import YouTube Video</span>
                </>
              )}
            </button>
          </form>
        )}

        {activeTab === 'upload' && (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Select Local Video File (Up to 250MB)
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-900/50">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">
                  {uploadFile ? uploadFile.name : 'Drag and drop video here, or click to browse'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Supports MP4, MOV, WebM, MKV</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="mt-3 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !uploadFile}
              className="flex items-center justify-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading & Probing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload & Ingest Video</span>
                </>
              )}
            </button>
          </form>
        )}

        {activeTab === 'sample' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Need to test immediately without uploading a big file? Click any sample video below to test real FFmpeg encoding:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleLoadSample('podcast')}
                disabled={isSubmitting}
                className="rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 p-4 text-left transition-all group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Play className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Viral Podcast Masterclass</h4>
                    <span className="text-[10px] text-slate-400">45s • 1280x720 • Dialogue with high hook</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ideal for testing hook detection, animated karaoke captions, and 9:16 background blur.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('tech_talk')}
                disabled={isSubmitting}
                className="rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 p-4 text-left transition-all group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Play className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">AI Architecture Keynote</h4>
                    <span className="text-[10px] text-slate-400">35s • 1280x720 • Fast technical speech</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ideal for testing center crop, tech SEO keywords, and YouTube upload scheduling.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Status / Feedback Alert */}
        {statusMessage && (
          <div className="rounded-xl bg-purple-950/30 border border-purple-500/40 p-3 flex items-center space-x-2 text-xs text-purple-200">
            <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl bg-rose-950/30 border border-rose-500/40 p-3 flex items-center space-x-2 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Selected Video Preview & AI Generator Controls */}
      {selectedProject && (
        <div className="rounded-2xl border border-purple-500/30 bg-[#0d121f] p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <FileVideo className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Active Source</span>
                <h3 className="text-sm font-bold text-white line-clamp-1">{selectedProject.title}</h3>
              </div>
            </div>
            <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
              {selectedProject.duration}s • {selectedProject.resolution}
            </span>
          </div>

          {/* AI Settings Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Clip Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                <span>Clip Duration</span>
              </label>
              <select
                value={durationOption}
                onChange={e => setDurationOption(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="30s">30 seconds (Quick Hook)</option>
                <option value="60s">60 seconds (Standard Short)</option>
                <option value="30-60s">30–60 seconds (Optimal Virality)</option>
                <option value="60-120s">60–120 seconds (Deep Dive)</option>
                <option value="custom">Custom Duration</option>
              </select>
            </div>

            {/* Clips count */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Number of Clips</span>
              </label>
              <select
                value={clipCount}
                onChange={e => setClipCount(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="1">1 Best Clip</option>
                <option value="3">Top 3 Viral Clips (Recommended)</option>
                <option value="5">Top 5 Clips</option>
                <option value="10">Top 10 Clips Batch</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                <span>Captions Language</span>
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="en">English (US/UK)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="hinglish">Hinglish (Mix)</option>
              </select>
            </div>

            {/* Framing Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>9:16 Framing Mode</span>
              </label>
              <select
                value={framingMode}
                onChange={e => setFramingMode(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="blur_background">Blurred Background (Viral Standard)</option>
                <option value="crop_center">Center Crop 9:16</option>
                <option value="fit_with_bars">Fit with Letterbox Bars</option>
              </select>
            </div>
          </div>

          {/* Trigger AI Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateViralClips}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 px-8 py-3.5 text-xs font-bold text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-102"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing Moments with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Extract Top {clipCount} Viral Clips Now</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
