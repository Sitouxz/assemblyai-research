'use client';

import { DeliveryMetrics } from '@/lib/types';
import { formatDuration } from '@/lib/deliveryMetrics';

interface ConfidenceDisplayProps {
  confidenceScore?: number;
  lowConfidenceWords?: DeliveryMetrics['lowConfidenceWords'];
}

export default function ConfidenceDisplay({ confidenceScore, lowConfidenceWords }: ConfidenceDisplayProps) {
  if (confidenceScore === undefined) {
    return null;
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        ⭐ Speech Clarity
      </h4>
      
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-4xl font-bold ${getConfidenceColor(confidenceScore)}`}>
          {confidenceScore}
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Confidence Score</div>
          <div className={`text-sm font-medium ${getConfidenceColor(confidenceScore)}`}>
            {getConfidenceLabel(confidenceScore)}
          </div>
        </div>
      </div>

      {lowConfidenceWords && lowConfidenceWords.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            View {lowConfidenceWords.length} Unclear Word{lowConfidenceWords.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {lowConfidenceWords.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-sm"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  "{item.word}"
                </span>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${getConfidenceColor(Math.round(item.confidence * 100))}`}>
                    {Math.round(item.confidence * 100)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {formatDuration(item.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
        Based on AssemblyAI's word-level confidence scores
      </p>
    </div>
  );
}

