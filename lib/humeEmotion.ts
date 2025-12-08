import { VoiceEmotionSummary } from './types';

/**
 * Check if Hume Voice Emotion is enabled and configured
 */
export function isHumeEmotionEnabled(): boolean {
  return !!(
    process.env.USE_HUME_EMOTION === 'true' &&
    process.env.HUME_API_KEY
  );
}

/**
 * Runs Hume Expression Measurement for voice emotion analysis
 * 
 * @param audioUrl - URL to the audio file
 * @param maxDurationSeconds - Maximum duration to analyze (default: 60s to minimize cost)
 * @returns VoiceEmotionSummary with emotion timeline and distribution
 */
export async function runHumeEmotionAnalysis(
  audioUrl: string,
  maxDurationSeconds: number = 60
): Promise<VoiceEmotionSummary> {
  // Check if Hume is enabled
  if (!isHumeEmotionEnabled()) {
    throw new Error(
      'Hume Voice Emotion is not enabled. Please set USE_HUME_EMOTION=true and configure HUME_API_KEY.'
    );
  }

  const humeApiKey = process.env.HUME_API_KEY!;
  
  // Clamp max duration to prevent excessive costs
  const safeDuration = Math.min(maxDurationSeconds, 90);

  try {
    // Download and potentially trim audio if needed
    const audioBuffer = await downloadAudio(audioUrl);
    
    // For now, we'll send the full audio to Hume
    // In production, you might want to trim it to maxDurationSeconds
    // This requires ffmpeg or another audio processing library

    // Create form data for Hume API
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', blob, 'audio.wav');
    
    // Hume API expects JSON configuration as separate fields or query params
    // Using the correct API format for batch jobs
    const jsonConfig = {
      models: {
        prosody: {}
      }
    };
    formData.append('json', JSON.stringify(jsonConfig));

    // Call Hume Batch API for audio analysis
    // Note: Hume has both batch and streaming APIs. For pre-recorded audio, batch is appropriate.
    const response = await fetch('https://api.hume.ai/v0/batch/jobs', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': humeApiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Hume] API Error Response:', errorText);
      throw new Error(`Hume API error (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const jobData = await response.json();
    console.log('[Hume] Job created:', jobData);
    const jobId = jobData.job_id;
    
    if (!jobId) {
      throw new Error('Hume API did not return a job ID');
    }

    // Poll for job completion
    const result = await pollHumeJob(jobId, humeApiKey);
    
    // Parse emotion results
    const emotionSummary = parseHumeResults(result);
    
    return emotionSummary;
  } catch (error: any) {
    console.error('Hume Emotion Analysis error:', error);
    throw new Error(
      `Hume Emotion Analysis failed: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Poll Hume job until completion
 */
async function pollHumeJob(jobId: string, apiKey: string, maxAttempts: number = 60): Promise<any> {
  let attempts = 0;
  const pollInterval = 3000; // 3 seconds (increased from 2s)

  console.log(`[Hume] Polling for job ${jobId}...`);

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
    
    const response = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}`, {
      headers: {
        'X-Hume-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check job status: ${response.statusText}`);
    }

    const jobStatus = await response.json();
    
    // Always log first 3 attempts to see the actual structure
    if (attempts <= 3) {
      console.log(`[Hume] Attempt ${attempts} - Full response:`, JSON.stringify(jobStatus, null, 2));
    }
    
    // Hume API might return state directly or nested - check all possibilities
    let state: string;
    if (typeof jobStatus === 'string') {
      state = jobStatus;
    } else if (typeof jobStatus.state === 'string') {
      state = jobStatus.state;
    } else if (typeof jobStatus.status === 'string') {
      state = jobStatus.status;
    } else if (jobStatus.state && typeof jobStatus.state.status === 'string') {
      state = jobStatus.state.status;
    } else {
      // Log unknown format
      console.error('[Hume] Unknown job status format:', jobStatus);
      state = 'UNKNOWN';
    }
    
    console.log(`[Hume] Attempt ${attempts}/${maxAttempts} - Status: ${state}`);
    
    if (state === 'COMPLETED') {
      console.log('[Hume] Job completed! Fetching predictions...');
      
      // Fetch predictions
      const predictionsResponse = await fetch(
        `https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`,
        {
          headers: {
            'X-Hume-Api-Key': apiKey,
          },
        }
      );

      if (!predictionsResponse.ok) {
        throw new Error('Failed to fetch predictions');
      }

      return await predictionsResponse.json();
    } else if (state === 'FAILED') {
      const errorMsg = jobStatus.message || jobStatus.errors || 'Unknown error';
      throw new Error(`Hume job failed: ${JSON.stringify(errorMsg)}`);
    }
    
    // If state is still unknown/object, log it for debugging
    if (state === 'UNKNOWN' || state === '[object Object]') {
      console.log('[Hume] Unexpected state format. Full job status:', JSON.stringify(jobStatus));
    }
    
    // Continue polling for IN_PROGRESS, QUEUED, etc.
  }

  throw new Error(`Hume job timed out after ${maxAttempts * pollInterval / 1000} seconds. The job may still be processing. Job ID: ${jobId}`);
}

