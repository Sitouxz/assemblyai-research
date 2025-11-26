import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// GET /api/transcriptions/[id]/share - List share links for transcript
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

    // Verify ownership
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

    // Get share links
    const shareLinks = await prisma.shareLink.findMany({
      where: {
        transcriptId: params.id,
      },
      select: {
        id: true,
        token: true,
        expiresAt: true,
        canDownload: true,
        canComment: true,
        createdAt: true,
        viewCount: true,
        password: true, // Just to check if password exists
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Don't send actual password, just indicate if it's set
    const links = shareLinks.map((link) => ({
      ...link,
      hasPassword: !!link.password,
      password: undefined,
    }));

    return NextResponse.json({ shareLinks: links });
  } catch (error: any) {
    console.error('Error fetching share links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share links' },
      { status: 500 }
    );
  }
}

// POST /api/transcriptions/[id]/share - Create a share link
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

    // Verify ownership
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

    const body = await req.json();
    const {
      password,
      expiresAt,
      canDownload = true,
      canComment = false,
    } = body;

    // Generate unique token
    const token = randomBytes(16).toString('hex');

    // Hash password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : null;

    // Parse expiry date
    const expiryDate = expiresAt ? new Date(expiresAt) : null;

    // Create share link
    const shareLink = await prisma.shareLink.create({
      data: {
        transcriptId: params.id,
        token,
        password: hashedPassword,
        expiresAt: expiryDate,
        canDownload,
        canComment,
      },
    });

    return NextResponse.json(
      {
        shareLink: {
          ...shareLink,
          password: undefined,
          hasPassword: !!password,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

// DELETE /api/transcriptions/[id]/share/[linkId] is in a separate file

