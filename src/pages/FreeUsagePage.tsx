import React from 'react';
import {
  Gift,
  Cpu,
  Terminal,
  CheckCircle2,
  HardDrive,
  Code,
  Shield,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AppView } from '../types.ts';

interface FreeUsagePageProps {
  setCurrentView: (view: AppView) => void;
}

export const FreeUsagePage: React.FC<FreeUsagePageProps> = ({ setCurrentView }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
          <Gift className="h-3.5 w-3.5" />
          <span>Zero Paid-API Dependency</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Free-Usage & Self-Hosted Architecture</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          ClipMitra AI is completely usable out-of-the-box with free, open-source local components.
        </p>
      </div>

      {/* Free Tier Core Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Local FFmpeg Core (100% Free)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All 9:16 background blur rendering, subtitle burning, hook banners, and EBU R128 audio normalization run directly on your CPU/GPU with no cloud rendering credits needed.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Local Heuristic AI Fallback</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Even without Gemini or OpenAI keys, our heuristic engine extracts high-retention moments and viral hooks based on speech cadence and emotional punctuation.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Local Storage Adapter</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Stores media directly in <code>./data/storage</code> with automatic file rotation and one-click cache cleanup. No mandatory AWS S3 buckets required.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Free YouTube API Tier</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Google provides 10,000 free quota units daily for every registered project, enabling up to 6 automated video uploads each day at $0 cost.
          </p>
        </div>
      </div>

      {/* Docker Compose Quickstart */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c101b] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span>Self-Hosting with Docker Compose</span>
        </h3>
        <p className="text-xs text-slate-400">
          Run ClipMitra AI on any Ubuntu, Debian, or Mac VPS using a single command:
        </p>

        <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto leading-relaxed">
{`# 1. Clone repository
git clone https://github.com/your-username/clipmitra-ai.git
cd clipmitra-ai

# 2. Copy environment template
cp .env.example .env

# 3. Launch full stack with FFmpeg and Redis
docker compose up -d --build

# 4. Open in browser:
http://localhost:3000`}
        </pre>
      </div>

      {/* Cloud & Scale Reality Check */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Transparent Scale Disclosures</h4>
        <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
          <p>
            • While local processing is 100% free, high-volume production (e.g. 100+ videos daily) will require dedicated cloud GPU compute or a server with multiple CPU cores.
          </p>
          <p>
            • To upload more than 6 videos per day to YouTube, you must submit a free quota extension request directly in Google Cloud Console.
          </p>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => setCurrentView('create_clips')}
          className="flex items-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 text-xs font-bold text-white shadow-lg transition-all"
        >
          <span>Start Generating Clips in Free Mode</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
