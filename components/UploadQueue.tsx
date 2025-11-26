'use client';

import { useState, useEffect } from 'react';

export interface QueueItem {
  id: string;
  file: File;
  url?: string;
  fileName: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  transcriptId?: string;
  duration?: number;
}

interface UploadQueueProps {
  queue: QueueItem[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onViewTranscript: (transcriptId: string) => void;
}

export default function UploadQueue({ queue, onRemove, onRetry, onViewTranscript }: UploadQueueProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeCount = queue.filter(
    item => item.status === 'uploading' || item.status === 'processing'
  ).length;
  const completedCount = queue.filter(item => item.status === 'completed').length;
  const errorCount = queue.filter(item => item.status === 'error').length;

  if (queue.length === 0) return null;

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'uploading':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
    }
  };

  const getStatusLabel = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'Waiting';
      case 'uploading':
        return 'Uploading';
      case 'processing':
        return 'Transcribing';
      case 'completed':
        return 'Done';
      case 'error':
        return 'Failed';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Upload Queue</h3>
          <div className="flex items-center gap-2 text-sm">
            {activeCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {activeCount} active
              </span>
            )}
            {completedCount > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {completedCount} completed
              </span>
            )}
            {errorCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {errorCount} failed
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Queue Items */}
      {isExpanded && (
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {queue.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.fileName}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                    {item.duration && ` • ${Math.floor(item.duration / 60)}:${Math.floor(item.duration % 60).toString().padStart(2, '0')}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {item.status === 'completed' && item.transcriptId && (
                    <button
                      onClick={() => onViewTranscript(item.transcriptId!)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </button>
                  )}
                  {item.status === 'error' && (
                    <button
                      onClick={() => onRetry(item.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Retry
                    </button>
                  )}
                  {(item.status === 'pending' || item.status === 'error' || item.status === 'completed') && (
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(item.status === 'uploading' || item.status === 'processing') && (
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.status === 'uploading' ? 'bg-blue-600' : 'bg-yellow-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{item.status === 'uploading' ? 'Uploading...' : 'Transcribing...'}</span>
                    <span>{Math.round(item.progress)}%</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {item.status === 'error' && item.error && (
                <p className="text-xs text-red-600 mt-1">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer with actions */}
      {isExpanded && queue.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {queue.length} item{queue.length !== 1 ? 's' : ''} in queue
            </span>
            {(completedCount > 0 || errorCount > 0) && (
              <button
                onClick={() => {
                  queue
                    .filter(item => item.status === 'completed' || item.status === 'error')
                    .forEach(item => onRemove(item.id));
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

