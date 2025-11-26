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
}

