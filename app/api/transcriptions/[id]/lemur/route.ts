import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getAssemblyAIClient } from '@/lib/assemblyai';

// POST /api/transcriptions/[id]/lemur - Generate LeMUR insights
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

    if (!transcript.assemblyaiId) {
      return NextResponse.json(
        { error: 'Transcript does not have AssemblyAI ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { type, question, context } = body;

    // Get the appropriate AssemblyAI client (user key or app key)
    const client = await getAssemblyAIClient(session.user.id);

    let result: any;

    switch (type) {
      case 'summary':
        // Generate summary using LeMUR
        result = await client.lemur.summary({
          transcript_ids: [transcript.assemblyaiId],
          answer_format: context?.answer_format || 'Provide a concise summary in paragraph form.',
          context: context?.custom_context,
        });
        break;

      case 'action_items':
        // Extract action items
        result = await client.lemur.actionItems({
          transcript_ids: [transcript.assemblyaiId],
          context: context?.custom_context,
        });
        break;

      case 'key_points':
        // Extract key points
        result = await client.lemur.task({
          transcript_ids: [transcript.assemblyaiId],
          prompt: context?.custom_prompt || 'Extract the key points and main ideas from this transcript. List them as bullet points.',
        });
        break;

      case 'qa':
        // Q&A
        if (!question) {
          return NextResponse.json(
            { error: 'Question is required for Q&A' },
            { status: 400 }
          );
        }
        result = await client.lemur.questionAnswer({
          transcript_ids: [transcript.assemblyaiId],
          questions: [
            {
              question: question,
              context: context?.custom_context,
              answer_format: context?.answer_format,
            },
          ],
        });
        break;

      case 'custom':
        // Custom LeMUR task
        if (!context?.custom_prompt) {
          return NextResponse.json(
            { error: 'Custom prompt is required for custom tasks' },
            { status: 400 }
          );
        }
        result = await client.lemur.task({
          transcript_ids: [transcript.assemblyaiId],
          prompt: context.custom_prompt,
          final_model: context.model,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid LeMUR type' },
          { status: 400 }
        );
    }

    // Update transcript insights with LeMUR results
    const currentInsights = transcript.insights 
      ? JSON.parse(transcript.insights) 
      : {};
    
    const lemurInsights = currentInsights.lemur || {};
    lemurInsights[type] = {
      result,
      generated_at: new Date().toISOString(),
      question: question || undefined,
      context: context || undefined,
    };
    currentInsights.lemur = lemurInsights;

    await prisma.transcript.update({
      where: { id: params.id },
      data: {
        insights: JSON.stringify(currentInsights),
      },
    });

    return NextResponse.json({
      type,
      result,
      success: true,
    });
  } catch (error: any) {
    console.error('LeMUR error:', error);
    
    const errorMessage =
      error?.message || 'An error occurred generating LeMUR insights';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.status || 500 }
    );
  }
}

// GET /api/transcriptions/[id]/lemur - Get LeMUR insights
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

    const insights = transcript.insights 
      ? JSON.parse(transcript.insights) 
      : {};

    return NextResponse.json({
      lemur: insights.lemur || {},
    });
  } catch (error: any) {
    console.error('Error fetching LeMUR insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LeMUR insights' },
      { status: 500 }
    );
  }
}

