import { AssemblyAI } from 'assemblyai';
import { prisma } from './db';
import { decryptSecret } from './crypto';

// Default client using app-level API key
// This will be used as fallback if no user key is available
let defaultClient: AssemblyAI | null = null;

if (process.env.ASSEMBLYAI_API_KEY) {
  defaultClient = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  });
}

/**
 * Default client for backwards compatibility
 * @deprecated Use getAssemblyAIClient(userId) instead
 */
export const client = defaultClient || new AssemblyAI({ apiKey: '' });

/**
 * Retrieves the AssemblyAI API key for a specific user
 * Falls back to the app-level API key if user has no personal key
 * 
 * @param userId - The user ID to look up (optional)
 * @returns The API key to use, or null if none available
 */
export async function getAssemblyAIApiKey(userId?: string | null): Promise<string | null> {
  // 1. Try to get user's personal API key
  if (userId) {
    try {
      const userApiKey = await prisma.userApiKey.findUnique({
        where: {
          userId_provider: {
            userId: userId,
            provider: 'assemblyai',
          },
        },
      });

      if (userApiKey) {
        // Decrypt and return the user's key
        const decryptedKey = decryptSecret(userApiKey.encryptedKey);
        return decryptedKey;
      }
    } catch (error) {
      console.error('Error retrieving user API key:', error);
      // Fall through to app-level key
    }
  }

  // 2. Fall back to app-level API key
  if (process.env.ASSEMBLYAI_API_KEY) {
    return process.env.ASSEMBLYAI_API_KEY;
  }

  // 3. No key available
  return null;
}

/**
 * Creates an AssemblyAI client for a specific user
 * Uses user's personal API key if available, otherwise falls back to app key
 * 
 * @param userId - The user ID (optional)
 * @returns AssemblyAI client instance
 * @throws Error if no API key is available
 */
export async function getAssemblyAIClient(userId?: string | null): Promise<AssemblyAI> {
  const apiKey = await getAssemblyAIApiKey(userId);

  if (!apiKey) {
    throw new Error(
      'No AssemblyAI API key available. Please add your own key in Settings or contact the app owner.'
    );
  }

  return new AssemblyAI({ apiKey });
}

