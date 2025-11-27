# Quick Setup Guide: Bring Your Own API Key Feature

## ⚡ Quick Start (3 Steps)

### 1. Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (64-character hex string).

### 2. Add to Environment Variables

Add the following to your `.env` or `.env.local` file:

```bash
ENCRYPTION_KEY=paste_the_generated_key_here
```

**Example** (don't use this actual key):
```bash
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 3. Restart Your Development Server

```bash
npm run dev
```

That's it! The feature is now active. 🎉

---

## 🧪 Test It Out

### As a User:

1. **Sign in** to your account (or create one at `/auth/signup`)

2. **Go to Settings**
   - Click your avatar/name in the header
   - Select "Settings"
   - Click the "API Keys" tab

3. **Add Your AssemblyAI Key**
   - Get your key from [AssemblyAI Dashboard](https://www.assemblyai.com/app)
   - Paste it in the form
   - Optionally add a label (e.g., "My Personal Key")
   - Click "Save API Key"

4. **Return to Home**
   - You'll see a green indicator: "Using Your Personal API Key"
   - All transcriptions now use your key!

### Test Key Precedence:

- **Guest users**: Use shared app key
- **Logged in without personal key**: Use shared app key (with yellow indicator)
- **Logged in with personal key**: Use personal key (with green indicator)

---

## 🔒 Security Notes

- ✅ All API keys are encrypted with AES-256-GCM before storage
- ✅ Keys are never sent to the client
- ✅ Decryption only happens server-side
- ✅ The `ENCRYPTION_KEY` must be kept secret
- ✅ Keys are validated before being saved

**Important**: Store your `ENCRYPTION_KEY` securely:
- Never commit it to version control
- Use environment variables or secrets management
- Generate a new key for each environment (dev/staging/prod)

---

## 🚨 Production Deployment

### For Vercel, Netlify, etc.:

1. Add the `ENCRYPTION_KEY` environment variable in your hosting dashboard
2. Redeploy your application
3. Users can now manage their API keys

### For Self-Hosted:

1. Add `ENCRYPTION_KEY` to your `.env` file
2. Ensure the environment variable is loaded at runtime
3. Restart your Node.js process

---

## 🆘 Troubleshooting

### Error: "ENCRYPTION_KEY is not set"

**Solution**: Add the `ENCRYPTION_KEY` to your environment variables and restart.

```bash
# Generate a new key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
ENCRYPTION_KEY=your_generated_key_here
```

### Error: "ENCRYPTION_KEY must be 64 hex characters"

**Solution**: Ensure your key is exactly 64 characters (32 bytes in hex).

### Error: "Invalid AssemblyAI API key"

**Solution**: The key validation failed. Check that:
- You copied the full key from AssemblyAI
- The key is still active in your AssemblyAI account
- There are no extra spaces or characters

### Can't see the Settings link

**Solution**: Make sure you're logged in. The Settings link only appears for authenticated users.

---

## 📚 More Information

- **Full Documentation**: See `BYOK-FEATURE-COMPLETE.md`
- **API Endpoints**: `/api/user/api-keys/assemblyai`
- **Database Model**: `UserApiKey` in `prisma/schema.prisma`
- **Encryption**: `lib/crypto.ts`

---

## ✅ Verification Checklist

- [ ] `ENCRYPTION_KEY` added to environment variables
- [ ] Server restarted
- [ ] Can access Settings page (`/settings`)
- [ ] Can add AssemblyAI API key
- [ ] Green indicator shows on homepage
- [ ] Transcriptions work with personal key
- [ ] Can update/remove key

---

## 🎯 Key Precedence Flow

```
┌─────────────────────────────────────────────┐
│          User Transcribes Audio             │
└───────────────┬─────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │ Authenticated? │
        └───────┬────────┘
                │
        ┌───────┴───────┐
        │               │
       Yes             No
        │               │
        ▼               ▼
┌──────────────┐  ┌──────────────┐
│  Has User    │  │  Use App-    │
│  API Key?    │  │  Level Key   │
└──────┬───────┘  └──────────────┘
       │
   ┌───┴────┐
   │        │
  Yes      No
   │        │
   ▼        ▼
┌──────┐ ┌─────┐
│ Use  │ │ Use │
│User  │ │ App │
│ Key  │ │ Key │
└──────┘ └─────┘
```

---

Ready to go! 🚀 Users can now bring their own AssemblyAI API keys.


