import React from 'react';
import {
  LayoutDashboard,
  Video,
  Scissors,
  FileText,
  Youtube,
  Zap,
  Calendar,
  Layers,
  HardDrive,
  Settings,
  HelpCircle,
  Gift,
  Home,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AppView } from '../types.ts';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  clipsCount: number;
  scheduledCount: number;
  isAutomationOn: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  clipsCount,
  scheduledCount,
  isAutomationOn
}) => {
  const mainNav = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create_clips' as AppView, label: 'Create Clips', icon: Video, badge: 'AI' },
    { id: 'video_editor' as AppView, label: 'Video Editor (9:16)', icon: Scissors, badge: 'FFmpeg' },
    { id: 'ai_metadata' as AppView, label: 'AI SEO Studio', icon: FileText, badge: 'Virality' },
    { id: 'clip_library' as AppView, label: 'Clip Library', icon: Layers, count: clipsCount },
    { id: 'scheduler' as AppView, label: 'Upload Scheduler', icon: Calendar, count: scheduledCount },
    { id: 'automation' as AppView, label: 'Automation Rules', icon: Zap, status: isAutomationOn },
    { id: 'youtube_accounts' as AppView, label: 'YouTube Accounts', icon: Youtube }
  ];

  const systemNav = [
    { id: 'usage_limits' as AppView, label: 'Usage & Quotas', icon: HardDrive },
    { id: 'settings' as AppView, label: 'Settings & Models', icon: Settings },
    { id: 'free_usage' as AppView, label: 'Free-Usage Mode', icon: Gift, badge: '100% Free' },
    { id: 'help_guide' as AppView, label: 'Setup Guide & APIs', icon: HelpCircle },
    { id: 'landing' as AppView, label: 'App Landing Page', icon: Home }
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/80 bg-[#090d16] flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workflows
          </div>
          <nav className="space-y-1">
            {mainNav.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.count}
                    </span>
                  )}
                  {item.status !== undefined && (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.status ? 'bg-emerald-400 ring-2 ring-emerald-500/20 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Management & Docs
          </div>
          <nav className="space-y-1">
            {systemNav.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-purple-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Local Engine Status Box */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            <span>Local FFmpeg Core</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">READY</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Hardware encoder ready. 9:16 vertical crop & audio loudness normalization active.
        </p>
      </div>
    </aside>
  );
};
