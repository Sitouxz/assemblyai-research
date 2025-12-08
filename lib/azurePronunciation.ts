import { PronunciationSummary } from './types';

/**
 * Check if Azure Pronunciation Assessment is enabled and configured
 */
export function isAzurePronunciationEnabled(): boolean {
  return !!(
    process.env.USE_AZURE_PRONUNCIATION === 'true' &&
    process.env.AZURE_SPEECH_KEY &&
    process.env.AZURE_SPEECH_REGION
  );
}

/**
 * Runs Azure Speech Pronunciation Assessment on audio
 * 
 * @param audioUrlOrBuffer - URL to audio file or Buffer containing audio data
 * @param referenceText - The expected transcript text for pronunciation assessment
 * @returns PronunciationSummary with scores and word-level details
 */
export async function runAzurePronunciationAssessment(
  audioUrlOrBuffer: string | Buffer,
  referenceText: string
): Promise<PronunciationSummary> {
  // Check if Azure is enabled
  if (!isAzurePronunciationEnabled()) {
    throw new Error(
      'Azure Pronunciation Assessment is not enabled. Please set USE_AZURE_PRONUNCIATION=true and configure AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.'
    );
  }

  const speechKey = process.env.AZURE_SPEECH_KEY!;
  const speechRegion = process.env.AZURE_SPEECH_REGION!;

  try {
    // Import Azure Speech SDK dynamically to avoid errors if not installed
    const sdk = await import('microsoft-cognitiveservices-speech-sdk');
    
    // Create speech config
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    
    // Configure pronunciation assessment
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true // Enable miscue (insertions, omissions, etc.)
    );
    
    // Enable prosody assessment if supported
    pronunciationConfig.enableProsodyAssessment = true;

    let audioConfig: any;
    
    // Handle audio input (URL or Buffer)
    if (typeof audioUrlOrBuffer === 'string') {
      // For URLs, we need to download the audio first
      const audioBuffer = await downloadAudio(audioUrlOrBuffer);
      
      // Create push stream for audio
      const pushStream = sdk.AudioInputStream.createPushStream();
      pushStream.write(audioBuffer);
      pushStream.close();
      
      audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    } else {
      // For Buffer, create push stream
      const pushStream = sdk.AudioInputStream.createPushStream();
      pushStream.write(audioUrlOrBuffer);
      pushStream.close();
      
      audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    }

    // Create speech recognizer
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    
    // Apply pronunciation assessment config
    pronunciationConfig.applyTo(recognizer);

    // Perform recognition with pronunciation assessment
    const result = await new Promise<any>((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          recognizer.close();
          resolve(result);
        },
        (error) => {
          recognizer.close();
          reject(error);
        }
      );
    });

    // Check result
    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
      const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(result);
      
      // Parse detailed JSON from the result
      const detailedResult = JSON.parse(result.properties.getProperty(
        sdk.PropertyId.SpeechServiceResponse_JsonResult
      ));

      // Extract word-level details
      const words = detailedResult?.NBest?.[0]?.Words || [];
      const wordDetails = words.map((w: any) => ({
        word: w.Word,
        accuracyScore: w.PronunciationAssessment?.AccuracyScore || 0,
        errorType: w.PronunciationAssessment?.ErrorType || 'None',
        phonemes: w.PronunciationAssessment?.Phonemes?.map((p: any) => ({
          phoneme: p.Phoneme,
          score: p.AccuracyScore,
        })) || undefined,
      }));

      // Build summary
      const summary: PronunciationSummary = {
        overallPronScore: Math.round(pronunciationResult.pronunciationScore),
        accuracyScore: Math.round(pronunciationResult.accuracyScore),
        fluencyScore: Math.round(pronunciationResult.fluencyScore),
        completenessScore: Math.round(pronunciationResult.completenessScore),
        prosodyScore: pronunciationResult.prosodyScore 
          ? Math.round(pronunciationResult.prosodyScore) 
          : undefined,
        words: wordDetails,
        raw: detailedResult,
      };

      return summary;
    } else if (result.reason === sdk.ResultReason.NoMatch) {
      throw new Error('No speech could be recognized in the audio.');
    } else {
      throw new Error(`Speech recognition failed: ${result.errorDetails}`);
    }
  } catch (error: any) {
    // Handle specific errors
    if (error.code === 'MODULE_NOT_FOUND' && error.message?.includes('microsoft-cognitiveservices-speech-sdk')) {
      throw new Error(
        'Azure Speech SDK is not installed. Please run: npm install microsoft-cognitiveservices-speech-sdk'
      );
    }
    
    console.error('Azure Pronunciation Assessment error:', error);
    throw new Error(
      `Azure Pronunciation Assessment failed: ${error.message || 'Unknown error'}`
    );
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
 * Get color class for pronunciation score (Tailwind classes)
 */
export function getPronunciationScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get label for pronunciation score
 */
export function getPronunciationScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Get color for error type
 */
export function getErrorTypeColor(errorType: string): string {
  switch (errorType) {
    case 'None':
      return 'text-green-600 dark:text-green-400';
    case 'Omission':
      return 'text-orange-600 dark:text-orange-400';
    case 'Insertion':
      return 'text-blue-600 dark:text-blue-400';
    case 'Mispronunciation':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}


