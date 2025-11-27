'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import UploadCard from '@/components/UploadCard';
import RecordCard from '@/components/RecordCard';
import LiveTranscriptionCard from '@/components/LiveTranscriptionCard';
import StatusIndicator from '@/components/StatusIndicator';
import TranscriptViewer from '@/components/TranscriptViewer';
import InsightsPanel from '@/components/InsightsPanel';
import HistorySidebar from '@/components/HistorySidebar';
import JsonViewer from '@/components/JsonViewer';
import PatchNotes from '@/components/PatchNotes';
import ApiKeyIndicator from '@/components/ApiKeyIndicator';
import { TranscriptResponse, TranscriptionStatus, HistoryItem } from '@/lib/types';

type TranscriptionMode = 'upload' | 'record' | 'live';

export default function Home() {
  const { data: session } = useSession();
  const [apiReady, setApiReady] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mode, setMode] = useState<TranscriptionMode>('upload');

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setApiReady(data.assemblyaiConfigured);
      } catch (err) {
        setApiReady(false);
      }
    };
    checkHealth();
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem('transcriptionHistory');
        if (stored) {
          const parsed = JSON.parse(stored);
          setHistory(Array.isArray(parsed) ? parsed : []);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };
    loadHistory();
  }, []);

  // Save transcript to history
  const saveToHistory = (transcriptData: TranscriptResponse, fileName: string, duration?: number) => {
    try {
      const historyItem: HistoryItem = {
        id: transcriptData.id,
        fileName,
        createdAt: Date.now(),
        duration,
        snippet: transcriptData.text.substring(0, 100),
        transcript: transcriptData,
      };

      const updatedHistory = [historyItem, ...history].slice(0, 20); // Keep last 20
      setHistory(updatedHistory);
      localStorage.setItem('transcriptionHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Failed to save to history:', err);
    }
  };

  // Handle transcription
  const handleTranscribe = async (
    file: File | null,
    url: string | null,
    options: any,
    fileName?: string,
    duration?: number
  ) => {
    setError(null);
    setStatus(TranscriptionStatus.UPLOADING);
    setTranscript(null);

    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
        formData.append('fileName', fileName || file.name);
      } else if (url) {
        formData.append('url', url);
        formData.append('fileName', fileName || url);
      }

      // Send options as JSON
      formData.append('options', JSON.stringify(options));

      setStatus(TranscriptionStatus.PROCESSING);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data: TranscriptResponse = await response.json();
      setTranscript(data);
      setStatus(TranscriptionStatus.COMPLETED);

      // Save to localStorage history for guest users (authenticated users have it in DB)
      if (!session) {
        const displayName = fileName || url || 'Untitled';
        saveToHistory(data, displayName, duration);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStatus(TranscriptionStatus.ERROR);
    }
  };

  // Load transcript from history
  const loadFromHistory = (item: HistoryItem) => {
    setTranscript(item.transcript);
    setStatus(TranscriptionStatus.COMPLETED);
    setError(null);
  };

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* API Key Indicator */}
        <div className="mb-6">
          <ApiKeyIndicator />
        </div>

        {/* Sign-up prompt for guest users */}
        {!session && (
          <div className="mb-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Sign up to save your transcripts
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Create a free account to access your transcripts from any device and keep them organized.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/auth/signup"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Create account →
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              apiReady
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {apiReady ? '✓ API Ready' : '✗ No API Key'}
          </span>
        </div>

        {/* Patch Notes */}
        <div className="mb-8">
          <PatchNotes />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <section className="lg:col-span-3 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 transition-colors">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('upload')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                    mode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Upload / URL
                </button>
                <button
                  onClick={() => setMode('record')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                    mode === 'record'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Record
                </button>
                <button
                  onClick={() => setMode('live')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                    mode === 'live'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Live
                </button>
              </div>
            </div>

            {/* Mode-specific Card */}
            {mode === 'upload' && (
              <UploadCard
                onTranscribe={handleTranscribe}
                isProcessing={status === TranscriptionStatus.PROCESSING || status === TranscriptionStatus.UPLOADING}
              />
            )}
            {mode === 'record' && (
              <RecordCard
                onTranscribe={handleTranscribe}
                isProcessing={status === TranscriptionStatus.PROCESSING || status === TranscriptionStatus.UPLOADING}
              />
            )}
            {mode === 'live' && (
              <LiveTranscriptionCard />
            )}

            {/* Status and Results (only for upload/record modes) */}
            {mode !== 'live' && status !== TranscriptionStatus.IDLE && (
              <StatusIndicator status={status} error={error} />
            )}

            {mode !== 'live' && transcript && (
              <>
                <TranscriptViewer transcript={transcript} />
                <InsightsPanel transcript={transcript} />
              </>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <HistorySidebar
              history={history}
              onSelect={loadFromHistory}
              onClear={() => {
                setHistory([]);
                localStorage.removeItem('transcriptionHistory');
              }}
            />
            {transcript && <JsonViewer data={transcript.raw} />}
          </aside>
        </div>
      </div>
    </main>
  );
}

