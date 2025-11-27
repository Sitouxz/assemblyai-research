# Alternative Fix for Live Transcription Auth Issue

## The Problem
`createTemporaryToken()` might not work as expected in SDK v4.19.0 for real-time streaming.

## Solution Options

### Option 1: Use API Key Directly (Temporary Test)
**Warning**: This exposes your API key to the browser. Only use for testing!

Update `app/api/assemblyai/stream-token/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAssemblyAIApiKey } from '@/lib/assemblyai';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Get the API key (user's or app's)
    const apiKey = await getAssemblyAIApiKey(session?.user?.id);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured' },
        { status: 402 }
      );
    }

    // For real-time, return the API key directly (temporary solution)
    return NextResponse.json({
      token: apiKey,
      expiresInSeconds: 480,
    });

  } catch (error: any) {
    console.error('Error generating streaming token:', error);
    return NextResponse.json(
      { error: 'Failed to generate streaming token' },
      { status: 500 }
    );
  }
}
```

### Option 2: Check SDK Method Signature
The `createTemporaryToken` might return a Promise that resolves to an object with a `token` property.

Try this in `app/api/assemblyai/stream-token/route.ts`:

```typescript
const tokenResult = await client.streaming.createTemporaryToken({
  expires_in_seconds: 480,
});

// Try different property access patterns
const tempToken = tokenResult?.token || tokenResult?.data?.token || tokenResult;

console.log('Token result:', {
  type: typeof tokenResult,
  keys: Object.keys(tokenResult || {}),
  value: tempToken
});
```

### Option 3: Use Server-Side Proxy
Instead of client connecting directly to AssemblyAI, proxy through your backend.

This is the most secure but requires more setup.

## Which Option to Try First?

1. **Check terminal logs** - See what `createTemporaryToken` actually returns
2. **If it's an object** - Try Option 2 (extract the right property)
3. **If it's undefined** - Try Option 1 as a test (then we know the WebSocket code works)
4. **If Option 1 works** - We know the issue is just with token generation

Let me know what you see in the terminal!


