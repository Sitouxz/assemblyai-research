import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';
import { TranscriptResponse } from './types';

/**
 * Create a DOCX document from transcript
 */
export function createDOCX(transcript: TranscriptResponse, options?: {
  includeTimestamps?: boolean;
  includeSpeakers?: boolean;
  includeInsights?: boolean;
  title?: string;
}): Document {
  const {
    includeTimestamps = true,
    includeSpeakers = true,
    includeInsights = true,
    title = 'Transcript',
  } = options || {};

  const sections: any[] = [];

  // Title
  sections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Date
  sections.push(
    new Paragraph({
      text: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    })
  );

  // Transcript content
  if (transcript.words && transcript.words.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Transcript',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    let currentSpeaker: string | undefined;
    let currentParagraph: any[] = [];

    transcript.words.forEach((word, index) => {
      const speakerChanged = includeSpeakers && word.speaker !== currentSpeaker;

      if (speakerChanged) {
        // Flush current paragraph
        if (currentParagraph.length > 0) {
          sections.push(
            new Paragraph({
              children: currentParagraph,
              spacing: { after: 200 },
            })
          );
          currentParagraph = [];
        }

        currentSpeaker = word.speaker;

        // Add speaker label
        if (currentSpeaker) {
          currentParagraph.push(
            new TextRun({
              text: `Speaker ${currentSpeaker}: `,
              bold: true,
              color: '1F4788',
            })
          );
        }
      }

      // Add timestamp for first word
      if (currentParagraph.length === 0 && includeTimestamps) {
        currentParagraph.push(
          new TextRun({
            text: `[${formatTimestamp(word.start)}] `,
            italics: true,
            color: '666666',
          })
        );
      }

      // Add word
      currentParagraph.push(
        new TextRun({
          text: (currentParagraph.length > 1 ? ' ' : '') + word.text,
        })
      );
    });

    // Flush final paragraph
    if (currentParagraph.length > 0) {
      sections.push(
        new Paragraph({
          children: currentParagraph,
          spacing: { after: 200 },
        })
      );
    }
  } else {
    // Fallback to plain text
    sections.push(
      new Paragraph({
        text: transcript.text,
        spacing: { after: 200 },
      })
    );
  }

  // Insights
  if (includeInsights) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    
    sections.push(
      new Paragraph({
        text: 'Insights',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Summary
    if (transcript.summary) {
      sections.push(
        new Paragraph({
          text: 'Summary',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
      sections.push(
        new Paragraph({
          text: transcript.summary,
          spacing: { after: 200 },
        })
      );
    }

    // Chapters
    if (transcript.chapters && transcript.chapters.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Chapters',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      transcript.chapters.forEach((chapter, index) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${chapter.headline}`,
                bold: true,
              }),
              new TextRun({
                text: ` [${formatTimestamp(chapter.start)} - ${formatTimestamp(chapter.end)}]`,
                italics: true,
                color: '666666',
              }),
            ],
            spacing: { after: 100 },
          })
        );

        if (chapter.summary) {
          sections.push(
            new Paragraph({
              text: chapter.summary,
              spacing: { after: 150 },
              indent: { left: 400 },
            })
          );
        }
      });
    }

    // Entities
    if (transcript.entities && transcript.entities.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Detected Entities',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      const entityTypes = new Map<string, Set<string>>();
      transcript.entities.forEach((entity) => {
        if (!entityTypes.has(entity.entity_type)) {
          entityTypes.set(entity.entity_type, new Set());
        }
        entityTypes.get(entity.entity_type)!.add(entity.text);
      });

      entityTypes.forEach((entities, type) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${type}: `,
                bold: true,
              }),
              new TextRun({
                text: Array.from(entities).join(', '),
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    }

    // Key Highlights
    if (transcript.auto_highlights_result && transcript.auto_highlights_result.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Key Highlights',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      transcript.auto_highlights_result
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 10)
        .forEach((highlight, index) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${highlight.text}`,
                }),
                new TextRun({
                  text: ` (mentioned ${highlight.count} times)`,
                  italics: true,
                  color: '666666',
                }),
              ],
              spacing: { after: 100 },
            })
          );
        });
    }
  }

  return new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

