'use client';

import { useState, useRef, useCallback } from 'react';
import AdvancedOptions from './AdvancedOptions';
import { TranscriptionOptions } from '@/lib/types';

interface UploadCardProps {
  onTranscribe: (
    file: File | null,
    url: string | null,
    options: TranscriptionOptions,
    fileName?: string,
    duration?: number
  ) => void;
  isProcessing: boolean;
}

export default function UploadCard({ onTranscribe, isProcessing }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState<number | undefined>();
  const [isDragOver, setIsDragOver] = useState(false);
  const [options, setOptions] = useState<TranscriptionOptions>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const validateFile = (selectedFile: File): boolean => {
    const validTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
      'video/mp4',
      'video/x-m4v',
    ];
    
    const validExtensions = ['.mp3', '.wav', '.m4a', '.mp4'];
    const fileName = selectedFile.name.toLowerCase();
    
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = validTypes.includes(selectedFile.type);

    if (!hasValidExtension && !hasValidType) {
      setError('Please upload a valid audio/video file (MP3, WAV, M4A, MP4)');
      return false;
    }

    // Check file size (4MB limit for Vercel serverless)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 4MB. For larger files, please use a public URL instead.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    setUrl(''); // Clear URL when file is selected

    // Try to get audio duration
    const audioUrl = URL.createObjectURL(selectedFile);
    const audio = new Audio(audioUrl);
    
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
      URL.revokeObjectURL(audioUrl);
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(audioUrl);
    });
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      // For now, just select the first file
      // Multi-file support will be handled by the queue in the parent component
      handleFileSelect(selectedFiles[0]);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl) {
      setFile(null); // Clear file when URL is entered
      setError(null);
    }
  };

  const handleSubmit = () => {
    setError(null);

    if (!file && !url.trim()) {
      setError('Please select a file or enter a URL');
      return;
    }

    if (url && !url.match(/^https?:\/\/.+/)) {
      setError('Please enter a valid URL');
      return;
    }

    onTranscribe(file, url.trim() || null, options, file?.name, audioDuration);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Upload & Settings
      </h2>

      {/* File size notice */}
      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 Maximum file size: 4MB. For larger files, please use a public URL instead.
        </p>
      </div>

      {/* File Dropzone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {file ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Size: {formatFileSize(file.size)}</span>
              {audioDuration && (
                <span>Duration: {formatDuration(audioDuration)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setAudioDuration(undefined);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop a file here, or click to browse
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isProcessing}
            >
              Browse file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isProcessing}
              multiple
            />
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or enter a public URL
        </label>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://example.com/audio.mp3"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isProcessing || !!file}
        />
      </div>

      {/* Options */}
      <div className="mt-6">
        <AdvancedOptions
          options={options}
          onChange={setOptions}
          disabled={isProcessing}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Transcribe Button */}
      <button
        onClick={handleSubmit}
        disabled={isProcessing || (!file && !url.trim())}
        className={`mt-6 w-full py-3 px-4 rounded-md font-medium transition-all ${
          isProcessing || (!file && !url.trim())
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Transcribing...
          </span>
        ) : (
          'Transcribe'
        )}
      </button>
    </div>
  );
}