/**
 * Parse Hume results into our VoiceEmotionSummary format
 */
function parseHumeResults(rawResults: any): VoiceEmotionSummary {
  try {
    // Extract prosody predictions from the results
    const predictions = rawResults[0]?.results?.predictions || [];
    const prosodyData = predictions.find((p: any) => p.models?.prosody);
    const prosodyPredictions = prosodyData?.models?.prosody?.grouped_predictions || [];

    // Flatten all emotion predictions over time
    const timelineEmotions: Array<{
      startMs: number;
      endMs: number;
      emotions: Record<string, number>;
    }> = [];

    for (const group of prosodyPredictions) {
      for (const prediction of group.predictions || []) {
        const emotions: Record<string, number> = {};
        
        // Extract emotion scores
        for (const emotion of prediction.emotions || []) {
          emotions[emotion.name] = emotion.score;
        }

        timelineEmotions.push({
          startMs: Math.round((prediction.time?.begin || 0) * 1000),
          endMs: Math.round((prediction.time?.end || 0) * 1000),
          emotions,
        });
      }
    }

    // Calculate dominant emotions over time
    const dominantEmotionsOverTime = timelineEmotions.map(segment => {
      const sortedEmotions = Object.entries(segment.emotions)
        .sort(([, a], [, b]) => b - a);
      
      const topEmotion = sortedEmotions[0] || ['neutral', 0];
      
      return {
        startMs: segment.startMs,
        endMs: segment.endMs,
        topEmotion: topEmotion[0],
        score: topEmotion[1],
        allEmotions: segment.emotions,
      };
    });

    // Calculate overall emotion distribution (average across all segments)
    const emotionSums: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};

    for (const segment of timelineEmotions) {
      for (const [emotion, score] of Object.entries(segment.emotions)) {
        emotionSums[emotion] = (emotionSums[emotion] || 0) + score;
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    }

    const overallEmotionDistribution: Record<string, number> = {};
    for (const [emotion, sum] of Object.entries(emotionSums)) {
      overallEmotionDistribution[emotion] = 
        Math.round((sum / emotionCounts[emotion]) * 1000) / 1000;
    }

    return {
      dominantEmotionsOverTime,
      overallEmotionDistribution,
      raw: rawResults,
    };
  } catch (error) {
    console.error('Error parsing Hume results:', error);
    // Return empty summary on parse error
    return {
      dominantEmotionsOverTime: [],
      overallEmotionDistribution: {},
      raw: rawResults,
    };
  }
}

/**
 * Download audio from URL
 */
async function downloadAudio(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    throw new Error(`Failed to download audio from URL: ${error.message}`);
  }
}

/**
 * Get color for emotion (Tailwind classes)
 */
export function getEmotionColor(emotion: string): string {
  const emotionColors: Record<string, string> = {
    joy: 'text-yellow-600 dark:text-yellow-400',
    happiness: 'text-yellow-600 dark:text-yellow-400',
    excitement: 'text-orange-600 dark:text-orange-400',
    sadness: 'text-blue-700 dark:text-blue-400',
    anger: 'text-red-600 dark:text-red-400',
    fear: 'text-purple-600 dark:text-purple-400',
    disgust: 'text-green-700 dark:text-green-400',
    surprise: 'text-pink-600 dark:text-pink-400',
    calmness: 'text-teal-600 dark:text-teal-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return emotionColors[emotion.toLowerCase()] || 'text-gray-600 dark:text-gray-400';
}

/**
 * Format emotion score as percentage
 */
export function formatEmotionScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Get top N emotions from distribution
 */
export function getTopEmotions(
  distribution: Record<string, number>,
  n: number = 5
): Array<{ emotion: string; score: number }> {
  return Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([emotion, score]) => ({ emotion, score }));
}


