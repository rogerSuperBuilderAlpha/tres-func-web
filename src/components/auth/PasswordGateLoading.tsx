'use client';

import { Spinner } from '@/components/ui';

export function PasswordGateLoading() {
  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center">
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <Spinner size="lg" className="text-gold-500" />
      </div>
    </div>
  );
}

