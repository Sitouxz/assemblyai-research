'use client';

import { DeliveryMetrics } from '@/lib/types';
import { formatDuration } from '@/lib/deliveryMetrics';

interface PaceTimelineProps {
  paceTimeline?: DeliveryMetrics['paceTimeline'];
  overallWpm: number;
}

export default function PaceTimeline({ paceTimeline, overallWpm }: PaceTimelineProps) {
  if (!paceTimeline || paceTimeline.length === 0) {
    return null;
  }

  const maxWpm = Math.max(...paceTimeline.map(s => s.wpm), 200);
  const minWpm = Math.min(...paceTimeline.map(s => s.wpm), 0);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        📈 Speaking Pace Timeline
      </h4>
      
      <div className="space-y-3">
        {paceTimeline.map((segment, index) => {
          const startSec = Math.floor(segment.startMs / 1000);
          const endSec = Math.floor(segment.endMs / 1000);
          const heightPercent = ((segment.wpm - minWpm) / (maxWpm - minWpm)) * 100;
          
          // Color based on WPM quality
          let barColor = 'bg-blue-500';
          if (segment.wpm < 100) barColor = 'bg-red-500';
          else if (segment.wpm < 120) barColor = 'bg-orange-500';
          else if (segment.wpm >= 120 && segment.wpm <= 160) barColor = 'bg-green-500';
          else if (segment.wpm > 180) barColor = 'bg-red-500';
          else if (segment.wpm > 160) barColor = 'bg-yellow-500';

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono w-16">
                {startSec}s-{endSec}s
              </div>
              
              <div className="flex-1 relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all flex items-center px-2`}
                    style={{ width: `${Math.max(heightPercent, 10)}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      {segment.wpm} WPM
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 w-20 text-right">
                {segment.wordCount} words
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Ideal (120-160)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Fast (160-180)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Too slow/fast</span>
        </div>
      </div>
    </div>
  );
}

