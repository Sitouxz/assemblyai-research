'use client';

import { DeliveryMetrics } from '@/lib/types';
import { formatDuration } from '@/lib/deliveryMetrics';

interface FillerHotspotsProps {
  fillerHotspots?: DeliveryMetrics['fillerHotspots'];
}

export default function FillerHotspots({ fillerHotspots }: FillerHotspotsProps) {
  if (!fillerHotspots || fillerHotspots.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        🗺️ Filler Word Hotspots
      </h4>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Moments where multiple filler words clustered together
      </p>

      <div className="space-y-3">
        {fillerHotspots.map((hotspot, index) => (
          <div
            key={index}
            className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                  ⚠️
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {hotspot.count} filler words
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {formatDuration(hotspot.startMs)}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {hotspot.fillers.map((filler, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-400 rounded"
                >
                  "{filler}"
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
        💡 Try pausing briefly instead of using filler words
      </p>
    </div>
  );
}

