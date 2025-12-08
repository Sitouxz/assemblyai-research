import { Word, DeliveryMetrics } from './types';

// Common filler words to detect
const FILLER_WORDS = [
  'um', 'uh', 'er', 'erm', 'hmm', 'ah', 'like',
  'you know', 'sort of', 'kind of', 'i mean', 'basically',
  'actually', 'literally', 'so', 'right', 'okay', 'well'
];

// Pause threshold in milliseconds (gaps longer than this are considered pauses)
const PAUSE_THRESHOLD_MS = 800;

// Ideal WPM range for clear speaking
const IDEAL_WPM_MIN = 120;
const IDEAL_WPM_MAX = 160;

/**
 * Computes delivery metrics from AssemblyAI transcript results
 * This is completely free - uses only data from AssemblyAI output
 * 
 * @param result - AssemblyAI transcript result with word-level timestamps
 * @returns DeliveryMetrics object with all calculated metrics
 */
export function computeDeliveryMetricsFromAssemblyAI(result: any): DeliveryMetrics {
  // Extract words array from the result
  const words: Word[] = result.words || [];
  
  if (!words || words.length === 0) {
    // Return default metrics if no words available
    return {
      overallWpm: 0,
      silenceRatio: 0,
      totalSilenceMs: 0,
      pauseCount: 0,
      talkTimeBySpeakerMs: {},
      fillerPerMinute: 0,
      fluencyScore: 0,
      fillerWords: [],
      avgPauseDurationMs: 0,
    };
  }

  // Calculate total duration
  const firstWordStart = words[0].start;
  const lastWordEnd = words[words.length - 1].end;
  const totalDurationMs = lastWordEnd - firstWordStart;
  const durationMinutes = Math.max(totalDurationMs / 1000 / 60, 0.01); // Prevent division by zero

  // 1. Calculate Overall WPM
  const totalWords = words.length;
  const overallWpm = Math.round(totalWords / durationMinutes);

  // 2. Calculate silence and pauses
  let totalSilenceMs = 0;
  let pauseCount = 0;
  const pauses: number[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];
    const gap = nextWord.start - currentWord.end;

    if (gap > 0) {
      totalSilenceMs += gap;
      
      if (gap > PAUSE_THRESHOLD_MS) {
        pauseCount++;
        pauses.push(gap);
      }
    }
  }

  const silenceRatio = totalDurationMs > 0 ? totalSilenceMs / totalDurationMs : 0;
  const avgPauseDurationMs = pauses.length > 0 
    ? Math.round(pauses.reduce((sum, p) => sum + p, 0) / pauses.length)
    : 0;

  // 3. Calculate talk-time per speaker (if diarization is available)
  const talkTimeBySpeakerMs: Record<string, number> = {};
  
  for (const word of words) {
    const speaker = word.speaker || 'Speaker 1';
    const duration = word.end - word.start;
    
    if (!talkTimeBySpeakerMs[speaker]) {
      talkTimeBySpeakerMs[speaker] = 0;
    }
    talkTimeBySpeakerMs[speaker] += duration;
  }

  // 4. Calculate filler words
  const detectedFillers: string[] = [];
  let fillerCount = 0;

  for (const word of words) {
    const wordText = word.text.toLowerCase().trim();
    
    // Check for single-word fillers
    if (FILLER_WORDS.includes(wordText)) {
      fillerCount++;
      detectedFillers.push(word.text);
    }
  }

  // Check for multi-word filler phrases
  for (let i = 0; i < words.length - 1; i++) {
    const twoWordPhrase = `${words[i].text} ${words[i + 1].text}`.toLowerCase();
    const multiWordFillers = FILLER_WORDS.filter(f => f.includes(' '));
    
    if (multiWordFillers.includes(twoWordPhrase)) {
      fillerCount++;
      detectedFillers.push(twoWordPhrase);
    }
  }

  const fillerPerMinute = fillerCount / durationMinutes;

  // 5. Calculate simple fluency score (0-100)
  const fluencyScore = calculateFluencyScore({
    wpm: overallWpm,
    silenceRatio,
    fillerPerMinute,
    pauseCount,
    durationMinutes,
  });

  // 6. Calculate enhanced metrics
  const { confidenceScore, lowConfidenceWords } = calculateConfidenceMetrics(words);
  const longestPause = findLongestPause(words);
  const paceTimeline = calculatePaceTimeline(words);
  const momentumScore = calculateMomentumScore(paceTimeline);
  const sentenceStats = analyzeSentences(result.text || '');
  const fillerHotspots = detectFillerHotspots(words);
  const rhythmVariation = calculateRhythmVariation(paceTimeline);
  const peakSegments = identifyPeakSegments(words, paceTimeline);
  const clarityScore = calculateClarityScore(confidenceScore, overallWpm, silenceRatio);
  const criticalMoments = detectCriticalMoments(words, fillerHotspots, longestPause);
  const speakerInterruptions = detectSpeakerInterruptions(words);
  const breathingPattern = estimateBreathingPattern(words);

  return {
    // Basic metrics
    overallWpm,
    silenceRatio: Math.round(silenceRatio * 1000) / 1000, // Round to 3 decimals
    totalSilenceMs: Math.round(totalSilenceMs),
    pauseCount,
    talkTimeBySpeakerMs,
    fillerPerMinute: Math.round(fillerPerMinute * 10) / 10, // Round to 1 decimal
    fluencyScore,
    fillerWords: detectedFillers.slice(0, 20), // Limit to first 20 examples
    avgPauseDurationMs,
    
    // Enhanced metrics
    confidenceScore,
    lowConfidenceWords,
    longestPause,
    paceTimeline,
    momentumScore,
    sentenceStats,
    fillerHotspots,
    rhythmVariation,
    peakSegments,
    clarityScore,
    criticalMoments,
    speakerInterruptions,
    breathingPattern,
  };
}

