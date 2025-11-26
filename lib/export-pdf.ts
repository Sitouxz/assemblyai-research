import PDFDocument from 'pdfkit';
import { TranscriptResponse } from './types';

/**
 * Create a PDF from transcript
 * Returns a PDFDocument that can be piped to a stream
 */
export function createPDF(transcript: TranscriptResponse, options?: {
  includeTimestamps?: boolean;
  includeSpeakers?: boolean;
  includeInsights?: boolean;
  title?: string;
}): InstanceType<typeof PDFDocument> {
  const {
    includeTimestamps = true,
    includeSpeakers = true,
    includeInsights = true,
    title = 'Transcript',
  } = options || {};

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Title
  doc.fontSize(24).font('Helvetica-Bold').text(title, {
    align: 'center',
  });

  doc.moveDown(0.5);

  // Date
  doc.fontSize(12).font('Helvetica').fillColor('#666666').text(
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    {
      align: 'center',
    }
  );

  doc.moveDown(2);

  // Transcript heading
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text('Transcript');
  doc.moveDown(1);

  // Transcript content
  doc.fontSize(11).font('Helvetica');

  if (transcript.words && transcript.words.length > 0) {
    let currentSpeaker: string | undefined;
    let currentLine = '';
    let lineStartTime = 0;

    transcript.words.forEach((word, index) => {
      const speakerChanged = includeSpeakers && word.speaker !== currentSpeaker;

      if (speakerChanged) {
        // Flush current line
        if (currentLine.trim()) {
          if (includeTimestamps) {
            doc.fillColor('#888888').text(`[${formatTimestamp(lineStartTime)}] `, {
              continued: true,
            });
          }
          if (includeSpeakers && currentSpeaker) {
            doc.fillColor('#1F4788').font('Helvetica-Bold').text(`Speaker ${currentSpeaker}: `, {
              continued: true,
            });
          }
          doc.fillColor('#000000').font('Helvetica').text(currentLine.trim());
          doc.moveDown(0.5);
        }

        currentSpeaker = word.speaker;
        currentLine = word.text;
        lineStartTime = word.start;
      } else {
        currentLine += ' ' + word.text;
      }

      // Check if we need to break for page
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    // Flush final line
    if (currentLine.trim()) {
      if (includeTimestamps) {
        doc.fillColor('#888888').text(`[${formatTimestamp(lineStartTime)}] `, {
          continued: true,
        });
      }
      if (includeSpeakers && currentSpeaker) {
        doc.fillColor('#1F4788').font('Helvetica-Bold').text(`Speaker ${currentSpeaker}: `, {
          continued: true,
        });
      }
      doc.fillColor('#000000').font('Helvetica').text(currentLine.trim());
    }
  } else {
    // Fallback to plain text
    doc.fillColor('#000000').text(transcript.text, {
      align: 'left',
      width: 495,
    });
  }

  // Insights
  if (includeInsights && (transcript.summary || transcript.chapters || transcript.entities)) {
    doc.addPage();

    doc.fontSize(18).font('Helvetica-Bold').text('Insights');
    doc.moveDown(1);

    // Summary
    if (transcript.summary) {
      doc.fontSize(14).font('Helvetica-Bold').text('Summary');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(transcript.summary);
      doc.moveDown(1);
    }

    // Chapters
    if (transcript.chapters && transcript.chapters.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Chapters');
      doc.moveDown(0.5);

      transcript.chapters.forEach((chapter, index) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${chapter.headline}`, {
          continued: true,
        });
        doc.font('Helvetica').fillColor('#666666').text(
          ` [${formatTimestamp(chapter.start)} - ${formatTimestamp(chapter.end)}]`
        );

        if (chapter.summary) {
          doc.fillColor('#000000').text(chapter.summary, {
            indent: 20,
          });
        }
        doc.moveDown(0.5);

        if (doc.y > 700) {
          doc.addPage();
        }
      });
      doc.moveDown(0.5);
    }

    // Entities
    if (transcript.entities && transcript.entities.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Detected Entities');
      doc.moveDown(0.5);

      const entityTypes = new Map<string, Set<string>>();
      transcript.entities.forEach((entity) => {
        if (!entityTypes.has(entity.entity_type)) {
          entityTypes.set(entity.entity_type, new Set());
        }
        entityTypes.get(entity.entity_type)!.add(entity.text);
      });

      doc.fontSize(11).font('Helvetica');
      entityTypes.forEach((entities, type) => {
        doc.font('Helvetica-Bold').text(`${type}: `, { continued: true });
        doc.font('Helvetica').text(Array.from(entities).join(', '));
        doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
    }

    // Key Highlights
    if (transcript.auto_highlights_result && transcript.auto_highlights_result.length > 0) {
      if (doc.y > 650) {
        doc.addPage();
      }

      doc.fontSize(14).font('Helvetica-Bold').text('Key Highlights');
      doc.moveDown(0.5);

      doc.fontSize(11).font('Helvetica');
      transcript.auto_highlights_result
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 10)
        .forEach((highlight, index) => {
          doc.text(`${index + 1}. ${highlight.text}`, { continued: true });
          doc.fillColor('#666666').text(` (mentioned ${highlight.count} times)`);
          doc.fillColor('#000000').moveDown(0.3);
        });
    }
  }

  // Finalize PDF
  doc.end();

  return doc;
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

