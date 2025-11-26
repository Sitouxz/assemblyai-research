import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE /api/transcriptions/[id]/share/[linkId] - Delete a share link
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; linkId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership of transcript
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

    // Delete share link
    const deleted = await prisma.shareLink.deleteMany({
      where: {
        id: params.linkId,
        transcriptId: params.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting share link:', error);
    return NextResponse.json(
      { error: 'Failed to delete share link' },
      { status: 500 }
    );
  }
}

