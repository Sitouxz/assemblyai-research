'use client';

import { useState } from 'react';
import { VoiceEmotionSummary, SentimentAnalysisResult } from '@/lib/types';
import { 
  getEmotionColor, 
  formatEmotionScore,
  getTopEmotions 
} from '@/lib/humeEmotion';

interface EmotionTabProps {
  transcriptId: string;
  voiceEmotion?: VoiceEmotionSummary | null;
  textSentiment?: SentimentAnalysisResult[];
  isHumeEnabled?: boolean;
}

export default function EmotionTab({ 
  transcriptId,
  voiceEmotion: initialVoiceEmotion,
  textSentiment = [],
  isHumeEnabled = false,
}: EmotionTabProps) {
  const [voiceEmotion, setVoiceEmotion] = useState<VoiceEmotionSummary | null>(
    initialVoiceEmotion || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transcriptions/${transcriptId}/emotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          force: true,
          maxDurationSeconds: 60, // Analyze first 60 seconds only
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to run emotion analysis');
      }

      setVoiceEmotion(data.voiceEmotion);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate text sentiment summary
  const textSentimentSummary = textSentiment.reduce(
    (acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalSentiments = textSentiment.length;

  return (
    <div className="space-y-6">
      {/* Text Sentiment Analysis (Always available if sentiment was enabled) */}
      {textSentiment.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Text Sentiment Analysis
          </h3>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                POSITIVE
              </div>
              <div className="text-3xl font-bold text-green-800 dark:text-green-400">
                {textSentimentSummary.POSITIVE || 0}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                {totalSentiments > 0 
                  ? Math.round(((textSentimentSummary.POSITIVE || 0) / totalSentiments) * 100)
                  : 0}% of segments
              </div>
            </div>

            <div className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                NEUTRAL
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-300">
                {textSentimentSummary.NEUTRAL || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                {totalSentiments > 0 
                  ? Math.round(((textSentimentSummary.NEUTRAL || 0) / totalSentiments) * 100)
                  : 0}% of segments
              </div>
            </div>

            <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                NEGATIVE
              </div>
              <div className="text-3xl font-bold text-red-800 dark:text-red-400">
                {textSentimentSummary.NEGATIVE || 0}
              </div>
              <div className="text-xs text-red-600 dark:text-red-500 mt-1">
                {totalSentiments > 0 
                  ? Math.round(((textSentimentSummary.NEGATIVE || 0) / totalSentiments) * 100)
                  : 0}% of segments
              </div>
            </div>
          </div>

          {/* Sentiment Timeline (collapsed by default) */}
          <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <summary className="cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-gray-900 dark:text-white">
              View Sentiment Timeline ({textSentiment.length} segments)
            </summary>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 max-h-96 overflow-y-auto">
              {textSentiment.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    item.sentiment === 'POSITIVE'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : item.sentiment === 'NEGATIVE'
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-medium ${
                      item.sentiment === 'POSITIVE'
                        ? 'text-green-800 dark:text-green-400'
                        : item.sentiment === 'NEGATIVE'
                        ? 'text-red-800 dark:text-red-400'
                        : 'text-gray-800 dark:text-gray-400'
                    }`}>
                      {item.sentiment}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(item.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Voice Emotion Analysis (Hume) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Voice Emotion Analysis
        </h3>

        {!isHumeEnabled && (
          <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-gray-400 text-5xl mb-4">🎭</div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
              Voice Emotion Not Enabled
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
              Hume Voice Emotion Analysis is not configured on this server.
              Contact your administrator to enable this feature.
            </p>
          </div>
        )}

        {isHumeEnabled && !voiceEmotion && (
          <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-gray-400 text-5xl mb-4">🎭</div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
              No Voice Emotion Analysis Yet
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Analyze the emotional tone and prosody of the speaker's voice using Hume AI.
              Only the first 60 seconds will be analyzed to minimize costs.
            </p>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Analyzing Voice...
                </>
              ) : (
                'Analyze Voice Emotion'
              )}
            </button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Powered by Hume AI • Analyzes first 60 seconds only
            </p>
          </div>
        )}

        {isHumeEnabled && voiceEmotion && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {voiceEmotion.dominantEmotionsOverTime.length} emotion segments analyzed
              </span>
              <button
                onClick={handleRunAnalysis}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Reanalyzing...' : 'Reanalyze'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Top Emotions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                Top Detected Emotions
              </h4>
              <div className="space-y-3">
                {getTopEmotions(voiceEmotion.overallEmotionDistribution, 5).map(({ emotion, score }, index) => {
                  const percentage = score * 100;
                  const colors = [
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-blue-500',
                    'bg-indigo-500',
                    'bg-violet-500',
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div key={emotion}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className={`font-medium capitalize ${getEmotionColor(emotion)}`}>
                          {emotion}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatEmotionScore(score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emotion Timeline */}
            <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-gray-900 dark:text-white">
                View Emotion Timeline ({voiceEmotion.dominantEmotionsOverTime.length} segments)
              </summary>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 max-h-96 overflow-y-auto">
                {voiceEmotion.dominantEmotionsOverTime.map((segment, index) => {
                  const startSec = (segment.startMs / 1000).toFixed(1);
                  const endSec = (segment.endMs / 1000).toFixed(1);

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {startSec}s - {endSec}s
                        </span>
                        <span className={`font-medium capitalize ${getEmotionColor(segment.topEmotion)}`}>
                          {segment.topEmotion}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatEmotionScore(segment.score)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </details>

            {/* Info Footer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Note:</strong> Voice emotion analysis uses Hume AI to detect emotional 
                expressions in the speaker's voice. To minimize costs, only the first 60 seconds 
                of audio are analyzed by default.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


