'use client';

import { useState } from 'react';
import { TranscriptionOptions } from '@/lib/types';

interface AdvancedOptionsProps {
  options: TranscriptionOptions;
  onChange: (options: TranscriptionOptions) => void;
  disabled?: boolean;
}

export default function AdvancedOptions({ options, onChange, disabled }: AdvancedOptionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const updateOption = (key: keyof TranscriptionOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Basic Options - Always Visible */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Basic Options</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoChapters"
            checked={options.auto_chapters || false}
            onChange={(e) => updateOption('auto_chapters', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            disabled={disabled}
          />
          <label htmlFor="autoChapters" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Auto chapters / topics
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="sentimentAnalysis"
            checked={options.sentiment_analysis || false}
            onChange={(e) => updateOption('sentiment_analysis', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            disabled={disabled}
          />
          <label htmlFor="sentimentAnalysis" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Sentiment analysis
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="entityDetection"
            checked={options.entity_detection || false}
            onChange={(e) => updateOption('entity_detection', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            disabled={disabled}
          />
          <label htmlFor="entityDetection" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Entity detection (names, organizations, etc.)
          </label>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        disabled={disabled}
      >
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Speaker Diarization */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <button
              type="button"
              onClick={() => toggleSection('speakers')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              disabled={disabled}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">Speaker Diarization</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  activeSection === 'speakers' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeSection === 'speakers' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="speakerLabels"
                    checked={options.speaker_labels || false}
                    onChange={(e) => updateOption('speaker_labels', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <label htmlFor="speakerLabels" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable speaker labels
                  </label>
                </div>
                
                {options.speaker_labels && (
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Expected speakers (optional)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={options.speakers_expected || ''}
                      onChange={(e) => updateOption('speakers_expected', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Auto-detect"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PII Redaction */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <button
              type="button"
              onClick={() => toggleSection('pii')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              disabled={disabled}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">PII Redaction</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  activeSection === 'pii' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeSection === 'pii' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="redactPii"
                    checked={options.redact_pii || false}
                    onChange={(e) => updateOption('redact_pii', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <label htmlFor="redactPii" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Redact PII from transcript
                  </label>
                </div>
                
                {options.redact_pii && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="redactPiiAudio"
                        checked={options.redact_pii_audio || false}
                        onChange={(e) => updateOption('redact_pii_audio', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        disabled={disabled}
                      />
                      <label htmlFor="redactPiiAudio" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Generate redacted audio (beeps over PII)
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Redaction method
                      </label>
                      <select
                        value={options.redact_pii_sub || 'hash'}
                        onChange={(e) => updateOption('redact_pii_sub', e.target.value as 'hash' | 'entity_name')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={disabled}
                      >
                        <option value="hash">Hash (e.g., "[PERSON_NAME]")</option>
                        <option value="entity_name">Entity name (e.g., "John Doe")</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Types to redact
                      </label>
                      <div className="space-y-2 text-xs">
                        {['phone_number', 'email_address', 'credit_card_number', 'ssn', 'date_of_birth', 'person_name', 'location', 'banking_information'].map((policy) => (
                          <div key={policy} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`pii-${policy}`}
                              checked={(options.redact_pii_policies || []).includes(policy)}
                              onChange={(e) => {
                                const current = options.redact_pii_policies || [];
                                const updated = e.target.checked
                                  ? [...current, policy]
                                  : current.filter(p => p !== policy);
                                updateOption('redact_pii_policies', updated);
                              }}
                              className="w-3 h-3 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                              disabled={disabled}
                            />
                            <label htmlFor={`pii-${policy}`} className="ml-2 text-gray-700 dark:text-gray-300">
                              {policy.replace(/_/g, ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Additional Features */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <button
              type="button"
              onClick={() => toggleSection('additional')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              disabled={disabled}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">Additional Features</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  activeSection === 'additional' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeSection === 'additional' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoHighlights"
                    checked={options.auto_highlights || false}
                    onChange={(e) => updateOption('auto_highlights', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <label htmlFor="autoHighlights" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Auto highlights (key phrases)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="iabCategories"
                    checked={options.iab_categories || false}
                    onChange={(e) => updateOption('iab_categories', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <label htmlFor="iabCategories" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    IAB topic categories
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="contentSafety"
                    checked={options.content_safety || false}
                    onChange={(e) => updateOption('content_safety', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <label htmlFor="contentSafety" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Content moderation / safety
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="disfluencies"
                    checked={options.disfluencies || false}
                    onChange={(e) => updateOption('disfluencies', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <label htmlFor="disfluencies" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Remove disfluencies (uh, um, etc.)
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Custom prompt/instructions
                  </label>
                  <textarea
                    value={options.custom_prompt || ''}
                    onChange={(e) => updateOption('custom_prompt', e.target.value)}
                    placeholder="Optional: Provide custom instructions for the model"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    disabled={disabled}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

