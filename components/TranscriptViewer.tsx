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
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!audioRef.current) return;
      
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          if (audioRef.current.paused) {
            audioRef.current.play();
          } else {
            audioRef.current.pause();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const newRateUp = Math.min(2, playbackRate + 0.25);
          setPlaybackRate(newRateUp);
          audioRef.current.playbackRate = newRateUp;
          break;
        case 'ArrowDown':
          e.preventDefault();
          const newRateDown = Math.max(0.5, playbackRate - 0.25);
          setPlaybackRate(newRateDown);
          audioRef.current.playbackRate = newRateDown;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playbackRate]);

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

      {/* Audio Player with Controls */}
      {transcript.audioUrl && (
        <div className="mb-6">
          <audio
            ref={audioRef}
            src={transcript.audioUrl}
            className="hidden"
          >
            Your browser does not support the audio element.
          </audio>
          
          {/* Custom Controls */}
          <div className="bg-gray-100 rounded-lg p-4 space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-16">
                {Math.floor(currentTime / 60000)}:{Math.floor((currentTime % 60000) / 1000).toString().padStart(2, '0')}
              </span>
              <input
                type="range"
                min="0"
                max={audioRef.current?.duration ? audioRef.current.duration * 1000 : 100}
                value={currentTime}
                onChange={(e) => {
                  const time = parseInt(e.target.value);
                  if (audioRef.current) {
                    audioRef.current.currentTime = time / 1000;
                    setCurrentTime(time);
                  }
                }}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-16">
                {audioRef.current?.duration ? 
                  `${Math.floor(audioRef.current.duration / 60)}:${Math.floor(audioRef.current.duration % 60).toString().padStart(2, '0')}` 
                  : '0:00'}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              {/* Left: Skip buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => skipTime(-10)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Skip back 10s"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                </button>
                <button
                  onClick={() => skipTime(-5)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Skip back 5s"
                >
                  -5s
                </button>
              </div>

              {/* Center: Play/Pause */}
              <button
                onClick={() => {
                  if (audioRef.current?.paused) {
                    audioRef.current?.play();
                  } else {
                    audioRef.current?.pause();
                  }
                }}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                {audioRef.current?.paused !== false ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                )}
              </button>

              {/* Right: Skip forward + Speed */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => skipTime(5)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Skip forward 5s"
                >
                  +5s
                </button>
                <button
                  onClick={() => skipTime(10)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Skip forward 10s"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                  </svg>
                </button>
                <select
                  value={playbackRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value);
                    setPlaybackRate(rate);
                    if (audioRef.current) {
                      audioRef.current.playbackRate = rate;
                    }
                  }}
                  className="text-sm px-2 py-1 border border-gray-300 rounded"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>
          </div>
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

      {/* Info */}
      <div className="mt-4 space-y-1">
        {transcript.words && (
          <div className="text-xs text-gray-500">
            Click on any word to jump to that timestamp in the audio.
          </div>
        )}
        <div className="text-xs text-gray-500">
          Keyboard shortcuts: Space (play/pause), ←/→ (skip 5s), ↑/↓ (speed)
        </div>
      </div>
    </div>
  );
}

