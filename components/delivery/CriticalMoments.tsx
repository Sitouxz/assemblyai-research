'use client';

import { DeliveryMetrics } from '@/lib/types';
import { formatDuration } from '@/lib/deliveryMetrics';

interface CriticalMomentsProps {
  criticalMoments?: DeliveryMetrics['criticalMoments'];
}

export default function CriticalMoments({ criticalMoments }: CriticalMomentsProps) {
  if (!criticalMoments || criticalMoments.length === 0) {
    return (
      <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-900 dark:text-green-400 mb-2">
          ✅ No Critical Issues Detected
        </h4>
        <p className="text-sm text-green-700 dark:text-green-400">
          Your speech had no significant problem areas. Great job!
        </p>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟠';
      case 'low': return '🟡';
      default: return '⚪';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'low': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    }
  };

  const getIssueLabel = (issue: string) => {
    switch (issue) {
      case 'filler_cluster': return 'Filler Cluster';
      case 'long_pause': return 'Long Pause';
      case 'unclear_speech': return 'Unclear Speech';
      default: return issue;
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        🚨 Areas for Improvement
      </h4>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Moments that could be improved in future recordings
      </p>

      <div className="space-y-2">
        {criticalMoments.map((moment, index) => (
          <div
            key={index}
            className={`p-3 border rounded-lg ${getSeverityColor(moment.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-lg leading-none">
                  {getSeverityIcon(moment.severity)}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getIssueLabel(moment.issue)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {moment.details}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono ml-2">
                {formatDuration(moment.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
        💡 Review these moments in the audio to understand what went wrong
      </p>
    </div>
  );
}

