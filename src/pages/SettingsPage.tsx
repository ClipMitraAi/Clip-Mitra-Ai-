import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Key,
  HardDrive,
  Sliders,
  CheckCircle2,
  Shield,
  Volume2
} from 'lucide-react';
import { api } from '../api.ts';
import { SystemSettings } from '../types.ts';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.settings) setSettings(res.settings);
    });
  }, []);

  const handleSave = async (updates: Partial<SystemSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...updates };
    setSettings(next);
    setIsSaving(true);
    try {
      const res = await api.updateSettings(updates);
      if (res.settings) setSettings(res.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-purple-400 mb-1">
          <Settings className="h-3.5 w-3.5" />
          <span>Application Configuration</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">System Settings & Models</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure video encoding presets, AI providers, and audio normalization defaults.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 text-xs text-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Active AI Engine */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>AI Transcription & Virality Engine</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleSave({ activeAiProvider: 'gemini' })}
              className={`rounded-xl border p-4 text-left transition-all ${
                settings.activeAiProvider === 'gemini'
                  ? 'border-purple-500 bg-purple-950/20 text-white'
                  : 'border-slate-800 bg-slate-900 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Google Gemini 3.8 Flash</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Deep semantic analysis of transcript, hook extraction, virality scoring (1-100), and SEO keywords.
              </p>
            </button>

            <button
              onClick={() => handleSave({ activeAiProvider: 'free_heuristic' })}
              className={`rounded-xl border p-4 text-left transition-all ${
                settings.activeAiProvider === 'free_heuristic'
                  ? 'border-emerald-500 bg-emerald-950/20 text-white'
                  : 'border-slate-800 bg-slate-900 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Free Local Heuristic AI</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  OFFLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Zero external API calls. Uses local algorithmic speech pacing and pattern interrupts.
              </p>
            </button>
          </div>
        </div>

        {/* FFmpeg Video Encoding Preset */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>FFmpeg 9:16 Video Encoding Preset</span>
          </h3>
          <p className="text-xs text-slate-400">
            Controls CPU encoding speed versus file compression efficiency.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-1">
            {(['ultrafast', 'fast', 'medium'] as const).map(preset => (
              <button
                key={preset}
                onClick={() => handleSave({ renderPreset: preset })}
                className={`rounded-xl py-3 px-2 border text-center transition-all ${
                  settings.renderPreset === preset
                    ? 'border-cyan-500 bg-cyan-950/20 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <p className="text-xs font-bold uppercase">{preset}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {preset === 'ultrafast' ? 'Fastest preview' : preset === 'fast' ? 'Balanced (Default)' : 'High quality'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Defaults */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-emerald-400" />
                <span>Default Audio Loudness Normalization</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically normalize dialogue to YouTube Shorts standard (-16 LUFS).
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableAudioNormalization}
              onChange={e => handleSave({ enableAudioNormalization: e.target.checked })}
              className="h-4 w-4 rounded accent-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
