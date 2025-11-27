import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to fetch with SSL verification disabled
async function fetchWithoutSSLVerification(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const agent = new https.Agent({
      rejectUnauthorized: false, // Ignore SSL certificate errors
    });

    https.get(url, { agent }, (response) => {
      const chunks: Buffer[] = [];
      
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      response.on('error', (error) => {
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    
    console.log('[Audio Proxy] Request received for URL:', url);
    
    if (!url) {
      console.error('[Audio Proxy] Missing URL parameter');
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    // Validate that it's an AssemblyAI URL
    if (!url.includes('cdn.assemblyai.com') && !url.includes('assemblyai.com')) {
      console.error('[Audio Proxy] Invalid audio URL:', url);
      return NextResponse.json(
        { error: 'Invalid audio URL' },
        { status: 400 }
      );
    }
    
    console.log('[Audio Proxy] Fetching audio from:', url);

    // Fetch the audio from AssemblyAI with SSL verification disabled
    // This is needed because AssemblyAI's CDN sometimes has certificate issues
    let audioBuffer: Buffer;
    try {
      audioBuffer = await fetchWithoutSSLVerification(url);
      console.log('[Audio Proxy] Successfully fetched audio, size:', audioBuffer.byteLength, 'bytes');
    } catch (fetchError: any) {
      console.error('[Audio Proxy] Failed to fetch audio:', fetchError.message);
      return NextResponse.json(
        { error: 'Failed to fetch audio from source' },
        { status: 500 }
      );
    }
    
    // Determine content type based on URL extension
    let contentType = 'audio/mpeg';
    if (url.includes('.mp3')) contentType = 'audio/mpeg';
    else if (url.includes('.mp4')) contentType = 'audio/mp4';
    else if (url.includes('.wav')) contentType = 'audio/wav';
    else if (url.includes('.webm')) contentType = 'audio/webm';
    else if (url.includes('.m4a')) contentType = 'audio/mp4';
    else if (url.includes('.ogg')) contentType = 'audio/ogg';
    else if (url.includes('.aac')) contentType = 'audio/aac';
    else if (url.includes('.flac')) contentType = 'audio/flac';
    
    console.log('[Audio Proxy] Content type:', contentType);

    // Stream it back to the client
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error proxying audio:', error);
    return NextResponse.json(
      { error: 'Failed to proxy audio' },
      { status: 500 }
    );
  }
}

