import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Force Node.js runtime (not Edge) - required for fs operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Security check - only allow alphanumeric IDs
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid audio ID' },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), 'uploads');
    const audioPath = join(uploadsDir, `${id}.webm`);
    
    // Try common audio/video extensions
    const extensions = ['.webm', '.mp3', '.wav', '.m4a', '.mp4', '.ogg', '.aac', '.flac'];
    let finalPath = audioPath;
    let found = false;
    
    for (const ext of extensions) {
      const testPath = join(uploadsDir, `${id}${ext}`);
      if (existsSync(testPath)) {
        finalPath = testPath;
        found = true;
        console.log('[Audio Serve] Found file:', testPath);
        break;
      }
    }
    
    if (!found) {
      console.error('[Audio Serve] File not found. Tried extensions:', extensions);
      console.error('[Audio Serve] Looking for ID:', id, 'in directory:', uploadsDir);
    }
    
    if (!found) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(finalPath);
    const extension = finalPath.split('.').pop();
    
    // Map extension to MIME type
    const mimeTypes: Record<string, string> = {
      'webm': 'audio/webm',
      'mp3': 'audio/mpeg',
      'mp4': 'audio/mp4',
      'wav': 'audio/wav',
      'm4a': 'audio/mp4',
      'ogg': 'audio/ogg',
      'aac': 'audio/aac',
      'flac': 'audio/flac',
    };
    
    const mimeType = mimeTypes[extension || 'webm'] || 'audio/mpeg';
    
    console.log('[Audio Serve] Serving file:', finalPath, 'as', mimeType, 'size:', fileBuffer.length);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error serving audio:', error);
    return NextResponse.json(
      { error: 'Failed to load audio' },
      { status: 500 }
    );
  }
}

