import React, { useState, useEffect } from 'react';
import { api } from './api.ts';
import {
  AppView,
  User,
  SourceProject,
  Clip,
  YouTubeChannel,
  SystemUsage,
  ActivityLog
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthModal } from './pages/AuthModal.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { CreateClipsPage } from './pages/CreateClipsPage.tsx';
import { VideoEditorPage } from './pages/VideoEditorPage.tsx';
import { AIMetadataPage } from './pages/AIMetadataPage.tsx';
import { YouTubeAccountsPage } from './pages/YouTubeAccountsPage.tsx';
import { AutomationPage } from './pages/AutomationPage.tsx';
import { UploadSchedulerPage } from './pages/UploadSchedulerPage.tsx';
import { ClipLibraryPage } from './pages/ClipLibraryPage.tsx';
import { UsageLimitsPage } from './pages/UsageLimitsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { HelpGuidePage } from './pages/HelpGuidePage.tsx';
import { FreeUsagePage } from './pages/FreeUsagePage.tsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<SourceProject[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [selectedProject, setSelectedProject] = useState<SourceProject | null>(null);
  const [isAutomationOn, setIsAutomationOn] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState<{
    totalClips: number;
    totalProjects: number;
    publishedClips: number;
    scheduledClips: number;
    failedJobs: number;
    usage: SystemUsage;
    activeChannelsCount: number;
    defaultChannel: YouTubeChannel | null;
  }>({
    totalClips: 0,
    totalProjects: 0,
    publishedClips: 0,
    scheduledClips: 0,
    failedJobs: 0,
    usage: {
      todayClipsGenerated: 0,
      todayUploadsCount: 0,
      storageUsedBytes: 0,
      youtubeApiUnitsUsed: 0,
      maxDailyClipsQuota: 25,
      youtubeDailyQuotaLimit: 10000
    },
    activeChannelsCount: 0,
    defaultChannel: null
  });

  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);

  // Initial data load
  const loadInitialData = async () => {
    try {
      const [userRes, dashRes, chanRes, autoRes] = await Promise.all([
        api.getMe(),
        api.getDashboardStats(),
        api.getChannels(),
        api.getAutomationRules()
      ]);

      if (userRes.user) setUser(userRes.user);
      if (dashRes.stats) {
        setStats(dashRes.stats);
        setProjects(dashRes.recentProjects || []);
        setClips(dashRes.recentClips || []);
        setRecentLogs(dashRes.recentLogs || []);
        if (dashRes.recentClips?.length > 0 && !selectedClip) {
          setSelectedClip(dashRes.recentClips[0]);
        }
        if (dashRes.recentProjects?.length > 0 && !selectedProject) {
          setSelectedProject(dashRes.recentProjects[0]);
        }
      }
      if (chanRes.channels) setChannels(chanRes.channels);
      if (autoRes.rules) setIsAutomationOn(autoRes.rules.enabled);
    } catch (err) {
      console.warn('Initial data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Check URL parameters for view
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as AppView;
    if (viewParam) {
      setCurrentView(viewParam);
    }
  }, []);

  const refreshClips = async () => {
    const res = await api.getClips();
    if (res.clips) {
      setClips(res.clips);
      if (selectedClip) {
        const fresh = res.clips.find(c => c.id === selectedClip.id);
        if (fresh) setSelectedClip(fresh);
      }
    }
  };

  const refreshChannels = async () => {
    const res = await api.getChannels();
    if (res.channels) setChannels(res.channels);
  };

  const handleUpdateClip = (updated: Clip) => {
    setSelectedClip(updated);
    setClips(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const handleClipsGenerated = (newClips: Clip[]) => {
    setClips(prev => [...newClips, ...prev]);
    if (newClips.length > 0) {
      setSelectedClip(newClips[0]);
    }
  };

  const handleLogin = async (name: string, email: string) => {
    const res = await api.login(name, email);
    if (res.user) setUser(res.user);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c15] flex flex-col items-center justify-center space-y-4 text-slate-100">
        <div className="h-12 w-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-300">Initializing ClipMitra AI Studio...</p>
      </div>
    );
  }

  // Full Landing Page view
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-[#080c15]">
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          user={user}
          channels={channels}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
        <LandingPage
          onGetStarted={() => setCurrentView('create_clips')}
          setCurrentView={setCurrentView}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          currentUser={user}
          onLogin={handleLogin}
          onConnectYouTube={() => setCurrentView('youtube_accounts')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col font-outfit">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        channels={channels}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            clipsCount={clips.length}
            scheduledCount={stats.scheduledClips}
            isAutomationOn={isAutomationOn}
          />
        </div>

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardPage
              stats={stats}
              recentProjects={projects}
              recentClips={clips}
              recentLogs={recentLogs}
              setCurrentView={setCurrentView}
              onSelectClip={setSelectedClip}
              onSelectProject={setSelectedProject}
            />
          )}

          {currentView === 'create_clips' && (
            <CreateClipsPage
              projects={projects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              onClipsGenerated={handleClipsGenerated}
              setCurrentView={setCurrentView}
              onSelectClip={setSelectedClip}
            />
          )}

          {currentView === 'video_editor' && (
            <VideoEditorPage
              clip={selectedClip}
              onUpdateClip={handleUpdateClip}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'ai_metadata' && (
            <AIMetadataPage
              clip={selectedClip}
              channels={channels}
              onUpdateClip={handleUpdateClip}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'youtube_accounts' && (
            <YouTubeAccountsPage
              channels={channels}
              onRefreshChannels={refreshChannels}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'automation' && (
            <AutomationPage
              channels={channels}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'scheduler' && (
            <UploadSchedulerPage
              clips={clips}
              channels={channels}
              setCurrentView={setCurrentView}
              onSelectClip={setSelectedClip}
            />
          )}

          {currentView === 'clip_library' && (
            <ClipLibraryPage
              clips={clips}
              onSelectClip={setSelectedClip}
              onRefreshClips={refreshClips}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'usage_limits' && <UsageLimitsPage />}

          {currentView === 'settings' && <SettingsPage />}

          {currentView === 'help_guide' && <HelpGuidePage />}

          {currentView === 'free_usage' && <FreeUsagePage setCurrentView={setCurrentView} />}
        </main>
      </div>

      {/* User Login & Profile Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onLogin={handleLogin}
        onConnectYouTube={() => setCurrentView('youtube_accounts')}
      />
    </div>
  );
}
