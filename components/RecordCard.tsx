'use client';

import { useEffect, useState } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import AdvancedOptions from './AdvancedOptions';
import { TranscriptionOptions } from '@/lib/types';

interface RecordCardProps {
  onTranscribe: (
    file: File | null,
    url: string | null,
    options: TranscriptionOptions,
    fileName?: string,
    duration?: number
  ) => void;
  isProcessing: boolean;
}

export default function RecordCard({ onTranscribe, isProcessing }: RecordCardProps) {
  const {
    isRecording,
    recordedBlob,
    durationMs,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecorder();

  const [options, setOptions] = useState<TranscriptionOptions>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Create audio URL for playback preview
  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl(null);
    }
  }, [recordedBlob]);

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleDiscard = () => {
    resetRecording();
  };

  const handleTranscribe = () => {
    if (!recordedBlob) return;

    // Convert Blob to File
    const file = new File([recordedBlob], 'recording.webm', { type: recordedBlob.type });
    const durationSeconds = durationMs / 1000;

    onTranscribe(file, null, options, 'Audio Recording', durationSeconds);
  };

  const getStatus = () => {
    if (isRecording) return 'Recording…';
    if (recordedBlob) return `Recorded ${formatDuration(durationMs)}`;
    return 'Ready to record';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Record & Transcribe
      </h2>

      {/* Recording Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-700/50 transition-colors">
        {/* Status Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isRecording && (
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
            <span className={`text-sm font-medium ${
              isRecording 
                ? 'text-red-600 dark:text-red-400' 
                : recordedBlob 
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {getStatus()}
            </span>
          </div>
          
          {/* Timer */}
          {(isRecording || recordedBlob) && (
            <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
              {formatDuration(durationMs)}
            </div>
          )}
        </div>

        {/* Recording Icon/Waveform */}
        <div className="mb-4">
          {isRecording ? (
            <div className="flex items-center justify-center gap-1 h-16">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 40}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
            </div>
          ) : (
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          {!recordedBlob ? (
            <button
              onClick={handleRecordToggle}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              } disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          ) : (
            <>
              <button
                onClick={handleDiscard}
                disabled={isProcessing}
                className="px-6 py-3 rounded-md font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Discard
              </button>
              <button
                onClick={handleTranscribe}
                disabled={isProcessing}
                className="px-6 py-3 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing…' : 'Transcribe Recording'}
              </button>
            </>
          )}
        </div>

        {/* Audio Preview */}
        {audioUrl && recordedBlob && !isRecording && (
          <div className="mt-4">
            <audio
              controls
              src={audioUrl}
              className="w-full max-w-md mx-auto"
              style={{ height: '40px' }}
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {recorderError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-400">{recorderError}</p>
        </div>
      )}

      {/* Advanced Options */}
      <div className="mt-6">
        <AdvancedOptions
          options={options}
          onChange={setOptions}
          disabled={isProcessing || isRecording}
        />
      </div>

      {/* Info Notice */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 Click "Start Recording" to record audio from your microphone. Once finished, you can preview and transcribe it using the same pipeline as file uploads.
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          Note: Keep recordings under 5 minutes to stay within the 4MB size limit.
        </p>
      </div>
    </div>
  );
}



