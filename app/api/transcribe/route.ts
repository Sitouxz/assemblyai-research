import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/assemblyai';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TranscriptionOptions, TranscriptResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Allow both authenticated and guest users for now
    // Guest users won't have their transcripts saved to DB
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;
    const fileName = formData.get('fileName') as string | null;

    if (!file && !url) {
      return NextResponse.json(
        { error: 'No file or URL provided' },
        { status: 400 }
      );
    }

    // Build transcription options from form data
    const optionsJson = formData.get('options') as string | null;
    const options: TranscriptionOptions = optionsJson ? JSON.parse(optionsJson) : {};

    let audioSource: string | Buffer;
    const sourceType = file ? 'file' : 'url';

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

    // Prepare SDK options - map all advanced features
    const sdkOptions: any = {
      audio: audioSource,
    };

    // Basic options
    if (options.language_code) sdkOptions.language_code = options.language_code;
    if (options.language_detection) sdkOptions.language_detection = true;

    // Speech-to-Text
    if (options.speaker_labels) {
      sdkOptions.speaker_labels = true;
      if (options.speakers_expected) {
        sdkOptions.speakers_expected = options.speakers_expected;
      }
    }
    if (options.disfluencies) sdkOptions.disfluencies = true;
    if (options.word_boost && options.word_boost.length > 0) {
      sdkOptions.word_boost = options.word_boost;
      if (options.boost_param) sdkOptions.boost_param = options.boost_param;
    }

    // Speech Understanding
    if (options.auto_chapters) sdkOptions.auto_chapters = true;
    if (options.sentiment_analysis) sdkOptions.sentiment_analysis = true;
    if (options.entity_detection) sdkOptions.entity_detection = true;
    if (options.iab_categories) sdkOptions.iab_categories = true;
    if (options.content_safety) sdkOptions.content_safety = true;
    if (options.auto_highlights) sdkOptions.auto_highlights = true;

    // PII Redaction
    if (options.redact_pii) {
      sdkOptions.redact_pii = true;
      if (options.redact_pii_audio) sdkOptions.redact_pii_audio = true;
      if (options.redact_pii_policies && options.redact_pii_policies.length > 0) {
        sdkOptions.redact_pii_policies = options.redact_pii_policies;
      }
      if (options.redact_pii_sub) sdkOptions.redact_pii_sub = options.redact_pii_sub;
    }

    // Custom
    if (options.custom_spelling && options.custom_spelling.length > 0) {
      sdkOptions.custom_spelling = options.custom_spelling;
    }
    if (options.custom_prompt) sdkOptions.prompt = options.custom_prompt;

    // Transcribe using AssemblyAI SDK
    // The SDK handles upload and polling internally
    const transcript = await client.transcripts.transcribe(sdkOptions);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: 500 }
      );
    }

    // Normalize response with all new fields
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
      entities: transcript.entities || undefined,
      iab_categories: transcript.iab_categories_result || undefined,
      content_safety_labels: transcript.content_safety_labels?.results || undefined,
      auto_highlights_result: transcript.auto_highlights_result?.results || undefined,
      speakers: transcript.speakers_expected || undefined,
      raw: transcript,
    };

    // Save to database if user is authenticated
    if (session?.user?.id) {
      const title = fileName || (file ? file.name : url) || 'Untitled Transcript';
      
      const insights: any = {};
      if (transcript.chapters) insights.chapters = transcript.chapters;
      if (transcript.sentiment_analysis_results) {
        insights.sentiment = transcript.sentiment_analysis_results;
      }
      if (transcript.summary) insights.summary = transcript.summary;
      if (transcript.entities) insights.entities = transcript.entities;
      if (transcript.iab_categories_result) insights.iab_categories = transcript.iab_categories_result;
      if (transcript.content_safety_labels?.results) insights.content_safety_labels = transcript.content_safety_labels.results;
      if (transcript.auto_highlights_result?.results) insights.auto_highlights = transcript.auto_highlights_result.results;
      if (transcript.words) insights.words = transcript.words;

      const dbTranscript = await prisma.transcript.create({
        data: {
          userId: session.user.id,
          title,
          audioUrl: url || transcript.audio_url || null,
          audioSource: sourceType,
          text: transcript.text || '',
          duration: transcript.audio_duration || null,
          status: 'completed',
          assemblyaiId: transcript.id,
          config: JSON.stringify(options),
          insights: Object.keys(insights).length > 0 ? JSON.stringify(insights) : null,
        },
      });

      // Add database ID to response
      normalizedResponse.dbId = dbTranscript.id;
    }

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

