'use client';

import { useState } from 'react';

interface LeMURPanelProps {
  transcriptId: string;
  onGenerate: (type: string, question?: string, context?: any) => Promise<any>;
}

export default function LeMURPanel({ transcriptId, onGenerate }: LeMURPanelProps) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (type: string) => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const payload: any = { type };
      
      if (type === 'qa' && question.trim()) {
        payload.question = question.trim();
      } else if (type === 'custom' && customPrompt.trim()) {
        payload.context = { custom_prompt: customPrompt.trim() };
      }

      const response = await fetch(`/api/transcriptions/${transcriptId}/lemur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          AI-Powered Insights (LeMUR)
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Use AssemblyAI's LeMUR to generate summaries, extract action items, answer questions, and more.
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => {
              setActiveType('summary');
              handleGenerate('summary');
            }}
            disabled={isLoading}
            className="px-4 py-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📝 Generate Summary
          </button>
          <button
            onClick={() => {
              setActiveType('action_items');
              handleGenerate('action_items');
            }}
            disabled={isLoading}
            className="px-4 py-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✅ Extract Action Items
          </button>
          <button
            onClick={() => {
              setActiveType('key_points');
              handleGenerate('key_points');
            }}
            disabled={isLoading}
            className="px-4 py-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💡 Key Points
          </button>
          <button
            onClick={() => setActiveType('qa')}
            disabled={isLoading}
            className="px-4 py-3 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❓ Ask a Question
          </button>
        </div>

        {/* Q&A Interface */}
        {activeType === 'qa' && (
          <div className="border border-gray-200 rounded-md p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask a question about the transcript
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What were the main topics discussed?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleGenerate('qa')}
              disabled={isLoading || !question.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Get Answer'}
            </button>
          </div>
        )}

        {/* Custom Prompt Interface */}
        {activeType === 'custom' && (
          <div className="border border-gray-200 rounded-md p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom task prompt
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Identify all technical terms mentioned and provide brief explanations"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isLoading}
            />
            <button
              onClick={() => handleGenerate('custom')}
              disabled={isLoading || !customPrompt.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Generating insights...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && !isLoading && (
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-green-600">✓</span> Result
            </h4>
            <div className="prose prose-sm max-w-none">
              {activeType === 'qa' && result.response ? (
                <div>
                  <p className="text-gray-900 whitespace-pre-wrap">{result.response[0].answer}</p>
                </div>
              ) : activeType === 'action_items' && result.response ? (
                <div className="space-y-2">
                  {result.response.split('\n').filter((item: string) => item.trim()).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-gray-900">{item.replace(/^[-•]\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              ) : result.response ? (
                <p className="text-gray-900 whitespace-pre-wrap">{result.response}</p>
              ) : (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          </div>
        )}

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setActiveType(activeType === 'custom' ? null : 'custom')}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          disabled={isLoading}
        >
          {activeType === 'custom' ? 'Hide' : 'Show'} Custom Prompt
        </button>
      </div>
    </div>
  );
}

