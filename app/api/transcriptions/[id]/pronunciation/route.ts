import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { 
  runAzurePronunciationAssessment, 
  isAzurePronunciationEnabled 
} from '@/lib/azurePronunciation';

/**
 * POST /api/transcriptions/[id]/pronunciation
 * Run Azure Speech Pronunciation Assessment on a transcript's audio
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

    // Check if Azure Pronunciation is enabled
    if (!isAzurePronunciationEnabled()) {
      return NextResponse.json(
        { 
          error: 'Pronunciation assessment is not enabled', 
          message: 'Azure Pronunciation Assessment requires USE_AZURE_PRONUNCIATION=true and valid Azure credentials.',
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

    // Check if pronunciation data already exists
    if (transcript.pronunciation && !force) {
      return NextResponse.json({
        message: 'Pronunciation assessment already exists. Use force=true to recompute.',
        pronunciation: transcript.pronunciation,
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

    console.log('[Pronunciation] Running assessment for transcript:', params.id);
    console.log('[Pronunciation] Audio URL:', audioUrl);
    console.log('[Pronunciation] Reference text length:', transcript.text.length);

    // Run Azure Pronunciation Assessment
    const pronunciationResult = await runAzurePronunciationAssessment(
      audioUrl,
      transcript.text
    );

    // Save result to database
    const updated = await prisma.transcript.update({
      where: { id: params.id },
      data: {
        pronunciation: pronunciationResult as any, // Prisma Json type
      },
    });

    console.log('[Pronunciation] Assessment complete. Overall score:', pronunciationResult.overallPronScore);

    return NextResponse.json({
      message: 'Pronunciation assessment completed',
      pronunciation: pronunciationResult,
      cached: false,
    });
  } catch (error: any) {
    console.error('[Pronunciation] Error:', error);
    
    // Determine appropriate error message
    let errorMessage = 'Failed to run pronunciation assessment';
    let statusCode = 500;
    
    if (error.message?.includes('not enabled')) {
      statusCode = 400;
    } else if (error.message?.includes('not installed')) {
      statusCode = 501; // Not Implemented
      errorMessage = 'Azure Speech SDK is not installed on the server';
    } else if (error.message?.includes('download audio')) {
      statusCode = 400;
      errorMessage = 'Unable to access audio file';
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
 * GET /api/transcriptions/[id]/pronunciation
 * Get pronunciation assessment results for a transcript
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
        pronunciation: true,
      },
    });

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      pronunciation: transcript.pronunciation,
      available: !!transcript.pronunciation,
      enabled: isAzurePronunciationEnabled(),
    });
  } catch (error: any) {
    console.error('[Pronunciation] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pronunciation data' },
      { status: 500 }
    );
  }
}


