'use client';

import { useState } from 'react';
import { TranscriptResponse } from '@/lib/types';
import LeMURPanel from './LeMURPanel';

interface InsightsPanelProps {
  transcript: TranscriptResponse;
}

type TabType = 'summary' | 'chapters' | 'sentiment' | 'entities' | 'highlights' | 'content_safety' | 'lemur';

export default function InsightsPanel({ transcript }: InsightsPanelProps) {
  const hasSummary = !!transcript.summary;
  const hasChapters = !!transcript.chapters && transcript.chapters.length > 0;
  const hasSentiment = !!transcript.sentiment && transcript.sentiment.length > 0;
  const hasEntities = !!transcript.entities && transcript.entities.length > 0;
  const hasHighlights = !!transcript.auto_highlights_result && transcript.auto_highlights_result.length > 0;
  const hasContentSafety = !!transcript.content_safety_labels && transcript.content_safety_labels.length > 0;
  const hasDbId = !!transcript.dbId; // LeMUR needs database ID

  // Determine default tab
  const getDefaultTab = (): TabType => {
    if (hasSummary) return 'summary';
    if (hasChapters) return 'chapters';
    if (hasSentiment) return 'sentiment';
    if (hasEntities) return 'entities';
    if (hasHighlights) return 'highlights';
    if (hasDbId) return 'lemur';
    return 'summary';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());

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

  if (!hasSummary && !hasChapters && !hasSentiment && !hasEntities && !hasHighlights && !hasContentSafety && !hasDbId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Insights</h2>
        <p className="text-gray-500 text-sm">
          No insights available. Enable advanced features in the upload settings to see insights here.
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
          {hasEntities && (
            <button
              onClick={() => setActiveTab('entities')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'entities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Entities
            </button>
          )}
          {hasHighlights && (
            <button
              onClick={() => setActiveTab('highlights')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'highlights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Highlights
            </button>
          )}
          {hasContentSafety && (
            <button
              onClick={() => setActiveTab('content_safety')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'content_safety'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content Safety
            </button>
          )}
          {hasDbId && (
            <button
              onClick={() => setActiveTab('lemur')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'lemur'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Insights
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

        {/* Entities Tab */}
        {activeTab === 'entities' && hasEntities && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Detected Entities</h3>
            <div className="space-y-3">
              {transcript.entities?.map((entity, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-gray-900">{entity.text}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                      {entity.entity_type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(entity.start)} - {formatTimestamp(entity.end)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highlights Tab */}
        {activeTab === 'highlights' && hasHighlights && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Auto Highlights</h3>
            <div className="space-y-3">
              {transcript.auto_highlights_result?.map((highlight, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{highlight.text}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Rank: {highlight.rank}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {highlight.count} mention{highlight.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {highlight.timestamps.map((ts, idx) => (
                      <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {formatTimestamp(ts.start)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Safety Tab */}
        {activeTab === 'content_safety' && hasContentSafety && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Safety Labels</h3>
            <div className="space-y-3">
              {transcript.content_safety_labels?.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <p className="text-sm text-gray-900 mb-3">{item.text}</p>
                  <div className="space-y-2">
                    {item.labels.map((label, idx) => {
                      const getSeverityColor = (severity: number) => {
                        if (severity >= 0.8) return 'bg-red-100 text-red-800 border-red-200';
                        if (severity >= 0.5) return 'bg-orange-100 text-orange-800 border-orange-200';
                        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                      };

                      return (
                        <div
                          key={idx}
                          className={`border rounded p-2 ${getSeverityColor(label.severity)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{label.label}</span>
                            <div className="flex gap-2 text-xs">
                              <span>Confidence: {Math.round(label.confidence * 100)}%</span>
                              <span>Severity: {Math.round(label.severity * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {formatTimestamp(item.timestamp.start)} - {formatTimestamp(item.timestamp.end)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LeMUR Tab */}
        {activeTab === 'lemur' && hasDbId && (
          <LeMURPanel
            transcriptId={transcript.dbId!}
            onGenerate={async (type, question, context) => {
              // This will be handled by the LeMURPanel component
              return {};
            }}
          />
        )}
      </div>
    </div>
  );
}

