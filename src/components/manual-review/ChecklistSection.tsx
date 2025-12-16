'use client';

import { useMemo } from 'react';
import { CHECKLIST_ITEMS } from './config';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistSectionProps {
  checklist: ChecklistItem[];
  onToggle: (id: string) => void;
}

export function createInitialChecklist(): ChecklistItem[] {
  return CHECKLIST_ITEMS.map((item) => ({ ...item, checked: false }));
}

export function ChecklistSection({ checklist, onToggle }: ChecklistSectionProps) {
  const completedCount = useMemo(() => checklist.filter((item) => item.checked).length, [checklist]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-navy-900">Review Checklist</h3>
        <span className="text-sm text-navy-500 bg-navy-100 px-2.5 py-1 rounded-full font-medium">
          {completedCount}/{checklist.length}
        </span>
      </div>
      <div className="bg-navy-50 rounded-xl p-4 space-y-1">
        {checklist.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-navy-100/50 p-2.5 rounded-lg transition"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="w-4 h-4 text-gold-500 rounded border-navy-300 focus:ring-gold-400 focus:ring-offset-0"
            />
            <span className={`text-sm ${item.checked ? 'text-navy-400 line-through' : 'text-navy-700'}`}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}




