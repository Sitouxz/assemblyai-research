import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const uploadsDir = join(process.cwd(), 'uploads');
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({
        status: 'error',
        message: 'Uploads directory does not exist',
        uploadsDir,
      });
    }

    const files = await readdir(uploadsDir);
    
    return NextResponse.json({
      status: 'ok',
      message: 'API route is working!',
      uploadsDir,
      filesCount: files.length,
      files: files.slice(0, 10), // First 10 files
      runtime: 'nodejs',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }
}

