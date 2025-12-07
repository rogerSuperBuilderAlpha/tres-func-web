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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Submit Candidate for Evaluation
        </h2>

        <div className="space-y-4">
          {/* Form inputs */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="repoUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Frontend Repository URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/frontend-repo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                required
              />
              {repoUrl && !isValidGitHubUrl(repoUrl) && (
                <p className="mt-1 text-xs text-red-500">
                  Please enter a valid GitHub URL
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="backendRepoUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Backend Repository URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                id="backendRepoUrl"
                value={backendRepoUrl}
                onChange={(e) => setBackendRepoUrl(e.target.value)}
                placeholder="https://github.com/username/backend-repo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              />
              {backendRepoUrl && !isValidGitHubUrl(backendRepoUrl) && (
                <p className="mt-1 text-xs text-red-500">
                  Please enter a valid GitHub URL
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="deployedUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Deployed Application URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="deployedUrl"
                value={deployedUrl}
                onChange={(e) => setDeployedUrl(e.target.value)}
                placeholder="https://candidate-app.vercel.app"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                required
              />
              {deployedUrl && !isValidUrl(deployedUrl) && (
                <p className="mt-1 text-xs text-red-500">
                  Please enter a valid URL
                </p>
              )}
            </div>

            {/* Methodology note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-medium mb-1">About deployment methodology</p>
              <p className="text-blue-600">
                Whether you use a monorepo, separate repos, or serverless architecture does not affect our evaluation.
                We focus on how you solve the problem, not your deployment choices.
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-2.5 px-4 rounded-lg font-medium transition ${
                canSubmit
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Start Evaluation'
              )}
            </button>
          </div>

          {/* What gets evaluated - full width below */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs">
            <h3 className="font-medium text-gray-800 mb-2">What gets evaluated?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-600">
              <div className="flex items-center">
                <span className="text-blue-500 mr-1.5">•</span>
                Code quality & structure
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1.5">•</span>
                Security vulnerabilities
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1.5">•</span>
                Error handling
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1.5">•</span>
                Image processing
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1.5">•</span>
                Form validation
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1.5">•</span>
                Resilience under load
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1.5">•</span>
                Core functionality
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1.5">•</span>
                UX & accessibility
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
