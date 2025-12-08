'use client';

import { useState } from 'react';
import { PronunciationSummary } from '@/lib/types';
import { 
  getPronunciationScoreColor, 
  getPronunciationScoreLabel,
  getErrorTypeColor 
} from '@/lib/azurePronunciation';

interface PronunciationTabProps {
  transcriptId: string;
  pronunciation?: PronunciationSummary | null;
  isEnabled?: boolean;
}

export default function PronunciationTab({ 
  transcriptId,
  pronunciation: initialPronunciation,
  isEnabled = false,
}: PronunciationTabProps) {
  const [pronunciation, setPronunciation] = useState<PronunciationSummary | null>(
    initialPronunciation || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAssessment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transcriptions/${transcriptId}/pronunciation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to run pronunciation assessment');
      }

      setPronunciation(data.pronunciation);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Feature not enabled
  if (!isEnabled) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-5xl mb-4">🎤</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Pronunciation Assessment Not Enabled
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
          Azure Speech Pronunciation Assessment is not configured on this server.
          Contact your administrator to enable this feature.
        </p>
      </div>
    );
  }

  // No pronunciation data yet
  if (!pronunciation) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-5xl mb-4">🎤</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Pronunciation Assessment Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
          Run a pronunciation assessment to get detailed feedback on pronunciation accuracy, 
          fluency, completeness, and prosody.
        </p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 max-w-md mx-auto">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleRunAssessment}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Running Assessment...
            </>
          ) : (
            'Run Pronunciation Assessment'
          )}
        </button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Powered by Azure Speech Services
        </p>
      </div>
    );
  }

  const {
    overallPronScore,
    accuracyScore,
    fluencyScore,
    completenessScore,
    prosodyScore,
    words = [],
  } = pronunciation;

  // Filter words with errors
  const wordsWithErrors = words.filter(w => w.errorType !== 'None' || w.accuracyScore < 70);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pronunciation Assessment Results
        </h3>
        <button
          onClick={handleRunAssessment}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Reassessing...' : 'Reassess'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Overall Pronunciation Score
          </h4>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            overallPronScore >= 80 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : overallPronScore >= 60
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {getPronunciationScoreLabel(overallPronScore)}
          </span>
        </div>
        <div className="flex items-end gap-3">
          <div className={`text-6xl font-bold ${getPronunciationScoreColor(overallPronScore)}`}>
            {overallPronScore}
          </div>
          <div className="text-gray-500 dark:text-gray-400 mb-2">/ 100</div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Accuracy
          </h5>
          <div className={`text-2xl font-bold ${getPronunciationScoreColor(accuracyScore)}`}>
            {accuracyScore}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Fluency
          </h5>
          <div className={`text-2xl font-bold ${getPronunciationScoreColor(fluencyScore)}`}>
            {fluencyScore}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Completeness
          </h5>
          <div className={`text-2xl font-bold ${getPronunciationScoreColor(completenessScore)}`}>
            {completenessScore}
          </div>
        </div>

        {prosodyScore !== undefined && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Prosody
            </h5>
            <div className={`text-2xl font-bold ${getPronunciationScoreColor(prosodyScore)}`}>
              {prosodyScore}
            </div>
          </div>
        )}
      </div>

      {/* Words with Issues */}
      {wordsWithErrors.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Words Needing Attention ({wordsWithErrors.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {wordsWithErrors.map((word, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {word.word}
                  </span>
                  {word.errorType !== 'None' && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      word.errorType === 'Mispronunciation'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : word.errorType === 'Omission'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {word.errorType}
                    </span>
                  )}
                </div>
                <div className={`text-sm font-semibold ${getPronunciationScoreColor(word.accuracyScore)}`}>
                  {word.accuracyScore}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Words (expandable) */}
      <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <summary className="cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-gray-900 dark:text-white">
          View All Words ({words.length})
        </summary>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 max-h-96 overflow-y-auto">
          {words.map((word, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 dark:text-white">
                  {word.word}
                </span>
                {word.errorType !== 'None' && (
                  <span className={`text-xs ${getErrorTypeColor(word.errorType)}`}>
                    ({word.errorType})
                  </span>
                )}
              </div>
              <span className={`text-sm font-medium ${getPronunciationScoreColor(word.accuracyScore)}`}>
                {word.accuracyScore}
              </span>
            </div>
          ))}
        </div>
      </details>

      {/* Info Footer */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> Pronunciation assessment uses Azure Speech Services to evaluate 
          pronunciation accuracy, speaking fluency, and completeness compared to the transcript text.
          Scores range from 0-100, with higher scores indicating better pronunciation.
        </p>
      </div>
    </div>
  );
}


