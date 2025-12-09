import { useState, useRef, useCallback, useEffect } from 'react';

interface UseRecorderReturn {
  isRecording: boolean;
  recordedBlob: Blob | null;
  durationMs: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
}

/**
 * Custom hook for recording audio using the MediaRecorder API
 * Returns audio as a WebM blob suitable for transcription
 */
export function useRecorder(): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to stop tracks and clear timer
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      streamRef.current = stream;

      // Determine supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, 
        mimeType ? { mimeType } : undefined
      );

      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        setRecordedBlob(blob);
        setIsRecording(false);
        cleanup();
      };

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
        setIsRecording(false);
        cleanup();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      // Start timer
      startTimeRef.current = Date.now();
      setDurationMs(0);
      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);

      setIsRecording(true);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access to record.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Failed to start recording: ${err.message || 'Unknown error'}`);
      }
      
      cleanup();
    }
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    setDurationMs(0);
    setError(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    recordedBlob,
    durationMs,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}





