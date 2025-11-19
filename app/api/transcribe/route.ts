import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/assemblyai';
import { TranscriptionOptions, TranscriptResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;

    if (!file && !url) {
      return NextResponse.json(
        { error: 'No file or URL provided' },
        { status: 400 }
      );
    }

    // Build transcription options
    const options: TranscriptionOptions = {};
    
    if (formData.get('auto_chapters') === 'true') {
      options.auto_chapters = true;
    }
    
    if (formData.get('sentiment_analysis') === 'true') {
      options.sentiment_analysis = true;
    }
    
    if (formData.get('disfluencies') === 'true') {
      options.disfluencies = true;
    }
    
    const customPrompt = formData.get('custom_prompt') as string | null;
    if (customPrompt && customPrompt.trim()) {
      options.custom_prompt = customPrompt.trim();
    }

    let audioSource: string | Buffer;

    if (file) {
      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      audioSource = Buffer.from(bytes);
    } else if (url) {
      audioSource = url;
    } else {
      return NextResponse.json(
        { error: 'Invalid audio source' },
        { status: 400 }
      );
    }

    // Prepare SDK options
    const sdkOptions: any = {
      audio: audioSource,
    };

    if (options.auto_chapters) {
      sdkOptions.auto_chapters = true;
    }

    if (options.sentiment_analysis) {
      sdkOptions.sentiment_analysis = true;
    }

    if (options.disfluencies) {
      sdkOptions.disfluencies = true;
    }

    if (options.custom_prompt) {
      sdkOptions.prompt = options.custom_prompt;
    }

    // Transcribe using AssemblyAI SDK
    // The SDK handles upload and polling internally
    const transcript = await client.transcripts.transcribe(sdkOptions);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: 500 }
      );
    }

    // Normalize response
    const normalizedResponse: TranscriptResponse = {
      id: transcript.id,
      text: transcript.text || '',
      words: transcript.words?.map(word => ({
        ...word,
        speaker: word.speaker ?? undefined,
      })),
      audioUrl: url || transcript.audio_url || undefined,
      summary: transcript.summary || undefined,
      chapters: transcript.chapters || undefined,
      sentiment: transcript.sentiment_analysis_results || undefined,
      raw: transcript,
    };

    return NextResponse.json(normalizedResponse);
  } catch (error: any) {
    console.error('Transcription error:', error);
    
    const errorMessage =
      error?.message || 'An error occurred during transcription';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.status || 500 }
    );
  }
}

