import { NextResponse } from 'next/server';
import { isAzurePronunciationEnabled } from '@/lib/azurePronunciation';
import { isHumeEmotionEnabled } from '@/lib/humeEmotion';

/**
 * GET /api/config/features
 * Returns which speaking analytics features are enabled
 */
export async function GET() {
  return NextResponse.json({
    azurePronunciation: isAzurePronunciationEnabled(),
    humeEmotion: isHumeEmotionEnabled(),
    // Add other feature flags here as needed
  });
}

