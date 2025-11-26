import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Packer } from 'docx';
import {
  exportAsText,
  exportAsSRT,
  exportAsVTT,
  generateExportFilename,
  formatInsightsForExport,
} from '@/lib/export';
import { createDOCX } from '@/lib/export-docx';
import { createPDF } from '@/lib/export-pdf';
import { TranscriptResponse } from '@/lib/types';

// GET /api/transcriptions/[id]/export?format=txt&options=...
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

    // Get transcript
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

    // Parse options from query
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'txt';
    const includeTimestamps = searchParams.get('timestamps') !== 'false';
    const includeSpeakers = searchParams.get('speakers') !== 'false';
    const includeInsights = searchParams.get('insights') !== 'false';
    const insightsOnly = searchParams.get('insightsOnly') === 'true';

    // Reconstruct TranscriptResponse
    const insights = transcript.insights ? JSON.parse(transcript.insights) : {};
    const transcriptData: TranscriptResponse = {
      id: transcript.assemblyaiId || transcript.id,
      dbId: transcript.id,
      text: transcript.text,
      words: insights.words,
      audioUrl: transcript.audioUrl || undefined,
      summary: insights.summary,
      chapters: insights.chapters,
      sentiment: insights.sentiment,
      entities: insights.entities,
      iab_categories: insights.iab_categories,
      content_safety_labels: insights.content_safety_labels,
      auto_highlights_result: insights.auto_highlights,
      raw: {},
    };

    const filename = generateExportFilename(transcript.title, format);

    // Handle insights-only export
    if (insightsOnly) {
      const insightsText = formatInsightsForExport(transcriptData);
      return new NextResponse(insightsText, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${generateExportFilename(transcript.title, 'txt')}"`,
        },
      });
    }

    // Export based on format
    switch (format.toLowerCase()) {
      case 'txt': {
        const text = exportAsText(transcriptData, {
          includeTimestamps,
          includeSpeakers,
        });
        
        const fullText = includeInsights
          ? text + '\n\n' + formatInsightsForExport(transcriptData)
          : text;

        return new NextResponse(fullText, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'srt': {
        const srt = exportAsSRT(transcriptData);
        return new NextResponse(srt, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'vtt': {
        const vtt = exportAsVTT(transcriptData);
        return new NextResponse(vtt, {
          headers: {
            'Content-Type': 'text/vtt',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'docx': {
        const doc = createDOCX(transcriptData, {
          includeTimestamps,
          includeSpeakers,
          includeInsights,
          title: transcript.title,
        });

        const buffer = await Packer.toBuffer(doc);

        return new NextResponse(buffer as any, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'pdf': {
        const pdfDoc = createPDF(transcriptData, {
          includeTimestamps,
          includeSpeakers,
          includeInsights,
          title: transcript.title,
        });

        // Collect PDF chunks
        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));

        // Wait for PDF to finish
        await new Promise((resolve, reject) => {
          pdfDoc.on('end', resolve);
          pdfDoc.on('error', reject);
        });

        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer as any, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid export format' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export transcript' },
      { status: 500 }
    );
  }
}

