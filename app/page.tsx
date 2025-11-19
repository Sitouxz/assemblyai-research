'use client';

import { useState, useEffect } from 'react';
import UploadCard from '@/components/UploadCard';
import StatusIndicator from '@/components/StatusIndicator';
import TranscriptViewer from '@/components/TranscriptViewer';
import InsightsPanel from '@/components/InsightsPanel';
import HistorySidebar from '@/components/HistorySidebar';
import JsonViewer from '@/components/JsonViewer';
import { TranscriptResponse, TranscriptionStatus, HistoryItem } from '@/lib/types';

export default function Home() {
  const [apiReady, setApiReady] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

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
      } else if (url) {
        formData.append('url', url);
      }

      formData.append('auto_chapters', String(options.autoChapters || false));
      formData.append('sentiment_analysis', String(options.sentimentAnalysis || false));
      formData.append('disfluencies', String(options.disfluencies || false));
      formData.append('custom_prompt', options.customPrompt || '');

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

      // Save to history
      const displayName = fileName || url || 'Untitled';
      saveToHistory(data, displayName, duration);
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
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              AssemblyAI Playground
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                apiReady
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {apiReady ? 'API Ready' : 'No API Key'}
            </span>
          </div>
          <p className="text-lg text-gray-600">
            Upload audio, transcribe, and analyze with AssemblyAI
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <section className="lg:col-span-2 space-y-6">
            <UploadCard
              onTranscribe={handleTranscribe}
              isProcessing={status === TranscriptionStatus.PROCESSING || status === TranscriptionStatus.UPLOADING}
            />

            {status !== TranscriptionStatus.IDLE && (
              <StatusIndicator status={status} error={error} />
            )}

            {transcript && (
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

