import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/transcriptions - List user's transcripts
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const transcripts = await prisma.transcript.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        [sortBy]: order,
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        audioUrl: true,
        audioSource: true,
        text: true,
        duration: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await prisma.transcript.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      transcripts,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    );
  }
}

// POST /api/transcriptions - Create a new transcript (used internally)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      audioUrl,
      audioSource,
      text,
      duration,
      status,
      assemblyaiId,
      config,
      insights,
    } = body;

    const transcript = await prisma.transcript.create({
      data: {
        userId: session.user.id,
        title: title || 'Untitled Transcript',
        audioUrl,
        audioSource,
        text: text || '',
        duration,
        status: status || 'completed',
        assemblyaiId,
        config: config ? JSON.stringify(config) : null,
        insights: insights ? JSON.stringify(insights) : null,
      },
    });

    return NextResponse.json(transcript, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transcript:', error);
    return NextResponse.json(
      { error: 'Failed to create transcript' },
      { status: 500 }
    );
  }
}