/**
 * Calculate a simple fluency score from 0-100 based on multiple factors
 */
function calculateFluencyScore(params: {
  wpm: number;
  silenceRatio: number;
  fillerPerMinute: number;
  pauseCount: number;
  durationMinutes: number;
}): number {
  const { wpm, silenceRatio, fillerPerMinute, pauseCount, durationMinutes } = params;

  // Component 1: WPM score (0-40 points)
  // Ideal range: 120-160 WPM
  let wpmScore = 0;
  if (wpm >= IDEAL_WPM_MIN && wpm <= IDEAL_WPM_MAX) {
    wpmScore = 40; // Perfect score in ideal range
  } else if (wpm < IDEAL_WPM_MIN) {
    // Too slow: linear decrease
    wpmScore = Math.max(0, (wpm / IDEAL_WPM_MIN) * 40);
  } else {
    // Too fast: linear decrease
    const excess = wpm - IDEAL_WPM_MAX;
    wpmScore = Math.max(0, 40 - (excess / 40));
  }

  // Component 2: Silence score (0-30 points)
  // Ideal silence ratio: 10-25%
  let silenceScore = 0;
  if (silenceRatio >= 0.1 && silenceRatio <= 0.25) {
    silenceScore = 30;
  } else if (silenceRatio < 0.1) {
    // Too little silence
    silenceScore = (silenceRatio / 0.1) * 30;
  } else {
    // Too much silence
    const excess = silenceRatio - 0.25;
    silenceScore = Math.max(0, 30 - (excess * 80));
  }

  // Component 3: Filler words score (0-20 points)
  // Ideal: less than 2 fillers per minute
  let fillerScore = 0;
  if (fillerPerMinute <= 2) {
    fillerScore = 20;
  } else if (fillerPerMinute <= 5) {
    fillerScore = 20 - ((fillerPerMinute - 2) * 5);
  } else {
    fillerScore = Math.max(0, 5 - (fillerPerMinute - 5));
  }

  // Component 4: Pause naturalness (0-10 points)
  // Ideal: 3-8 pauses per minute
  const pausesPerMinute = pauseCount / durationMinutes;
  let pauseScore = 0;
  if (pausesPerMinute >= 3 && pausesPerMinute <= 8) {
    pauseScore = 10;
  } else if (pausesPerMinute < 3) {
    pauseScore = (pausesPerMinute / 3) * 10;
  } else {
    const excess = pausesPerMinute - 8;
    pauseScore = Math.max(0, 10 - (excess * 2));
  }

  // Total fluency score
  const totalScore = wpmScore + silenceScore + fillerScore + pauseScore;
  
  // Clamp to 0-100 and round
  return Math.round(Math.max(0, Math.min(100, totalScore)));
}

