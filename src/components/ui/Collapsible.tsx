'use client';

import { useState, ReactNode, memo } from 'react';
import { ChevronDownIcon } from './Icons';

interface CollapsibleProps {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Collapsible = memo(function Collapsible({ trigger, children, defaultOpen = false, className = '' }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        {trigger}
        <ChevronDownIcon
          className={`w-5 h-5 text-navy-400 dark:text-navy-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`collapse-content ${isOpen ? 'open' : ''}`}>
        <div>{children}</div>
      </div>
    </div>
  );
});
