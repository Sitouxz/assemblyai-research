'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Section {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const sections: Section[] = [
  { id: 'getting-started', title: 'Getting Started', icon: '🚀', description: 'Set up your account and first transcript' },
  { id: 'uploading', title: 'Uploading Audio', icon: '📤', description: 'Upload files or use URLs' },
  { id: 'advanced-options', title: 'Advanced Options', icon: '⚙️', description: '20+ transcription features' },
  { id: 'playback', title: 'Playback Controls', icon: '🎵', description: 'Speed, skip, and keyboard shortcuts' },
  { id: 'insights', title: 'AI Insights', icon: '🤖', description: 'Summaries, Q&A, and analysis' },
  { id: 'export', title: 'Export & Download', icon: '📥', description: '5 formats with options' },
  { id: 'sharing', title: 'Sharing', icon: '🔗', description: 'Secure links with passwords' },
  { id: 'organization', title: 'Organization', icon: '📁', description: 'History, search, and filters' },
  { id: 'dark-mode', title: 'Dark Mode', icon: '🌙', description: 'Theme customization' },
  { id: 'keyboard', title: 'Keyboard Shortcuts', icon: '⌨️', description: 'Power user features' },
];

export default function HowToUsePage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use AssemblyAI Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Complete guide to mastering all features - from basic transcription to advanced AI insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Contents
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🚀</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Getting Started</h2>
                    <p className="text-gray-600 dark:text-gray-400">Your first steps with the platform</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Create an Account</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• Visit <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">/auth/signup</code></p>
                      <p className="text-gray-700 dark:text-gray-300">• Enter your name, email, and password (min 6 characters)</p>
                      <p className="text-gray-700 dark:text-gray-300">• Click "Sign Up"</p>
                      <p className="text-gray-700 dark:text-gray-300">• You'll be automatically logged in</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Your First Transcript</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• Go to the home page</p>
                      <p className="text-gray-700 dark:text-gray-300">• Upload an audio/video file OR paste a URL</p>
                      <p className="text-gray-700 dark:text-gray-300">• Click "Transcribe"</p>
                      <p className="text-gray-700 dark:text-gray-300">• Wait for processing (typically 15-30% of audio duration)</p>
                      <p className="text-gray-700 dark:text-gray-300">• View your results!</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <span className="text-blue-600 dark:text-blue-400">💡</span>
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Pro Tip</p>
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                          Supported formats: MP3, MP4, WAV, M4A, FLAC, WebM, and more. Max file size depends on your AssemblyAI plan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Uploading Audio */}
            <section id="uploading" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">📤</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Uploading Audio</h2>
                    <p className="text-gray-600 dark:text-gray-400">Two ways to submit your content</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Method 1: File Upload</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• Click "Choose File" or drag & drop into the upload area</p>
                      <p className="text-gray-700 dark:text-gray-300">• Select your audio or video file from your computer</p>
                      <p className="text-gray-700 dark:text-gray-300">• The file will be uploaded to AssemblyAI's servers</p>
                      <p className="text-gray-700 dark:text-gray-300">• Processing begins automatically</p>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Best for:</strong> Local files, recordings, downloaded content
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Method 2: URL Input</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• Switch to "URL" tab in the upload card</p>
                      <p className="text-gray-700 dark:text-gray-300">• Paste a direct link to an audio/video file</p>
                      <p className="text-gray-700 dark:text-gray-300">• URL must be publicly accessible</p>
                      <p className="text-gray-700 dark:text-gray-300">• AssemblyAI fetches the file directly</p>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Best for:</strong> Podcasts, online videos, cloud-hosted files
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                      <div>
                        <p className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">Important</p>
                        <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                          For URL uploads, the file must be directly downloadable (not a webpage containing a player). 
                          Example: <code className="px-1 bg-yellow-100 dark:bg-yellow-900 rounded">https://example.com/audio.mp3</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Advanced Options */}
            <section id="advanced-options" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">⚙️</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Options</h2>
                    <p className="text-gray-600 dark:text-gray-400">20+ powerful transcription features</p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Click "Advanced Options" on the upload card to access these features:
                </p>

                <div className="space-y-4">
                  {/* Speaker Diarization */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">🎙️</span>
                      Speaker Diarization
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Identify and label different speakers in your audio.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm space-y-1">
                      <p className="text-gray-700 dark:text-gray-300">✓ Toggle "Speaker Diarization"</p>
                      <p className="text-gray-700 dark:text-gray-300">✓ Optionally set expected number of speakers</p>
                      <p className="text-gray-700 dark:text-gray-300">✓ Transcript will show "Speaker A", "Speaker B", etc.</p>
                    </div>
                  </div>

                  {/* PII Redaction */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">🔐</span>
                      PII Redaction
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Automatically remove sensitive information like SSNs, credit cards, phone numbers.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm space-y-1">
                      <p className="text-gray-700 dark:text-gray-300">✓ Enable "Redact PII"</p>
                      <p className="text-gray-700 dark:text-gray-300">✓ Select policies: SSN, Credit Card, Email, Phone, etc.</p>
                      <p className="text-gray-700 dark:text-gray-300">✓ Sensitive data replaced with [PII] in transcript</p>
                      <p className="text-gray-700 dark:text-gray-300">✓ Optional: Redact from audio file too</p>
                    </div>
                  </div>

                  {/* Entity Detection */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">🏷️</span>
                      Entity Detection
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Extract names, organizations, locations, and other entities.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">Automatically identifies: Persons, Organizations, Locations, Medical Terms, and more.</p>
                    </div>
                  </div>

                  {/* IAB Categories */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      IAB Topic Categories
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Classify your content into 600+ industry-standard topics.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">Examples: Technology, Business, Sports, Health, Entertainment, etc.</p>
                    </div>
                  </div>

                  {/* Content Moderation */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">🛡️</span>
                      Content Safety
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Detect sensitive content with confidence scores.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">Flags: Violence, Hate Speech, Profanity, Sexual Content, etc.</p>
                    </div>
                  </div>

                  {/* Auto Highlights */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      Auto Highlights
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Automatically extract key phrases and important moments.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">Shows most important phrases with frequency counts.</p>
                    </div>
                  </div>

                  {/* Sentiment Analysis */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">📈</span>
                      Sentiment Analysis
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Analyze emotional tone (Positive, Neutral, Negative) for each sentence.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">Great for customer service, interviews, feedback analysis.</p>
                    </div>
                  </div>

                  {/* Auto Chapters */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">📖</span>
                      Auto Chapters
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Automatically segment your transcript into topic-based chapters.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">Each chapter includes summary, start/end times, and main topics.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="text-blue-600 dark:text-blue-400">💡</span>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Combining Features</p>
                      <p className="text-blue-800 dark:text-blue-300 text-sm">
                        You can enable multiple features at once! For example: Speaker Diarization + Sentiment Analysis + PII Redaction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Playback Controls */}
            <section id="playback" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🎵</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Playback Controls</h2>
                    <p className="text-gray-600 dark:text-gray-400">Professional audio player features</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Custom Audio Player</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <div className="inline-block bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 w-full max-w-xl">
                          <div className="flex items-center justify-between mb-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>0:23</span>
                            <span className="flex-1 mx-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                              <span className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full" style={{width: '30%'}}></span>
                            </span>
                            <span>3:45</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <button className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded">⏪ -10s</button>
                            <button className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded">-5s</button>
                            <button className="p-2 bg-blue-500 text-white rounded-full">▶️</button>
                            <button className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded">+5s</button>
                            <button className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded">+10s ⏩</button>
                            <select className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded">
                              <option>1x</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Playback Speed</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-3">Choose from 6 playback speeds:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x'].map((speed) => (
                          <div key={speed} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 text-center">
                            <span className="font-mono text-gray-900 dark:text-white">{speed}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        <strong>Tip:</strong> Use 1.5x-2x for faster review, 0.5x-0.75x for detailed analysis
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skip Controls</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• <strong>-10s / +10s buttons:</strong> Quick navigation for long content</p>
                      <p className="text-gray-700 dark:text-gray-300">• <strong>-5s / +5s buttons:</strong> Precise positioning</p>
                      <p className="text-gray-700 dark:text-gray-300">• <strong>Progress bar:</strong> Click anywhere to jump to that time</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Word-Level Sync</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• <strong>Click any word</strong> in the transcript to jump to that timestamp</p>
                      <p className="text-gray-700 dark:text-gray-300">• <strong>Auto-highlight:</strong> Current word highlighted during playback</p>
                      <p className="text-gray-700 dark:text-gray-300">• <strong>Auto-scroll:</strong> Transcript automatically scrolls to keep current word visible</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Insights */}
            <section id="insights" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🤖</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights (LeMUR)</h2>
                    <p className="text-gray-600 dark:text-gray-400">Powered by Large Language Models</p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Navigate to the "AI Insights" tab on any transcript to access these features:
                </p>

                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      Generate Summary
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Get an AI-powered summary of your transcript in seconds.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm space-y-1">
                      <p className="text-gray-700 dark:text-gray-300">1. Click "Generate Summary" button</p>
                      <p className="text-gray-700 dark:text-gray-300">2. Wait a few seconds for processing</p>
                      <p className="text-gray-700 dark:text-gray-300">3. Review the concise summary</p>
                      <p className="text-gray-700 dark:text-gray-300">4. Copy or save for later use</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      Extract Action Items
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Automatically identify tasks, to-dos, and next steps mentioned in the content.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">Perfect for meeting recordings, project discussions, and planning sessions.</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      Key Points
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Extract the most important points and main ideas.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">Great for lectures, presentations, and long-form content.</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      Q&A System
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Ask questions about your transcript and get AI-powered answers.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm space-y-1">
                      <p className="text-gray-700 dark:text-gray-300">1. Switch to "Q&A" tab</p>
                      <p className="text-gray-700 dark:text-gray-300">2. Type your question (e.g., "What was the main conclusion?")</p>
                      <p className="text-gray-700 dark:text-gray-300">3. Click "Ask Question"</p>
                      <p className="text-gray-700 dark:text-gray-300">4. Get contextual answers based on the transcript</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      Custom Tasks
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Give the AI custom instructions for any analysis you need.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                      <p className="text-gray-700 dark:text-gray-300 mb-2">Examples:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>"Create a bullet-point outline"</li>
                        <li>"Identify all mentioned dates and deadlines"</li>
                        <li>"List technical terms with definitions"</li>
                        <li>"Extract customer feedback themes"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Export & Download */}
            <section id="export" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">📥</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export & Download</h2>
                    <p className="text-gray-600 dark:text-gray-400">5 professional formats with options</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How to Export</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">1. Open any transcript detail page</p>
                      <p className="text-gray-700 dark:text-gray-300">2. Click the "Export" button in the header</p>
                      <p className="text-gray-700 dark:text-gray-300">3. Select your desired format</p>
                      <p className="text-gray-700 dark:text-gray-300">4. Configure export options</p>
                      <p className="text-gray-700 dark:text-gray-300">5. Click "Download"</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Available Formats</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📄 Plain Text (.txt)</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Simple, readable text format</p>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <p>✓ Optional timestamps</p>
                          <p>✓ Optional speaker labels</p>
                          <p>✓ Universal compatibility</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📘 Word Document (.docx)</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Professional formatting</p>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <p>✓ Styled headings</p>
                          <p>✓ Includes insights</p>
                          <p>✓ Editable in Word/Google Docs</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📕 PDF (.pdf)</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Print-ready documents</p>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <p>✓ Professional layout</p>
                          <p>✓ Chapters and sentiment</p>
                          <p>✓ Universal viewing</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎬 SRT Subtitles (.srt)</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Video player subtitles</p>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <p>✓ Time-synced subtitles</p>
                          <p>✓ VLC, YouTube compatible</p>
                          <p>✓ Configurable line length</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:col-span-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎥 WebVTT (.vtt)</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">HTML5 video subtitles</p>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <p>✓ Web-native format</p>
                          <p>✓ Supports styling</p>
                          <p>✓ Modern browser compatible</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Export Options</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-3">Customize your export:</p>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>☑️ Include timestamps (TXT/DOCX/PDF)</li>
                        <li>☑️ Include speaker names (if available)</li>
                        <li>☑️ Include chapters (DOCX/PDF)</li>
                        <li>☑️ Include highlights (DOCX/PDF)</li>
                        <li>☑️ Include all insights (DOCX/PDF)</li>
                        <li>☑️ Show PII redactions (if enabled)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sharing */}
            <section id="sharing" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🔗</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sharing</h2>
                    <p className="text-gray-600 dark:text-gray-400">Secure collaboration features</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Creating a Share Link</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">1. Open any transcript</p>
                      <p className="text-gray-700 dark:text-gray-300">2. Click "Share" button in the header</p>
                      <p className="text-gray-700 dark:text-gray-300">3. Configure sharing options (see below)</p>
                      <p className="text-gray-700 dark:text-gray-300">4. Click "Create Share Link"</p>
                      <p className="text-gray-700 dark:text-gray-300">5. Copy the link and share it!</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Share Options</h3>
                    
                    <div className="space-y-4">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-lg">🔒</span>
                          Password Protection
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Add a password to restrict access to authorized viewers only.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                          <p className="text-gray-700 dark:text-gray-300">• Set a custom password when creating the link</p>
                          <p className="text-gray-700 dark:text-gray-300">• Viewers must enter the password to access</p>
                          <p className="text-gray-700 dark:text-gray-300">• Password is securely hashed (bcrypt)</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-lg">⏰</span>
                          Expiry Date
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Set when the share link should stop working.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                          <p className="text-gray-700 dark:text-gray-300">• Choose a future date/time</p>
                          <p className="text-gray-700 dark:text-gray-300">• Link automatically expires</p>
                          <p className="text-gray-700 dark:text-gray-300">• Great for temporary sharing</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-lg">📥</span>
                          Download Permissions
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Control whether viewers can download the transcript.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                          <p className="text-gray-700 dark:text-gray-300">• Enable: Viewers can export the transcript</p>
                          <p className="text-gray-700 dark:text-gray-300">• Disable: View-only access</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-lg">👁️</span>
                          View Tracking
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          See how many times your shared link has been accessed.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">
                          <p className="text-gray-700 dark:text-gray-300">View count automatically increments with each visit</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Managing Share Links</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• View all share links for a transcript in the Share dialog</p>
                      <p className="text-gray-700 dark:text-gray-300">• Copy link URL with one click</p>
                      <p className="text-gray-700 dark:text-gray-300">• Revoke access by deleting a share link</p>
                      <p className="text-gray-700 dark:text-gray-300">• Create multiple links with different settings</p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <span className="text-green-600 dark:text-green-400">✓</span>
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-300 mb-1">Public View</p>
                        <p className="text-green-800 dark:text-green-300 text-sm">
                          Shared transcripts are accessible at <code className="px-1 bg-green-100 dark:bg-green-900 rounded">/share/[token]</code> - 
                          a clean, read-only view perfect for sharing with clients or team members.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Organization */}
            <section id="organization" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">📁</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage your transcript library</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">History Page</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• Access via "History" link in navigation</p>
                      <p className="text-gray-700 dark:text-gray-300">• View all your transcripts in one place</p>
                      <p className="text-gray-700 dark:text-gray-300">• See title, duration, status, and creation date</p>
                      <p className="text-gray-700 dark:text-gray-300">• Click any transcript to open detail view</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Search & Filter</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Search</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Use the search box to find transcripts by title or content.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sort</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Sort by: Newest first, Oldest first, Title A-Z, Title Z-A
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Filter by Status</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Show: All, Completed only, Processing, Failed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Delete Transcripts</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• Click the delete button (🗑️) on any transcript</p>
                      <p className="text-gray-700 dark:text-gray-300">• Confirm the deletion</p>
                      <p className="text-gray-700 dark:text-gray-300">• Transcript is permanently removed</p>
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-2">⚠️ Deletion is permanent and cannot be undone!</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <span className="text-purple-600 dark:text-purple-400">🔮</span>
                      <div>
                        <p className="font-semibold text-purple-900 dark:text-purple-300 mb-1">Coming Soon</p>
                        <p className="text-purple-800 dark:text-purple-300 text-sm">
                          Folders and tags for advanced organization are coming in a future update!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dark Mode */}
            <section id="dark-mode" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🌙</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dark Mode</h2>
                    <p className="text-gray-600 dark:text-gray-400">Comfortable viewing for any environment</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Switching Themes</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">1. Click the sun/moon icon in the header (top right)</p>
                      <p className="text-gray-700 dark:text-gray-300">2. Choose from three options:</p>
                      <div className="ml-6 space-y-2 mt-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">☀️</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Light Mode</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Always use light theme</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🌙</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Always use dark theme</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💻</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">System</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Match your operating system preference</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Benefits of Dark Mode</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">• Reduced eye strain in low-light environments</p>
                      <p className="text-gray-700 dark:text-gray-300">• Better battery life on OLED screens</p>
                      <p className="text-gray-700 dark:text-gray-300">• Improved focus on content</p>
                      <p className="text-gray-700 dark:text-gray-300">• Modern, sleek appearance</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <span className="text-blue-600 dark:text-blue-400">✨</span>
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Persistent Preference</p>
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                          Your theme choice is saved locally and will persist across browser sessions!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section id="keyboard" className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">⌨️</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                    <p className="text-gray-600 dark:text-gray-400">Power user features for faster navigation</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Playback Shortcuts</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Key</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr>
                            <td className="px-4 py-3">
                              <kbd className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-white">Space</kbd>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Play / Pause audio</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <kbd className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-white">←</kbd>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Skip back 5 seconds</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <kbd className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-white">→</kbd>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Skip forward 5 seconds</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <kbd className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-white">↑</kbd>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Increase playback speed (+0.25x)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <kbd className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-white">↓</kbd>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Decrease playback speed (-0.25x)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <span className="text-yellow-600 dark:text-yellow-400">💡</span>
                      <div>
                        <p className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">Pro Tip</p>
                        <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                          Keyboard shortcuts only work when the transcript page is in focus and you're not typing in an input field.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Workflow Example</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">Reviewing a transcript efficiently:</p>
                      <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>1. Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white">Space</kbd> to start playback</li>
                        <li>2. Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white">↑</kbd> twice to speed up to 1.5x</li>
                        <li>3. Hear something important? Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white">←</kbd> to replay</li>
                        <li>4. Click the word in the transcript to jump to exact timestamp</li>
                        <li>5. Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white">↓</kbd> to slow down for detailed listening</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tips & Best Practices */}
            <section className="scroll-mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">💎</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tips & Best Practices</h2>
                    <p className="text-gray-600 dark:text-gray-400">Get the most out of the platform</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 For Best Accuracy</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Use high-quality audio (clear, minimal background noise)</li>
                      <li>• Enable speaker diarization for multi-person content</li>
                      <li>• Add custom vocabulary for technical terms</li>
                      <li>• Use appropriate language setting</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">⚡ For Faster Workflow</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Use keyboard shortcuts for playback</li>
                      <li>• Set up advanced options as defaults</li>
                      <li>• Export early if you need offline access</li>
                      <li>• Use share links instead of downloading</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔒 For Security</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Enable PII redaction for sensitive content</li>
                      <li>• Use password-protected share links</li>
                      <li>• Set expiry dates on temporary shares</li>
                      <li>• Regularly review and revoke old share links</li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎨 For Better Experience</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Enable dark mode for nighttime work</li>
                      <li>• Use 1.5x speed for faster review</li>
                      <li>• Click words to jump to exact moments</li>
                      <li>• Try LeMUR Q&A for quick answers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Need Help? */}
            <section className="scroll-mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <span className="text-5xl mb-4 block">🤝</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Need More Help?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  If you have questions or run into issues, check out these resources
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Start Transcribing
                  </Link>
                  <Link
                    href="/history"
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    View History
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

