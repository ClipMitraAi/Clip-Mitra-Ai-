# ClipMitra AI - Viral Video Shorts Generator & YouTube Auto-Uploader

ClipMitra AI is a complete, full-stack production application that automatically converts long-form YouTube videos, podcasts, and recordings into high-converting 9:16 vertical short clips, burns animated karaoke captions, and publishes them to an authorized YouTube channel via Google OAuth 2.0 and the YouTube Data API v3.

---

## 🌟 Key Features

1. **YouTube Video & Local Media Ingestion**:
   - Ingest public YouTube videos via URL or Video ID.
   - Upload your own MP4, MOV, WebM, and MKV video files up to 250MB.
   - Instant sample testing suite (Podcast masterclass & AI Keynote).

2. **AI Viral Moment & Hook Detection**:
   - Google Gemini 3.8 Flash model (`@google/genai`) analyzes speech cadence, emotional inflection, and retention drop-off points.
   - Generates high-converting curiosity hooks (e.g. *"⚠️ Never post a Short before doing this"*).
   - Generates virality scores (1–100) with algorithmic reasoning.
   - 100% Free local heuristic AI fallback when running offline without external API keys.

3. **Native FFmpeg 9:16 Video Editor**:
   - **Aspect Framing**: Blurred background canvas (viral standard), center crop, or fit-with-bars.
   - **Resolution Options**: 360p, 720p HD, 1080p Full HD, 2K, and 4K (with low-resolution source integrity warnings).
   - **Dynamic Animated Subtitles**: Word-by-word karaoke highlighting, custom fonts (Montserrat, Anton, Bebas Neue, Bangers, Inter), font size, stroke outline, box pill, and vertical safe-zone positioning.
   - **Overlay Banners**: Top hook headline, retention subtext, animated progress bar, and channel watermark.
   - **Audio Processing**: EBU R128 loudness normalization (-16 LUFS) and volume sliders.
   - **Live Player**: Dual-handle timeline trimmer with instant loop preview.

4. **AI SEO Studio**:
   - High-ranking YouTube Shorts titles (under 100 chars with emojis).
   - Video descriptions with hashtags and subscribe call-to-actions.
   - High-volume YouTube tags and category selectors.
   - Pinned comment engagement prompts.

5. **Official YouTube Data API v3 & Google OAuth 2.0**:
   - Connect authorized channels using Google's official OAuth consent flow.
   - Minimum required permissions: `youtube.upload` and `youtube.readonly`.
   - Sandbox / Simulator mode for instant zero-credential verification.
   - Visibility modes: Public, Unlisted, or Private.
   - Direct 1-click publishing or calendar-based scheduling.

6. **Hands-Free Automation Engine**:
   - Auto-pipeline: Detects new videos -> Transcribes -> Extracts top N clips -> Renders 9:16 vertical MP4 -> Auto-schedules or holds for human approval.
   - Daily upload limits and safety quotas.

7. **Zero Paid-API Dependency (Free-Usage Mode)**:
   - Uses local FFmpeg directly on your server or laptop.
   - Free YouTube Data API tier (10,000 daily units = ~6 Shorts uploads/day).
   - Local disk storage with one-click temporary cache cleaner.

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js 20+ or 22+
- FFmpeg and FFprobe installed (`apt-get install -y ffmpeg` or `brew install ffmpeg`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/clipmitra-ai.git
cd clipmitra-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
```env
# Optional Gemini API key for AI analysis
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Public application URL
APP_URL="http://localhost:3000"

# Optional Google Cloud OAuth credentials for YouTube publishing
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Storage path & FFmpeg
STORAGE_PATH="./data/storage"
FFMPEG_PATH="/usr/bin/ffmpeg"
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Setup

Run ClipMitra AI and Redis with a single command:

```bash
docker compose up -d --build
```

The container automatically installs FFmpeg, system font libraries, builds the React frontend, and starts the full-stack server on port 3000.

---

## 🧪 Local Testing Instructions

1. Open the dashboard at `http://localhost:3000`.
2. Click **Generate New Clips** in the top navigation.
3. Switch to the **Instant Sample Videos** tab and click **Viral Podcast Masterclass**.
4. Select **30–60 seconds** and click **Extract Top 3 Viral Clips Now**.
5. Once extracted, the editor opens automatically:
   - Customize font family to **Anton** and highlight color to yellow.
   - Click **Render 9:16 with FFmpeg**. Watch the progress bar increment from 0% to 100%.
   - Click **Download MP4** to inspect the real vertical video output.
6. Click **SEO & Publish**, select an authorized channel, and click **Publish Short Now**.

---

## 📖 Production Deployment Guide

### Option 1: Docker / Cloud Run / VPS
```bash
# Build the production Docker image
docker build -t clipmitra-ai:latest .

# Run container exposing port 3000
docker run -d -p 3000:3000 --name clipmitra \
  -e GEMINI_API_KEY="your-key" \
  -e GOOGLE_CLIENT_ID="your-google-client-id" \
  -e GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  clipmitra-ai:latest
```

### Option 2: Linux Systemd Service
1. Install Node.js 22 and FFmpeg.
2. Run `npm run build`.
3. Start the service with `npm start` (`tsx server.ts`).

---

## 🔧 Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `FFmpeg not found` | FFmpeg is not in system PATH | Install ffmpeg via `sudo apt install ffmpeg` or update `FFMPEG_PATH` in `.env`. |
| `YouTube Quota Exceeded (403)` | Daily 10,000 units limit reached | Each video upload uses 1,600 units (~6 uploads/day). Quota resets at 00:00 PST. Apply for a free quota extension in Google Cloud Console. |
| `Google OAuth Error: redirect_uri_mismatch` | Redirect URI not registered | In Google Cloud Console Credentials, add `http://localhost:3000/api/youtube/callback` under Authorized Redirect URIs. |
| `Upload File Too Large` | Exceeded 250MB limit | Compress video or increase `limits.fileSize` in `server.ts`. |
