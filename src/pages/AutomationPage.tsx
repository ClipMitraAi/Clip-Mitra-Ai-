import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  Youtube,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { api } from '../api.ts';
import { AutomationRule, YouTubeChannel, AppView } from '../types.ts';

interface AutomationPageProps {
  channels: YouTubeChannel[];
  setCurrentView: (view: AppView) => void;
}

export const AutomationPage: React.FC<AutomationPageProps> = ({
  channels,
  setCurrentView
}) => {
  const [rules, setRules] = useState<AutomationRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getAutomationRules().then(res => {
      if (res.rules) setRules(res.rules);
    });
  }, []);

  const handleUpdate = async (updates: Partial<AutomationRule>) => {
    if (!rules) return;
    const next = { ...rules, ...updates };
    setRules(next);
    setIsSaving(true);
    try {
      const res = await api.updateAutomationRules(updates);
      if (res.rules) setRules(res.rules);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!rules) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 mb-1">
            <Zap className="h-3.5 w-3.5" />
            <span>Autonomous Pipeline Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Automation & Hands-Free Rules</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated clipping, caption styling, rendering, and scheduled publishing rules.
          </p>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <span className="text-xs font-bold text-slate-200">
            {rules.enabled ? 'Automation ACTIVE' : 'Automation PAUSED'}
          </span>
          <button
            onClick={() => handleUpdate({ enabled: !rules.enabled })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              rules.enabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                rules.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Visual Pipeline Workflow Diagram */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Visual Workflow Execution Chain
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-xs">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 space-y-1">
            <span className="text-[10px] text-purple-400 font-mono font-bold">STEP 1</span>
            <p className="font-bold text-white text-[11px]">Video Ingest</p>
            <p className="text-[9px] text-slate-400">YouTube or Upload</p>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 space-y-1">
            <span className="text-[10px] text-purple-400 font-mono font-bold">STEP 2</span>
            <p className="font-bold text-white text-[11px]">AI Transcription</p>
            <p className="text-[9px] text-slate-400">Word-level sync</p>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 space-y-1">
            <span className="text-[10px] text-purple-400 font-mono font-bold">STEP 3</span>
            <p className="font-bold text-white text-[11px]">Virality Detection</p>
            <p className="text-[9px] text-slate-400">Extract top {rules.clipsPerVideo} clips</p>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 space-y-1">
            <span className="text-[10px] text-purple-400 font-mono font-bold">STEP 4</span>
            <p className="font-bold text-white text-[11px]">9:16 FFmpeg Render</p>
            <p className="text-[9px] text-slate-400">Burn hooks & text</p>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 space-y-1">
            <span className="text-[10px] text-purple-400 font-mono font-bold">STEP 5</span>
            <p className="font-bold text-white text-[11px]">SEO Generator</p>
            <p className="text-[9px] text-slate-400">Titles, tags, hooks</p>
          </div>

          <div className="rounded-xl bg-slate-900 border border-purple-500/40 bg-purple-950/20 p-2.5 space-y-1">
            <span className="text-[10px] text-emerald-400 font-mono font-bold">STEP 6</span>
            <p className="font-bold text-white text-[11px]">
              {rules.autoPublish ? 'Auto-Publish' : 'Hold Approval'}
            </p>
            <p className="text-[9px] text-slate-400">YouTube channel</p>
          </div>
        </div>
      </div>

      {/* Automation Parameters Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Guardrail: Approval vs Auto-Publish */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c101b] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">Manual Approval Guardrail</h3>
              <p className="text-[11px] text-slate-400">
                {rules.autoPublish
                  ? '⚠️ Clips are published automatically to YouTube without human review.'
                  : '✅ Clips are held in Draft mode until you review & approve them.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleUpdate({ autoPublish: false })}
              className={`rounded-xl py-2 px-3 text-xs font-bold border transition-all ${
                !rules.autoPublish
                  ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400'
              }`}
            >
              Require Approval (Safe)
            </button>
            <button
              onClick={() => handleUpdate({ autoPublish: true })}
              className={`rounded-xl py-2 px-3 text-xs font-bold border transition-all ${
                rules.autoPublish
                  ? 'border-amber-500 bg-amber-950/30 text-amber-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400'
              }`}
            >
              Full Auto-Publish
            </button>
          </div>
        </div>

        {/* Destination Channel */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c101b] p-5 space-y-3">
          <h3 className="text-xs font-bold text-white">Default Destination Channel</h3>
          <select
            value={rules.destinationChannelId || ''}
            onChange={e => handleUpdate({ destinationChannelId: e.target.value })}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white"
          >
            {channels.map(c => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.customUrl})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400">
            Automated uploads will target this OAuth authorized channel.
          </p>
        </div>

        {/* Clips per source video */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c101b] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Clips Per Source Video</h3>
            <span className="font-mono text-purple-300 font-bold">{rules.clipsPerVideo} clips</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={rules.clipsPerVideo}
            onChange={e => handleUpdate({ clipsPerVideo: Number(e.target.value) })}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1 clip</span>
            <span>3 (Optimal)</span>
            <span>10 max</span>
          </div>
        </div>

        {/* Daily Safety Cap */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c101b] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Maximum Daily Upload Limit</h3>
            <span className="font-mono text-cyan-300 font-bold">{rules.maxDailyClips} uploads/day</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={rules.maxDailyClips}
            onChange={e => handleUpdate({ maxDailyClips: Number(e.target.value) })}
            className="w-full accent-cyan-500"
          />
          <p className="text-[10px] text-slate-400">
            Prevents hitting YouTube Data API 10,000 units quota limit.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 text-xs text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Automation rules updated and synced with background scheduler.</span>
        </div>
      )}
    </div>
  );
};
