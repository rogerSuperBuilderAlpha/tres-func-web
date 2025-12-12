'use client';

import { useState, useCallback } from 'react';
import { isValidRepoUrl, isValidUrl } from '@/lib/utils';
import { fetchRepoMetadata, checkSiteAccessibility, RepoMetadata, SiteMetadata } from '@/lib/validators';
import { Spinner } from '@/components/ui';
import { RepoPreview } from './RepoPreview';
import { SitePreview } from './SitePreview';
import { PreflightSummary } from './PreflightSummary';
import { AdvancedOptions } from './submission/AdvancedOptions';
import { ValidatedUrlInput, type ValidationState } from './submission/ValidatedUrlInput';
import { useDebouncedEffect } from '@/hooks';

interface EnhancedSubmissionFormProps {
  onSubmit: (repoUrl: string, deployedUrl: string, backendRepoUrl?: string, options?: SubmissionOptions) => void;
  isSubmitting: boolean;
}

export interface SubmissionOptions {
  focusMode?: 'balanced' | 'security' | 'ux' | 'performance';
  skipTests?: string[];
  notes?: string;
}

export function EnhancedSubmissionForm({ onSubmit, isSubmitting }: EnhancedSubmissionFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [backendRepoUrl, setBackendRepoUrl] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [focusMode, setFocusMode] = useState<SubmissionOptions['focusMode']>('balanced');
  
  // Validation states
  const [repoValidation, setRepoValidation] = useState<ValidationState>({ checking: false, valid: false });
  const [backendValidation, setBackendValidation] = useState<ValidationState>({ checking: false, valid: true });
  const [siteValidation, setSiteValidation] = useState<ValidationState>({ checking: false, valid: false });
  
  // Metadata
  const [repoMetadata, setRepoMetadata] = useState<RepoMetadata | null>(null);
  const [backendMetadata, setBackendMetadata] = useState<RepoMetadata | null>(null);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);

  // Debounced validation for repo URL
  const validateRepo = useCallback(async (url: string, isBackend = false) => {
    const setState = isBackend ? setBackendValidation : setRepoValidation;
    const setMeta = isBackend ? setBackendMetadata : setRepoMetadata;

    if (!url) {
      setState({ checking: false, valid: isBackend }); // Backend is optional
      setMeta(null);
      return;
    }

    if (!isValidRepoUrl(url)) {
      setState({ checking: false, valid: false, error: 'Invalid GitHub URL' });
      setMeta(null);
      return;
    }

    setState({ checking: true, valid: false });

    const metadata = await fetchRepoMetadata(url);
    if (metadata) {
      if (metadata.isPrivate) {
        setState({ checking: false, valid: false, error: 'Repository is private' });
      } else {
        setState({ checking: false, valid: true });
      }
      setMeta(metadata);
    } else {
      setState({ checking: false, valid: false, error: 'Repository not found' });
      setMeta(null);
    }
  }, []);

  // Debounced validation for site URL
  const validateSite = useCallback(async (url: string) => {
    if (!url) {
      setSiteValidation({ checking: false, valid: false });
      setSiteMetadata(null);
      return;
    }

    if (!isValidUrl(url)) {
      setSiteValidation({ checking: false, valid: false, error: 'Invalid URL' });
      setSiteMetadata(null);
      return;
    }

    setSiteValidation({ checking: true, valid: false });

    const metadata = await checkSiteAccessibility(url);
    setSiteMetadata(metadata);
    setSiteValidation({
      checking: false,
      valid: metadata.accessible,
      error: metadata.accessible ? undefined : 'Site unreachable',
    });
  }, []);

  // Validate on URL changes with debounce
  useDebouncedEffect(() => void validateRepo(repoUrl), [repoUrl, validateRepo], 500);
  useDebouncedEffect(() => void validateRepo(backendRepoUrl, true), [backendRepoUrl, validateRepo], 500);
  useDebouncedEffect(() => void validateSite(deployedUrl), [deployedUrl, validateSite], 500);

  const canSubmit =
    repoValidation.valid &&
    siteValidation.valid &&
    (backendRepoUrl === '' || backendValidation.valid) &&
    !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(repoUrl, deployedUrl, backendRepoUrl || undefined, {
        focusMode,
        notes: notes || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main submission card */}
      <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl p-6 border border-navy-100 dark:border-navy-700">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">New Evaluation</h2>
              <p className="text-xs text-navy-500 dark:text-navy-400">Enter submission details</p>
            </div>
          </div>
          
        </div>

        <div className="space-y-4">
          {/* Frontend Repository */}
          <ValidatedUrlInput
            id="repoUrl"
            label="Frontend Repository"
            required
            value={repoUrl}
            onChange={setRepoUrl}
            placeholder="https://github.com/username/frontend-repo"
            validation={repoValidation}
          />

          {/* Backend Repository */}
          <ValidatedUrlInput
            id="backendRepoUrl"
            label="Backend Repository"
            value={backendRepoUrl}
            onChange={setBackendRepoUrl}
            placeholder="https://github.com/username/backend-repo"
            validation={backendValidation}
            optional
          />

          {/* Deployed URL */}
          <ValidatedUrlInput
            id="deployedUrl"
            label="Deployed Application"
            required
            value={deployedUrl}
            onChange={setDeployedUrl}
            placeholder="https://candidate-app.vercel.app"
            validation={siteValidation}
          />
        </div>

        {/* Advanced Options */}
        <AdvancedOptions
          focusMode={focusMode}
          onFocusModeChange={setFocusMode}
          notes={notes}
          onNotesChange={setNotes}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full mt-5 py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
            canSubmit
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-400 hover:to-gold-500 shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/30 hover:-translate-y-0.5'
              : 'bg-navy-200 dark:bg-navy-700 text-navy-400 dark:text-navy-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Spinner size="sm" className="mr-2 text-white" />
              Starting Evaluation...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Evaluation
            </span>
          )}
        </button>
      </div>

      {/* Preview Cards */}
      {(repoMetadata || siteMetadata) && (
        <div className="space-y-3">
          {repoMetadata && <RepoPreview metadata={repoMetadata} label="Frontend Repository" />}
          {backendMetadata && <RepoPreview metadata={backendMetadata} label="Backend Repository" />}
          {siteMetadata && deployedUrl && <SitePreview url={deployedUrl} metadata={siteMetadata} />}
        </div>
      )}

      {/* Preflight Summary */}
      <PreflightSummary
        repoValid={repoValidation.valid}
        siteValid={siteValidation.valid}
        isReady={canSubmit}
      />
    </form>
  );
}
