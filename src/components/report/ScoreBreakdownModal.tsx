'use client';

import { memo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { getScoreColor, getScoreHex } from '@/lib/utils';
import type {
  CoreFunctionalityBreakdown,
  ErrorHandlingBreakdown,
  UxAccessibilityBreakdown,
  CodeQualityBreakdown,
  SecurityBreakdown,
  DeploymentBreakdown,
  PlaywrightSubmission,
} from '@/types';

type BreakdownType =
  | CoreFunctionalityBreakdown
  | ErrorHandlingBreakdown
  | UxAccessibilityBreakdown
  | CodeQualityBreakdown
  | SecurityBreakdown
  | DeploymentBreakdown;

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  score: number;
  maxScore: number;
  breakdown: BreakdownType | undefined;
  categoryKey: string;
}

export const ScoreBreakdownModal = memo(function ScoreBreakdownModal({
  isOpen,
  onClose,
  title,
  icon,
  score,
  maxScore,
  breakdown,
  categoryKey,
}: ScoreBreakdownModalProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<PlaywrightSubmission | null>(null);
  const percentage = Math.round((score / maxScore) * 100);

  if (!breakdown) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`${icon} ${title} Breakdown`}>
        <div className="p-6 text-center text-navy-500 dark:text-navy-400">
          No detailed breakdown available for this category.
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${icon} ${title} Breakdown`} size="xl">
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Score Header */}
        <div className="flex items-center justify-between pb-4 border-b border-navy-200 dark:border-navy-700">
          <div className="text-lg font-semibold text-navy-800 dark:text-white">
            Score: <span className={getScoreColor(score, maxScore)}>{score}</span>
            <span className="text-navy-400">/{maxScore}</span>
          </div>
          <div className="h-3 w-48 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
                backgroundColor: getScoreHex(score, maxScore),
              }}
            />
          </div>
        </div>

        {/* Category-specific content */}
        {categoryKey === 'coreFunctionality' && (
          <CoreFunctionalityContent
            breakdown={breakdown as CoreFunctionalityBreakdown}
            selectedSubmission={selectedSubmission}
            onSelectSubmission={setSelectedSubmission}
          />
        )}
        {categoryKey === 'errorHandling' && (
          <GenericBreakdownContent breakdown={breakdown as ErrorHandlingBreakdown} />
        )}
        {categoryKey === 'uxAccessibility' && (
          <GenericBreakdownContent breakdown={breakdown as UxAccessibilityBreakdown} />
        )}
        {categoryKey === 'codeQuality' && (
          <CodeQualityContent breakdown={breakdown as CodeQualityBreakdown} />
        )}
        {categoryKey === 'security' && (
          <SecurityContent breakdown={breakdown as SecurityBreakdown} />
        )}
        {categoryKey === 'deploymentCompliance' && (
          <GenericBreakdownContent breakdown={breakdown as DeploymentBreakdown} />
        )}
      </div>
    </Modal>
  );
});

// Core Functionality breakdown with Playwright submissions
function CoreFunctionalityContent({
  breakdown,
  selectedSubmission,
  onSelectSubmission,
}: {
  breakdown: CoreFunctionalityBreakdown;
  selectedSubmission: PlaywrightSubmission | null;
  onSelectSubmission: (sub: PlaywrightSubmission | null) => void;
}) {
  const submissions = breakdown.playwrightSubmissions || [];
  const accurateCount = submissions.filter((s) => s.scenarioType === 'accurate' && s.responseReceived).length;
  const inaccurateCount = submissions.filter((s) => s.scenarioType === 'inaccurate' && s.responseReceived).length;

  return (
    <div className="space-y-6">
      {/* Playwright Summary */}
      <div className="bg-navy-50 dark:bg-navy-800/50 rounded-lg p-4">
        <h3 className="font-semibold text-navy-800 dark:text-white mb-3">
          🎭 Playwright 20-Submission Test
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            label="Success Rate"
            value={`${Math.round(breakdown.playwrightSuccessRate)}%`}
            color={breakdown.playwrightSuccessRate >= 80 ? 'green' : breakdown.playwrightSuccessRate >= 60 ? 'yellow' : 'red'}
          />
          <StatBox
            label="Playwright Points"
            value={`${breakdown.playwrightPoints}/25`}
            color={breakdown.playwrightPoints >= 18 ? 'green' : breakdown.playwrightPoints >= 12 ? 'yellow' : 'red'}
          />
          <StatBox
            label="Accurate (Match)"
            value={`${accurateCount}/5`}
            color={accurateCount >= 4 ? 'green' : accurateCount >= 2 ? 'yellow' : 'red'}
          />
          <StatBox
            label="Inaccurate (Mismatch)"
            value={`${inaccurateCount}/15`}
            color={inaccurateCount >= 12 ? 'green' : inaccurateCount >= 8 ? 'yellow' : 'red'}
          />
        </div>
      </div>

      {/* Playwright Submissions Grid */}
      <div>
        <h3 className="font-semibold text-navy-800 dark:text-white mb-3">
          Individual Submissions ({submissions.length})
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {submissions.map((sub) => (
            <button
              key={sub.index}
              onClick={() => onSelectSubmission(sub)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium
                transition-all hover:scale-105 cursor-pointer border-2
                ${sub.responseReceived
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-400'
                }
                ${selectedSubmission?.index === sub.index ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
              `}
            >
              <span className="text-lg font-bold">{sub.index}</span>
              <span className="text-[10px] opacity-80">
                {sub.scenarioType === 'accurate' ? '✓' : '✗'}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-navy-500 dark:text-navy-400">
          <span>✓ = Accurate data (should match)</span>
          <span>✗ = Inaccurate data (should mismatch)</span>
        </div>
      </div>

      {/* Selected Submission Detail */}
      {selectedSubmission && (
        <SubmissionDetailPanel
          submission={selectedSubmission}
          onClose={() => onSelectSubmission(null)}
        />
      )}

      {/* HTTP Tests Summary */}
      <div className="bg-navy-50 dark:bg-navy-800/50 rounded-lg p-4">
        <h3 className="font-semibold text-navy-800 dark:text-white mb-3">
          🔌 HTTP API Tests
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <StatBox
            label="Tests Passed"
            value={`${breakdown.httpTestsPassed}/${breakdown.httpTestsTotal}`}
            color={breakdown.httpTestsPassed >= 4 ? 'green' : breakdown.httpTestsPassed >= 2 ? 'yellow' : 'red'}
          />
          <StatBox
            label="HTTP Points"
            value={`${breakdown.httpPoints}/15`}
            color={breakdown.httpPoints >= 12 ? 'green' : breakdown.httpPoints >= 6 ? 'yellow' : 'red'}
          />
        </div>
      </div>

      {/* Details List */}
      <DetailsList details={breakdown.details} />
    </div>
  );
}

