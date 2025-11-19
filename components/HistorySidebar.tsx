'use client';

import { HistoryItem } from '@/lib/types';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function HistorySidebar({
  history,
  onSelect,
  onClear,
}: HistorySidebarProps) {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClear = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all transcript history? This cannot be undone.'
      )
    ) {
      onClear();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transcripts</h2>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No recent transcripts</p>
          <p className="text-xs text-gray-400 mt-2">
            Transcripts will appear here after you transcribe audio files
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate flex-1 group-hover:text-blue-700">
                  {item.fileName}
                </p>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {item.snippet}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatDate(item.createdAt)}</span>
                {item.duration && (
                  <span>{formatDuration(item.duration)}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

