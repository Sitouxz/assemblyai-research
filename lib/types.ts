export interface Word {
  start: number;
  end: number;
  text: string;
  confidence?: number;
  speaker?: string;
}

export interface Chapter {
  start: number;
  end: number;
  headline: string;
  summary?: string;
  gist?: string;
}

export interface SentimentAnalysisResult {
  text: string;
  start: number;
  end: number;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
}

export interface Entity {
  entity_type: string;
  text: string;
  start: number;
  end: number;
}

export interface ContentSafetyLabel {
  text: string;
  labels: Array<{
    label: string;
    confidence: number;
    severity: number;
  }>;
  timestamp: {
    start: number;
    end: number;
  };
}

export interface AutoHighlight {
  count: number;
  rank: number;
  text: string;
  timestamps: Array<{ start: number; end: number }>;
}

export interface TranscriptResponse {
  id: string;
  dbId?: string; // Database ID for authenticated users
  text: string;
  words?: Word[];
  audioUrl?: string;
  summary?: string;
  chapters?: Chapter[];
  sentiment?: SentimentAnalysisResult[];
  entities?: Entity[];
  iab_categories?: any;
  content_safety_labels?: ContentSafetyLabel[];
  auto_highlights_result?: AutoHighlight[];
  speakers?: number;
  raw: any;
}

export interface TranscriptionOptions {
  // Basic options
  language_code?: string;
  language_detection?: boolean;
  
  // Speech-to-Text
  speaker_labels?: boolean;
  speakers_expected?: number;
  disfluencies?: boolean;
  word_boost?: string[];
  boost_param?: 'low' | 'default' | 'high';
  
  // Speech Understanding
  auto_chapters?: boolean;
  sentiment_analysis?: boolean;
  entity_detection?: boolean;
  iab_categories?: boolean;
  content_safety?: boolean;
  auto_highlights?: boolean;
  
  // PII Redaction
  redact_pii?: boolean;
  redact_pii_audio?: boolean;
  redact_pii_policies?: string[];
  redact_pii_sub?: 'entity_name' | 'hash';
  
  // Custom
  custom_spelling?: { from: string; to: string }[];
  custom_prompt?: string;
  
  // LeMUR (applied post-transcription)
  summarization?: boolean;
  summary_model?: string;
  summary_type?: string;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  createdAt: number;
  duration?: number;
  snippet: string;
  transcript: TranscriptResponse;
}

export enum TranscriptionStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  RECORDING = 'recording',
  STREAMING = 'streaming',
}

export type SourceType = 'upload' | 'url' | 'recording' | 'stream';

// Types for live transcription streaming
export interface StreamingTurn {
  id: string;
  text: string;
  endOfTurn: boolean;
  createdAt: Date;
}

export interface StreamingTokenResponse {
  token: string;
  expiresInSeconds: number;
}

// Speaking Performance Analytics Types

export interface DeliveryMetrics {
  // Basic metrics
  overallWpm: number;
  silenceRatio: number;         // silence / total duration (0–1)
  totalSilenceMs: number;
  pauseCount: number;
  talkTimeBySpeakerMs: Record<string, number>;
  fillerPerMinute: number;
  fluencyScore: number;         // 0–100 heuristic
  fillerWords?: string[];       // actual filler words found
  avgPauseDurationMs?: number;  // average pause duration
  
  // Enhanced metrics
  confidenceScore?: number;      // 0-100, avg word confidence
  lowConfidenceWords?: Array<{
    word: string;
    confidence: number;
    timestamp: number;
  }>;
  
  longestPause?: {
    durationMs: number;
    timestamp: number;
    beforeWord?: string;
    afterWord?: string;
  };
  
  paceTimeline?: Array<{
    startMs: number;
    endMs: number;
    wpm: number;
    wordCount: number;
  }>;
  
  momentumScore?: number;        // pace change: >100 = speeding up, <100 = slowing down
  
  sentenceStats?: {
    avgWordsPerSentence: number;
    longestSentence: number;
    shortestSentence: number;
    runOnSentences: number;      // sentences > 25 words
  };
  
  fillerHotspots?: Array<{
    startMs: number;
    endMs: number;
    fillers: string[];
    count: number;
  }>;
  
  rhythmVariation?: number;      // std dev of WPM - measures pace consistency
  
  peakSegments?: Array<{
    startMs: number;
    endMs: number;
    wpm: number;
    fillerCount: number;
    score: number;
  }>;
  
  clarityScore?: number;         // composite: confidence * pace * articulation
  
  criticalMoments?: Array<{
    timestamp: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    details: string;
  }>;
  
  speakerInterruptions?: Array<{
    timestamp: number;
    interrupter: string;
    interrupted: string;
    durationMs: number;
  }>;
  
  breathingPattern?: Array<{
    timestamp: number;
    pauseDurationMs: number;
    estimated: boolean;
  }>;
}

export interface PronunciationSummary {
  overallPronScore: number;     // 0–100
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore?: number;
  words: Array<{
    word: string;
    accuracyScore: number;
    errorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
    phonemes?: Array<{
      phoneme: string;
      score: number;
    }>;
  }>;
  raw: any;
}

export interface VoiceEmotionSummary {
  dominantEmotionsOverTime: Array<{
    startMs: number;
    endMs: number;
    topEmotion: string;
    score: number;
    allEmotions?: Record<string, number>;
  }>;
  overallEmotionDistribution: Record<string, number>; // emotion -> avg score
  raw: any; // full Hume payload
}

