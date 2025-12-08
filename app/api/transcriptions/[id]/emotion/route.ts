import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { 
  runHumeEmotionAnalysis, 
  isHumeEmotionEnabled 
} from '@/lib/humeEmotion';

/**
 * POST /api/transcriptions/[id]/emotion
 * Run Hume Voice Emotion Analysis on a transcript's audio
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Hume Emotion is enabled
    if (!isHumeEmotionEnabled()) {
      return NextResponse.json(
        { 
          error: 'Voice emotion analysis is not enabled', 
          message: 'Hume Voice Emotion requires USE_HUME_EMOTION=true and a valid Hume API key.',
          enabled: false,
        },
        { status: 400 }
      );
    }

    // Get transcript from database
    const transcript = await prisma.transcript.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Check if audio URL is available
    if (!transcript.audioUrl) {
      return NextResponse.json(
        { error: 'No audio file available for this transcript' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const force = body.force || false;
    const maxDurationSeconds = Math.min(body.maxDurationSeconds || 60, 90); // Cap at 90 seconds

    // Check if emotion data already exists
    if (transcript.voiceEmotion && !force) {
      return NextResponse.json({
        message: 'Voice emotion analysis already exists. Use force=true to recompute.',
        voiceEmotion: transcript.voiceEmotion,
        cached: true,
      });
    }

    // Resolve audio URL (handle proxy URLs)
    let audioUrl = transcript.audioUrl;
    
    // If it's a proxy URL, extract the actual URL
    if (audioUrl.startsWith('/api/audio-proxy')) {
      const url = new URL(audioUrl, req.url);
      const actualUrl = url.searchParams.get('url');
      if (actualUrl) {
        audioUrl = actualUrl;
      } else {
        return NextResponse.json(
          { error: 'Unable to resolve audio URL' },
          { status: 400 }
        );
      }
    }

    // If it's a local file URL, convert to absolute URL
    if (audioUrl.startsWith('/api/audio/')) {
      const baseUrl = req.url.split('/api/')[0];
      audioUrl = `${baseUrl}${audioUrl}`;
    }

    console.log('[Emotion] Running analysis for transcript:', params.id);
    console.log('[Emotion] Audio URL:', audioUrl);
    console.log('[Emotion] Max duration:', maxDurationSeconds, 'seconds');

    // Run Hume Voice Emotion Analysis
    const emotionResult = await runHumeEmotionAnalysis(
      audioUrl,
      maxDurationSeconds
    );

    // Save result to database
    const updated = await prisma.transcript.update({
      where: { id: params.id },
      data: {
        voiceEmotion: emotionResult as any, // Prisma Json type
      },
    });

    console.log('[Emotion] Analysis complete. Segments:', emotionResult.dominantEmotionsOverTime.length);

    return NextResponse.json({
      message: 'Voice emotion analysis completed',
      voiceEmotion: emotionResult,
      cached: false,
    });
  } catch (error: any) {
    console.error('[Emotion] Error:', error);
    
    // Determine appropriate error message
    let errorMessage = 'Failed to run voice emotion analysis';
    let statusCode = 500;
    
    if (error.message?.includes('not enabled')) {
      statusCode = 400;
    } else if (error.message?.includes('download audio')) {
      statusCode = 400;
      errorMessage = 'Unable to access audio file';
    } else if (error.message?.includes('Hume API')) {
      statusCode = 502; // Bad Gateway (external service error)
      errorMessage = 'Hume API error';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/transcriptions/[id]/emotion
 * Get voice emotion analysis results for a transcript
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transcript = await prisma.transcript.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      select: {
        voiceEmotion: true,
      },
    });

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      voiceEmotion: transcript.voiceEmotion,
      available: !!transcript.voiceEmotion,
      enabled: isHumeEmotionEnabled(),
    });
  } catch (error: any) {
    console.error('[Emotion] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emotion data' },
      { status: 500 }
    );
  }
}


