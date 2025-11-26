'use client';

import { useState } from 'react';

interface ExportMenuProps {
  transcriptId: string;
  transcriptTitle: string;
}

export default function ExportMenu({ transcriptId, transcriptTitle }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    timestamps: true,
    speakers: true,
    insights: true,
  });

  const handleExport = async (format: string, insightsOnly = false) => {
    const params = new URLSearchParams();
    params.set('format', format);
    
    if (!insightsOnly) {
      params.set('timestamps', options.timestamps.toString());
      params.set('speakers', options.speakers.toString());
      params.set('insights', options.insights.toString());
    } else {
      params.set('insightsOnly', 'true');
    }

    // Trigger download
    const url = `/api/transcriptions/${transcriptId}/export?${params}`;
    window.open(url, '_blank');
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* Export Format Options */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Export Format</h3>
              
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => handleExport('txt')}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">Plain Text (.txt)</div>
                  <div className="text-xs text-gray-600">Simple text format</div>
                </button>

                <button
                  onClick={() => handleExport('docx')}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">Word Document (.docx)</div>
                  <div className="text-xs text-gray-600">Formatted document</div>
                </button>

                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">PDF (.pdf)</div>
                  <div className="text-xs text-gray-600">Printable format</div>
                </button>

                <button
                  onClick={() => handleExport('srt')}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">Subtitles (.srt)</div>
                  <div className="text-xs text-gray-600">For video players</div>
                </button>

                <button
                  onClick={() => handleExport('vtt')}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">WebVTT (.vtt)</div>
                  <div className="text-xs text-gray-600">For web videos</div>
                </button>

                <button
                  onClick={() => handleExport('txt', true)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors border-t border-gray-200 mt-2 pt-3"
                >
                  <div className="font-medium text-gray-900">Insights Only</div>
                  <div className="text-xs text-gray-600">Summary, chapters, entities</div>
                </button>
              </div>

              {/* Options Toggle */}
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Export Options
              </button>

              {showOptions && (
                <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="timestamps"
                      checked={options.timestamps}
                      onChange={(e) => setOptions({ ...options, timestamps: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="timestamps" className="ml-2 text-sm text-gray-700">
                      Include timestamps
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="speakers"
                      checked={options.speakers}
                      onChange={(e) => setOptions({ ...options, speakers: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="speakers" className="ml-2 text-sm text-gray-700">
                      Include speaker labels
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="insights"
                      checked={options.insights}
                      onChange={(e) => setOptions({ ...options, insights: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="insights" className="ml-2 text-sm text-gray-700">
                      Include insights
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

