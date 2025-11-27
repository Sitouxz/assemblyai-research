'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ApiKeyIndicator() {
  const { data: session, status } = useSession();
  const [hasUserKey, setHasUserKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchKeyStatus();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchKeyStatus = async () => {
    try {
      const response = await fetch('/api/user/api-keys/assemblyai');
      if (response.ok) {
        const data = await response.json();
        setHasUserKey(data.hasKey);
      }
    } catch (error) {
      console.error('Failed to fetch API key status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // User not logged in
  if (!session) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Using Shared API Key
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              You're using the app's default API key.{' '}
              <Link href="/auth/signin" className="font-medium underline hover:text-blue-900 dark:hover:text-blue-100">
                Sign in
              </Link>
              {' '}and add your own AssemblyAI key to avoid shared limits.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User logged in WITHOUT personal key
  if (!hasUserKey) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              Using Shared App Key
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
              Currently using the app's shared AssemblyAI key. You can{' '}
              <Link href="/settings" className="font-medium underline hover:text-yellow-900 dark:hover:text-yellow-100">
                add your own key in Settings
              </Link>
              {' '}to avoid rate limits.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User logged in WITH personal key
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
            Using Your Personal API Key
          </h3>
          <p className="text-sm text-green-800 dark:text-green-200 mt-1">
            Transcriptions will use your personal AssemblyAI key.{' '}
            <Link href="/settings" className="font-medium underline hover:text-green-900 dark:hover:text-green-100">
              Manage keys
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


