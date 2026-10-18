import React from 'react';
import {
  Scissors,
  Sparkles,
  Youtube,
  Layers,
  Settings,
  HelpCircle,
  HardDrive,
  Calendar,
  Flame,
  User as UserIcon,
  Zap,
  ChevronDown
} from 'lucide-react';
import { AppView, User, YouTubeChannel } from '../types.ts';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: User | null;
  channels: YouTubeChannel[];
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  user,
  channels,
  onOpenAuth
}) => {
  const defaultChannel = channels.find(c => c.isDefault) || channels[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center space-x-3 text-left group focus:outline-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="h-5 w-5 text-white transform -rotate-45" />
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[9px] font-bold text-slate-950">
                AI
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white font-outfit">
                  ClipMitra<span className="text-purple-400">.ai</span>
                </span>
                <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">Viral Shorts & Auto-Publisher</p>
            </div>
          </button>
        </div>

        {/* Quick View Switches */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setCurrentView('create_clips')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'create_clips'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Generate Clips</span>
          </button>

          <button
            onClick={() => setCurrentView('clip_library')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'clip_library'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setCurrentView('automation')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'automation'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Automation</span>
          </button>

          <button
            onClick={() => setCurrentView('youtube_accounts')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'youtube_accounts'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Youtube className="h-3.5 w-3.5 text-red-400" />
            <span>Channels</span>
          </button>
        </nav>

        {/* Right side controls: Active channel badge, CTA button, User profile */}
        <div className="flex items-center space-x-3">
          {/* Active channel indicator */}
          {defaultChannel ? (
            <button
              onClick={() => setCurrentView('youtube_accounts')}
              className="hidden sm:flex items-center space-x-2 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="relative">
                <img
                  src={defaultChannel.thumbnailUrl}
                  alt={defaultChannel.title}
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-red-500/50"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[11px] font-semibold text-slate-200 truncate max-w-[120px]">{defaultChannel.title}</p>
                <p className="text-[9px] text-slate-400">{defaultChannel.subscriberCount} subs</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('youtube_accounts')}
              className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/20"
            >
              <Youtube className="h-3.5 w-3.5 text-red-400" />
              <span>Connect YouTube</span>
            </button>
          )}

          {/* Quick Generate Action */}
          <button
            onClick={() => setCurrentView('create_clips')}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/25 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-102"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Viral Clip</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* User profile avatar / Login trigger */}
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-1.5 text-xs text-slate-200 transition-colors"
            title="Switch User / Settings"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-7 w-7 rounded-lg object-cover ring-1 ring-purple-500/40" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600/30 text-purple-300">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
};
