'use client';

import { useState, useCallback, useId } from 'react';
import { SubmitButton, PlusIcon, StackIcon } from '@/components/ui';
import { SubmissionCard, type SubmissionEntry } from './submission/SubmissionCard';
import { type ValidationState } from './submission/ValidatedUrlInput';

export type { SubmissionEntry };
export type { ValidationState };

export interface BatchSubmissionResult {
  successful: number;
  failed: number;
}

interface BatchSubmissionFormProps {
  onSubmitBatch: (submissions: Array<{ repoUrl: string; deployedUrl: string }>) => Promise<BatchSubmissionResult>;
  isSubmitting: boolean;
  submittingCount?: number;
}

function createEmptyEntry(id: string): SubmissionEntry {
  return {
    id,
    repoUrl: '',
    deployedUrl: '',
    repoValidation: { checking: false, valid: false },
    siteValidation: { checking: false, valid: false },
    repoMetadata: null,
    siteMetadata: null,
  };
}

export function BatchSubmissionForm({ onSubmitBatch, isSubmitting, submittingCount = 0 }: BatchSubmissionFormProps) {
  const baseId = useId();
  const [entries, setEntries] = useState<SubmissionEntry[]>([
    createEmptyEntry(`${baseId}-0`),
  ]);

  const updateEntry = useCallback((id: string, updates: Partial<SubmissionEntry>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const addEntry = useCallback(() => {
    setEntries(prev => [...prev, createEmptyEntry(`${baseId}-${prev.length}`)]);
  }, [baseId]);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const validEntries = entries.filter(e => e.repoValidation.valid && e.siteValidation.valid);
  const canSubmit = validEntries.length > 0 && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      await onSubmitBatch(validEntries.map(entry => ({
        repoUrl: entry.repoUrl,
        deployedUrl: entry.deployedUrl,
      })));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
            <StackIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy-900 dark:text-white">Batch Evaluation</h2>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              {entries.length} submission{entries.length !== 1 ? 's' : ''} • {validEntries.length} ready
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addEntry}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gold-700 dark:text-gold-400 bg-gold-50 dark:bg-gold-900/30 rounded-lg hover:bg-gold-100 dark:hover:bg-gold-900/50 transition disabled:opacity-50"
        >
          <PlusIcon className="w-4 h-4" />
          Add Submission
        </button>
      </div>

      {/* Submission Cards */}
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <SubmissionCard
            key={entry.id}
            entry={entry}
            index={index}
            onUpdate={updateEntry}
            onRemove={removeEntry}
            canRemove={entries.length > 1}
          />
        ))}
      </div>

      {/* Submit Button */}
      <SubmitButton
        disabled={!canSubmit}
        isSubmitting={isSubmitting}
        submittingText={
          submittingCount > 0 
            ? `Starting ${submittingCount} Evaluation${submittingCount !== 1 ? 's' : ''}...`
            : 'Starting Evaluations...'
        }
      >
        Start {validEntries.length} Evaluation{validEntries.length !== 1 ? 's' : ''}
      </SubmitButton>

      {/* Info */}
      {validEntries.length > 1 && (
        <p className="text-xs text-center text-navy-500 dark:text-navy-400">
          All evaluations will run in parallel. You can track progress in History.
        </p>
      )}
    </form>
  );
}
