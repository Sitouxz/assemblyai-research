# Debugging Live Transcription "Connection closed unexpectedly"

## Steps to Debug

### 1. Check Browser Console
Open Developer Tools (F12) → Console tab, then click "Start Live Transcription"

Look for:
- `Received streaming token: ...` - Should say "Token received"
- `WebSocket closed:` - Will show the error code and reason

### 2. Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 1008 | Policy Violation | Invalid or expired token, check API key |
| 1002 | Protocol Error | Wrong WebSocket URL format or parameters |
| 1000 | Normal Closure | Session ended normally (not an error) |
| 1006 | Abnormal Closure | Network issue or server rejected connection |

### 3. Check Server Logs
In your terminal where `npm run dev` is running, look for:
- `Generated streaming token: ...`
- Any error messages from the token generation

### 4. Verify API Key
Make sure you have a valid AssemblyAI API key set:
- Check `.env.local` has `ASSEMBLYAI_API_KEY=your_key_here`
- Or add your personal key in Settings → API Keys

### 5. Test Token Generation Manually

Open a new terminal and test the token endpoint:

```bash
# If you're signed in:
curl http://localhost:3000/api/assemblyai/stream-token

# Should return:
# {"token":"temporary_token_string","expiresInSeconds":480}
```

## Potential Issues & Fixes

### Issue 1: Token Format
The SDK might return the token in a different format than expected.

**Check:** Look at console output for token type
**Fix:** May need to extract token from response object

### Issue 2: WebSocket URL
The AssemblyAI real-time endpoint might be different in SDK v4.x

**Current URL:** `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=...`
**May need:** Different endpoint or parameter format

### Issue 3: Authentication Method
The token might need to be sent differently (header vs query param)

## Quick Test

To isolate the issue, try this in your browser console after getting a token:

```javascript
// Get a token first
fetch('/api/assemblyai/stream-token')
  .then(r => r.json())
  .then(data => {
    console.log('Token:', data.token);
    
    // Try connecting with the token
    const ws = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${data.token}`);
    
    ws.onopen = () => console.log('✅ Connected!');
    ws.onerror = (e) => console.error('❌ Error:', e);
    ws.onclose = (e) => console.log('🔌 Closed:', e.code, e.reason);
    ws.onmessage = (e) => console.log('📨 Message:', e.data);
  });
```

## What to Report

Please share:
1. The WebSocket close **code** and **reason** from console
2. Whether token generation succeeded (check terminal)
3. Any error messages from browser console
4. Whether your API key is set (don't share the actual key)

This will help pinpoint the exact issue!


