'use client';

import { useState, memo } from 'react';
import { ChevronDownIcon } from '@/components/ui';

interface AccordionItemProps {
  title: string;
  count?: number;
  countColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const AccordionItem = memo(function AccordionItem({ 
  title, 
  count,
  countColor = 'bg-navy-100 text-navy-600',
  children, 
  defaultOpen = false 
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-navy-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-navy-700">{title}</span>
          {count !== undefined && count > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${countColor}`}>
              {count}
            </span>
          )}
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-navy-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  );
});
