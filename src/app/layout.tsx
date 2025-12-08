import type { Metadata } from 'next';
import { ClientWrapper } from '@/components/ClientWrapper';
import './globals.css';

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
    <html lang="en">
      <body className="font-sans antialiased">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
