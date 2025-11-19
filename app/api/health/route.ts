import { NextResponse } from 'next/server';

export async function GET() {
  const assemblyaiConfigured = !!process.env.ASSEMBLYAI_API_KEY;
  return NextResponse.json({
    ok: true,
    assemblyaiConfigured,
  });
}

