'use client';

import { PasswordGate } from './PasswordGate';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return <PasswordGate>{children}</PasswordGate>;
}


