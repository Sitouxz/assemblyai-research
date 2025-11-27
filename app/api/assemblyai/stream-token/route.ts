import { NextRequest, NextResponse } from 'next/server';
import { getAssemblyAIClient } from '@/lib/assemblyai';
import { auth } from '@/lib/auth';

/**
 * GET /api/assemblyai/stream-token
 * 
 * Generates a temporary streaming token for real-time transcription
 * This endpoint is secured and requires authentication (or can be made public if desired)
 * 
 * The token is short-lived and never exposes the long-lived API key to the client
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Optional: Require authentication for streaming
    // Comment out these lines if you want to allow guest streaming
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: 'Authentication required for live transcription' },
    //     { status: 401 }
    //   );
    // }

    // Get the appropriate AssemblyAI client (user's key or app key)
    const client = await getAssemblyAIClient(session?.user?.id);

    // Generate temporary token using the streaming API
    // The SDK's createTemporaryToken returns a string token that can be used for WebSocket auth
    let tempToken: string;
    
    try {
      tempToken = await client.streaming.createTemporaryToken({
        expires_in_seconds: 480, // 8 minutes (480 seconds)
      });
      
      console.log('Generated streaming token type:', typeof tempToken);
      console.log('Token length:', tempToken?.length);
      
      // Verify we got a string token
      if (!tempToken || typeof tempToken !== 'string') {
        throw new Error('Invalid token format received from SDK');
      }
      
    } catch (sdkError: any) {
      console.error('SDK token generation error:', sdkError);
      throw sdkError;
    }

    return NextResponse.json({
      token: tempToken,
      expiresInSeconds: 480,
    });

  } catch (error: any) {
    console.error('Error generating streaming token:', error);
    
    // Check for specific error types
    if (error.message?.includes('No AssemblyAI API key')) {
      return NextResponse.json(
        { 
          error: 'No API key configured. Please add your AssemblyAI API key in Settings.',
          needsApiKey: true,
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate streaming token' },
      { status: 500 }
    );
  }
}