/**
 * Get a human-readable label for the fluency score
 */
export function getFluencyLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
}

/**
 * Get a human-readable label for WPM
 */
export function getWpmLabel(wpm: number): string {
  if (wpm < 100) return 'Too Slow';
  if (wpm < IDEAL_WPM_MIN) return 'Slow';
  if (wpm <= IDEAL_WPM_MAX) return 'Good Pace';
  if (wpm <= 180) return 'Fast';
  return 'Too Fast';
}

/**
 * Get color class for fluency score (Tailwind classes)
 */
export function getFluencyColor(score: number): string {
  if (score >= 85) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-blue-600 dark:text-blue-400';
  if (score >= 55) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Format milliseconds to human-readable duration
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Calculate confidence score metrics
 */
function calculateConfidenceMetrics(words: Word[]) {
  const wordsWithConfidence = words.filter(w => w.confidence !== undefined);
  
  if (wordsWithConfidence.length === 0) {
    return { confidenceScore: undefined, lowConfidenceWords: undefined };
  }
  
  const avgConfidence = wordsWithConfidence.reduce((sum, w) => sum + (w.confidence || 0), 0) / wordsWithConfidence.length;
  const confidenceScore = Math.round(avgConfidence * 100);
  
  const lowConfidenceWords = wordsWithConfidence
    .filter(w => (w.confidence || 0) < 0.7)
    .map(w => ({
      word: w.text,
      confidence: w.confidence || 0,
      timestamp: w.start
    }))
    .slice(0, 20); // Limit to 20
  
  return {
    confidenceScore,
    lowConfidenceWords: lowConfidenceWords.length > 0 ? lowConfidenceWords : undefined
  };
}

/**
 * Find the longest pause
 */
function findLongestPause(words: Word[]): DeliveryMetrics['longestPause'] {
  let longestPause: DeliveryMetrics['longestPause'];
  let maxGap = 0;
  
  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];
    const gap = nextWord.start - currentWord.end;
    
    if (gap > maxGap && gap > PAUSE_THRESHOLD_MS) {
      maxGap = gap;
      longestPause = {
        durationMs: Math.round(gap),
        timestamp: currentWord.end,
        beforeWord: currentWord.text,
        afterWord: nextWord.text
      };
    }
  }
  
  return longestPause;
}

/**
 * Calculate speaking pace timeline (WPM by segments)
 */
function calculatePaceTimeline(words: Word[], segmentDurationMs: number = 30000): DeliveryMetrics['paceTimeline'] {
  if (words.length === 0) return undefined;
  
  const firstStart = words[0].start;
  const lastEnd = words[words.length - 1].end;
  const totalDuration = lastEnd - firstStart;
  
  const segments: DeliveryMetrics['paceTimeline'] = [];
  let currentSegmentStart = firstStart;
  
  while (currentSegmentStart < lastEnd) {
    const segmentEnd = Math.min(currentSegmentStart + segmentDurationMs, lastEnd);
    
    const segmentWords = words.filter(w => 
      w.start >= currentSegmentStart && w.start < segmentEnd
    );
    
    if (segmentWords.length > 0) {
      const segmentDuration = segmentEnd - currentSegmentStart;
      const segmentMinutes = segmentDuration / 1000 / 60;
      const wpm = Math.round(segmentWords.length / Math.max(segmentMinutes, 0.01));
      
      segments.push({
        startMs: currentSegmentStart,
        endMs: segmentEnd,
        wpm,
        wordCount: segmentWords.length
      });
    }
    
    currentSegmentStart = segmentEnd;
  }
  
  return segments.length > 0 ? segments : undefined;
}

/**
 * Calculate momentum/energy score
 */
function calculateMomentumScore(paceTimeline?: DeliveryMetrics['paceTimeline']): number | undefined {
  if (!paceTimeline || paceTimeline.length < 2) return undefined;
  
  const firstSegmentWpm = paceTimeline[0].wpm;
  const lastSegmentWpm = paceTimeline[paceTimeline.length - 1].wpm;
  
  if (firstSegmentWpm === 0) return 100;
  
  return Math.round((lastSegmentWpm / firstSegmentWpm) * 100);
}

