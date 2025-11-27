# Feature Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser UI                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │  Upload  │  │  Record  │  │         Live             │  │
│  │   Tab    │  │   Tab    │  │         Tab              │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │              │                    │
          │              │                    │
          ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Hooks                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │              │  │ useRecorder  │  │useLiveTranscript │  │
│  │   (none)     │  │              │  │     ion          │  │
│  │              │  │ MediaRecorder│  │  WebSocket +     │  │
│  │              │  │     API      │  │  AudioContext    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │              │                    │
          │              │                    │
          ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │              │  │              │  │  /api/assemblyai │  │
│  │     /api/    │  │     /api/    │  │  /stream-token   │  │
│  │  transcribe  │  │  transcribe  │  │        +         │  │
│  │              │  │              │  │ /api/transcript  │  │
│  │              │  │              │  │     ions/live    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │              │                    │
          │              │                    │
          ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  AssemblyAI SDK                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  transcripts │  │  transcripts │  │    streaming.    │  │
│  │ .transcribe()│  │ .transcribe()│  │createTemporary   │  │
│  │              │  │              │  │     Token()      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │              │                    │
          │              │                    │
          ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   AssemblyAI API                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Standard   │  │   Standard   │  │   Streaming      │  │
│  │Transcription │  │Transcription │  │   WebSocket      │  │
│  │     API      │  │     API      │  │    wss://...     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │              │                    │
          │              │                    │
          ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Transcript Table                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │sourceType│  │sourceType│  │   sourceType     │   │  │
│  │  │: 'upload'│  │:'recording'│ │   : 'stream'    │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1️⃣ Upload Flow (Existing)
```
User selects file
   → FormData upload
      → /api/transcribe
         → AssemblyAI transcripts.transcribe()
            → Store in DB (sourceType: 'upload')
               → Display results
```

### 2️⃣ Record & Transcribe Flow (NEW)
```
User clicks "Start Recording"
   → useRecorder hook
      → MediaRecorder API
         → Collect audio chunks
            → Create Blob → Convert to File
               → FormData upload
                  → /api/transcribe
                     → AssemblyAI transcripts.transcribe()
                        → Store in DB (sourceType: 'recording')
                           → Display results
```

### 3️⃣ Live Transcription Flow (NEW)
```
User clicks "Start Live"
   → useLiveTranscription hook
      → Fetch /api/assemblyai/stream-token
         → Receive temporary token
            → Open WebSocket to AssemblyAI
               → Stream audio chunks (PCM16, 16kHz)
                  ← Receive transcript turns
                     → Display in real-time
                        → User clicks "Stop"
                           → Optional: POST /api/transcriptions/live
                              → Store in DB (sourceType: 'stream')
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Client                             │
│  ❌ Never receives long-lived API key                    │
│  ✅ Only receives temporary streaming tokens             │
└──────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────┐
│                     Backend Server                        │
│  ✅ Stores long-lived API key in .env                    │
│  ✅ Generates temporary tokens (8 min expiration)        │
│  ✅ User API keys encrypted in database                  │
│  ✅ Auth required for saving transcripts                 │
└──────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌──────────────────────────────────────────────────────────┐
│                    AssemblyAI API                         │
│  ✅ Validates API keys                                   │
│  ✅ Validates temporary tokens                           │
│  ✅ Rate limiting & usage tracking                       │
└──────────────────────────────────────────────────────────┘
```

---

## Component Tree

```
app/page.tsx
├─ Tab Navigation
│  ├─ Upload Tab
│  ├─ Record Tab
│  └─ Live Tab
│
├─ UploadCard (existing)
│  ├─ File dropzone
│  ├─ URL input
│  └─ AdvancedOptions
│
├─ RecordCard (NEW)
│  ├─ useRecorder hook
│  ├─ Recording controls
│  ├─ Audio preview
│  └─ AdvancedOptions
│
└─ LiveTranscriptionCard (NEW)
   ├─ useLiveTranscription hook
   ├─ Status indicator
   ├─ Transcript display
   └─ Save controls
```

---

## State Management