// Submission detail panel with screenshots
function SubmissionDetailPanel({
  submission,
  onClose,
}: {
  submission: PlaywrightSubmission;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'form' | 'result'>('form');

  return (
    <div className="bg-white dark:bg-navy-800 rounded-lg border border-navy-200 dark:border-navy-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-navy-800 dark:text-white">
          Submission #{submission.index} Details
        </h4>
        <button
          onClick={onClose}
          className="text-navy-400 hover:text-navy-600 dark:hover:text-navy-200"
        >
          ✕
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Type:</span>
            <span className={submission.scenarioType === 'accurate' ? 'text-green-600' : 'text-orange-600'}>
              {submission.scenarioType === 'accurate' ? 'Accurate (should match)' : 'Inaccurate (should mismatch)'}
            </span>
          </div>
          {submission.errorType && (
            <div className="flex justify-between">
              <span className="text-navy-500 dark:text-navy-400">Error Type:</span>
              <span className="text-orange-600">{submission.errorType}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Brand:</span>
            <span className="text-navy-800 dark:text-white">{submission.brand}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Product:</span>
            <span className="text-navy-800 dark:text-white">{submission.product}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">ABV:</span>
            <span className="text-navy-800 dark:text-white">{submission.abv}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Volume:</span>
            <span className="text-navy-800 dark:text-white">{submission.volume}ml</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Submitted:</span>
            <span className={submission.submitted ? 'text-green-600' : 'text-red-600'}>
              {submission.submitted ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Response:</span>
            <span className={submission.responseReceived ? 'text-green-600' : 'text-red-600'}>
              {submission.responseReceived ? 'Received' : 'None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Response Type:</span>
            <span className="text-navy-800 dark:text-white">{submission.responseType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Response Time:</span>
            <span className="text-navy-800 dark:text-white">{submission.responseTimeMs}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-500 dark:text-navy-400">Result Screen:</span>
            <span className={submission.showedResultScreen ? 'text-green-600' : 'text-red-600'}>
              {submission.showedResultScreen ? 'Shown' : 'Not shown'}
            </span>
          </div>
        </div>
      </div>

      {/* Screenshot Tabs */}
      {(submission.formFilledScreenshot || submission.completedScreenshot) && (
        <div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300'
              }`}
            >
              Form Filled
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                activeTab === 'result'
                  ? 'bg-blue-600 text-white'
                  : 'bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300'
              }`}
            >
              Result Screen
            </button>
          </div>
          <div className="rounded-lg overflow-hidden border border-navy-200 dark:border-navy-700">
            {activeTab === 'form' && submission.formFilledScreenshot && (
              <img
                src={submission.formFilledScreenshot}
                alt={`Form filled for submission ${submission.index}`}
                className="w-full h-auto"
              />
            )}
            {activeTab === 'result' && submission.completedScreenshot && (
              <img
                src={submission.completedScreenshot}
                alt={`Result for submission ${submission.index}`}
                className="w-full h-auto"
              />
            )}
            {activeTab === 'form' && !submission.formFilledScreenshot && (
              <div className="p-8 text-center text-navy-400">No form screenshot available</div>
            )}
            {activeTab === 'result' && !submission.completedScreenshot && (
              <div className="p-8 text-center text-navy-400">No result screenshot available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Code Quality specific content
function CodeQualityContent({ breakdown }: { breakdown: CodeQualityBreakdown }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <CheckItem label="Has Tests" checked={breakdown.hasTests} detail={breakdown.hasTests ? `${breakdown.testFileCount} files` : undefined} />
        <CheckItem label="Uses TypeScript" checked={breakdown.usesTypeScript} />
        <CheckItem label="Frontend/Backend Separation" checked={breakdown.hasSeparation} />
        <CheckItem label="Has .gitignore" checked={breakdown.hasGitignore} />
        <CheckItem label="README with Setup" checked={breakdown.hasReadme} />
        {breakdown.llmProvider && (
          <div className="bg-navy-50 dark:bg-navy-800 rounded p-3">
            <div className="text-xs text-navy-500 dark:text-navy-400">LLM Provider</div>
            <div className="font-medium text-navy-800 dark:text-white">{breakdown.llmProvider}</div>
            <div className={`text-xs ${breakdown.llmProviderType === 'direct' ? 'text-green-600' : 'text-orange-600'}`}>
              {breakdown.llmProviderType === 'direct' ? '✓ Direct (OpenAI/Anthropic)' : '⚠ Reseller'}
            </div>
          </div>
        )}
      </div>
      <DetailsList details={breakdown.details} />
    </div>
  );
}

// Security specific content
function SecurityContent({ breakdown }: { breakdown: SecurityBreakdown }) {
  const issues = [
    { label: 'Secrets in Code', value: breakdown.secretsInCode, critical: true },
    { label: 'Secrets in Git History', value: breakdown.secretsInHistory, critical: true },
    { label: 'XSS Vulnerable', value: breakdown.xssVulnerable, critical: true },
    { label: 'SQL Injection Accepted', value: breakdown.sqlInjectionAccepted, critical: true },
    { label: 'Debug Mode Enabled', value: breakdown.debugModeEnabled, critical: false },
    { label: 'Accepts .exe as .jpg', value: breakdown.acceptsExeAsJpg, critical: false },
    { label: 'API Keys in Client', value: breakdown.apiKeysInClient, critical: true },
  ];

  const hasIssues = issues.some((i) => (typeof i.value === 'number' ? i.value > 0 : i.value));

  return (
    <div className="space-y-4">
      {hasIssues ? (
        <div className="space-y-2">
          {issues.map((issue) => {
            const isActive = typeof issue.value === 'number' ? issue.value > 0 : issue.value;
            if (!isActive) return null;
            return (
              <div
                key={issue.label}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  issue.critical
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <span className={issue.critical ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}>
                  {issue.critical ? '🚨' : '⚠️'} {issue.label}
                </span>
                <span className="font-mono font-bold">
                  {typeof issue.value === 'number' ? issue.value : 'Yes'}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <span className="text-green-700 dark:text-green-400 font-medium">
            ✓ No security issues detected
          </span>
        </div>
      )}
      <DetailsList details={breakdown.details} />
    </div>
  );
}

// Generic breakdown content for simple categories
function GenericBreakdownContent({ breakdown }: { breakdown: { details: string[]; totalPoints: number; maxPoints: number } }) {
  return (
    <div className="space-y-4">
      <DetailsList details={breakdown.details} />
    </div>
  );
}

// Reusable components
function StatBox({ label, value, color }: { label: string; value: string; color: 'green' | 'yellow' | 'red' }) {
  const colors = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
  };

  return (
    <div className={`rounded-lg p-3 border ${colors[color]} text-center`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function CheckItem({ label, checked, detail }: { label: string; checked: boolean; detail?: string }) {
  return (
    <div className={`rounded p-3 ${checked ? 'bg-green-50 dark:bg-green-900/20' : 'bg-navy-50 dark:bg-navy-800'}`}>
      <div className="flex items-center gap-2">
        <span className={checked ? 'text-green-600' : 'text-navy-400'}>{checked ? '✓' : '✗'}</span>
        <span className="text-sm font-medium text-navy-800 dark:text-white">{label}</span>
      </div>
      {detail && <div className="text-xs text-navy-500 dark:text-navy-400 mt-1">{detail}</div>}
    </div>
  );
}

function DetailsList({ details }: { details: string[] }) {
  if (!details || details.length === 0) return null;

  return (
    <div className="bg-navy-50 dark:bg-navy-900/50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">Details</h4>
      <ul className="space-y-1 text-sm font-mono text-navy-600 dark:text-navy-400">
        {details.map((detail, i) => (
          <li key={i} className={detail.startsWith('  ') ? 'ml-4' : ''}>
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

