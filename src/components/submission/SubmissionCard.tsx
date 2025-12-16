'use client';

import { memo, useCallback } from 'react';
import { isValidRepoUrl, isValidUrl } from '@/lib/utils';
import { fetchRepoMetadata, checkSiteAccessibility, RepoMetadata, SiteMetadata } from '@/lib/validators';
import { CheckIcon, XIcon, FolderIcon, GlobeIcon } from '@/components/ui';
import { ValidatedUrlInput, type ValidationState } from './ValidatedUrlInput';
import { useDebouncedEffect } from '@/hooks';

export interface SubmissionEntry {
  id: string;
  repoUrl: string;
  deployedUrl: string;
  repoValidation: ValidationState;
  siteValidation: ValidationState;
  repoMetadata: RepoMetadata | null;
  siteMetadata: SiteMetadata | null;
}

interface SubmissionCardProps {
  entry: SubmissionEntry;
  index: number;
  onUpdate: (id: string, updates: Partial<SubmissionEntry>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const SubmissionCard = memo(function SubmissionCard({
  entry,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: SubmissionCardProps) {
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
});