### Upload/Record Modes
```typescript
const [transcript, setTranscript] = useState<TranscriptResponse | null>(null);
const [status, setStatus] = useState<TranscriptionStatus>(IDLE);
const [error, setError] = useState<string | null>(null);
```

### Recording State (useRecorder)
```typescript
{
  isRecording: boolean,
  recordedBlob: Blob | null,
  durationMs: number,
  error: string | null,
  startRecording: () => Promise<void>,
  stopRecording: () => void,
  resetRecording: () => void
}
```

### Live Transcription State (useLiveTranscription)
```typescript
{
  status: 'idle' | 'requestingMic' | 'connecting' | 'streaming' | 'stopping' | 'error',
  transcriptTurns: StreamingTurn[],
  error: string | null,
  start: () => Promise<void>,
  stop: () => void,
  reset: () => void,
  getFullTranscript: () => string
}
```

---

## Database Schema

```sql
-- Transcript table (simplified)
CREATE TABLE "Transcript" (
    id              TEXT PRIMARY KEY,
    userId          TEXT NOT NULL,
    title           TEXT NOT NULL,
    audioUrl        TEXT,
    audioSource     TEXT,          -- Legacy: 'file' | 'url'
    sourceType      TEXT,          -- NEW: 'upload' | 'url' | 'recording' | 'stream'
    text            TEXT NOT NULL,
    duration        REAL,
    status          TEXT DEFAULT 'completed',
    assemblyaiId    TEXT,
    config          TEXT,          -- JSON
    insights        TEXT,          -- JSON
    createdAt       TIMESTAMP DEFAULT NOW(),
    updatedAt       TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

---

## API Endpoints

### New Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/assemblyai/stream-token` | Generate streaming token | Optional* |
| POST | `/api/transcriptions/live` | Save live session | Yes |

*Can be made required by uncommenting auth check in route

### Modified Endpoints

| Method | Endpoint | Changes |
|--------|----------|---------|
| POST | `/api/transcribe` | Now sets `sourceType` field |

---

## Error Handling

### Recording Errors
- `NotAllowedError`: Microphone permission denied
- `NotFoundError`: No microphone detected
- `MediaRecorder` errors: Capture/encoding failures

### Live Transcription Errors
- WebSocket connection failures
- Token generation failures
- Network interruptions
- API key issues (401/402/429)

### All Errors
- User-friendly error messages
- Console logging for debugging
- Non-blocking (app continues to work)
- Clear recovery paths

---

## Performance Considerations

### Recording
- ✅ Efficient blob collection
- ✅ Memory cleanup (URL.revokeObjectURL)
- ✅ No continuous processing during recording
- ✅ Small file sizes (compressed WebM)

### Live Transcription
- ✅ Optimized audio buffer sizes (4096 samples)
- ✅ Efficient downsampling algorithm
- ✅ Proper WebSocket handling
- ✅ Cleanup on unmount/disconnect
- ✅ No memory leaks

### UI
- ✅ React state updates only when needed
- ✅ Automatic scrolling with smooth behavior
- ✅ Debounced UI updates
- ✅ Lazy loading of components

---

## Testing Strategy

### Unit Testing (Manual)
1. Test MediaRecorder API functionality
2. Test WebSocket connection handling
3. Test audio processing functions
4. Test state management in hooks

### Integration Testing (Manual)
1. Test full recording → transcription flow
2. Test full live → save flow
3. Test API token generation
4. Test database operations

### E2E Testing (Manual)
1. Test complete user journeys
2. Test error scenarios
3. Test permissions handling
4. Test cross-browser compatibility

---

## Future Enhancements

### Phase 1 (Easy)
- [ ] Add audio level meter
- [ ] Add recording countdown timer
- [ ] Add keyboard shortcuts (Space to record)
- [ ] Add export recorded audio

### Phase 2 (Medium)
- [ ] Add pause/resume for recording
- [ ] Add live transcript editing
- [ ] Add speaker identification in live mode
- [ ] Add transcript confidence scores

### Phase 3 (Advanced)
- [ ] Multi-language auto-detection in live mode
- [ ] Real-time translation
- [ ] Audio effects (noise reduction)
- [ ] Collaborative live sessions

---

**Architecture designed for scalability, security, and user experience.** 🏗️


