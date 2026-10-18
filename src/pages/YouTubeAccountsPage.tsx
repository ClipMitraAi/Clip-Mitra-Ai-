import React, { useState, useEffect } from 'react';
import {
  Youtube,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertTriangle,
  Lock,
  Key,
  HelpCircle
} from 'lucide-react';
import { api } from '../api.ts';
import { YouTubeChannel, AppView } from '../types.ts';

interface YouTubeAccountsPageProps {
  channels: YouTubeChannel[];
  onRefreshChannels: () => void;
  setCurrentView: (view: AppView) => void;
}

export const YouTubeAccountsPage: React.FC<YouTubeAccountsPageProps> = ({
  channels,
  onRefreshChannels,
  setCurrentView
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [authUrl, setAuthUrl] = useState('');
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  useEffect(() => {
    api.getAuthUrl().then(res => {
      setIsConfigured(res.isConfigured);
      setAuthUrl(res.authUrl);
    });
  }, []);

  const handleDisconnect = async (channelId: string) => {
    if (confirm('Are you sure you want to revoke and disconnect this YouTube channel?')) {
      await api.disconnectChannel(channelId);
      onRefreshChannels();
    }
  };

  const handleStartOAuth = () => {
    setIsConnecting(true);
    // Redirect to Google OAuth consent screen or demo simulator
    window.location.href = authUrl || '/api/youtube/demo-auth';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-red-400 mb-1">
            <Youtube className="h-3.5 w-3.5" />
            <span>Authorized Channels Manager</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Connected YouTube Accounts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage official Google OAuth 2.0 authorized channels for automated Shorts publishing.
          </p>
        </div>

        <button
          onClick={handleStartOAuth}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          <span>Connect New YouTube Channel</span>
        </button>
      </div>

      {/* OAuth Mode Notice */}
      {!isConfigured && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-3 text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">OAuth Simulator & Sandbox Mode Active</p>
              <p className="text-amber-300/80 mt-0.5">
                Google Client ID is currently unset in .env. Clicking "Connect" uses a high-fidelity authorized channel simulation so you can test all workflows immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('help_guide')}
            className="flex-shrink-0 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 transition-colors"
          >
            OAuth Setup Guide →
          </button>
        </div>
      )}

      {/* Connected Channels List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <span>Active Authorized Channels ({channels.length})</span>
        </h2>

        {channels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-3">
            <Youtube className="h-10 w-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Connected Channels</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Connect your YouTube channel using Google OAuth 2.0 to begin automatically publishing clips.
            </p>
            <button
              onClick={handleStartOAuth}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
            >
              Connect Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map(channel => (
              <div
                key={channel.id}
                className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={channel.thumbnailUrl}
                      alt={channel.title}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-red-500/40"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{channel.title}</h3>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{channel.customUrl}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                        <span>{channel.subscriberCount} subscribers</span>
                        <span>•</span>
                        <span>{channel.videoCount} videos</span>
                      </div>
                    </div>
                  </div>

                  {channel.isDefault && (
                    <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[9px] font-bold text-purple-300">
                      DEFAULT
                    </span>
                  )}
                </div>

                {/* Scopes & Permissions */}
                <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-3 space-y-2 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Granted OAuth Scopes
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Upload videos to YouTube (youtube.upload)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Read channel analytics (youtube.readonly)</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>OAuth Token Active</span>
                  </span>

                  <button
                    onClick={() => handleDisconnect(channel.id)}
                    className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 p-1 transition-colors"
                    title="Disconnect and revoke credentials"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security & Compliance Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center space-x-2 text-white font-bold text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>YouTube API Services User Data Policy Compliance</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          ClipMitra AI accesses only your authorized YouTube channel via Google OAuth 2.0 tokens stored locally. We never store your Google account password or share your video assets with third parties.
        </p>
      </div>
    </div>
  );
};
