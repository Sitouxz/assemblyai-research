'use client';

import { useState, useEffect } from 'react';

interface ApiKeyStatus {
  hasKey: boolean;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ApiKeyManager() {
  const [status, setStatus] = useState<ApiKeyStatus>({ hasKey: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchKeyStatus();
  }, []);

  const fetchKeyStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/api-keys/assemblyai');
      
      if (!response.ok) {
        throw new Error('Failed to fetch API key status');
      }
      
      const data = await response.json();
      setStatus(data);
      setShowForm(!data.hasKey);
    } catch (err: any) {
      setError(err.message || 'Failed to load API key information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/api-keys/assemblyai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          label: label.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save API key');
      }

      const data = await response.json();
      setStatus(data);
      setShowForm(false);
      setApiKey('');
      setLabel('');
      setSuccess('API key saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your AssemblyAI API key? You will fall back to using the shared app key.')) {
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/api-keys/assemblyai', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete API key');
      }

      const data = await response.json();
      setStatus(data);
      setShowForm(true);
      setSuccess('API key removed successfully');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete API key');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AssemblyAI API Key Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                AssemblyAI API Key
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add your own AssemblyAI API key to avoid shared rate limits and ensure dedicated access.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Get your API key from the{' '}
                  <a
                    href="https://www.assemblyai.com/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    AssemblyAI Dashboard
                  </a>
                  . Your key is encrypted and stored securely.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          {/* Current Key Status */}
          {status.hasKey && !showForm && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    AssemblyAI key connected
                  </p>
                  {status.label && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                      {status.label}
                    </p>
                  )}
                  {status.updatedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                      Last updated: {new Date(status.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Update Key
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Removing...' : 'Remove Key'}
                </button>
              </div>
            </div>
          )}

          {/* Add/Update Form */}
          {showForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your AssemblyAI API key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., My AssemblyAI Key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save API Key'}
                </button>
                {status.hasKey && (
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setApiKey('');
                      setLabel('');
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          🔒 Security
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Your API key is encrypted using AES-256-GCM before being stored in the database.
          It is never exposed to the client and is only decrypted server-side when making requests to AssemblyAI.
        </p>
      </div>
    </div>
  );
}





