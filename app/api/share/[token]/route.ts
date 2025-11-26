import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/share/[token] - Access shared transcript (public)
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Find share link
    const shareLink = await prisma.shareLink.findUnique({
      where: {
        token: params.token,
      },
      include: {
        transcript: {
          select: {
            id: true,
            title: true,
            audioUrl: true,
            text: true,
            duration: true,
            createdAt: true,
            insights: true,
          },
        },
      },
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }

    // Check expiry
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      );
    }

    // Increment view count
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { viewCount: { increment: 1 } },
    });

    // Return transcript data (password check is done client-side via POST)
    return NextResponse.json({
      requiresPassword: !!shareLink.password,
      canDownload: shareLink.canDownload,
      canComment: shareLink.canComment,
      // Only send transcript if no password or password already verified
      transcript: !shareLink.password
        ? {
            id: shareLink.transcript.id,
            title: shareLink.transcript.title,
            audioUrl: shareLink.transcript.audioUrl,
            text: shareLink.transcript.text,
            duration: shareLink.transcript.duration,
            createdAt: shareLink.transcript.createdAt,
            insights: shareLink.transcript.insights
              ? JSON.parse(shareLink.transcript.insights)
              : null,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error accessing share link:', error);
    return NextResponse.json(
      { error: 'Failed to access share link' },
      { status: 500 }
    );
  }
}

// POST /api/share/[token] - Verify password for shared transcript
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await req.json();
    const { password } = body;

    // Find share link
    const shareLink = await prisma.shareLink.findUnique({
      where: {
        token: params.token,
      },
      include: {
        transcript: {
          select: {
            id: true,
            title: true,
            audioUrl: true,
            text: true,
            duration: true,
            createdAt: true,
            insights: true,
          },
        },
      },
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }

    // Check expiry
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      );
    }

    // Verify password
    if (!shareLink.password) {
      return NextResponse.json(
        { error: 'This share link does not require a password' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(password, shareLink.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Return transcript data
    return NextResponse.json({
      transcript: {
        id: shareLink.transcript.id,
        title: shareLink.transcript.title,
        audioUrl: shareLink.transcript.audioUrl,
        text: shareLink.transcript.text,
        duration: shareLink.transcript.duration,
        createdAt: shareLink.transcript.createdAt,
        insights: shareLink.transcript.insights
          ? JSON.parse(shareLink.transcript.insights)
          : null,
      },
      canDownload: shareLink.canDownload,
      canComment: shareLink.canComment,
    });
  } catch (error: any) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}

