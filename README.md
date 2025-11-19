# AssemblyAI Playground

A modern web application for transcribing and analyzing audio/video files using AssemblyAI's Speech AI APIs. Upload audio files, get transcripts with timestamps, explore insights like summaries and sentiment analysis, and maintain a history of your transcriptions.

## Features

- **File Upload**: Drag-and-drop or browse to upload audio/video files (MP3, WAV, M4A, MP4)
- **URL Support**: Transcribe audio from public URLs
- **Real-time Transcription**: Upload audio and get transcripts with word-level timestamps
- **Audio Synchronization**: Click on words in the transcript to jump to that timestamp in the audio
- **Interactive Transcript Viewer**: Word-level highlighting synchronized with audio playback
- **Search**: Search through transcripts with highlight matching
- **Insights Panel**: View summaries, chapters/topics, and sentiment analysis (when enabled)
- **History Management**: Keep track of recent transcripts with localStorage
- **Developer Tools**: View raw JSON responses from AssemblyAI
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: AssemblyAI JavaScript SDK
- **Runtime**: Node.js

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An AssemblyAI API key ([Get one here](https://www.assemblyai.com/))

### Installation

1. **Clone or navigate to the project directory**

```bash
cd assemblyai-research
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your AssemblyAI API key:

```bash
ASSEMBLYAI_API_KEY=your_api_key_here
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
assemblyai-research/
├── app/
│   ├── api/
│   │   ├── health/route.ts        # Health check endpoint
│   │   └── transcribe/route.ts    # Transcription API endpoint
│   ├── components/
│   │   ├── UploadCard.tsx         # File upload and settings
│   │   ├── StatusIndicator.tsx    # Progress indicator
│   │   ├── TranscriptViewer.tsx   # Transcript display with audio player
│   │   ├── InsightsPanel.tsx      # Summary, chapters, sentiment
│   │   ├── HistorySidebar.tsx     # Recent transcripts sidebar
│   │   └── JsonViewer.tsx         # Raw JSON viewer
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main page component
│   └── globals.css                # Global styles
├── lib/
│   ├── assemblyai.ts              # AssemblyAI client setup
│   └── types.ts                   # TypeScript type definitions
├── .env.local.example             # Example environment file
└── package.json
```

## Architecture Overview

### Backend (API Routes)

- **`/api/health`**: Checks if the server is running and if the AssemblyAI API key is configured
- **`/api/transcribe`**: Handles file uploads and URL-based transcription requests
  - Accepts FormData with file or URL
  - Converts files to Buffer for AssemblyAI SDK
  - Configures transcription options (auto chapters, sentiment analysis, etc.)
  - Returns normalized transcript response

### Frontend Components

- **UploadCard**: Handles file selection, drag-and-drop, URL input, and transcription options
- **StatusIndicator**: Shows transcription progress (Uploading → Queued → Processing → Completed)
- **TranscriptViewer**: Displays transcript with audio player, word-level timestamps, and search
- **InsightsPanel**: Tabbed interface for viewing summaries, chapters, and sentiment analysis
- **HistorySidebar**: Manages and displays recent transcripts stored in localStorage
- **JsonViewer**: Collapsible panel for viewing raw API responses

### Data Flow

1. User uploads file or provides URL → `UploadCard`
2. Form data sent to `/api/transcribe` → Next.js API route
3. API route uses AssemblyAI SDK to transcribe → AssemblyAI API
4. Response normalized and returned → Frontend
5. Transcript displayed in `TranscriptViewer` → User
6. Transcript saved to localStorage → `HistorySidebar`

## Transcription Options

When uploading a file, you can enable:

- **Auto Chapters/Topics**: Automatically detect chapters and topics in the audio
- **Sentiment Analysis**: Analyze sentiment for each sentence
- **Remove Disfluencies**: Remove fillers like "uh" and "um" from the transcript
- **Custom Prompt**: Provide custom instructions to the transcription model

## Usage

1. **Upload a file**: Drag and drop an audio/video file or click "Browse file"
2. **Or enter a URL**: Paste a public URL to an audio file
3. **Configure options**: Enable any desired transcription features
4. **Transcribe**: Click the "Transcribe" button
5. **View results**: 
   - Read the transcript with word-level timestamps
   - Click words to jump to that point in the audio
   - View insights like summaries and sentiment (if enabled)
   - Explore the raw JSON response in Developer mode

## History Management

Transcripts are automatically saved to your browser's localStorage after successful transcription. You can:

- View recent transcripts in the sidebar
- Click on a history item to load it back into the viewer
- Clear your history with the "Clear" button

Note: History is stored locally in your browser and is not synced across devices.

## Development

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run lint
```

## Environment Variables

- `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key (required)

## Error Handling

The application includes comprehensive error handling:

- File validation (type and size checks)
- URL validation
- API error messages displayed to users
- Network error handling
- Graceful degradation when features aren't available

## License

This project is provided as-is for demonstration and educational purposes.

## Resources

- [AssemblyAI Documentation](https://www.assemblyai.com/docs)
- [AssemblyAI Node.js SDK](https://github.com/AssemblyAI/assemblyai-node-sdk)
- [Next.js Documentation](https://nextjs.org/docs)

