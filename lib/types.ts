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

export interface TranscriptResponse {
  id: string;
  text: string;
  words?: Word[];
  audioUrl?: string;
  summary?: string;
  chapters?: Chapter[];
  sentiment?: SentimentAnalysisResult[];
  raw: any;
}

export interface TranscriptionOptions {
  auto_chapters?: boolean;
  sentiment_analysis?: boolean;
  disfluencies?: boolean;
  custom_prompt?: string;
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

