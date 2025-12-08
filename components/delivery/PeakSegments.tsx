'use client';

import { DeliveryMetrics } from '@/lib/types';
import { formatDuration } from '@/lib/deliveryMetrics';

interface PeakSegmentsProps {
  peakSegments?: DeliveryMetrics['peakSegments'];
}

export default function PeakSegments({ peakSegments }: PeakSegmentsProps) {
  if (!peakSegments || peakSegments.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        🏆 Peak Performance Moments
      </h4>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Your best speaking segments - try to replicate this quality!
      </p>

      <div className="space-y-3">
        {peakSegments.map((segment, index) => (
          <div
            key={index}
            className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Score: {segment.score}/100
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {formatDuration(segment.startMs)} - {formatDuration(segment.endMs)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Pace:</span>
                <span className="ml-2 font-medium text-green-700 dark:text-green-400">
                  {segment.wpm} WPM
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Fillers:</span>
                <span className="ml-2 font-medium text-green-700 dark:text-green-400">
                  {segment.fillerCount === 0 ? 'None! 🎉' : segment.fillerCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
        📝 Note: Segments scored on ideal pace (120-160 WPM) + minimal fillers
      </p>
    </div>
  );
}

