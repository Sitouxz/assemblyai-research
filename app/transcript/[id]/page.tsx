'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import TranscriptViewer from '@/components/TranscriptViewer';
import InsightsPanel from '@/components/InsightsPanel';
import { TranscriptResponse } from '@/lib/types';

export default function TranscriptDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/transcript/${id}`);
    }
  }, [status, router, id]);

  useEffect(() => {
    if (session && id) {
      fetchTranscript();
    }
  }, [session, id]);

  const fetchTranscript = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/transcriptions/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Transcript not found');
        }
        throw new Error('Failed to fetch transcript');
      }

      const data = await response.json();
      
      // Convert database format to TranscriptResponse format
      const transcriptResponse: TranscriptResponse = {
        id: data.assemblyaiId || data.id,
        dbId: data.id,
        text: data.text,
        audioUrl: data.audioUrl || undefined,
        words: data.insights?.words || undefined,
        summary: data.insights?.summary || undefined,
        chapters: data.insights?.chapters || undefined,
        sentiment: data.insights?.sentiment || undefined,
        raw: data,
      };
      
      setTranscript(transcriptResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to load transcript');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transcript...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/history')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  if (!transcript) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/history')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </button>

        <div className="space-y-6">
          <TranscriptViewer transcript={transcript} />
          <InsightsPanel transcript={transcript} />
        </div>
      </div>
    </div>
  );
}

