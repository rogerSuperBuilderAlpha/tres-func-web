'use client';

import { useState } from 'react';

interface SubmissionFormProps {
  onSubmit: (repoUrl: string, deployedUrl: string, backendRepoUrl?: string) => void;
  isSubmitting: boolean;
}

export function SubmissionForm({ onSubmit, isSubmitting }: SubmissionFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [backendRepoUrl, setBackendRepoUrl] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl && deployedUrl) {
      onSubmit(repoUrl, deployedUrl, backendRepoUrl || undefined);
    }
  };

  const isValidGitHubUrl = (url: string) => {
    return url.startsWith('https://github.com/');
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSubmit =
    isValidGitHubUrl(repoUrl) &&
    isValidUrl(deployedUrl) &&
    (!backendRepoUrl || isValidGitHubUrl(backendRepoUrl)) &&
    !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      <div className="glass rounded-2xl shadow-xl p-6 border border-navy-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-navy-900">
            Submit for Evaluation
          </h2>
        </div>

        <div className="space-y-4">
          {/* Form inputs */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="repoUrl"
                className="block text-sm font-medium text-navy-700 mb-1.5"
              >
                Frontend Repository <span className="text-danger-500">*</span>
              </label>
              <input
                type="url"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/frontend-repo"
                className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition text-sm text-navy-900 placeholder:text-navy-400"
                required
              />
              {repoUrl && !isValidGitHubUrl(repoUrl) && (
                <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please enter a valid GitHub URL
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="backendRepoUrl"
                className="block text-sm font-medium text-navy-700 mb-1.5"
              >
                Backend Repository <span className="text-navy-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                id="backendRepoUrl"
                value={backendRepoUrl}
                onChange={(e) => setBackendRepoUrl(e.target.value)}
                placeholder="https://github.com/username/backend-repo"
                className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition text-sm text-navy-900 placeholder:text-navy-400"
              />
              {backendRepoUrl && !isValidGitHubUrl(backendRepoUrl) && (
                <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please enter a valid GitHub URL
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="deployedUrl"
                className="block text-sm font-medium text-navy-700 mb-1.5"
              >
                Deployed Application <span className="text-danger-500">*</span>
              </label>
              <input
                type="url"
                id="deployedUrl"
                value={deployedUrl}
                onChange={(e) => setDeployedUrl(e.target.value)}
                placeholder="https://candidate-app.vercel.app"
                className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition text-sm text-navy-900 placeholder:text-navy-400"
                required
              />
              {deployedUrl && !isValidUrl(deployedUrl) && (
                <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please enter a valid URL
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                canSubmit
                  ? 'bg-gradient-to-r from-navy-700 to-navy-900 text-white hover:from-navy-600 hover:to-navy-800 shadow-lg shadow-navy-900/25 hover:shadow-xl hover:shadow-navy-900/30'
                  : 'bg-navy-200 text-navy-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
        </div>
      </div>
    </form>
  );
}
