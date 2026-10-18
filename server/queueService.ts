import { db } from './db.ts';
import { ffmpegService } from './ffmpegService.ts';
import { youtubeService } from './youtubeService.ts';
import { geminiService } from './geminiService.ts';
import { Clip, SourceProject } from './types.ts';

export interface RenderJobState {
  jobId: string;
  clipId: string;
  progress: number;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  error?: string;
  outputUrl?: string;
  startedAt: number;
}

export class QueueService {
  private renderJobs: Map<string, RenderJobState> = new Map();
  private isWorkerRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startSchedulerWorker();
  }

  /**
   * Start periodic worker to check for scheduled uploads and automation jobs
   */
  public startSchedulerWorker() {
    if (this.isWorkerRunning) return;
    this.isWorkerRunning = true;

    this.intervalTimer = setInterval(async () => {
      try {
        await this.checkScheduledUploads();
      } catch (err) {
        console.error('Scheduler check error:', err);
      }
    }, 5000);
  }

  /**
   * Check and publish any pending scheduled uploads whose scheduledTime has arrived
   */
  private async checkScheduledUploads() {
    const jobs = db.getScheduledJobs().filter(j => j.status === 'pending');
    const now = Date.now();

    for (const job of jobs) {
      const scheduledTimeMs = new Date(job.scheduledTime).getTime();
      if (now >= scheduledTimeMs) {
        // Execute upload
        db.updateScheduledJob(job.id, { status: 'in_progress' });
        const clip = db.getClip(job.clipId);

        if (!clip) {
          db.updateScheduledJob(job.id, { status: 'failed', lastError: 'Clip not found' });
          continue;
        }

        const channel = db.getChannel(job.channelId) || db.getChannels()[0];
        if (!channel) {
          db.updateScheduledJob(job.id, { status: 'failed', lastError: 'No channel found' });
          continue;
        }

        db.updateClip(clip.id, { youtubeStatus: 'publishing' });

        const uploadRes = await youtubeService.uploadVideo({
          channelId: channel.id,
          filePath: clip.outputVideoPath || '/samples/podcast_sample.mp4',
          title: clip.seoMetadata.title || clip.title,
          description: clip.seoMetadata.description,
          tags: clip.seoMetadata.tags,
          privacy: job.privacy,
          categoryId: clip.seoMetadata.categoryId
        });

        if (uploadRes.success) {
          db.updateScheduledJob(job.id, { status: 'completed' });
          db.updateClip(clip.id, {
            youtubeStatus: 'published',
            youtubeVideoId: uploadRes.videoId,
            youtubeVideoUrl: uploadRes.videoUrl,
            publishedAt: uploadRes.publishedAt
          });
        } else {
          const retries = job.retryCount + 1;
          const status = retries >= 3 ? 'failed' : 'pending';
          db.updateScheduledJob(job.id, {
            status,
            retryCount: retries,
            lastError: uploadRes.error
          });
          db.updateClip(clip.id, {
            youtubeStatus: 'failed',
            youtubeUploadError: uploadRes.error
          });
        }
      }
    }
  }

  /**
   * Queue and execute an FFmpeg render job asynchronously
   */
  public async queueRender(clipId: string): Promise<RenderJobState> {
    const clip = db.getClip(clipId);
    if (!clip) throw new Error('Clip not found');

    const project = db.getProject(clip.projectId);
    if (!project) throw new Error('Associated project not found');

    const jobId = 'render_' + clipId + '_' + Date.now();
    const jobState: RenderJobState = {
      jobId,
      clipId,
      progress: 0,
      status: 'queued',
      startedAt: Date.now()
    };

    this.renderJobs.set(jobId, jobState);
    db.updateClip(clipId, {
      renderStatus: 'rendering',
      renderProgress: 0,
      renderError: undefined
    });

    // Run async in background
    setTimeout(async () => {
      try {
        jobState.status = 'rendering';
        const inputPath = project.originalFilePath || '/samples/podcast_sample.mp4';
        
        let resolvedInput = inputPath;
        if (resolvedInput.startsWith('/samples/')) {
          resolvedInput = `${process.cwd()}/public${resolvedInput}`;
        }

        const outPath = await ffmpegService.renderClip(resolvedInput, clip, (progress) => {
          jobState.progress = progress;
          db.updateClip(clipId, { renderProgress: progress });
        });

        jobState.status = 'completed';
        jobState.progress = 100;
        jobState.outputUrl = `/api/render/download/${clipId}`;

        db.updateClip(clipId, {
          renderStatus: 'ready',
          renderProgress: 100,
          outputVideoPath: outPath,
          outputVideoUrl: jobState.outputUrl
        });

        db.logActivity({
          category: 'render',
          level: 'success',
          title: `Render Finished: ${clip.title}`,
          details: `9:16 vertical render finished in ${((Date.now() - jobState.startedAt) / 1000).toFixed(1)}s.`,
          entityId: clipId
        });

        // Check automation auto-publish
        const autoRule = db.getAutomation();
        if (autoRule.enabled && autoRule.autoPublish) {
          const channel = db.getChannels().find(c => c.id === autoRule.destinationChannelId) || db.getChannels()[0];
          if (channel) {
            db.addScheduledJob({
              id: 'job_auto_' + Date.now(),
              clipId,
              channelId: channel.id,
              scheduledTime: new Date(Date.now() + 60000).toISOString(), // 1 min buffer
              privacy: autoRule.defaultPrivacy,
              status: 'pending',
              retryCount: 0,
              createdAt: new Date().toISOString()
            });
            db.updateClip(clipId, {
              youtubeStatus: 'scheduled',
              scheduledFor: new Date(Date.now() + 60000).toISOString(),
              destinationChannelId: channel.id
            });
          }
        }
      } catch (err: any) {
        jobState.status = 'failed';
        jobState.error = err?.message || 'Rendering failed';
        db.updateClip(clipId, {
          renderStatus: 'failed',
          renderError: jobState.error
        });
        db.logActivity({
          category: 'render',
          level: 'error',
          title: `Render Failed: ${clip.title}`,
          details: jobState.error,
          entityId: clipId
        });
      }
    }, 100);

    return jobState;
  }

  public getJobState(jobId: string): RenderJobState | undefined {
    return this.renderJobs.get(jobId);
  }

  public getLatestJobForClip(clipId: string): RenderJobState | undefined {
    const list = Array.from(this.renderJobs.values()).filter(j => j.clipId === clipId);
    return list[list.length - 1];
  }
}

export const queueService = new QueueService();
