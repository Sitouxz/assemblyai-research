import { NextRequest, NextResponse } from 'next/server';
import { getAssemblyAIClient } from '@/lib/assemblyai';

/**
 * TEST ENDPOINT - Debug token generation
 * Visit: http://localhost:3000/api/test-token
 */
export async function GET(req: NextRequest) {
  try {
    const client = await getAssemblyAIClient();

    console.log('=== TOKEN GENERATION TEST ===');
    
    const result = await client.streaming.createTemporaryToken({
      expires_in_seconds: 480,
    });

    console.log('Raw result type:', typeof result);
    console.log('Raw result:', result);
    console.log('Is string?:', typeof result === 'string');
    console.log('Has .token?:', result && typeof result === 'object' && 'token' in result);
    console.log('Keys:', result && typeof result === 'object' ? Object.keys(result) : 'N/A');

    return NextResponse.json({
      resultType: typeof result,
      isString: typeof result === 'string',
      result: result,
      firstChars: typeof result === 'string' ? result.substring(0, 20) + '...' : 'Not a string',
    });

  } catch (error: any) {
    console.error('Test token error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}


