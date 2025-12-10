'use client';

import { useState, useEffect, useCallback } from 'react';
import { isValidRepoUrl, isValidUrl, getRepoProvider } from '@/lib/utils';
import { fetchRepoMetadata, checkSiteAccessibility, RepoMetadata, SiteMetadata } from '@/lib/validators';
import { Spinner, Collapsible, Badge } from '@/components/ui';
import { RepoPreview } from './RepoPreview';
import { SitePreview } from './SitePreview';
import { PreflightSummary } from './PreflightSummary';

interface EnhancedSubmissionFormProps {
  onSubmit: (repoUrl: string, deployedUrl: string, backendRepoUrl?: string, options?: SubmissionOptions) => void;
  isSubmitting: boolean;
}

export interface SubmissionOptions {
  focusMode?: 'balanced' | 'security' | 'ux' | 'performance';
  skipTests?: string[];
  notes?: string;
}

interface ValidationState {
  checking: boolean;
  valid: boolean;
  error?: string;
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
  useEffect(() => {
    const timer = setTimeout(() => validateRepo(repoUrl), 500);
    return () => clearTimeout(timer);
  }, [repoUrl, validateRepo]);

  useEffect(() => {
    const timer = setTimeout(() => validateRepo(backendRepoUrl, true), 500);
    return () => clearTimeout(timer);
  }, [backendRepoUrl, validateRepo]);

  useEffect(() => {
    const timer = setTimeout(() => validateSite(deployedUrl), 500);
    return () => clearTimeout(timer);
  }, [deployedUrl, validateSite]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(repoUrl, deployedUrl, backendRepoUrl || undefined, {
        focusMode,
        notes: notes || undefined,
      });
    }
  };

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (isValidRepoUrl(text)) {
        if (!repoUrl) {
          setRepoUrl(text);
        } else if (!backendRepoUrl) {
          setBackendRepoUrl(text);
        }
      } else if (isValidUrl(text)) {
        setDeployedUrl(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const canSubmit =
    repoValidation.valid &&
    siteValidation.valid &&
    (backendRepoUrl === '' || backendValidation.valid) &&
    !isSubmitting;

  const focusModes = [
    { value: 'balanced', label: 'Balanced', icon: '⚖️', desc: 'All tests equally weighted' },
    { value: 'security', label: 'Security Focus', icon: '🔒', desc: 'Emphasis on security tests' },
    { value: 'ux', label: 'UX Focus', icon: '🎨', desc: 'Emphasis on UX & accessibility' },
    { value: 'performance', label: 'Performance', icon: '⚡', desc: 'Speed & resilience focus' },
  ];

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
          
          {/* Quick actions */}
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-navy-600 dark:text-navy-300 bg-navy-100 dark:bg-navy-700 rounded-lg hover:bg-navy-200 dark:hover:bg-navy-600 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Paste URL
          </button>
        </div>

        <div className="space-y-4">
          {/* Frontend Repository */}
          <ValidatedInput
            id="repoUrl"
            label="Frontend Repository"
            required
            value={repoUrl}
            onChange={setRepoUrl}
            placeholder="https://github.com/username/frontend-repo"
            validation={repoValidation}
          />

          {/* Backend Repository */}
          <ValidatedInput
            id="backendRepoUrl"
            label="Backend Repository"
            value={backendRepoUrl}
            onChange={setBackendRepoUrl}
            placeholder="https://github.com/username/backend-repo"
            validation={backendValidation}
            optional
          />

          {/* Deployed URL */}
          <ValidatedInput
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
        <div className="mt-5 pt-5 border-t border-navy-100 dark:border-navy-700">
          <Collapsible
            trigger={
              <div className="flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-navy-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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
                  {focusModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setFocusMode(mode.value as SubmissionOptions['focusMode'])}
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
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this submission..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition text-sm text-navy-900 dark:text-navy-100 placeholder:text-navy-400 dark:placeholder:text-navy-500 resize-none"
                />
              </div>
            </div>
          </Collapsible>
        </div>

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

// Validated Input Component
function ValidatedInput({
  id,
  label,
  required,
  value,
  onChange,
  placeholder,
  validation,
  optional,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  validation: ValidationState;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">
        {label}{' '}
        {required ? (
          <span className="text-danger-500">*</span>
        ) : (
          <span className="text-navy-400 dark:text-navy-500 font-normal">(optional)</span>
        )}
      </label>
      <div className="relative">
        <input
          type="url"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 pr-10 bg-white dark:bg-navy-800 border rounded-xl focus:ring-2 transition text-sm text-navy-900 dark:text-navy-100 placeholder:text-navy-400 dark:placeholder:text-navy-500 ${
            validation.error && value
              ? 'border-danger-300 dark:border-danger-500/50 focus:ring-danger-400 focus:border-danger-400'
              : validation.valid
              ? 'border-success-300 dark:border-success-500/50 focus:ring-success-400 focus:border-success-400'
              : 'border-navy-200 dark:border-navy-600 focus:ring-gold-400 focus:border-gold-400'
          }`}
          required={required}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validation.checking ? (
            <Spinner size="sm" className="text-navy-400" />
          ) : validation.valid && value ? (
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : validation.error && value ? (
            <svg className="w-5 h-5 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : null}
        </div>
      </div>
      {validation.error && value && (
        <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validation.error}
        </p>
      )}
    </div>
  );
}

