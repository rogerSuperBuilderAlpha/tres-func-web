'use client';

import { memo } from 'react';
import { AccordionItem } from './AccordionItem';

interface SummaryAccordionCardProps {
  strengths: string[];
  concerns: string[];
}

export const SummaryAccordionCard = memo(function SummaryAccordionCard({ strengths, concerns }: SummaryAccordionCardProps) {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 shadow-sm">
      <div className="px-5">
        <AccordionItem
          title="Strengths"
          count={strengths.length}
          countColor="bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-500"
          defaultOpen={false}
        >
          <ul className="space-y-2">
            {strengths.slice(0, 8).map((item, i) => (
              <li key={i} className="text-sm text-navy-600 dark:text-navy-300 flex items-start gap-2">
                <span className="text-success-500 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </AccordionItem>

        <AccordionItem
          title="Concerns"
          count={concerns.length}
          countColor="bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-500"
          defaultOpen={false}
        >
          <ul className="space-y-2">
            {concerns.slice(0, 8).map((item, i) => (
              <li key={i} className="text-sm text-navy-600 dark:text-navy-300 flex items-start gap-2">
                <span className="text-warning-500 mt-0.5">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </AccordionItem>
      </div>
    </div>
  );
});



