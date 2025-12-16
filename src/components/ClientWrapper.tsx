'use client';

import { PasswordGate } from './PasswordGate';
import { ToastProvider, ErrorBoundary } from '@/components/ui';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <PasswordGate>{children}</PasswordGate>
      </ToastProvider>
    </ErrorBoundary>
  );
}






