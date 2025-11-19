'use client';

import { useState } from 'react';
import { TranscriptResponse } from '@/lib/types';

interface InsightsPanelProps {
  transcript: TranscriptResponse;
}

export default function InsightsPanel({ transcript }: InsightsPanelProps) {
  const hasSummary = !!transcript.summary;
  const hasChapters = !!transcript.chapters && transcript.chapters.length > 0;
  const hasSentiment = !!transcript.sentiment && transcript.sentiment.length > 0;

  // Determine default tab
  const getDefaultTab = (): 'summary' | 'chapters' | 'sentiment' => {
    if (hasSummary) return 'summary';
    if (hasChapters) return 'chapters';
    if (hasSentiment) return 'sentiment';
    return 'summary';
  };

  const [activeTab, setActiveTab] = useState<'summary' | 'chapters' | 'sentiment'>(getDefaultTab());

  const formatTimestamp = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'NEGATIVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NEUTRAL':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!hasSummary && !hasChapters && !hasSentiment) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Insights</h2>
        <p className="text-gray-500 text-sm">
          No insights available. Enable auto chapters, sentiment analysis, or other features
          in the upload settings to see insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {hasSummary && (
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Summary
            </button>
          )}
          {hasChapters && (
            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chapters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chapters / Topics
            </button>
          )}
          {hasSentiment && (
            <button
              onClick={() => setActiveTab('sentiment')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sentiment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sentiment
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Summary Tab */}
        {activeTab === 'summary' && hasSummary && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {transcript.summary}
            </div>
          </div>
        )}

        {/* Chapters Tab */}
        {activeTab === 'chapters' && hasChapters && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Chapters / Topics</h3>
            <div className="space-y-4">
              {transcript.chapters?.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{chapter.headline}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {formatTimestamp(chapter.start)} - {formatTimestamp(chapter.end)}
                    </span>
                  </div>
                  {chapter.summary && (
                    <p className="text-sm text-gray-700 mt-2">{chapter.summary}</p>
                  )}
                  {chapter.gist && (
                    <p className="text-xs text-gray-500 mt-2 italic">Gist: {chapter.gist}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sentiment Tab */}
        {activeTab === 'sentiment' && hasSentiment && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sentiment Analysis</h3>
            <div className="space-y-3">
              {transcript.sentiment?.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${getSentimentColor(item.sentiment)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium uppercase">
                      {item.sentiment}
                    </span>
                    <span className="text-xs">
                      {Math.round(item.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm mt-1">{item.text}</p>
                  <span className="text-xs opacity-75 mt-2 block">
                    {formatTimestamp(item.start)} - {formatTimestamp(item.end)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for active tab */}
        {activeTab === 'summary' && !hasSummary && (
          <p className="text-gray-500 text-sm">No summary available.</p>
        )}
        {activeTab === 'chapters' && !hasChapters && (
          <p className="text-gray-500 text-sm">No chapters available.</p>
        )}
        {activeTab === 'sentiment' && !hasSentiment && (
          <p className="text-gray-500 text-sm">No sentiment analysis available.</p>
        )}
      </div>
    </div>
  );
}

