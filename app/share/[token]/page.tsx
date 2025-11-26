'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TranscriptViewer from '@/components/TranscriptViewer';
import InsightsPanel from '@/components/InsightsPanel';
import { TranscriptResponse } from '@/lib/types';

export default function SharedTranscriptPage() {
  const params = useParams();
  const token = params.token as string;

  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    if (token) {
      fetchShareLink();
    }
  }, [token]);

  const fetchShareLink = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/share/${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 410) {
          throw new Error('This share link has expired.');
        }
        throw new Error(errorData.error || 'Failed to load shared transcript');
      }

      const data = await response.json();

      if (data.requiresPassword) {
        setRequiresPassword(true);
        setCanDownload(data.canDownload);
      } else {
        // No password required, show transcript
        setTranscript(convertToTranscriptResponse(data.transcript));
        setCanDownload(data.canDownload);
        setRequiresPassword(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load shared transcript');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/share/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid password');
      }

      const data = await response.json();
      setTranscript(convertToTranscriptResponse(data.transcript));
      setCanDownload(data.canDownload);
      setRequiresPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to verify password');
    } finally {
      setIsLoading(false);
    }
  };

  const convertToTranscriptResponse = (data: any): TranscriptResponse => {
    const insights = data.insights || {};
    return {
      id: data.id,
      text: data.text,
      words: insights.words,
      audioUrl: data.audioUrl || undefined,
      summary: insights.summary,
      chapters: insights.chapters,
      sentiment: insights.sentiment,
      entities: insights.entities,
      iab_categories: insights.iab_categories,
      content_safety_labels: insights.content_safety_labels,
      auto_highlights_result: insights.auto_highlights,
      raw: {},
    };
  };

  const handleExport = (format: string) => {
    if (!canDownload) {
      alert('Downloads are not allowed for this shared link.');
      return;
    }

    // Since we don't have the database ID, we'll implement client-side export
    alert(`Export as ${format} - This feature requires server-side access.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared transcript...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Protected
              </h2>
              <p className="text-gray-600">
                This transcript is password protected. Please enter the password to view it.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Access Transcript'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!transcript) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Shared Transcript
              </h3>
              <p className="text-sm text-blue-700">
                You're viewing a shared transcript. {canDownload ? 'You can export this transcript.' : 'Downloads are disabled for this link.'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <TranscriptViewer transcript={transcript} />
          <InsightsPanel transcript={transcript} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Want to create your own transcripts?
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try AssemblyAI Playground
          </a>
        </div>
      </div>
    </div>
  );
}

