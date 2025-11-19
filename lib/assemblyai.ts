import { AssemblyAI } from 'assemblyai';

if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error(
    'Missing ASSEMBLYAI_API_KEY in environment variables. Please set it in .env.local'
  );
}

export const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

