'use client';

import PatchNotes from '@/components/PatchNotes';

export default function ChangelogPage() {
  return (
    <main className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Changelog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            All updates, new features, and improvements to the platform
          </p>
        </div>
        <PatchNotes />
      </div>
    </main>
  );
}