/**
 * Analyze sentence structure
 */
function analyzeSentences(text: string): DeliveryMetrics['sentenceStats'] {
  // Split on sentence boundaries
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return undefined;
  
  const wordCounts = sentences.map(s => s.trim().split(/\s+/).length);
  const avgWordsPerSentence = Math.round(wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length);
  const longestSentence = Math.max(...wordCounts);
  const shortestSentence = Math.min(...wordCounts);
  const runOnSentences = wordCounts.filter(count => count > 25).length;
  
  return {
    avgWordsPerSentence,
    longestSentence,
    shortestSentence,
    runOnSentences
  };
}

/**
 * Detect filler word hotspots (clusters)
 */
function detectFillerHotspots(words: Word[], windowMs: number = 10000): DeliveryMetrics['fillerHotspots'] {
  const fillerIndices: number[] = [];
  
  words.forEach((word, index) => {
    const wordText = word.text.toLowerCase().trim();
    if (FILLER_WORDS.includes(wordText)) {
      fillerIndices.push(index);
    }
  });
  
  if (fillerIndices.length < 2) return undefined;
  
  const hotspots: DeliveryMetrics['fillerHotspots'] = [];
  
  for (let i = 0; i < fillerIndices.length; i++) {
    const startIdx = fillerIndices[i];
    const startTime = words[startIdx].start;
    const fillersInWindow: string[] = [words[startIdx].text];
    
    // Look for more fillers within the window
    for (let j = i + 1; j < fillerIndices.length; j++) {
      const idx = fillerIndices[j];
      if (words[idx].start - startTime <= windowMs) {
        fillersInWindow.push(words[idx].text);
        i = j; // Skip these in outer loop
      } else {
        break;
      }
    }
    
    if (fillersInWindow.length >= 2) {
      hotspots.push({
        startMs: startTime,
        endMs: words[fillerIndices[i]].end,
        fillers: fillersInWindow,
        count: fillersInWindow.length
      });
    }
  }
  
  return hotspots.length > 0 ? hotspots : undefined;
}

/**
 * Calculate speaking rhythm variation
 */
