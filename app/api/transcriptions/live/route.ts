import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/transcriptions/live
 * 
 * Saves a completed live transcription session to the database
 * This allows users to persist their real-time transcription results
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to save transcripts' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      text,
      durationSeconds,
      sessionId,
      configSnapshot,
    } = body;

    // Validate required fields
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Transcript text is required' },
        { status: 400 }
      );
    }

    // Create transcript record in database
    const transcript = await prisma.transcript.create({
      data: {
        userId: session.user.id,
        title: title || 'Live Transcription',
        text: text.trim(),
        duration: durationSeconds || null,
        status: 'completed',
        sourceType: 'stream',
        assemblyaiId: sessionId || null,
        config: configSnapshot ? JSON.stringify(configSnapshot) : null,
      },
    });

    return NextResponse.json({
      success: true,
      transcriptId: transcript.id,
      transcript,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error saving live transcript:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}




