'use client';

import { useState, useCallback, useId } from 'react';
import { isValidRepoUrl, isValidUrl } from '@/lib/utils';
import { fetchRepoMetadata, checkSiteAccessibility, RepoMetadata, SiteMetadata } from '@/lib/validators';
import { SubmitButton, PlusIcon, CheckIcon, XIcon, FolderIcon, GlobeIcon, StackIcon } from '@/components/ui';
import { ValidatedUrlInput } from './submission/ValidatedUrlInput';
import { useDebouncedEffect, type ValidationState } from '@/hooks';

export interface SubmissionEntry {
  id: string;
  repoUrl: string;
  deployedUrl: string;
  repoValidation: ValidationState;
  siteValidation: ValidationState;
  repoMetadata: RepoMetadata | null;
  siteMetadata: SiteMetadata | null;
}

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

function SubmissionCard({
  entry,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  entry: SubmissionEntry;
  index: number;
  onUpdate: (id: string, updates: Partial<SubmissionEntry>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const isValid = entry.repoValidation.valid && entry.siteValidation.valid;

  // Debounced validation for repo URL
  const validateRepo = useCallback(async (url: string) => {
    if (!url) {
      onUpdate(entry.id, {
        repoValidation: { checking: false, valid: false },
        repoMetadata: null,
      });
      return;
    }

    if (!isValidRepoUrl(url)) {
      onUpdate(entry.id, {
        repoValidation: { checking: false, valid: false, error: 'Invalid repository URL' },
        repoMetadata: null,
      });
      return;
    }

    onUpdate(entry.id, { repoValidation: { checking: true, valid: false } });

    const metadata = await fetchRepoMetadata(url);
    if (metadata) {
      if (metadata.isPrivate) {
        onUpdate(entry.id, {
          repoValidation: { checking: false, valid: false, error: 'Repository is private' },
          repoMetadata: metadata,
        });
      } else {
        onUpdate(entry.id, {
          repoValidation: { checking: false, valid: true },
          repoMetadata: metadata,
        });
      }
    } else {
      onUpdate(entry.id, {
        repoValidation: { checking: false, valid: false, error: 'Repository not found' },
        repoMetadata: null,
      });
    }
  }, [entry.id, onUpdate]);

  // Debounced validation for site URL
  const validateSite = useCallback(async (url: string) => {
    if (!url) {
      onUpdate(entry.id, {
        siteValidation: { checking: false, valid: false },
        siteMetadata: null,
      });
      return;
    }

    if (!isValidUrl(url)) {
      onUpdate(entry.id, {
        siteValidation: { checking: false, valid: false, error: 'Invalid URL' },
        siteMetadata: null,
      });
      return;
    }

    onUpdate(entry.id, { siteValidation: { checking: true, valid: false } });

    const metadata = await checkSiteAccessibility(url);
    onUpdate(entry.id, {
      siteMetadata: metadata,
      siteValidation: {
        checking: false,
        valid: metadata.accessible,
        error: metadata.accessible ? undefined : 'Site unreachable',
      },
    });
  }, [entry.id, onUpdate]);

  // Validate on URL changes with debounce
  useDebouncedEffect(() => void validateRepo(entry.repoUrl), [entry.repoUrl], 500);
  useDebouncedEffect(() => void validateSite(entry.deployedUrl), [entry.deployedUrl], 500);

  return (
    <div className={`glass dark:bg-navy-900/90 rounded-2xl shadow-xl p-5 border transition-all ${
      isValid 
        ? 'border-success-300 dark:border-success-700' 
        : 'border-navy-100 dark:border-navy-700'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold ${
            isValid 
              ? 'bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400' 
              : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400'
          }`}>
            {index + 1}
          </div>
          <span className="text-sm font-medium text-navy-700 dark:text-navy-300">
            Submission {index + 1}
          </span>
          {isValid && <CheckIcon className="w-4 h-4 text-success-500" />}
        </div>
        
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="p-1.5 text-navy-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <ValidatedUrlInput
          id={`repo-${entry.id}`}
          label="Repository"
          required
          value={entry.repoUrl}
          onChange={(url) => onUpdate(entry.id, { repoUrl: url })}
          placeholder="https://github.com/username/repo"
          validation={entry.repoValidation}
        />

        <ValidatedUrlInput
          id={`site-${entry.id}`}
          label="Deployed URL"
          required
          value={entry.deployedUrl}
          onChange={(url) => onUpdate(entry.id, { deployedUrl: url })}
          placeholder="https://candidate-app.vercel.app"
          validation={entry.siteValidation}
        />
      </div>

      {/* Compact Preview */}
      {(entry.repoMetadata || entry.siteMetadata) && (
        <div className="mt-3 pt-3 border-t border-navy-100 dark:border-navy-700 space-y-2">
          {entry.repoMetadata && (
            <div className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-400">
              <FolderIcon className="w-3.5 h-3.5" />
              <span className="font-medium">{entry.repoMetadata.name}</span>
              <span className="text-navy-400">•</span>
              <span>{entry.repoMetadata.language || 'Unknown'}</span>
              {entry.repoMetadata.stars > 0 && (
                <>
                  <span className="text-navy-400">•</span>
                  <span>⭐ {entry.repoMetadata.stars}</span>
                </>
              )}
            </div>
          )}
          {entry.siteMetadata?.accessible && (
            <div className="flex items-center gap-2 text-xs text-success-600 dark:text-success-400">
              <GlobeIcon className="w-3.5 h-3.5" />
              <span>Site accessible ({entry.siteMetadata.statusCode})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
