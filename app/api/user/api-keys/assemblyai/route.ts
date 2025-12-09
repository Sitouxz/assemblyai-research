import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encryptSecret, decryptSecret } from '@/lib/crypto';
import { AssemblyAI } from 'assemblyai';

/**
 * GET /api/user/api-keys/assemblyai
 * Returns metadata about the user's AssemblyAI API key (never returns the actual key)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userApiKey = await prisma.userApiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'assemblyai',
        },
      },
      select: {
        id: true,
        label: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userApiKey) {
      return NextResponse.json({
        hasKey: false,
      });
    }

    return NextResponse.json({
      hasKey: true,
      label: userApiKey.label,
      createdAt: userApiKey.createdAt,
      updatedAt: userApiKey.updatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching user API key:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API key information' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/api-keys/assemblyai
 * Saves or updates the user's AssemblyAI API key
 * Body: { apiKey: string, label?: string }
 */
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
    const { apiKey, label } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate the API key by making a test request to AssemblyAI
    try {
      const testClient = new AssemblyAI({ apiKey: apiKey.trim() });
      
      // Make a lightweight request to validate the key
      // We'll try to get a non-existent transcript to check auth
      // A 404 means the key is valid, 401/403 means invalid
      try {
        await testClient.transcripts.get('invalid-transcript-id');
      } catch (error: any) {
        // Check if it's an authentication error
        if (error?.status === 401 || error?.status === 403) {
          return NextResponse.json(
            { error: 'Invalid AssemblyAI API key. Please check your key and try again.' },
            { status: 400 }
          );
        }
        // 404 or other errors mean the key is valid but the transcript doesn't exist (expected)
      }
    } catch (error: any) {
      // Network or other errors
      console.error('Error validating API key:', error);
      return NextResponse.json(
        { error: 'Failed to validate API key. Please try again.' },
        { status: 500 }
      );
    }

    // Encrypt the API key
    const encryptedKey = encryptSecret(apiKey.trim());

    // Upsert the API key (create or update)
    const userApiKey = await prisma.userApiKey.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'assemblyai',
        },
      },
      update: {
        encryptedKey,
        label: label || null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        provider: 'assemblyai',
        encryptedKey,
        label: label || null,
      },
      select: {
        id: true,
        label: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      hasKey: true,
      label: userApiKey.label,
      createdAt: userApiKey.createdAt,
      updatedAt: userApiKey.updatedAt,
    });
  } catch (error: any) {
    console.error('Error saving user API key:', error);
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/api-keys/assemblyai
 * Removes the user's AssemblyAI API key
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.userApiKey.delete({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'assemblyai',
        },
      },
    });

    return NextResponse.json({
      success: true,
      hasKey: false,
    });
  } catch (error: any) {
    // If the key doesn't exist, that's fine
    if (error?.code === 'P2025') {
      return NextResponse.json({
        success: true,
        hasKey: false,
      });
    }

    console.error('Error deleting user API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}





