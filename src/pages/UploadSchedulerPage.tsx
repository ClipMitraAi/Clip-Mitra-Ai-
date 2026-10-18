import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Youtube,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ExternalLink,
  Layers,
  Send
} from 'lucide-react';
import { api } from '../api.ts';
import { ScheduledUploadJob, Clip, YouTubeChannel, AppView } from '../types.ts';

interface UploadSchedulerPageProps {
  clips: Clip[];
  channels: YouTubeChannel[];
  setCurrentView: (view: AppView) => void;
  onSelectClip: (clip: Clip) => void;
}

export const UploadSchedulerPage: React.FC<UploadSchedulerPageProps> = ({
  clips,
  channels,
  setCurrentView,
  onSelectClip
}) => {
  const [jobs, setJobs] = useState<ScheduledUploadJob[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string>(clips[0]?.id || '');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadJobs = () => {
    api.getScheduledJobs().then(res => {
      if (res.jobs) setJobs(res.jobs);
    });
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClipId || !selectedChannelId) return;

    setIsSubmitting(true);
    setActionMessage(null);

    try {
      const res = await api.publishToYouTube({
        clipId: selectedClipId,
        channelId: selectedChannelId,
        privacy,
        scheduledFor: new Date(scheduledDateTime).toISOString()
      });

      if (res.scheduled) {
        setActionMessage('Clip scheduled successfully! Worker will execute at the specified time.');
        loadJobs();
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Scheduling failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    await api.cancelScheduledJob(jobId);
    loadJobs();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Publishing Queue & Calendar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Upload Scheduler</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automate publication times to post during peak viewer activity hours.
          </p>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Clock className="h-4 w-4 text-purple-400" />
          <span>Schedule New Clip Upload</span>
        </h3>

        <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Clip</label>
            <select
              value={selectedClipId}
              onChange={e => setSelectedClipId(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white"
            >
              {clips.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Channel</label>
            <select
              value={selectedChannelId}
              onChange={e => setSelectedChannelId(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white"
            >
              {channels.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={e => setScheduledDateTime(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting || !selectedClipId}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-2.5 text-xs font-bold text-white shadow transition-all"
            >
              {isSubmitting ? 'Queueing...' : 'Add to Schedule'}
            </button>
          </div>
        </form>

        {actionMessage && (
          <div className="rounded-xl bg-purple-950/30 border border-purple-500/30 p-2.5 text-xs text-purple-200">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Scheduled Queue Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Scheduled Jobs Queue ({jobs.length})</h3>

        {jobs.length === 0 ? (
          <div className="rounded-xl border border-slate-800 p-6 text-center text-xs text-slate-500">
            No scheduled uploads pending. Add a clip above to schedule future publishing.
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map(job => {
              const matchedClip = clips.find(c => c.id === job.clipId);
              const matchedChannel = channels.find(c => c.id === job.channelId) || channels[0];
              return (
                <div
                  key={job.id}
                  className="rounded-xl border border-slate-800 bg-[#0d121f] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">
                        {matchedClip ? matchedClip.title : job.clipId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          job.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : job.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Channel: <span className="text-slate-200">{matchedChannel?.title}</span> • Target Time:{' '}
                      <span className="text-slate-200 font-mono">
                        {new Date(job.scheduledTime).toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {matchedClip && (
                      <button
                        onClick={() => {
                          onSelectClip(matchedClip);
                          setCurrentView('video_editor');
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1"
                      >
                        Preview Clip
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelJob(job.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 p-1"
                      title="Cancel scheduled upload"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
