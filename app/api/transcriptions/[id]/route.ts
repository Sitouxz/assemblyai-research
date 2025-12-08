import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/transcriptions/[id] - Get a specific transcript
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
    });

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const response = {
      ...transcript,
      config: transcript.config ? JSON.parse(transcript.config) : null,
      insights: transcript.insights ? JSON.parse(transcript.insights) : null,
      deliveryMetrics: transcript.deliveryMetrics || null,
      pronunciation: transcript.pronunciation || null,
      voiceEmotion: transcript.voiceEmotion || null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}

// PUT /api/transcriptions/[id] - Update a transcript
export async function PUT(
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

    // Verify ownership
    const existing = await prisma.transcript.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, text, status, config, insights } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (text !== undefined) updateData.text = text;
    if (status !== undefined) updateData.status = status;
    if (config !== undefined) {
      updateData.config = config ? JSON.stringify(config) : null;
    }
    if (insights !== undefined) {
      updateData.insights = insights ? JSON.stringify(insights) : null;
    }

    const transcript = await prisma.transcript.update({
      where: { id: params.id },
      data: updateData,
    });

    // Parse JSON fields for response
    const response = {
      ...transcript,
      config: transcript.config ? JSON.parse(transcript.config) : null,
      insights: transcript.insights ? JSON.parse(transcript.insights) : null,
      deliveryMetrics: transcript.deliveryMetrics || null,
      pronunciation: transcript.pronunciation || null,
      voiceEmotion: transcript.voiceEmotion || null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating transcript:', error);
    return NextResponse.json(
      { error: 'Failed to update transcript' },
      { status: 500 }
    );
  }
}

// DELETE /api/transcriptions/[id] - Delete a transcript
export async function DELETE(
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

    // Verify ownership and delete
    const deleted = await prisma.transcript.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transcript:', error);
    return NextResponse.json(
      { error: 'Failed to delete transcript' },
      { status: 500 }
    );
  }
}