function calculateRhythmVariation(paceTimeline?: DeliveryMetrics['paceTimeline']): number | undefined {
  if (!paceTimeline || paceTimeline.length < 2) return undefined;
  
  const wpms = paceTimeline.map(s => s.wpm);
  const mean = wpms.reduce((sum, wpm) => sum + wpm, 0) / wpms.length;
  const squareDiffs = wpms.map(wpm => Math.pow(wpm - mean, 2));
  const variance = squareDiffs.reduce((sum, diff) => sum + diff, 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.round(stdDev);
}

/**
 * Identify peak performance segments
 */
function identifyPeakSegments(words: Word[], paceTimeline?: DeliveryMetrics['paceTimeline']): DeliveryMetrics['peakSegments'] {
  if (!paceTimeline || paceTimeline.length === 0) return undefined;
  
  const segments = paceTimeline.map(segment => {
    const segmentWords = words.filter(w => w.start >= segment.startMs && w.start < segment.endMs);
    const fillerCount = segmentWords.filter(w => FILLER_WORDS.includes(w.text.toLowerCase())).length;
    
    // Score based on: ideal WPM + low fillers
    const wpmScore = segment.wpm >= IDEAL_WPM_MIN && segment.wpm <= IDEAL_WPM_MAX ? 50 : 
                     Math.max(0, 50 - Math.abs(segment.wpm - 140) / 2);
    const fillerScore = Math.max(0, 50 - (fillerCount * 10));
    const score = Math.round(wpmScore + fillerScore);
    
    return {
      startMs: segment.startMs,
      endMs: segment.endMs,
      wpm: segment.wpm,
      fillerCount,
      score
    };
  });
  
  // Return top 3 segments
  return segments
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/**
 * Calculate articulation clarity score
 */
function calculateClarityScore(confidenceScore?: number, wpm?: number, silenceRatio?: number): number | undefined {
  if (confidenceScore === undefined || !wpm || silenceRatio === undefined) return undefined;
  
  const confidenceFactor = confidenceScore / 100;
  const paceFactor = wpm >= IDEAL_WPM_MIN && wpm <= IDEAL_WPM_MAX ? 1.0 : Math.max(0.5, 1 - Math.abs(wpm - 140) / 200);
  const articulationFactor = Math.max(0.5, 1 - silenceRatio);
  
  return Math.round(confidenceFactor * paceFactor * articulationFactor * 100);
}

/**
 * Detect critical moments (problem clusters)
 */
function detectCriticalMoments(words: Word[], fillerHotspots?: DeliveryMetrics['fillerHotspots'], longestPause?: DeliveryMetrics['longestPause']): DeliveryMetrics['criticalMoments'] {
  const moments: DeliveryMetrics['criticalMoments'] = [];
  
  // Add filler hotspots as critical moments
  if (fillerHotspots) {
    fillerHotspots.forEach(hotspot => {
      if (hotspot.count >= 3) {
        moments.push({
          timestamp: hotspot.startMs,
          issue: 'filler_cluster',
          severity: hotspot.count >= 4 ? 'high' : 'medium',
          details: `${hotspot.count} filler words in ${Math.round((hotspot.endMs - hotspot.startMs) / 1000)}s`
        });
      }
    });
  }
  
  // Add longest pause if significant
  if (longestPause && longestPause.durationMs > 2000) {
    moments.push({
      timestamp: longestPause.timestamp,
      issue: 'long_pause',
      severity: longestPause.durationMs > 3000 ? 'high' : 'medium',
      details: `${(longestPause.durationMs / 1000).toFixed(1)}s pause`
    });
  }
  
  // Detect very low confidence clusters
  const lowConfWords = words.filter(w => w.confidence && w.confidence < 0.5);
  if (lowConfWords.length > 0) {
    // Group nearby low-confidence words
    let clusterStart = lowConfWords[0].start;
    let clusterCount = 1;
    
    for (let i = 1; i < lowConfWords.length; i++) {
      if (lowConfWords[i].start - lowConfWords[i - 1].end < 3000) {
        clusterCount++;
      } else if (clusterCount >= 3) {
        moments.push({
          timestamp: clusterStart,
          issue: 'unclear_speech',
          severity: 'medium',
          details: `${clusterCount} unclear words`
        });
        clusterStart = lowConfWords[i].start;
        clusterCount = 1;
      }
    }
  }
  
  return moments.length > 0 ? moments.sort((a, b) => a.timestamp - b.timestamp) : undefined;
}

/**
 * Detect speaker interruptions (multi-speaker scenarios)
 */
function detectSpeakerInterruptions(words: Word[]): DeliveryMetrics['speakerInterruptions'] {
  const interruptions: DeliveryMetrics['speakerInterruptions'] = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];
    
    // Check if speakers different and words overlap or are very close
    if (currentWord.speaker && nextWord.speaker && 
        currentWord.speaker !== nextWord.speaker) {
      
      const gap = nextWord.start - currentWord.end;
      
      // Interruption if overlap (gap < 0) or very quick turn-taking (gap < 200ms)
      if (gap < 200) {
        const overlapDuration = gap < 0 ? Math.abs(gap) : 0;
        
        interruptions.push({
          timestamp: nextWord.start,
          interrupter: nextWord.speaker,
          interrupted: currentWord.speaker,
          durationMs: overlapDuration
        });
      }
    }
  }
  
  return interruptions.length > 0 ? interruptions : undefined;
}

/**
 * Estimate breathing pattern from pauses
 */
function estimateBreathingPattern(words: Word[]): DeliveryMetrics['breathingPattern'] {
  const breathingPauses: DeliveryMetrics['breathingPattern'] = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];
    const gap = nextWord.start - currentWord.end;
    
    // Natural breaths typically 600-1500ms
    if (gap >= 600 && gap <= 1500) {
      breathingPauses.push({
        timestamp: currentWord.end,
        pauseDurationMs: Math.round(gap),
        estimated: true
      });
    }
  }
  
  return breathingPauses.length > 0 ? breathingPauses : undefined;
}


