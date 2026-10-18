import React from 'react';
import {
  Sparkles,
  Scissors,
  Youtube,
  Zap,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
  Flame,
  Award
} from 'lucide-react';
import { AppView } from '../types.ts';

interface LandingPageProps {
  onGetStarted: () => void;
  setCurrentView: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, setCurrentView }) => {
  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-6">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>Convert 1 Long Video Into 10 Viral Shorts in 60 Seconds</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Turn Any Long YouTube Video Into <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Viral 9:16 Shorts & Auto-Publish
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ClipMitra AI automatically identifies high-retention moments, crafts attention-grabbing hooks, burns animated karaoke captions, and schedules uploads directly to your authorized YouTube channel.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Studio & Generate Clips</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setCurrentView('free_usage')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-slate-900 border border-slate-700/80 px-6 py-4 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span>100% Free Self-Hosted Mode</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Official YouTube Data API v3 OAuth</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Native FFmpeg 9:16 Processing</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Gemini 3.8 Flash Virality AI</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Mock Showcase */}
        <div className="max-w-5xl mx-auto px-4 mt-14">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">clipmitra.ai/studio/auto-editor</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ● FFmpeg GPU Ready
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Input and AI breakdown */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Source Video</div>
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=150&auto=format&fit=crop&q=80"
                      alt="Source thumbnail"
                      className="h-14 w-24 rounded-lg object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        The AI Revolution & Why 90% of Creators Are Sleeping on Shorts
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">Duration: 45:20 • Ingested via YouTube API</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-300 flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Detected Viral Candidates (Virality Score 94/100)</span>
                    </span>
                    <span className="text-emerald-400 font-mono">3 Clips Generated</span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-xl bg-purple-950/30 border border-purple-500/30 p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">Clip #1: The 3-Second Retention Rule</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500 text-white font-bold">94% VIRAL</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Hook: ⚠️ Never post a Short before doing THIS!</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">00:00 - 00:28</span>
                    </div>

                    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-200">Clip #2: Why Consistency Beats Perfection</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">89% VIRAL</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Hook: 🧠 99% of creators make this mistake daily</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">01:14 - 01:52</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 9:16 Vertical Preview Frame */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-[230px] h-[410px] rounded-[32px] border-4 border-slate-700 bg-black overflow-hidden shadow-2xl flex flex-col justify-between p-3">
                  {/* Top Hook Banner */}
                  <div className="z-20 mt-4 mx-auto bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded shadow-lg text-center tracking-wide leading-tight">
                    ⚠️ NEVER POST A SHORT BEFORE THIS!
                  </div>

                  {/* Simulated Center Video */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
                      alt="Vertical frame demo"
                      className="w-full h-full object-cover filter blur-md opacity-40"
                    />
                    <div className="absolute inset-x-0 top-1/4 bottom-1/4 overflow-hidden flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80"
                        alt="Foreground subject"
                        className="w-full h-full object-cover rounded-lg shadow-2xl"
                      />
                    </div>
                  </div>

                  {/* Middle Animated Subtitle */}
                  <div className="z-20 mb-8 mx-auto text-center px-2">
                    <div className="bg-black/80 px-2.5 py-1 rounded-md border border-slate-800">
                      <span className="text-yellow-400 font-black text-xs font-montserrat uppercase">
                        YOUR RETENTION DOUBLES
                      </span>
                    </div>
                  </div>

                  {/* Bottom Progress Bar */}
                  <div className="z-20 w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-2">
                    <div className="bg-purple-500 h-full w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Engineered for Explosive YouTube Growth
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Every feature is tuned to maximize average view duration (AVD) and swipe-away prevention on YouTube Shorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-purple-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Virality & Hook Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini 3.8 Flash analyzes audio transcription, emotion peaks, topic boundaries, and controversial or high-curiosity statements to find the top clips.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-cyan-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Scissors className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Smart 9:16 FFmpeg Reframing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Converts landscape 16:9 videos into aesthetic vertical 9:16 Shorts with dynamic blurred backgrounds, center focus, and audio loudness normalization.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-red-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
                <Youtube className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">1-Click YouTube Auto-Uploader</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your channel via Google OAuth 2.0. Automatically generate SEO titles, tags, hashtags, and schedule uploads directly into YouTube Studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free & Open-source pledge */}
      <section className="py-12 border-t border-slate-800/80 bg-[#090d16]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mb-4">
            <ShieldCheck className="h-4 w-4" />
            <span>Open Source Friendly & Zero Paid-API Lock-in</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Use Local FFmpeg & Heuristics with Zero Cloud Subscription
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            ClipMitra AI is designed to run self-hosted locally on your laptop, Mac, or Linux server. You can generate unlimited clips completely free using built-in FFmpeg and local heuristics.
          </p>
        </div>
      </section>
    </div>
  );
};
