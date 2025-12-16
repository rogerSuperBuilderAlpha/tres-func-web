'use client';

import { PasswordGate } from './PasswordGate';
import { ToastProvider } from '@/components/ui';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <ToastProvider>
      <PasswordGate>{children}</PasswordGate>
    </ToastProvider>
  );
}






