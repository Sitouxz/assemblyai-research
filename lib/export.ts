import { TranscriptResponse, Word } from './types';

/**
 * Export transcript as plain text
 */
export function exportAsText(transcript: TranscriptResponse, options?: {
  includeTimestamps?: boolean;
  includeSpeakers?: boolean;
}): string {
  const { includeTimestamps = false, includeSpeakers = false } = options || {};
  
  if (!transcript.words || transcript.words.length === 0) {
    return transcript.text;
  }

  let output = '';
  let currentSpeaker: string | undefined;
  let currentLine = '';
  let currentLineStart = 0;

  transcript.words.forEach((word, index) => {
    const speakerChanged = includeSpeakers && word.speaker !== currentSpeaker;
    
    if (speakerChanged) {
      // Flush current line
      if (currentLine.trim()) {
        if (includeTimestamps) {
          output += `[${formatTimestamp(currentLineStart)}] `;
        }
        if (includeSpeakers && currentSpeaker) {
          output += `Speaker ${currentSpeaker}: `;
        }
        output += currentLine.trim() + '\n\n';
      }
      
      currentSpeaker = word.speaker;
      currentLine = word.text;
      currentLineStart = word.start;
    } else {
      currentLine += ' ' + word.text;
    }
  });

  // Flush final line
  if (currentLine.trim()) {
    if (includeTimestamps) {
      output += `[${formatTimestamp(currentLineStart)}] `;
    }
    if (includeSpeakers && currentSpeaker) {
      output += `Speaker ${currentSpeaker}: `;
    }
    output += currentLine.trim() + '\n';
  }

  return output || transcript.text;
}

/**
 * Export transcript as SRT subtitles
 */
export function exportAsSRT(transcript: TranscriptResponse, options?: {
  maxCharsPerLine?: number;
  maxDuration?: number;
}): string {
  const { maxCharsPerLine = 42, maxDuration = 7000 } = options || {};
  
  if (!transcript.words || transcript.words.length === 0) {
    return '';
  }

  const subtitles: Array<{ start: number; end: number; text: string }> = [];
  let currentSubtitle = { start: 0, end: 0, text: '' };

  transcript.words.forEach((word, index) => {
    const isFirstWord = currentSubtitle.text === '';
    
    if (isFirstWord) {
      currentSubtitle.start = word.start;
      currentSubtitle.text = word.text;
      currentSubtitle.end = word.end;
    } else {
      const proposedText = currentSubtitle.text + ' ' + word.text;
      const duration = word.end - currentSubtitle.start;
      
      // Check if we should start a new subtitle
      if (proposedText.length > maxCharsPerLine || duration > maxDuration) {
        subtitles.push({ ...currentSubtitle });
        currentSubtitle = {
          start: word.start,
          end: word.end,
          text: word.text,
        };
      } else {
        currentSubtitle.text = proposedText;
        currentSubtitle.end = word.end;
      }
    }
  });

  // Add final subtitle
  if (currentSubtitle.text) {
    subtitles.push(currentSubtitle);
  }

  // Format as SRT
  return subtitles
    .map((sub, index) => {
      return `${index + 1}\n${formatSRTTimestamp(sub.start)} --> ${formatSRTTimestamp(sub.end)}\n${sub.text}\n`;
    })
    .join('\n');
}

/**
 * Export transcript as VTT subtitles
 */
export function exportAsVTT(transcript: TranscriptResponse, options?: {
  maxCharsPerLine?: number;
  maxDuration?: number;
}): string {
  const srt = exportAsSRT(transcript, options);
  
  if (!srt) {
    return 'WEBVTT\n\n';
  }

  // Convert SRT timestamps to VTT format (change comma to period)
  const vtt = srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  
  return 'WEBVTT\n\n' + vtt;
}

/**
 * Format milliseconds as MM:SS
 */
function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds as SRT timestamp (HH:MM:SS,mmm)
 */
function formatSRTTimestamp(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  title: string,
  format: string,
  timestamp?: Date
): string {
  const date = timestamp || new Date();
  const dateStr = date.toISOString().split('T')[0];
  const safeTitle = title
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
  
  return `${safeTitle}_${dateStr}.${format}`;
}

/**
 * Prepare insights summary for export
 */
export function formatInsightsForExport(transcript: TranscriptResponse): string {
  let output = '=== INSIGHTS ===\n\n';

  // Summary
  if (transcript.summary) {
    output += '## Summary\n';
    output += transcript.summary + '\n\n';
  }

  // Chapters
  if (transcript.chapters && transcript.chapters.length > 0) {
    output += '## Chapters\n';
    transcript.chapters.forEach((chapter, index) => {
      output += `${index + 1}. ${chapter.headline} [${formatTimestamp(chapter.start)} - ${formatTimestamp(chapter.end)}]\n`;
      if (chapter.summary) {
        output += `   ${chapter.summary}\n`;
      }
    });
    output += '\n';
  }

  // Entities
  if (transcript.entities && transcript.entities.length > 0) {
    output += '## Entities\n';
    const entityTypes = new Map<string, string[]>();
    transcript.entities.forEach((entity) => {
      if (!entityTypes.has(entity.entity_type)) {
        entityTypes.set(entity.entity_type, []);
      }
      entityTypes.get(entity.entity_type)!.push(entity.text);
    });
    
    entityTypes.forEach((entities, type) => {
      output += `${type}: ${[...new Set(entities)].join(', ')}\n`;
    });
    output += '\n';
  }

  // Key Highlights
  if (transcript.auto_highlights_result && transcript.auto_highlights_result.length > 0) {
    output += '## Key Highlights\n';
    transcript.auto_highlights_result
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 10)
      .forEach((highlight, index) => {
        output += `${index + 1}. ${highlight.text} (mentioned ${highlight.count} times)\n`;
      });
    output += '\n';
  }

  // Sentiment Overview
  if (transcript.sentiment && transcript.sentiment.length > 0) {
    const sentimentCounts = {
      POSITIVE: 0,
      NEGATIVE: 0,
      NEUTRAL: 0,
    };
    
    transcript.sentiment.forEach((item) => {
      sentimentCounts[item.sentiment]++;
    });
    
    const total = transcript.sentiment.length;
    output += '## Sentiment Analysis\n';
    output += `Positive: ${sentimentCounts.POSITIVE} (${Math.round((sentimentCounts.POSITIVE / total) * 100)}%)\n`;
    output += `Neutral: ${sentimentCounts.NEUTRAL} (${Math.round((sentimentCounts.NEUTRAL / total) * 100)}%)\n`;
    output += `Negative: ${sentimentCounts.NEGATIVE} (${Math.round((sentimentCounts.NEGATIVE / total) * 100)}%)\n\n`;
  }

  return output;
}

