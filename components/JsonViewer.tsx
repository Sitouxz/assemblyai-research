'use client';

import { useState } from 'react';

interface JsonViewerProps {
  data: any;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) {
    return null;
  }

  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          Developer JSON View
        </h2>
        <span className="text-gray-500 text-sm">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 p-4 bg-gray-900">
          <pre className="json-viewer text-xs text-gray-100 overflow-x-auto overflow-y-auto max-h-96 whitespace-pre-wrap font-mono">
            {formattedJson}
          </pre>
        </div>
      )}
    </div>
  );
}

