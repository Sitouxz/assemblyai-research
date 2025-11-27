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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Process audio URL to use proxy if needed
  const getProxiedAudioUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // If it's already a local API URL, return as is
    if (url.startsWith('/api/')) {
      console.log('[Audio] Using local API URL:', url);
      return url;
    }
    
    // If it's an AssemblyAI CDN URL or any external URL, proxy it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const proxiedUrl = `/api/audio-proxy?url=${encodeURIComponent(url)}`;
      console.log('[Audio] Proxying external URL:', url, '→', proxiedUrl);
      return proxiedUrl;
    }
    
    console.log('[Audio] Using URL as is:', url);
    return url;
  };

  const audioUrl = getProxiedAudioUrl(transcript.audioUrl);
  
  console.log('[Audio] Original URL:', transcript.audioUrl, '| Processed URL:', audioUrl);

  // Reset audio when transcript changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(null);
    }
  }, [audioUrl]);

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
            audioRef.current.play().catch(err => {
              console.error('Error playing audio:', err);
              setAudioError('Tidak dapat memutar audio. Coba refresh halaman.');
            });
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
  }, [playbackRate, setAudioError]);

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

    const handlePlay = () => {
      setIsPlaying(true);
      setAudioError(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      setAudioError('Audio tidak dapat dimuat. File mungkin rusak atau tidak didukung.');
    };
    const handleCanPlay = () => {
      setAudioError(null);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [transcript.words]);

  const handleWordClick = (word: Word) => {
    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = word.start / 1000;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          setAudioError('Tidak dapat memutar audio. Coba refresh halaman.');
        });
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transcript</h2>
        {transcript.words && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {transcript.words.length} words
          </span>
        )}
      </div>

      {/* Audio Player with Controls */}
      {audioUrl && (
        <div className="mb-6">
          <audio
            ref={audioRef}
            src={audioUrl}
            className="hidden"
            preload="metadata"
            crossOrigin="anonymous"
          >
            Your browser does not support the audio element.
          </audio>
          
          {/* Audio Error Message */}
          {audioError && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-400">{audioError}</p>
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.load();
                        setAudioError(null);
                      }
                    }}
                    className="mt-2 text-xs text-red-700 dark:text-red-300 underline hover:no-underline"
                  >
                    Coba muat ulang audio
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Custom Controls */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
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
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
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
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-900 dark:text-white"
                  title="Skip back 10s"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                </button>
                <button
                  onClick={() => skipTime(-5)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-900 dark:text-white"
                  title="Skip back 5s"
                >
                  -5s
                </button>
              </div>

              {/* Center: Play/Pause */}
              <button
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                    } else {
                      audioRef.current.play().catch(err => {
                        console.error('Error playing audio:', err);
                        setAudioError('Tidak dapat memutar audio. Coba refresh halaman.');
                      });
                    }
                  }
                }}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                disabled={!!audioError}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Right: Skip forward + Speed */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => skipTime(5)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-900 dark:text-white"
                  title="Skip forward 5s"
                >
                  +5s
                </button>
                <button
                  onClick={() => skipTime(10)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-900 dark:text-white"
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
                  className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded"
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
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Transcript Content */}
      <div
        ref={transcriptRef}
        className="max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white leading-relaxed"
      >
        {transcript.text ? (
          renderTranscript()
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No transcript available.</p>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        {transcript.words && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Click on any word to jump to that timestamp in the audio.
          </div>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Keyboard shortcuts: Space (play/pause), ←/→ (skip 5s), ↑/↓ (speed)
        </div>
      </div>
    </div>
  );
}

