import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import { ClientWrapper } from '@/components/ClientWrapper';
import './globals.css';

// Optimized font loading with next/font
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'TTB Evaluator',
  description: 'Evaluate take-home submissions for TTB label verification apps',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
