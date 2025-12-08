'use client';

import { DeliveryMetrics } from '@/lib/types';
import { 
  getFluencyLabel, 
  getFluencyColor, 
  getWpmLabel,
  formatDuration 
} from '@/lib/deliveryMetrics';
import PaceTimeline from './delivery/PaceTimeline';
import ConfidenceDisplay from './delivery/ConfidenceDisplay';
import FillerHotspots from './delivery/FillerHotspots';
import PeakSegments from './delivery/PeakSegments';
import CriticalMoments from './delivery/CriticalMoments';
import ComparisonBenchmarks from './delivery/ComparisonBenchmarks';

interface DeliveryInsightsTabProps {
  deliveryMetrics?: DeliveryMetrics | null;
  duration?: number; // Duration in seconds from transcript
}

export default function DeliveryInsightsTab({ 
  deliveryMetrics,
  duration,
}: DeliveryInsightsTabProps) {
  if (!deliveryMetrics) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-5xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Delivery Analytics Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Delivery analytics are automatically computed from your transcripts.
        </p>
      </div>
    );
  }

  const {
    overallWpm,
    silenceRatio,
    totalSilenceMs,
    pauseCount,
    talkTimeBySpeakerMs,
    fillerPerMinute,
    fluencyScore,
    fillerWords = [],
    avgPauseDurationMs = 0,
  } = deliveryMetrics;

  // Calculate speaker percentages
  const totalTalkTime = Object.values(talkTimeBySpeakerMs).reduce((sum, t) => sum + t, 0);
  const speakerPercentages: Record<string, number> = {};
  
  for (const [speaker, time] of Object.entries(talkTimeBySpeakerMs)) {
    speakerPercentages[speaker] = totalTalkTime > 0 ? (time / totalTalkTime) * 100 : 0;
  }

  const speakers = Object.keys(talkTimeBySpeakerMs).sort();

  // Get colors for visualizations
  const fluencyColorClass = getFluencyColor(fluencyScore);
  const wpmLabel = getWpmLabel(overallWpm);
  
  // Determine WPM color
  const getWpmColor = (wpm: number) => {
    if (wpm >= 120 && wpm <= 160) return 'text-green-600 dark:text-green-400';
    if (wpm < 100 || wpm > 180) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <div className="space-y-6">
      {/* Overall Fluency Score */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Overall Fluency Score
          </h3>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            fluencyScore >= 70 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : fluencyScore >= 55
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {getFluencyLabel(fluencyScore)}
          </span>
        </div>
        <div className="flex items-end gap-3">
          <div className={`text-6xl font-bold ${fluencyColorClass}`}>
            {fluencyScore}
          </div>
          <div className="text-gray-500 dark:text-gray-400 mb-2">/ 100</div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Based on speaking pace, pauses, silence ratio, and filler word usage
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Words Per Minute */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Speaking Pace
            </h4>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {wpmLabel}
            </span>
          </div>
          <div className={`text-3xl font-bold ${getWpmColor(overallWpm)}`}>
            {overallWpm} <span className="text-base font-normal text-gray-500">WPM</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ideal range: 120-160 words per minute
          </p>
        </div>

        {/* Silence Ratio */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Silence
            </h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {Math.round(silenceRatio * 100)}%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDuration(totalSilenceMs)} of silence detected
          </p>
        </div>

        {/* Pauses */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pauses
            </h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {pauseCount}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {avgPauseDurationMs > 0 
              ? `Avg ${formatDuration(avgPauseDurationMs)} per pause`
              : 'Pauses longer than 800ms'
            }
          </p>
        </div>

        {/* Filler Words */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Filler Words
            </h4>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {fillerPerMinute.toFixed(1)}
            <span className="text-base font-normal text-gray-500"> /min</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {fillerWords.length > 0 ? `e.g., "${fillerWords.slice(0, 3).join('", "')}"` : 'Um, uh, like, etc.'}
          </p>
        </div>
      </div>

      {/* Talk Time by Speaker (if multiple speakers) */}
      {speakers.length > 1 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Talk Time by Speaker
          </h4>
          <div className="space-y-3">
            {speakers.map((speaker, index) => {
              const percentage = speakerPercentages[speaker];
              const time = talkTimeBySpeakerMs[speaker];
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-purple-500',
                'bg-orange-500',
                'bg-pink-500',
              ];
              const color = colors[index % colors.length];

              return (
                <div key={speaker}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {speaker}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatDuration(time)} ({percentage.toFixed(0)}%)
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
      )}

      {/* Enhanced Visualizations */}
      <PaceTimeline paceTimeline={deliveryMetrics.paceTimeline} overallWpm={overallWpm} />
      
      <ConfidenceDisplay 
        confidenceScore={deliveryMetrics.confidenceScore}
        lowConfidenceWords={deliveryMetrics.lowConfidenceWords}
      />
      
      <FillerHotspots fillerHotspots={deliveryMetrics.fillerHotspots} />
      
      <PeakSegments peakSegments={deliveryMetrics.peakSegments} />
      
      <CriticalMoments criticalMoments={deliveryMetrics.criticalMoments} />
      
      <ComparisonBenchmarks yourWpm={overallWpm} yourFluency={fluencyScore} />

      {/* Enhanced Metrics Cards */}
      {(deliveryMetrics.momentumScore || deliveryMetrics.clarityScore || deliveryMetrics.rhythmVariation) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deliveryMetrics.momentumScore && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Energy/Momentum
              </h4>
              <div className={`text-2xl font-bold ${
                deliveryMetrics.momentumScore > 110 ? 'text-green-600 dark:text-green-400' :
                deliveryMetrics.momentumScore < 90 ? 'text-orange-600 dark:text-orange-400' :
                'text-blue-600 dark:text-blue-400'
              }`}>
                {deliveryMetrics.momentumScore}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {deliveryMetrics.momentumScore > 100 ? '📈 Speeding up' : 
                 deliveryMetrics.momentumScore < 100 ? '📉 Slowing down' : 
                 '➡️ Consistent'}
              </p>
            </div>
          )}
          
          {deliveryMetrics.clarityScore !== undefined && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Clarity Score
              </h4>
              <div className={`text-2xl font-bold ${getFluencyColor(deliveryMetrics.clarityScore)}`}>
                {deliveryMetrics.clarityScore}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Confidence × Pace × Articulation
              </p>
            </div>
          )}
          
          {deliveryMetrics.rhythmVariation !== undefined && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Rhythm Variation
              </h4>
              <div className={`text-2xl font-bold ${
                deliveryMetrics.rhythmVariation < 10 ? 'text-orange-600 dark:text-orange-400' :
                deliveryMetrics.rhythmVariation > 30 ? 'text-orange-600 dark:text-orange-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {deliveryMetrics.rhythmVariation}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {deliveryMetrics.rhythmVariation < 10 ? '😴 Too monotone' :
                 deliveryMetrics.rhythmVariation > 30 ? '🎢 Too erratic' :
                 '🎵 Good variation'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sentence & Speech Stats */}
      {deliveryMetrics.sentenceStats && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            📝 Sentence Structure
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Avg Length:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {deliveryMetrics.sentenceStats.avgWordsPerSentence} words
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Longest:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {deliveryMetrics.sentenceStats.longestSentence} words
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Shortest:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {deliveryMetrics.sentenceStats.shortestSentence} words
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Run-ons:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {deliveryMetrics.sentenceStats.runOnSentences}
              </span>
            </div>
          </div>
          {deliveryMetrics.sentenceStats.runOnSentences > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              ⚠️ {deliveryMetrics.sentenceStats.runOnSentences} sentence{deliveryMetrics.sentenceStats.runOnSentences > 1 ? 's' : ''} over 25 words - consider breaking up
            </p>
          )}
        </div>
      )}

      {/* Advanced Features for Multi-Speaker */}
      {deliveryMetrics.speakerInterruptions && deliveryMetrics.speakerInterruptions.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            🔄 Speaker Interactions
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {deliveryMetrics.speakerInterruptions.length} interruption{deliveryMetrics.speakerInterruptions.length > 1 ? 's' : ''} detected
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {deliveryMetrics.speakerInterruptions.slice(0, 5).map((interruption, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                <span className="font-medium text-gray-900 dark:text-white">{interruption.interrupter}</span>
                <span className="text-gray-600 dark:text-gray-400"> interrupted </span>
                <span className="font-medium text-gray-900 dark:text-white">{interruption.interrupted}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                  at {formatDuration(interruption.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Longest Pause Highlight */}
      {deliveryMetrics.longestPause && deliveryMetrics.longestPause.durationMs > 1500 && (
        <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-400 mb-2">
            ⏸️ Longest Pause
          </h4>
          <p className="text-sm text-orange-700 dark:text-orange-400">
            {(deliveryMetrics.longestPause.durationMs / 1000).toFixed(1)} seconds at {formatDuration(deliveryMetrics.longestPause.timestamp)}
            {deliveryMetrics.longestPause.beforeWord && deliveryMetrics.longestPause.afterWord && (
              <span className="block mt-1 text-xs">
                Between "{deliveryMetrics.longestPause.beforeWord}" and "{deliveryMetrics.longestPause.afterWord}"
              </span>
            )}
          </p>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span>💡</span> Tips for Improvement
        </h4>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {overallWpm < 120 && (
            <li>• Try speaking a bit faster - aim for 120-160 words per minute</li>
          )}
          {overallWpm > 180 && (
            <li>• Slow down your pace to ensure clarity - aim for 120-160 words per minute</li>
          )}
          {fillerPerMinute > 3 && (
            <li>• Reduce filler words (um, uh, like) - try pausing instead</li>
          )}
          {silenceRatio > 0.3 && (
            <li>• Reduce excessive pauses to maintain engagement</li>
          )}
          {silenceRatio < 0.1 && (
            <li>• Add strategic pauses to emphasize key points</li>
          )}
          {pauseCount === 0 && (
            <li>• Use pauses to give your audience time to process information</li>
          )}
          {deliveryMetrics.rhythmVariation !== undefined && deliveryMetrics.rhythmVariation < 10 && (
            <li>• Vary your pace more to sound more engaging and natural</li>
          )}
          {deliveryMetrics.sentenceStats && deliveryMetrics.sentenceStats.runOnSentences > 2 && (
            <li>• Break up long sentences for better clarity</li>
          )}
        </ul>
      </div>
    </div>
  );
}


