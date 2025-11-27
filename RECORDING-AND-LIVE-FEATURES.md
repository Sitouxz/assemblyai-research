# Recording & Live Transcription Features

This document describes the two new capabilities added to the AssemblyAI transcription app.

## 🎙️ Feature 1: Record & Transcribe

Record audio directly in your browser and transcribe it using the same pipeline as file uploads.

### How It Works

1. **Navigate to "Record" Tab**: Click the "Record" tab on the main page
2. **Start Recording**: Click "Start Recording" to begin capturing audio from your microphone
3. **Stop Recording**: Click "Stop Recording" when finished
4. **Preview**: Listen to your recording using the audio player
5. **Transcribe**: Click "Transcribe Recording" to process the audio
6. **Results**: View transcript, insights, and all advanced features just like uploaded files

### Technical Details

- **Audio Format**: WebM with Opus codec (fallback to browser-supported format)
- **Recording Hook**: `useRecorder` (`hooks/useRecorder.ts`)
- **UI Component**: `RecordCard` (`components/RecordCard.tsx`)
- **Source Type**: Recordings are marked as `sourceType: "recording"` in the database
- **Advanced Options**: All transcription options (speaker labels, sentiment analysis, etc.) are available

### Permissions

The browser will request microphone permission when you first click "Start Recording". You must allow this to use the feature.

### Error Handling

- **Permission Denied**: Clear error message with instructions
- **No Microphone Found**: Detected and reported to user
- **Recording Errors**: Gracefully handled with user-friendly messages

---

## 🔴 Feature 2: Live Transcription

Stream microphone audio to AssemblyAI in real-time and see transcripts appear as you speak.

### How It Works

1. **Navigate to "Live" Tab**: Click the "Live" tab on the main page
2. **Start Live Transcription**: Click "Start Live Transcription"
3. **Speak**: Talk into your microphone and see real-time transcription
4. **Stop**: Click "Stop" when finished
5. **Save (Optional)**: Authenticated users can save the session to their history

### Technical Details

- **WebSocket Connection**: Direct connection to AssemblyAI's streaming API
- **Streaming Hook**: `useLiveTranscription` (`hooks/useLiveTranscription.ts`)
- **UI Component**: `LiveTranscriptionCard` (`components/LiveTranscriptionCard.tsx`)
- **Audio Processing**: 
  - Mono audio, 16kHz sample rate
  - PCM16 encoding
  - Real-time downsampling and conversion
- **Turn-Based Display**: 
  - Partial transcripts appear in italic
  - Finalized transcripts appear in normal weight
  - Automatic scrolling to latest content

### Security

- **Temporary Tokens**: Backend generates short-lived streaming tokens (8 minutes)
- **API Route**: `GET /api/assemblyai/stream-token`
- **Never Exposed**: The long-lived API key never reaches the client
- **Token Expiration**: Tokens automatically expire for security

### Saving Sessions

Authenticated users can:
- Add a custom title to their session
- Save the full transcript to database with `sourceType: "stream"`
- Access saved sessions in their history
- View, edit, and export saved live transcripts

**Guest Users**: Can use live transcription but cannot save sessions. Sign in to enable saving.

### API Routes

#### `GET /api/assemblyai/stream-token`
Generates a temporary streaming token for client-side WebSocket connection.

**Response:**
```json
{
  "token": "temporary_token_string",
  "expiresInSeconds": 480
}
```

#### `POST /api/transcriptions/live`
Saves a completed live transcription session.

**Request Body:**
```json
{
  "title": "Session Title",
  "text": "Full transcript text...",
  "durationSeconds": 120,
  "sessionId": "optional_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "transcriptId": "transcript_id",
  "transcript": { /* transcript object */ }
}
```

---

## 📊 Database Changes

### Schema Updates

Added `sourceType` field to `Transcript` model:

```prisma
model Transcript {
  // ... existing fields ...
  sourceType      String?  // 'upload' | 'url' | 'recording' | 'stream'
  // ... existing fields ...
}
```

**Source Types:**
- `upload`: File uploaded by user
- `url`: Public URL provided by user
- `recording`: Browser-recorded audio
- `stream`: Live transcription session

The legacy `audioSource` field is maintained for backwards compatibility.

---

## 🎨 UI/UX

### Tab Navigation

Three modes accessible via tabs:
1. **Upload / URL**: Original file and URL upload functionality
2. **Record**: Browser-based audio recording
3. **Live**: Real-time streaming transcription

### Status Indicators

- **Recording**: Red pulsing dot + animated waveform
- **Live Streaming**: Green pulsing dot + "Listening..." status
- **Connection States**: Clear feedback for all states (connecting, streaming, error, etc.)

### Responsive Design

All new components follow the existing design system:
- Dark mode support
- Tailwind CSS styling
- Mobile-friendly layouts
- Accessible controls

---

## 🔧 Implementation Files

### Hooks
- `hooks/useRecorder.ts` - MediaRecorder API wrapper
- `hooks/useLiveTranscription.ts` - WebSocket streaming management

### Components
- `components/RecordCard.tsx` - Recording UI
- `components/LiveTranscriptionCard.tsx` - Live transcription UI

### API Routes
- `app/api/assemblyai/stream-token/route.ts` - Token generation
- `app/api/transcriptions/live/route.ts` - Save live sessions

### Type Definitions
- `lib/types.ts` - Extended with streaming types

### Database
- `prisma/schema.prisma` - Added `sourceType` field

---

## 🧪 Testing

To test these features:

1. **Record & Transcribe**:
   - Grant microphone permission
   - Record a short audio clip (5-10 seconds)
   - Verify playback works
   - Transcribe and check results
   - Verify transcript appears in history (if authenticated)

2. **Live Transcription**:
   - Grant microphone permission
   - Start live session
   - Speak clearly and observe real-time transcription
   - Verify partial vs. finalized text rendering
   - Stop session and verify final transcript
   - Test saving (if authenticated)

3. **Existing Features**:
   - Verify file upload still works
   - Verify URL transcription still works
   - Check all existing features remain functional

---

## 🚀 Future Enhancements

Possible improvements:
- Export live transcription recordings
- Live transcript editing during streaming
- Multi-speaker identification in live mode
- Session pause/resume functionality
- Configurable streaming quality settings
- Audio level indicators
- Transcript confidence scores display

---

## 📝 Notes

- **Browser Compatibility**: Recording and live features require modern browsers with MediaRecorder and WebSocket support
- **Audio Quality**: Better microphones produce more accurate transcriptions
- **Network Requirements**: Live transcription requires stable internet connection
- **API Usage**: Both features consume AssemblyAI API credits (recording uses standard transcription, live uses streaming credits)


