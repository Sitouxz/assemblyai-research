# 🚀 Quick Start Guide

## ⚡ Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local and add your AssemblyAI API key
ASSEMBLYAI_API_KEY=your_key_here
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 3. Setup Database
```bash
npx prisma migrate dev
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
Navigate to `http://localhost:3000`

---

## 🎯 First Steps

### Create an Account
1. Visit `/auth/signup`
2. Enter name, email, password
3. Click "Sign Up"

### Upload Your First Transcript
1. Go to homepage `/`
2. **Option A:** Upload audio/video file
3. **Option B:** Paste audio URL
4. Click "Transcribe"
5. Wait for processing (15-30% of audio duration)

### View Results
1. Click on completed transcript
2. Explore tabs:
   - **Transcript** - Full text with clickable words
   - **Summary** - Chapter-based overview
   - **Entities** - Detected names, locations, etc.
   - **Topics** - IAB category classification
   - **Sentiment** - Emotional analysis
   - **Highlights** - Key phrases
   - **Content Safety** - Moderation labels
   - **AI Insights** - LeMUR-powered analysis

---

## ⚙️ Advanced Features

### Enable Speaker Diarization
1. Click "Advanced Options" on upload form
2. Toggle "Speaker Diarization"
3. Optionally set expected number of speakers
4. Transcribe

### PII Redaction
1. Advanced Options → PII Redaction
2. Select policies (SSN, credit cards, phone numbers, etc.)
3. Optionally enable audio redaction
4. Transcribe

### Generate AI Insights
1. Open transcript
2. Go to "AI Insights" tab
3. Click buttons:
   - **Summary** - Get overview
   - **Action Items** - Extract tasks
   - **Key Points** - Main ideas
4. Switch to Q&A tab
5. Ask questions about the transcript

---

## 📤 Export & Share

### Export Transcript
1. Open transcript
2. Click "Export" button
3. Select format:
   - **TXT** - Plain text
   - **DOCX** - Word document
   - **PDF** - Print-ready
   - **SRT** - Subtitles
   - **VTT** - Web video subtitles
4. Configure options
5. Download

### Share Transcript
1. Open transcript
2. Click "Share" button
3. Optional: Set password
4. Optional: Set expiry date
5. Copy link
6. Share with anyone!

---

## 🎨 Dark Mode

### Enable Dark Mode
1. Click sun/moon icon in header
2. Select:
   - **Light** - Always light
   - **Dark** - Always dark
   - **System** - Match OS preference
3. Preference saved automatically

---

## ⌨️ Keyboard Shortcuts

When viewing transcript with audio:
- **Space** - Play/Pause
- **←** - Skip back 5s
- **→** - Skip forward 5s
- **↑** - Increase speed
- **↓** - Decrease speed

---

## 🎵 Playback Controls

### Speed Control
Click dropdown to select:
- 0.5x (half speed)
- 0.75x
- 1x (normal)
- 1.25x
- 1.5x
- 2x (double speed)

### Navigation
- **Progress bar** - Click to jump to time
- **±5s buttons** - Quick skip
- **±10s buttons** - Larger skip
- **Click words** - Jump to that word's timestamp

---

## 📊 Feature Checklist

### Core Features ✅
- [x] User authentication
- [x] File upload (audio/video)
- [x] URL transcription
- [x] Word-level timestamps
- [x] Speaker diarization
- [x] PII redaction
- [x] Entity detection
- [x] Topic classification
- [x] Content moderation
- [x] Sentiment analysis
- [x] Auto highlights
- [x] Auto chapters

### AI Features ✅
- [x] LeMUR summaries
- [x] Action items extraction
- [x] Key points
- [x] Q&A system
- [x] Custom AI tasks

### Export ✅
- [x] Plain text export
- [x] Word documents
- [x] PDF generation
- [x] SRT subtitles
- [x] WebVTT subtitles

### Sharing ✅
- [x] Shareable links
- [x] Password protection
- [x] Expiry dates
- [x] Permission control
- [x] View tracking

### Playback ✅
- [x] Custom audio player
- [x] Speed control (6 speeds)
- [x] Skip controls
- [x] Keyboard shortcuts
- [x] Word-level sync
- [x] Auto-scroll

### UX ✅
- [x] Dark mode
- [x] Responsive design
- [x] Loading states
- [x] Error handling
- [x] History page
- [x] Search & filter

---

## 🔧 Common Issues

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Build errors
```bash
npm run build
# Check output for specific errors
```

### API errors
- Verify `ASSEMBLYAI_API_KEY` in `.env.local`
- Check API key is valid at assemblyai.com
- Ensure not hitting rate limits

---

## 📚 Documentation

- **ALL-PHASES-COMPLETE.md** - Complete feature documentation
- **IMPLEMENTATION-COMPLETE.md** - Implementation overview
- **PHASE-1-COMPLETE.md** - Foundation details
- **PHASE-2-COMPLETE.md** - Advanced features
- **PHASE-3-COMPLETE.md** - Export & sharing
- **README.md** - Project overview

---

## 🆘 Support

### Check Documentation First
1. Read the comprehensive docs
2. Check API endpoint reference
3. Review component documentation

### Common Questions

**Q: How do I add more users?**
A: Just have them sign up at `/auth/signup`

**Q: Can I use my own audio hosting?**
A: Yes! Paste any public audio URL

**Q: How much does AssemblyAI cost?**
A: Check pricing at assemblyai.com/pricing

**Q: Can I self-host this?**
A: Yes! Deploy to Vercel, Docker, or any Node.js host

**Q: Is there a file size limit?**
A: Depends on your AssemblyAI plan

**Q: Can multiple users share transcripts?**
A: Yes! Use the share feature with optional passwords

---

## 🎓 Video Tutorials (Conceptual)

1. **Getting Started** - Sign up, first transcript
2. **Advanced Options** - Diarization, PII, entities
3. **LeMUR AI** - Summaries, Q&A, action items
4. **Export & Share** - All formats, secure sharing
5. **Power User Tips** - Keyboard shortcuts, dark mode

---

## 🚀 What's Next?

### For Users
1. Upload your first audio file
2. Try different advanced options
3. Explore AI insights
4. Export in different formats
5. Share with your team

### For Developers
1. Review codebase structure
2. Explore API endpoints
3. Check database schema
4. Consider custom features
5. Plan team collaboration features

---

## 🎉 You're Ready!

Start transcribing at: **http://localhost:3000**

Happy transcribing! 🎙️✨

