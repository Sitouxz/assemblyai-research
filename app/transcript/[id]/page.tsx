'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import TranscriptViewer from '@/components/TranscriptViewer';
import InsightsPanel from '@/components/InsightsPanel';
import ExportMenu from '@/components/ExportMenu';
import ShareDialog from '@/components/ShareDialog';
import { TranscriptResponse } from '@/lib/types';

export default function TranscriptDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
  const [transcriptTitle, setTranscriptTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

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
      
      setTranscriptTitle(data.title || 'Untitled');
      
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
        entities: data.insights?.entities || undefined,
        iab_categories: data.insights?.iab_categories || undefined,
        content_safety_labels: data.insights?.content_safety_labels || undefined,
        auto_highlights_result: data.insights?.auto_highlights || undefined,
        raw: {
          ...data,
          // Include analytics in raw for reference
          deliveryMetrics: data.deliveryMetrics,
          pronunciation: data.pronunciation,
          voiceEmotion: data.voiceEmotion,
        },
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading transcript...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
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
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to History
          </button>

          <div className="flex items-center gap-3">
            <ExportMenu transcriptId={id} transcriptTitle={transcriptTitle} />
            <button
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <TranscriptViewer transcript={transcript} />
          <InsightsPanel 
            transcript={transcript}
            deliveryMetrics={transcript.raw?.deliveryMetrics || null}
            pronunciation={transcript.raw?.pronunciation || null}
            voiceEmotion={transcript.raw?.voiceEmotion || null}
          />
        </div>

        {/* Share Dialog */}
        <ShareDialog
          transcriptId={id}
          transcriptTitle={transcriptTitle}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      </div>
    </div>
  );
}

