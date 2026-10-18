import React from 'react';
import {
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Key,
  Youtube,
  Shield,
  FileCode,
  Terminal,
  AlertTriangle
} from 'lucide-react';

export const HelpGuidePage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-purple-400 mb-1">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Documentation & Integration Guide</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Google OAuth & YouTube API Setup Guide</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Step-by-step instructions for generating your official Google OAuth 2.0 Client credentials.
        </p>
      </div>

      {/* Step 1 */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-white">Create a Project in Google Cloud Console</h3>
        </div>
        <div className="space-y-2 text-xs text-slate-300 pl-11 leading-relaxed">
          <p>
            1. Visit the{' '}
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 hover:underline font-semibold"
            >
              Google Cloud Console <ExternalLink className="h-3 w-3 inline" />
            </a>{' '}
            and log in with the Google Account that owns your YouTube channel.
          </p>
          <p>2. Click on the project dropdown at the top and select <strong>New Project</strong>.</p>
          <p>3. Name the project <code>ClipMitra-AutoPublisher</code> and click <strong>Create</strong>.</p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-white">Enable YouTube Data API v3</h3>
        </div>
        <div className="space-y-2 text-xs text-slate-300 pl-11 leading-relaxed">
          <p>
            1. In the left navigation menu, go to <strong>APIs & Services &gt; Library</strong>.
          </p>
          <p>2. Search for <strong>YouTube Data API v3</strong>.</p>
          <p>3. Click on it and press the blue <strong>Enable</strong> button.</p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-white">Configure OAuth Consent Screen & Scopes</h3>
        </div>
        <div className="space-y-2 text-xs text-slate-300 pl-11 leading-relaxed">
          <p>1. Go to <strong>APIs & Services &gt; OAuth consent screen</strong>.</p>
          <p>2. Choose <strong>External</strong> user type, then enter App Name (e.g. <code>ClipMitra AI</code>) and your email.</p>
          <p>
            3. On the Scopes step, add the following two required scopes:
          </p>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 space-y-1 font-mono text-[11px] text-cyan-300">
            <div>https://www.googleapis.com/auth/youtube.upload</div>
            <div>https://www.googleapis.com/auth/youtube.readonly</div>
          </div>
          <p>4. Under <strong>Test Users</strong>, add your personal Google / YouTube email address.</p>
        </div>
      </div>

      {/* Step 4 */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-sm">
            4
          </div>
          <h3 className="text-sm font-bold text-white">Create OAuth 2.0 Client ID Credentials</h3>
        </div>
        <div className="space-y-2 text-xs text-slate-300 pl-11 leading-relaxed">
          <p>1. Go to <strong>APIs & Services &gt; Credentials &gt; Create Credentials &gt; OAuth client ID</strong>.</p>
          <p>2. Application type: <strong>Web application</strong>.</p>
          <p>3. Under <strong>Authorized redirect URIs</strong>, add:</p>
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 font-mono text-[11px] text-purple-300">
            http://localhost:3000/api/youtube/callback
          </div>
          <p>4. Copy the resulting <strong>Client ID</strong> and <strong>Client Secret</strong> into your <code>.env</code> file:</p>
          <pre className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
{`GOOGLE_CLIENT_ID="1234567890-xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"`}
          </pre>
        </div>
      </div>

      {/* Troubleshooting FAQ */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c101b] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Troubleshooting & FAQ</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div>
            <h4 className="font-bold text-white">Error: "Quota exceeded" (403)?</h4>
            <p className="text-slate-400 mt-0.5">
              YouTube Data API v3 grants 10,000 units per day. Uploading one video costs 1,600 units. You can upload up to 6 clips per day on the free tier. Quota resets daily at midnight Pacific Time.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white">Can I run completely free without any Google Cloud project?</h4>
            <p className="text-slate-400 mt-0.5">
              Yes! You can use ClipMitra's built-in Sandbox Simulator to generate, edit, and download vertical 9:16 MP4s completely free on your local machine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
