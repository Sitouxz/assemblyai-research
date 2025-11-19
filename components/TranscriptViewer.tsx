'use client';

import { useState, useRef, useEffect } from 'react';
import { TranscriptResponse, Word } from '@/lib/types';

interface TranscriptViewerProps {
  transcript: TranscriptResponse;
}

export default function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Sync audio playback with word highlighting
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !transcript.words) return;

    const updateTime = () => {
      const time = audio.currentTime * 1000; // Convert to milliseconds
      setCurrentTime(time);

      // Find the active word
      if (transcript.words) {
        const activeIndex = transcript.words.findIndex(
          (word) => time >= word.start && time <= word.end
        );
        setHighlightedWordIndex(activeIndex >= 0 ? activeIndex : null);

        // Auto-scroll to active word
        if (activeIndex >= 0) {
          const wordElement = document.getElementById(`word-${activeIndex}`);
          if (wordElement && transcriptRef.current) {
            const container = transcriptRef.current;
            const wordTop = wordElement.offsetTop;
            const wordBottom = wordTop + wordElement.offsetHeight;
            const containerTop = container.scrollTop;
            const containerBottom = containerTop + container.clientHeight;

            if (wordTop < containerTop || wordBottom > containerBottom) {
              wordElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          }
        }
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, [transcript.words]);

  const handleWordClick = (word: Word) => {
    if (audioRef.current) {
      audioRef.current.currentTime = word.start / 1000;
      if (audioRef.current.paused) {
        audioRef.current.play();
      }
    }
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const renderTranscript = () => {
    if (!transcript.words) {
      // Fallback to plain text with search highlighting
      return (
        <div className="prose max-w-none">
          {searchQuery ? highlightText(transcript.text, searchQuery) : transcript.text}
        </div>
      );
    }

    // Render with word-level timestamps
    return (
      <div className="space-y-1">
        {transcript.words.map((word, index) => {
          const isActive =
            highlightedWordIndex === index &&
            currentTime >= word.start &&
            currentTime <= word.end;
          const isSearchMatch =
            searchQuery &&
            word.text.toLowerCase().includes(searchQuery.toLowerCase());

          return (
            <span
              key={index}
              id={`word-${index}`}
              onClick={() => handleWordClick(word)}
              className={`inline-block px-1 py-0.5 rounded cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-200 text-blue-900 font-medium'
                  : isSearchMatch
                  ? 'bg-yellow-200 text-yellow-900'
                  : 'hover:bg-gray-100'
              }`}
              title={`${(word.start / 1000).toFixed(2)}s - ${(word.end / 1000).toFixed(2)}s`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Transcript</h2>
        {transcript.words && (
          <span className="text-sm text-gray-500">
            {transcript.words.length} words
          </span>
        )}
      </div>

      {/* Audio Player */}
      {transcript.audioUrl && (
        <div className="mb-6">
          <audio
            ref={audioRef}
            controls
            src={transcript.audioUrl}
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transcript..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Transcript Content */}
      <div
        ref={transcriptRef}
        className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-900 leading-relaxed"
      >
        {transcript.text ? (
          renderTranscript()
        ) : (
          <p className="text-gray-500 italic">No transcript available.</p>
        )}
      </div>

      {/* Word Timestamps Info */}
      {transcript.words && (
        <div className="mt-4 text-xs text-gray-500">
          Click on any word to jump to that timestamp in the audio.
        </div>
      )}
    </div>
  );
}

