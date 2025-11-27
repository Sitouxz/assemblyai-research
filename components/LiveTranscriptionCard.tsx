'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLiveTranscription } from '@/hooks/useLiveTranscription';
import { useRouter } from 'next/navigation';

export default function LiveTranscriptionCard() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    status,
    transcriptTurns,
    error: streamError,
    start,
    stop,
    reset,
    getFullTranscript,
  } = useLiveTranscription();

  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new turns arrive
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptTurns]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'idle':
        return { text: 'Not connected', color: 'text-gray-600 dark:text-gray-400' };
      case 'requestingMic':
        return { text: 'Requesting microphone…', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'connecting':
        return { text: 'Connecting…', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'streaming':
        return { text: 'Listening…', color: 'text-green-600 dark:text-green-400' };
      case 'stopping':
        return { text: 'Stopping…', color: 'text-gray-600 dark:text-gray-400' };
      case 'error':
        return { text: 'Error', color: 'text-red-600 dark:text-red-400' };
      default:
        return { text: 'Unknown', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const statusDisplay = getStatusDisplay();

  const handleStart = async () => {
    setSaveError(null);
    await start();
  };

  const handleStop = () => {
    stop();
  };

  const handleReset = () => {
    reset();
    setSaveTitle('');
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      setSaveError('You must be signed in to save transcripts');
      return;
    }

    const fullTranscript = getFullTranscript();
    if (!fullTranscript.trim()) {
      setSaveError('No transcript to save');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/transcriptions/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveTitle.trim() || 'Live Transcription',
          text: fullTranscript,
          durationSeconds: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save transcript');
      }

      const data = await response.json();
      
      // Navigate to the transcript detail page
      router.push(`/transcript/${data.transcriptId}`);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save transcript');
    } finally {
      setIsSaving(false);
    }
  };

  const isActive = status === 'streaming';
  const isConnecting = status === 'requestingMic' || status === 'connecting';
  const hasTranscript = transcriptTurns.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Live Transcription
      </h2>

      {/* Status Card */}
      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            <span className={`text-sm font-medium ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          </div>
        </div>

        {/* Control Button */}
        <div className="flex gap-3">
          {!isActive && !isConnecting ? (
            <button
              onClick={handleStart}
              disabled={isConnecting}
              className="flex-1 px-4 py-3 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Start Live Transcription
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={!isActive}
              className="flex-1 px-4 py-3 rounded-md font-medium bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          )}
          {hasTranscript && !isActive && !isConnecting && (
            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-md font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {streamError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-400">{streamError}</p>
        </div>
      )}

      {/* Live Transcript Display */}
      {hasTranscript && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Live Transcript:
          </h3>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900 max-h-96 overflow-y-auto">
            <div className="text-base leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {transcriptTurns.map((turn, index) => (
                <span key={turn.id}>
                  {turn.endOfTurn ? (
                    // Finalized text with space
                    <span>{turn.text} </span>
                  ) : (
                    // Partial text with cursor
                    <span className="text-blue-600 dark:text-blue-400">
                      {turn.text}
                      <span className="inline-block w-0.5 h-5 ml-0.5 bg-blue-500 animate-pulse" />
                    </span>
                  )}
                </span>
              ))}
            </div>
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      {/* Save Section */}
      {hasTranscript && !isActive && session?.user?.id && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Save Session:
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Session title (optional)"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSaving}
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving…' : 'Save to History'}
            </button>
          </div>
          {saveError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{saveError}</p>
          )}
        </div>
      )}

      {/* Sign-in Prompt for Guests */}
      {hasTranscript && !isActive && !session?.user?.id && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Sign in to save your live transcription session to your history.
            </p>
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 Speak into your microphone for real-time transcription. Partial results appear in italic, finalized text appears in normal weight. Sessions can be saved to your history.
        </p>
      </div>
    </div>
  );
}

