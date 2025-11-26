'use client';

import { useState, useEffect } from 'react';

interface ShareDialogProps {
  transcriptId: string;
  transcriptTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareLink {
  id: string;
  token: string;
  expiresAt: string | null;
  canDownload: boolean;
  canComment: boolean;
  createdAt: string;
  viewCount: number;
  hasPassword: boolean;
}

export default function ShareDialog({ transcriptId, transcriptTitle, isOpen, onClose }: ShareDialogProps) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [canDownload, setCanDownload] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchShareLinks();
    }
  }, [isOpen]);

  const fetchShareLinks = async () => {
    try {
      const response = await fetch(`/api/transcriptions/${transcriptId}/share`);
      if (response.ok) {
        const data = await response.json();
        setShareLinks(data.shareLinks);
      }
    } catch (error) {
      console.error('Failed to fetch share links:', error);
    }
  };

  const handleCreateLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transcriptions/${transcriptId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password || undefined,
          expiresAt: expiresAt || undefined,
          canDownload,
        }),
      });

      if (response.ok) {
        await fetchShareLinks();
        setShowCreateForm(false);
        setPassword('');
        setExpiresAt('');
        setCanDownload(true);
      }
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this share link?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transcriptions/${transcriptId}/share/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchShareLinks();
      }
    } catch (error) {
      console.error('Failed to delete share link:', error);
    }
  };

  const copyToClipboard = async (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Share Transcript</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Create a shareable link to this transcript. You can protect it with a password and set an expiry date.
            </p>

            {/* Create Link Button */}
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-6"
              >
                + Create New Share Link
              </button>
            )}

            {/* Create Form */}
            {showCreateForm && (
              <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-4">New Share Link</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password (optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expires at (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canDownload"
                      checked={canDownload}
                      onChange={(e) => setCanDownload(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="canDownload" className="ml-2 text-sm text-gray-700">
                      Allow downloads
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateLink}
                      disabled={isLoading}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {isLoading ? 'Creating...' : 'Create Link'}
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Links */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Active Share Links</h3>

              {shareLinks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No share links created yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {shareLinks.map((link) => (
                    <div
                      key={link.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {link.hasPassword && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                🔒 Password Protected
                              </span>
                            )}
                            {link.expiresAt && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Expires {new Date(link.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                            {!link.canDownload && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                No Downloads
                              </span>
                            )}
                          </div>
                          <code className="text-xs text-gray-600 break-all">
                            {window.location.origin}/share/{link.token}
                          </code>
                          <p className="text-xs text-gray-500 mt-1">
                            {link.viewCount} views • Created {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => copyToClipboard(link.token)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {copiedToken === link.token ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

