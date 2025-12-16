'use client';

import { useRef, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { EvaluationSummary } from '@/types';
import { EvaluationListItem } from './EvaluationListItem';

interface VirtualizedListProps {
  evaluations: EvaluationSummary[];
  onSelectEvaluation: (evaluationId: string) => void;
}

const ITEM_HEIGHT = 76; // Approximate height of each list item

export const VirtualizedList = memo(function VirtualizedList({
  evaluations,
  onSelectEvaluation,
}: VirtualizedListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: evaluations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5, // Render 5 extra items above/below viewport
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="max-h-[500px] overflow-y-auto"
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        <div
          className="absolute top-0 left-0 w-full"
          style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}
        >
          {items.map((virtualRow) => {
            const evaluation = evaluations[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="border-b border-navy-100 dark:border-navy-700 last:border-b-0"
              >
                <EvaluationListItem
                  evaluation={evaluation}
                  onClick={() => onSelectEvaluation(evaluation.evaluationId)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
