'use client';

import { TranscriptionStatus } from '@/lib/types';

interface StatusIndicatorProps {
  status: TranscriptionStatus;
  error?: string | null;
}

export default function StatusIndicator({ status, error }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case TranscriptionStatus.UPLOADING:
        return {
          label: 'Uploading',
          icon: '📤',
          color: 'bg-blue-100 text-blue-800',
          step: 1,
        };
      case TranscriptionStatus.QUEUED:
        return {
          label: 'Queued',
          icon: '⏳',
          color: 'bg-yellow-100 text-yellow-800',
          step: 2,
        };
      case TranscriptionStatus.PROCESSING:
        return {
          label: 'Processing',
          icon: '⚙️',
          color: 'bg-purple-100 text-purple-800',
          step: 3,
        };
      case TranscriptionStatus.COMPLETED:
        return {
          label: 'Completed',
          icon: '✅',
          color: 'bg-green-100 text-green-800',
          step: 4,
        };
      case TranscriptionStatus.ERROR:
        return {
          label: 'Error',
          icon: '❌',
          color: 'bg-red-100 text-red-800',
          step: 4,
        };
      default:
        return {
          label: 'Idle',
          icon: '⚪',
          color: 'bg-gray-100 text-gray-800',
          step: 0,
        };
    }
  };

  const config = getStatusConfig();
  const steps = [
    { label: 'Uploading', num: 1 },
    { label: 'Queued', num: 2 },
    { label: 'Processing', num: 3 },
    { label: 'Completed', num: 4 },
  ];

  const isProcessing = status === TranscriptionStatus.PROCESSING || 
                       status === TranscriptionStatus.UPLOADING ||
                       status === TranscriptionStatus.QUEUED;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Status</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
          <span className="mr-2">{config.icon}</span>
          {config.label}
        </span>
      </div>

      {/* Step Indicator */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => {
            const isActive = step.num <= config.step && status !== TranscriptionStatus.ERROR;
            const isCurrent = step.num === config.step;
            
            return (
              <div key={step.num} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  } ${isCurrent && isProcessing ? 'animate-pulse' : ''}`}
                >
                  {step.num}
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div
            className={`h-full transition-all duration-300 ${
              status === TranscriptionStatus.ERROR
                ? 'bg-red-500'
                : status === TranscriptionStatus.COMPLETED
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
            style={{
              width: `${(config.step / 4) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Progress Message */}
      {isProcessing && (
        <div className="mt-4 flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          <p className="text-sm">
            {status === TranscriptionStatus.UPLOADING && 'Uploading your file...'}
            {status === TranscriptionStatus.QUEUED && 'Your file is in the queue...'}
            {status === TranscriptionStatus.PROCESSING && 'Transcribing audio... This may take a moment.'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {status === TranscriptionStatus.ERROR && error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800 font-medium">Error:</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}

