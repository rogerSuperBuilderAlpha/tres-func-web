'use client';

import { useEffect } from 'react';
import { PasswordGate } from './PasswordGate';
import { ToastProvider, ErrorBoundary } from '@/components/ui';

interface ClientWrapperProps {
  children: React.ReactNode;
}

// Register service worker for offline caching
function useServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
    }
  }, []);
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  useServiceWorker();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <PasswordGate>{children}</PasswordGate>
      </ToastProvider>
    </ErrorBoundary>
  );
}







