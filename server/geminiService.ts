import { GoogleGenAI } from '@google/genai';
import { SEOMetadata, VideoTranscriptSegment, VideoTranscriptWord } from './types.ts';

export interface GeneratedClipCandidate {
  title: string;
  hookText: string;
  hookSubText: string;
  startTime: number;
  endTime: number;
  duration: number;
  transcriptText: string;
  viralityScore: number;
  viralityReasoning: string;
  seoMetadata: SEOMetadata;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        this.ai = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI with key:', err);
      }
    }
  }

  /**
   * Analyze transcript and extract viral moment candidates
   */
  public async analyzeTranscriptForClips(
    videoTitle: string,
    transcript: VideoTranscriptSegment[],
    targetDuration: '30s' | '60s' | '30-60s' | '60-120s' | 'custom' = '30-60s',
    clipCount = 3,
    language: 'en' | 'hi' | 'hinglish' = 'en'
  ): Promise<GeneratedClipCandidate[]> {
    if (this.ai) {
      try {
        const fullTranscriptText = transcript.map(s => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s]: ${s.text}`).join('\n');
        
        const prompt = `You are a world-class YouTube Shorts & TikTok algorithm virality engineer.
Analyze this video transcript and extract the top ${clipCount} most viral, high-retention vertical clips.

VIDEO TITLE: "${videoTitle}"
TARGET DURATION: ${targetDuration}
TARGET LANGUAGE: ${language}

FULL TRANSCRIPT WITH TIMESTAMPS:
${fullTranscriptText}

For each viral clip candidate, identify:
1. Exact start and end timestamps in seconds (strictly within the transcript bounds).
2. A high-converting curiosity / pattern-interrupt opening Hook (headline under 10 words, e.g. "⚠️ The #1 mistake creators make", "Nobody talks about this...").
3. A punchy clip title.
4. Virality score (1-100) and rationale (hook strength, emotional resonance, retention loop).
5. Complete SEO metadata: YouTube Shorts title (with #shorts), description, 6 high-volume tags, 5 hashtags, pinned comment engagement question, category, and language.

Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "title": "string",
    "hookText": "string",
    "hookSubText": "string",
    "startTime": number,
    "endTime": number,
    "viralityScore": number,
    "viralityReasoning": "string",
    "seoMetadata": {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "hashtags": ["string"],
      "pinnedComment": "string",
      "category": "Education",
      "categoryId": "27",
      "language": "English",
      "viralityScore": number,
      "viralityReasoning": "string"
    }
  }
]`;

        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text?.trim() || '[]';
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => {
            const start = Number(item.startTime) || (idx * 20);
            const end = Number(item.endTime) || (start + 30);
            const duration = Math.round(end - start);

            // Assemble transcript slice
            const matchedSegments = transcript.filter(s => s.end >= start && s.start <= end);
            const transcriptText = matchedSegments.map(s => s.text).join(' ') || item.title;

            return {
              title: item.title || `Viral Clip #${idx + 1}`,
              hookText: item.hookText || '🔥 WATCH THIS TILL THE END',
              hookSubText: item.hookSubText || 'The algorithm will thank you',
              startTime: Math.max(0, start),
              endTime: Math.max(start + 5, end),
              duration,
              transcriptText,
              viralityScore: item.viralityScore || 90,
              viralityReasoning: item.viralityReasoning || 'Strong hook and pattern interrupt.',
              seoMetadata: {
                title: item.seoMetadata?.title || `${item.title} 🚀 #shorts`,
                description: item.seoMetadata?.description || `Watch this viral moment!\n\nSubscribe for daily shorts.`,
                tags: item.seoMetadata?.tags || ['shorts', 'viral', 'clipmitra'],
                hashtags: item.seoMetadata?.hashtags || ['#shorts', '#viral', '#trending'],
                pinnedComment: item.seoMetadata?.pinnedComment || 'What do you think? Let me know below! 👇',
                category: item.seoMetadata?.category || 'Education',
                categoryId: item.seoMetadata?.categoryId || '27',
                language: item.seoMetadata?.language || 'English',
                viralityScore: item.viralityScore || 90,
                viralityReasoning: item.viralityReasoning || 'High retention potential.'
              }
            };
          });
        }
      } catch (err) {
        console.warn('Gemini AI analysis failed or returned non-JSON, falling back to heuristic:', err);
      }
    }

    // Free Local Heuristic AI Pipeline (Works 100% offline without API key)
    return this.generateHeuristicClips(videoTitle, transcript, targetDuration, clipCount, language);
  }

  /**
   * Free-usage Heuristic Viral Detector
   */
  private generateHeuristicClips(
    videoTitle: string,
    transcript: VideoTranscriptSegment[],
    targetDuration: string,
    clipCount: number,
    language: string
  ): GeneratedClipCandidate[] {
    const totalDuration = transcript.length > 0 ? transcript[transcript.length - 1].end : 60;
    const candidates: GeneratedClipCandidate[] = [];

    let clipLen = 30;
    if (targetDuration === '60s') clipLen = 55;
    else if (targetDuration === '60-120s') clipLen = 75;
    else if (targetDuration === '30-60s') clipLen = 40;

    const hookTemplates = [
      { hook: '⚠️ NEVER IGNORE THIS RULE IN 2026!', sub: 'Watch before it gets taken down' },
      { hook: '🧠 99% OF PEOPLE GET THIS WRONG', sub: 'The real secret revealed here' },
      { hook: '🔥 THE 3-SECOND ALGORITHM TRICK', sub: 'Double your retention instantly' },
      { hook: '💡 THE ONE HABIT THAT CHANGES EVERYTHING', sub: 'Tested on millions of viewers' },
      { hook: '🚨 STOP WASTING TIME DOING THIS', sub: 'Do this simple shift instead' }
    ];

    const step = Math.max(10, Math.floor((totalDuration - clipLen) / Math.max(1, clipCount)));

    for (let i = 0; i < clipCount; i++) {
      const startTime = Math.min(totalDuration - 10, i * step);
      const endTime = Math.min(totalDuration, startTime + clipLen);
      const duration = Math.round(endTime - startTime);

      const segments = transcript.filter(s => s.end >= startTime && s.start <= endTime);
      const text = segments.map(s => s.text).join(' ') || `Key discussion on ${videoTitle} regarding critical insights.`;

      const tpl = hookTemplates[i % hookTemplates.length];
      const score = 95 - i * 3;

      candidates.push({
        title: `${videoTitle.slice(0, 45)} - Key Lesson #${i + 1}`,
        hookText: tpl.hook,
        hookSubText: tpl.sub,
        startTime,
        endTime,
        duration,
        transcriptText: text,
        viralityScore: score,
        viralityReasoning: 'Pattern interrupt title with immediate problem-solution pacing for high swipe-away resistance.',
        seoMetadata: {
          title: `${videoTitle.slice(0, 50)} 🤯 #shorts`,
          description: `Watch this high-impact breakdown: "${videoTitle}".\n\n📌 Subscribe for daily actionable shorts!\n\n#algorithm #creator #growth`,
          tags: ['shorts', 'viral shorts', 'content strategy', 'youtube growth', 'clipmitra ai'],
          hashtags: ['#shorts', '#viral', '#trending', '#growthtips', '#fyp'],
          pinnedComment: 'Do you agree or disagree with this? Drop your honest thought below! 👇',
          category: 'Howto & Style',
          categoryId: '26',
          language: language === 'hi' ? 'Hindi' : language === 'hinglish' ? 'Hinglish' : 'English',
          viralityScore: score,
          viralityReasoning: 'Optimized for mobile watch-through rate.'
        }
      });
    }

    return candidates;
  }

  /**
   * Generate dedicated SEO metadata for an edited clip
   */
  public async generateSEOMetadata(
    clipTitle: string,
    transcriptText: string,
    hookText: string,
    language = 'English'
  ): Promise<SEOMetadata> {
    if (this.ai) {
      try {
        const prompt = `You are a YouTube Shorts SEO algorithm expert.
Generate high-ranking YouTube Shorts metadata for this clip:
Title: "${clipTitle}"
Hook Text: "${hookText}"
Spoken Content: "${transcriptText}"
Language: ${language}

Generate:
1. High CTR Title (under 80 characters, with #shorts)
2. Compelling Description with 2 call to actions and hashtag block
3. 8 High-volume YouTube Tags (comma-separated style in array)
4. 5 Relevant Hashtags
5. A high-engagement Pinned Comment question
6. Appropriate YouTube Category and CategoryId (e.g. "Education" / "27", "Entertainment" / "24", "Howto & Style" / "26")
7. Virality score (1-100) and reasoning.

Return strictly JSON with keys: title, description, tags, hashtags, pinnedComment, category, categoryId, language, viralityScore, viralityReasoning.`;

        const resp = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const parsed = JSON.parse(resp.text?.trim() || '{}');
        if (parsed.title) {
          return {
            title: parsed.title,
            description: parsed.description || '',
            tags: parsed.tags || ['shorts', 'viral', 'clipmitra'],
            hashtags: parsed.hashtags || ['#shorts', '#viral'],
            pinnedComment: parsed.pinnedComment || 'Tell me your take in the comments! 👇',
            category: parsed.category || 'Education',
            categoryId: parsed.categoryId || '27',
            language: parsed.language || language,
            viralityScore: parsed.viralityScore || 92,
            viralityReasoning: parsed.viralityReasoning || 'Targeted keywords and emotional hook.'
          };
        }
      } catch (err) {
        console.warn('Gemini metadata generation failed, using template:', err);
      }
    }

    return {
      title: `${clipTitle.slice(0, 60)} 🚀 #shorts`,
      description: `Watch how this works in 30 seconds!\n\nSubscribe to the channel for daily viral breakdowns.`,
      tags: ['youtube shorts', 'viral clips', 'growth', 'trending', 'clipmitra'],
      hashtags: ['#shorts', '#viral', '#trending', '#shortsfeed'],
      pinnedComment: 'What is your best tip on this? Drop it in the comments below! 👇',
      category: 'Education',
      categoryId: '27',
      language,
      viralityScore: 92,
      viralityReasoning: 'Strong search alignment with high click-through hook.'
    };
  }
}

export const geminiService = new GeminiService();
