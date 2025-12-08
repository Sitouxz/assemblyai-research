'use client';

import { useState } from 'react';

interface PatchNote {
  version: string;
  date: string;
  title: string;
  changes: {
    category: 'New' | 'Improved' | 'Fixed';
    items: string[];
  }[];
}

const patchNotes: PatchNote[] = [
  {
    version: '2.1.0',
    date: 'December 2024',
    title: 'Speaking Performance Analytics',
    changes: [
      {
        category: 'New',
        items: [
          '📊 Comprehensive Delivery Metrics - Automatic analysis of speaking pace, pauses, and fluency (100% FREE)',
          '📈 Speaking Pace Timeline - Visual WPM breakdown by 30-second segments',
          '⭐ Speech Clarity Score - Confidence-based articulation analysis from AssemblyAI',
          '🗺️ Filler Word Hotspots - Detection of clustered filler words with timestamps',
          '🏆 Peak Performance Segments - Top 3 best moments highlighted with scores',
          '🚨 Critical Moments Detection - Automatic flagging of problem areas (long pauses, filler clusters, unclear speech)',
          '📊 Comparison Benchmarks - Compare your performance to podcasters, presenters, and news anchors',
          '⚡ Energy/Momentum Score - Track if you\'re speeding up or slowing down',
          '🎵 Rhythm Variation Analysis - Measure pace consistency (monotone vs dynamic)',
          '📝 Sentence Structure Analysis - Avg/longest/shortest sentences + run-on detection',
          '🔄 Speaker Interruption Detection - Overtalk analysis for multi-speaker transcripts',
          '⏸️ Longest Pause Highlight - Context-aware pause detection with before/after words',
          '🎤 Azure Pronunciation Assessment - Word-level pronunciation scoring (optional, on-demand)',
          '🎭 Voice Emotion Analysis - Hume AI integration for emotional tone detection (optional, on-demand)',
          '💡 Intelligent Improvement Tips - Context-aware suggestions based on your metrics',
        ],
      },
      {
        category: 'Improved',
        items: [
          'Enhanced Delivery tab with 13+ new metrics and visualizations',
          'Automatic calculation of all delivery metrics on every transcript',
          'Beautiful color-coded visualizations for pace, confidence, and issues',
          'Collapsible sections for detailed analysis',
          'Feature flags for optional services (Azure, Hume)',
          'Better error handling and graceful degradation when services disabled',
          'Dark mode support for all new components',
          'Responsive design for mobile viewing',
        ],
      },
    ],
  },
  {
    version: '2.0.0',
    date: 'November 26, 2024',
    title: 'Major Platform Upgrade',
    changes: [
      {
        category: 'New',
        items: [
          '🎨 Full Dark Mode support with Light/Dark/System themes',
          '⌨️ Keyboard shortcuts (Space, Arrows for playback control)',
          '🎵 Custom audio player with 6 playback speeds (0.5x - 2x)',
          '⏭️ Skip controls (±5s, ±10s) for quick navigation',
          '📁 Folder and tag organization system (database ready)',
          '🔖 Bookmarks and annotations infrastructure',
          '💬 Comment system with threading support',
          '🎯 Word-level sync with auto-highlight during playback',
        ],
      },
      {
        category: 'Improved',
        items: [
          'Enhanced audio player UI with progress bar',
          'Clickable words to jump to timestamps',
          'Auto-scroll keeps current word in view',
          'Smooth theme transitions across all components',
          'Optimized database with 13 models and proper indices',
          'Better mobile responsive design',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    date: 'November 26, 2024',
    title: 'Export & Sharing Features',
    changes: [
      {
        category: 'New',
        items: [
          '📤 Export to 5 formats: TXT, DOCX, PDF, SRT, VTT',
          '🔗 Shareable links with password protection',
          '⏰ Share link expiry dates',
          '👁️ View tracking for shared transcripts',
          '🔒 Download permission control',
          '🌐 Public read-only view for shared content',
        ],
      },
      {
        category: 'Improved',
        items: [
          'Professional DOCX formatting with insights',
          'PDF generation with chapters and sentiment',
          'Configurable export options',
          'Cryptographically secure share tokens',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: 'November 26, 2024',
    title: 'Advanced AI & Configuration',
    changes: [
      {
        category: 'New',
        items: [
          '🤖 LeMUR AI: Summaries, Action Items, Key Points',
          '💭 Q&A system - Ask questions about transcripts',
          '🎙️ Speaker Diarization with labels',
          '🔐 PII Redaction (8+ policy types)',
          '🏷️ Entity Detection (names, organizations, locations)',
          '📊 IAB Topic Categories (600+ topics)',
          '🛡️ Content Moderation with safety labels',
          '⭐ Auto Highlights - Key phrase extraction',
          '📈 Sentiment Analysis (per-sentence)',
          '📖 Auto Chapters - Topic segmentation',
        ],
      },
      {
        category: 'Improved',
        items: [
          'Advanced options panel with 20+ configuration options',
          'Tabbed insights interface (7 tabs)',
          'JSON viewer for raw data',
          'Better error handling and loading states',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: 'November 26, 2024',
    title: 'Foundation Release',
    changes: [
      {
        category: 'New',
        items: [
          '🔐 User authentication with NextAuth.js v5',
          '👤 User registration and login',
          '💾 Database persistence with Prisma + SQLite',
          '📝 Per-user transcript management',
          '📜 History page with search and filtering',
          '🎙️ Audio/video file upload',
          '🔗 URL-based transcription',
          '📊 Individual transcript detail pages',
        ],
      },
    ],
  },
];

export default function PatchNotes() {
  const [isExpanded, setIsExpanded] = useState(false);
  const latestVersion = patchNotes[0];
  const olderVersions = patchNotes.slice(1);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'New':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'Improved':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'Fixed':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  const renderPatchNote = (note: PatchNote, isLatest: boolean = false) => (
    <div
      key={note.version}
      className={`${
        isLatest
          ? 'border-2 border-blue-500 dark:border-blue-400'
          : 'border border-gray-200 dark:border-gray-700'
      } rounded-lg p-6 bg-white dark:bg-gray-800 transition-colors`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {note.title}
            </h3>
            {isLatest && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
                Latest
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
              v{note.version}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {note.date}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {note.changes.map((change, idx) => (
          <div key={idx}>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getCategoryColor(
                change.category
              )}`}
            >
              {change.category === 'New' && '✨ '}
              {change.category === 'Improved' && '🚀 '}
              {change.category === 'Fixed' && '🔧 '}
              {change.category}
            </div>
            <ul className="space-y-2 ml-4">
              {change.items.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className="text-gray-700 dark:text-gray-300 flex items-start"
                >
                  <span className="mr-2 mt-1 text-gray-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              What's New
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest updates and features
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            v{latestVersion.version}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Latest version - always visible */}
        {renderPatchNote(latestVersion, true)}

        {/* Older versions - collapsible */}
        {olderVersions.length > 0 && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isExpanded ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Hide Previous Versions
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  View Previous Versions ({olderVersions.length})
                </>
              )}
            </button>

            {isExpanded && (
              <div className="space-y-4 animate-in slide-in-from-top-4">
                {olderVersions.map((note) => renderPatchNote(note))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              65+
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Features
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              20+
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              AI Options
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              13+
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Delivery Metrics
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              20+
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              API Endpoints
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

