'use client';

import { useState } from 'react';
import { SubmitButton, PlusIcon } from '@/components/ui';
import { RepoPreview } from './RepoPreview';
import { SitePreview } from './SitePreview';
import { PreflightSummary } from './PreflightSummary';
import { AdvancedOptions } from './submission/AdvancedOptions';
import { ValidatedUrlInput } from './submission/ValidatedUrlInput';
import { useRepoValidation, useSiteValidation } from '@/hooks';

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

  // Use extracted validation hooks
  const { validation: repoValidation, metadata: repoMetadata } = useRepoValidation(repoUrl);
  const { validation: backendValidation, metadata: backendMetadata } = useRepoValidation(backendRepoUrl, { optional: true });
  const { validation: siteValidation, metadata: siteMetadata } = useSiteValidation(deployedUrl);

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
              <PlusIcon className="w-5 h-5 text-white" />
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
        <div className="mt-5">
          <SubmitButton
            disabled={!canSubmit}
            isSubmitting={isSubmitting}
            submittingText="Starting Evaluation..."
          >
            Start Evaluation
          </SubmitButton>
        </div>
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
