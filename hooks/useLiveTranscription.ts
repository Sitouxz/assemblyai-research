import { useState, useRef, useCallback, useEffect } from 'react';
import { StreamingTurn } from '@/lib/types';

type StreamingStatus = 
  | 'idle' 
  | 'requestingMic' 
  | 'connecting' 
  | 'streaming' 
  | 'stopping' 
  | 'error';

interface UseLiveTranscriptionReturn {
  status: StreamingStatus;
  transcriptTurns: StreamingTurn[];
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  getFullTranscript: () => string;
}

/**
 * Custom hook for real-time streaming transcription using AssemblyAI's Streaming API
 * Handles WebSocket connection, audio streaming, and turn-based transcript collection
 */
export function useLiveTranscription(): UseLiveTranscriptionReturn {
  const [status, setStatus] = useState<StreamingStatus>('idle');
  const [transcriptTurns, setTranscriptTurns] = useState<StreamingTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Convert Float32Array to Int16Array (PCM16)
  const float32ToInt16 = useCallback((buffer: Float32Array): Int16Array => {
    const int16 = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }, []);

  // Downsample buffer to target sample rate
  const downsampleBuffer = useCallback(
    (buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array => {
      if (inputSampleRate === outputSampleRate) {
        return buffer;
      }
      const sampleRateRatio = inputSampleRate / outputSampleRate;
      const newLength = Math.round(buffer.length / sampleRateRatio);
      const result = new Float32Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
        }
        result[offsetResult] = accum / count;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
      return result;
    },
    []
  );

  const start = useCallback(async () => {
    try {
      setError(null);
      setStatus('requestingMic');

      // Step 1: Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      // Step 2: Get temporary streaming token from backend
      setStatus('connecting');
      const tokenResponse = await fetch('/api/assemblyai/stream-token');
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || 'Failed to get streaming token');
      }
      const { token } = await tokenResponse.json();
      console.log('Received streaming token:', token ? 'Token received' : 'No token');

      // Step 3: Create AudioContext for audio processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Target sample rate for AssemblyAI (16kHz)
      const targetSampleRate = 16000;
      const inputSampleRate = audioContext.sampleRate;

      // Step 4: Open WebSocket connection to AssemblyAI
      // SDK v4.x uses the v3 streaming endpoint with temporary tokens
      // Important: Must use streaming.assemblyai.com (not api.assemblyai.com) for v3
      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=${targetSampleRate}&token=${encodeURIComponent(token)}`;
      console.log('Connecting to WebSocket v3 with sample rate:', targetSampleRate);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('streaming');

        // Create audio processor
        const bufferSize = 4096;
        const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Downsample if needed
            const downsampled = downsampleBuffer(inputData, inputSampleRate, targetSampleRate);
            
            // Convert to PCM16
            const pcm16 = float32ToInt16(downsampled);
            
            // v3 API expects raw PCM16 audio data sent as binary (not JSON)
            // Send the Int16Array buffer directly as binary WebSocket message
            ws.send(pcm16.buffer);
          }
        };

        // Connect audio pipeline
        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);
          
          // v3 API uses 'type' field instead of 'message_type'
          const messageType = data.type || data.message_type;
          
          if (messageType === 'Begin') {
            console.log('Session began:', data.id);
          } else if (messageType === 'Turn') {
            // v3 uses "Turn" events with transcript text
            const transcriptText = data.transcript || '';
            const isEndOfTurn = data.end_of_turn === true;
            
            if (transcriptText.trim()) {
              setTranscriptTurns(prev => {
                const newTurns = [...prev];
                const lastTurn = newTurns[newTurns.length - 1];
                
                if (!isEndOfTurn && lastTurn && !lastTurn.endOfTurn) {
                  // Update existing partial turn (user is still speaking)
                  newTurns[newTurns.length - 1] = {
                    ...lastTurn,
                    text: transcriptText,
                  };
                } else if (isEndOfTurn && lastTurn && !lastTurn.endOfTurn) {
                  // Finalize the current partial turn
                  newTurns[newTurns.length - 1] = {
                    ...lastTurn,
                    text: transcriptText,
                    endOfTurn: true,
                  };
                } else {
                  // Create new turn (either new partial or new finalized)
                  newTurns.push({
                    id: `turn-${Date.now()}-${Math.random()}`,
                    text: transcriptText,
                    endOfTurn: isEndOfTurn,
                    createdAt: new Date(),
                  });
                }
                return newTurns;
              });
            }
          } else if (messageType === 'SessionTerminated' || messageType === 'End') {
            console.log('Session terminated');
          } else {
            // Log unknown message types for debugging
            console.log('Unknown message type:', messageType, data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err, event.data);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
        setStatus('error');
        cleanup();
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          currentStatus: status
        });
        
        // Provide more specific error messages based on close code
        if (status !== 'stopping' && status !== 'error') {
          let errorMsg = 'Connection closed unexpectedly';
          
          if (event.code === 1008) {
            errorMsg = 'Authentication failed. Please check your API key.';
          } else if (event.code === 1002) {
            errorMsg = 'Protocol error. Invalid token or connection parameters.';
          } else if (event.reason) {
            errorMsg = `Connection closed: ${event.reason}`;
          }
          
          setError(errorMsg);
          setStatus('error');
        } else {
          setStatus('idle');
        }
        cleanup();
      };

    } catch (err: any) {
      console.error('Failed to start live transcription:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(err.message || 'Failed to start live transcription');
      }
      
      setStatus('error');
      cleanup();
    }
  }, [status, cleanup, downsampleBuffer, float32ToInt16]);

  const stop = useCallback(() => {
    setStatus('stopping');
    
    // Send terminate message if WebSocket is open (v3 format)
    // Control messages like Terminate are sent as JSON
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
    }
    
    cleanup();
    setStatus('idle');
  }, [cleanup]);

  const reset = useCallback(() => {
    stop();
    setTranscriptTurns([]);
    setError(null);
  }, [stop]);

  const getFullTranscript = useCallback(() => {
    return transcriptTurns
      .filter(turn => turn.text.trim())
      .map(turn => turn.text)
      .join('\n');
  }, [transcriptTurns]);

  return {
    status,
    transcriptTurns,
    error,
    start,
    stop,
    reset,
    getFullTranscript,
  };
}

