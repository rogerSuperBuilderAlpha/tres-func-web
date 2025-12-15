'use client';

import { Collapsible } from '@/components/ui';
import type { SubmissionOptions } from '../EnhancedSubmissionForm';

const FOCUS_MODES: Array<{ value: SubmissionOptions['focusMode']; label: string; icon: string; desc: string }> = [
  { value: 'balanced', label: 'Balanced', icon: '⚖️', desc: 'All tests equally weighted' },
  { value: 'security', label: 'Security Focus', icon: '🔒', desc: 'Emphasis on security tests' },
  { value: 'ux', label: 'UX Focus', icon: '🎨', desc: 'Emphasis on UX & accessibility' },
  { value: 'performance', label: 'Performance', icon: '⚡', desc: 'Speed & resilience focus' },
];

interface AdvancedOptionsProps {
  focusMode: SubmissionOptions['focusMode'];
  onFocusModeChange: (mode: SubmissionOptions['focusMode']) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function AdvancedOptions({ focusMode, onFocusModeChange, notes, onNotesChange }: AdvancedOptionsProps) {
  return (
    <div className="mt-5 pt-5 border-t border-navy-100 dark:border-navy-700">
      <Collapsible
        trigger={
          <div className="flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-navy-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Advanced Options
          </div>
        }
      >
        <div className="mt-4 space-y-4">
          {/* Focus Mode */}
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">Evaluation Focus</label>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => onFocusModeChange(mode.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition ${
                    focusMode === mode.value
                      ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/30'
                      : 'border-navy-200 dark:border-navy-600 hover:border-navy-300 dark:hover:border-navy-500 bg-white dark:bg-navy-800'
                  }`}
                >
                  <span className="text-lg">{mode.icon}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-navy-900 dark:text-navy-100">{mode.label}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{mode.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">
              Notes <span className="text-navy-400 dark:text-navy-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Any notes about this submission..."
              rows={2}
              className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition text-sm text-navy-900 dark:text-navy-100 placeholder:text-navy-400 dark:placeholder:text-navy-500 resize-none"
            />
          </div>
        </div>
      </Collapsible>
    </div>
  );
}



