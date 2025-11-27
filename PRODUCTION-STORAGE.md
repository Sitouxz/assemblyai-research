# Production Storage Solutions

## ⚠️ Problem: Local File Storage Doesn't Work in Production

Platforms like Vercel, Netlify, and Railway use **ephemeral/serverless file systems**:
- Files saved during a request are **deleted** after the function completes
- Each serverless instance has its own isolated filesystem
- No persistent storage available

## ✅ Current Solution (Temporary)

The app currently uses **AssemblyAI's CDN** for audio playback in production:
- AssemblyAI stores uploaded audio temporarily on their CDN
- We proxy these URLs through `/api/audio-proxy` to avoid SSL issues
- ⏱️ **Limitation**: AssemblyAI may delete these files after some time

## 🚀 Recommended Solutions for Production

### Option 1: AWS S3 (Most Popular)

**Setup:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Environment Variables:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-audio-bucket
```

**Implementation:**
```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadAudioToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const fileId = randomBytes(16).toString('hex');
  const extension = fileName.split('.').pop() || 'webm';
  const key = `audio/${fileId}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: 'max-age=31536000',
    })
  );

  // Return public URL
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
```

**Cost:** ~$0.023/GB/month + transfer costs

---

### Option 2: Cloudflare R2 (S3-Compatible, Cheaper)

**Setup:**
```bash
npm install @aws-sdk/client-s3  # R2 is S3-compatible
```

**Environment Variables:**
```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=your-audio-bucket
```

**Implementation:**
```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadAudioToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const fileId = randomBytes(16).toString('hex');
  const extension = fileName.split('.').pop() || 'webm';
  const key = `audio/${fileId}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  // Return public URL (requires R2 custom domain or public access)
  return `https://your-domain.com/cdn/${key}`;
}
```

**Cost:** 
- Storage: **FREE** for first 10GB
- No egress fees (unlike S3)
- Great for high-traffic apps

---

### Option 3: Vercel Blob Storage (Easiest for Vercel)

**Setup:**
```bash
npm install @vercel/blob
```

**Environment Variables:**
```env
BLOB_READ_WRITE_TOKEN=your_token  # Auto-provided by Vercel
```

**Implementation:**
```typescript
// lib/storage.ts
import { put } from '@vercel/blob';

export async function uploadAudioToVercel(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const { url } = await put(fileName, file, {
    access: 'public',
    contentType,
  });

  return url;
}
```

**Cost:** 
- Free tier: 1GB storage, 100GB bandwidth
- Then $0.15/GB storage + $0.20/GB bandwidth

---

### Option 4: Supabase Storage (Open Source)

**Setup:**
```bash
npm install @supabase/supabase-js
```

**Environment Variables:**
```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

**Implementation:**
```typescript
// lib/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadAudioToSupabase(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const fileId = randomBytes(16).toString('hex');
  const extension = fileName.split('.').pop() || 'webm';
  const path = `audio/${fileId}.${extension}`;

  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(path, file, {
      contentType,
      cacheControl: '31536000',
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('audio-files')
    .getPublicUrl(path);

  return publicUrl;
}
```

**Cost:** 
- Free tier: 1GB storage, 2GB bandwidth
- Pro: $25/month for 100GB storage

---

## 🔧 How to Integrate Cloud Storage

### 1. Create Storage Module

```typescript
// lib/storage.ts
export async function uploadAudio(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  // Choose your storage provider
  if (process.env.AWS_S3_BUCKET) {
    return uploadAudioToS3(file, fileName, contentType);
  }
  if (process.env.R2_BUCKET) {
    return uploadAudioToR2(file, fileName, contentType);
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return uploadAudioToVercel(file, fileName, contentType);
  }
  
  throw new Error('No storage provider configured');
}
```

### 2. Update Transcribe API

```typescript
// app/api/transcribe/route.ts
import { uploadAudio } from '@/lib/storage';

// In the transcribe handler:
if (file) {
  const bytes = await file.arrayBuffer();
  audioSource = Buffer.from(bytes);
  
  // Upload to cloud storage
  try {
    savedAudioUrl = await uploadAudio(
      audioSource,
      file.name,
      file.type
    );
    console.log('[Transcribe] Uploaded to cloud storage:', savedAudioUrl);
  } catch (error) {
    console.error('[Transcribe] Failed to upload:', error);
  }
}
```

### 3. Remove Audio Proxy (if using public URLs)

If your cloud storage returns public URLs, you can remove the proxy and use URLs directly.

---

## 📊 Comparison

| Provider | Free Tier | Storage Cost | Bandwidth Cost | Setup Difficulty |
|----------|-----------|--------------|----------------|------------------|
| AWS S3 | 5GB (12mo) | $0.023/GB | $0.09/GB | Medium |
| Cloudflare R2 | 10GB | $0.015/GB | **FREE** | Medium |
| Vercel Blob | 1GB | $0.15/GB | $0.20/GB | **Easy** |
| Supabase | 1GB | Included | Included | Easy |

---

## 🚀 Quick Start (Vercel Blob - Easiest)

1. **Install:**
   ```bash
   npm install @vercel/blob
   ```

2. **Enable in Vercel:**
   - Go to your Vercel project
   - Storage → Create Blob Store
   - Token auto-configured

3. **Done!** No additional setup needed.

---

## 💡 Current Workaround

For now, the app uses **AssemblyAI's CDN URLs** with proxy:
- ✅ Works in production
- ✅ No extra setup needed
- ⚠️ Files may be deleted after some time
- ⚠️ Depends on AssemblyAI's availability

This is fine for **demo/testing** but should be replaced with proper cloud storage for **production**.

---

## 🔐 Security Considerations

### Signed URLs (Recommended)
For private audio files, use signed/presigned URLs:

```typescript
// AWS S3 Presigned URL
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const command = new GetObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET!,
  Key: key,
});

const signedUrl = await getSignedUrl(s3Client, command, {
  expiresIn: 3600, // 1 hour
});
```

### CORS Configuration
Make sure your storage bucket allows CORS for audio playback:

```json
{
  "AllowedOrigins": ["https://yourdomain.com"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3000
}
```

---

## 🎯 Recommendation

**For MVP/Demo:** 
- Current solution (AssemblyAI CDN + proxy) is fine

**For Production:**
- **Budget-conscious**: Cloudflare R2 (free egress!)
- **Vercel users**: Vercel Blob (easiest integration)
- **Enterprise**: AWS S3 (most reliable, scalable)
- **Open-source fans**: Supabase (good free tier)

Choose based on your needs and existing infrastructure! 🚀

