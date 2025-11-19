import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AssemblyAI Playground',
  description: 'Upload audio, transcribe, and analyze with AssemblyAI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

