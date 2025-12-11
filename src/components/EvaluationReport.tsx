'use client';

import { useState } from 'react';
import type { EvaluationReportData, ManualReview, CriticalIssue } from '@/types';
import { getScoreTierGradient, getScoreColor } from '@/lib/utils';
import { AccordionItem, ReviewCard, ReviewDetailModal, ScoreCard, QualitativeAssessmentCard } from './report';

// Helper to normalize critical issues (handles both string and object formats)
function formatCriticalIssue(issue: string | CriticalIssue): string {
  if (typeof issue === 'string') {
    return issue;
  }
  const description = issue.description || issue.issue || 'Unknown issue';
  const severity = issue.severity ? `[${issue.severity.toUpperCase()}]` : '';
  const category = issue.category || issue.type || '';
  
  if (category && severity) {
    return `${severity} ${category}: ${description}`;
  } else if (category) {
    return `${category}: ${description}`;
  } else if (severity) {
    return `${severity} ${description}`;
  }
  return description;
}

interface EvaluationReportProps {
  report: EvaluationReportData;
  onReset: () => void;
  pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
  pdfUrl?: string;
  onRetryPdf?: () => void;
  manualReviews?: ManualReview[];
}

// Rubric configuration
const RUBRIC_LABELS: Record<string, { label: string; max: number; icon: string }> = {
  coreFunctionality: { label: 'Core Functionality', max: 20, icon: '⚡' },
  errorHandling: { label: 'Error Handling', max: 20, icon: '🛡️' },
  uxAccessibility: { label: 'UX & Accessibility', max: 20, icon: '✨' },
  codeQuality: { label: 'Code Quality', max: 10, icon: '📐' },
  security: { label: 'Security', max: 10, icon: '🔒' },
  deploymentCompliance: { label: 'Deployment', max: 10, icon: '🚀' },
};

const RUBRIC_TO_SUITE_MAP: Record<string, string[]> = {
  coreFunctionality: ['functional', 'imageEdgeCases'],
  errorHandling: ['formInput', 'resilience', 'imageEdgeCases'],
  uxAccessibility: ['uxTest', 'resilience'],
  codeQuality: ['repoAnalysis', 'aiReview'],
  security: ['security'],
  deploymentCompliance: ['deployment', 'repoAnalysis'],
};

// Helper to generate fallback assessment for each rubric key
type Suites = Record<string, Record<string, unknown>>;

function getFallbackAssessment(rubricKey: string, suites: Suites, percentage: number): string {
  switch (rubricKey) {
    case 'coreFunctionality': {
      const func = suites.functional as Record<string, { passed?: boolean }> | undefined;
      if (!func) return 'Functional tests completed';
      const passed = [func.scenarioA_Match?.passed, func.scenarioB_BrandMismatch?.passed, func.scenarioC_AbvMismatch?.passed].filter(Boolean).length;
      const baseText = passed === 3 ? 'All core verification scenarios pass.' : passed === 0 ? 'Core verification logic not working.' : `${passed}/3 scenarios passed.`;
      return (passed === 3 && percentage < 60) ? `${baseText} Additional scoring factors need improvement.` : baseText;
    }
    case 'errorHandling': {
      const res = suites.resilience as Record<string, unknown> | undefined;
      const parts: string[] = [];
      if (res?.recoversAfterError) parts.push('Recovers gracefully');
      if (res?.rapidSubmissions) parts.push('Handles rapid submissions');
      return parts.length > 0 ? parts.join('. ') : 'Error handling tested';
    }
    case 'uxAccessibility': {
      const ux = suites.uxTest as Record<string, unknown> | undefined;
      if (!ux) return 'UX evaluation completed';
      const parts: string[] = [];
      if (ux.isMobileResponsive) parts.push('Mobile responsive');
      if (ux.hasProperHeadings) parts.push('Proper headings');
      const loadTime = ux.loadTimeMs as number | undefined;
      if (loadTime && loadTime < 2000) parts.push(`Fast load (${(loadTime/1000).toFixed(1)}s)`);
      return parts.length > 0 ? parts.join('. ') : 'UX evaluated';
    }
    case 'codeQuality': {
      const repo = suites.repoAnalysis as Record<string, unknown> | undefined;
      const parts: string[] = [];
      if (repo?.hasTests) parts.push('Has tests');
      if (repo?.separatesFrontendBackend) parts.push('Clean architecture');
      return parts.length > 0 ? parts.join('. ') : 'Code analysis completed';
    }
    case 'security': {
      const sec = suites.security as Record<string, Record<string, boolean>> | undefined;
      if (!sec) return 'Security assessed';
      const issues: string[] = [];
      if (sec.xss?.brandNameFieldVulnerable) issues.push('XSS detected');
      if (sec.injection?.sqlInjectionPayloadsAccepted) issues.push('SQL injection risk');
      return issues.length > 0 ? issues.join('. ') : 'No critical vulnerabilities';
    }
    case 'deploymentCompliance': {
      const dep = suites.deployment as Record<string, unknown> | undefined;
      const repo = suites.repoAnalysis as Record<string, unknown> | undefined;
      const parts: string[] = [];
      if (dep?.urlAccessible) parts.push('URL accessible');
      if (repo?.readmeHasSetupInstructions) parts.push('README complete');
      return parts.length > 0 ? parts.join('. ') : 'Deployment verified';
    }
    default:
      return 'Assessment completed';
  }
}

export { PdfStatusButton } from './report/PdfStatusButton';

export function EvaluationReport({ report, manualReviews = [] }: EvaluationReportProps) {
  const [selectedReview, setSelectedReview] = useState<ManualReview | null>(null);
  const hasRubric = !!report.scores?.rubric;
  const overallScore = report.scores?.rubric?.overall ?? report.scores?.overall ?? 0;
  const maxScore = hasRubric ? 90 : 100;
  const scoreTier = getScoreTierGradient(overallScore, maxScore);

  const getRubricAssessment = (rubricKey: string): string => {
    const suites = report.suites as Suites | undefined;
    const rubric = report.scores?.rubric as Record<string, number> | undefined;
    const score = rubric?.[rubricKey] || 0;
    const maxScoreForKey = RUBRIC_LABELS[rubricKey]?.max || 20;
    const percentage = Math.round((score / maxScoreForKey) * 100);

    // First, check for overall scoreReasoning (this considers ALL tests including Playwright)
    const scoreReasoning = (report as unknown as Record<string, unknown>).scoreReasoning as Record<string, string> | undefined;
    if (scoreReasoning?.[rubricKey] && scoreReasoning[rubricKey] !== 'Fallback scoring - AI unavailable') {
      return scoreReasoning[rubricKey];
    }

    // For Core Functionality, prioritize showing Playwright results since they reflect real user experience
    if (rubricKey === 'coreFunctionality' && suites?.uxTest) {
      const uxTest = suites.uxTest as Record<string, unknown>;
      const formInteraction = uxTest.formInteraction as { submissionResult?: { submitted?: boolean; responseReceived?: boolean; showedResultScreen?: boolean } } | undefined;
      const result = formInteraction?.submissionResult;
      if (result?.submitted && result?.responseReceived && result?.showedResultScreen) {
        return `Playwright browser tests show the application works for real users: form was found, fields were filled, image was uploaded, form was submitted successfully, and results were displayed. This indicates core functionality works from the user's perspective. HTTP API tests may have failed due to endpoint path differences, but the user-facing experience is functional.`;
      }
    }

    if (!suites) return 'Assessment data not available';

    // Fall back to suite-level AI analysis
    for (const suiteKey of (RUBRIC_TO_SUITE_MAP[rubricKey] || [])) {
      const suite = suites[suiteKey];
      const aiAnalysis = suite?.aiAnalysis as { explanation?: string; keyFindings?: string[] } | undefined;
      if (aiAnalysis?.explanation) {
        const findings = aiAnalysis.keyFindings?.slice(0, 2) || [];
        let explanation = findings.length > 0 ? `${aiAnalysis.explanation} ${findings.join('. ')}` : aiAnalysis.explanation;
        
        if (percentage < 60 && !explanation.toLowerCase().includes('issue') && !explanation.toLowerCase().includes('fail') && !explanation.toLowerCase().includes('crash')) {
          explanation = `${explanation} ${percentage < 40 ? 'Significant room for improvement.' : 'Some areas need work.'}`;
        }
        return explanation;
      }
    }

    // Use extracted fallback assessment helper
    return getFallbackAssessment(rubricKey, suites, percentage);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Column - Summary */}
      <div className="w-full lg:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-navy-200 glass overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Score Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-block px-8 py-3 rounded-2xl shadow-lg mb-3"
              style={scoreTier.style}
            >
              <span className="text-2xl font-bold text-white">{scoreTier.label}</span>
            </div>
            <div className={`text-6xl font-bold font-mono ${getScoreColor(overallScore, maxScore)}`}>
              {overallScore}
            </div>
            <p className="text-navy-500 mt-1">out of {maxScore} points</p>
          </div>

          {/* Links & Details */}
          <div className="bg-white rounded-xl border border-navy-200 p-5 mb-6 shadow-sm">
            <h3 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              Links & Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-navy-400 mb-1">Repository</p>
                <a href={report.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-navy-700 hover:text-gold-600 font-medium truncate block">
                  {(report.repoUrl || '').replace('https://github.com/', '').replace('https://gitlab.com/', '')}
                </a>
              </div>
              <div>
                <p className="text-xs text-navy-400 mb-1">Deployed App</p>
                <a href={report.deployedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-navy-700 hover:text-gold-600 font-medium truncate block">
                  {(report.deployedUrl || '').replace('https://', '')}
                </a>
              </div>
              <div>
                <p className="text-xs text-navy-400 mb-1">Evaluated</p>
                <p className="text-sm text-navy-700 font-medium">
                  {report.evaluatedAt ? new Date(report.evaluatedAt).toLocaleString() : 'Unknown'}
                </p>
              </div>
              {report.llmCosts && report.llmCosts.totalCostUsd > 0 && (
                <div className="pt-3 border-t border-navy-100 mt-3">
                  <p className="text-xs text-navy-400 mb-1">LLM Evaluation Cost</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-navy-700 font-medium">
                      ${report.llmCosts.totalCostUsd.toFixed(4)}
                    </span>
                    <span className="text-xs text-navy-400">
                      ({(report.llmCosts.totalTokens || 0).toLocaleString()} tokens)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Summary Card */}
          {report.aiExecutiveSummary && (
            <div className="bg-white rounded-xl border border-navy-200 p-5 mb-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gold-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
                AI Assessment
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed mb-4">{report.aiExecutiveSummary.overallAssessment}</p>
              
              {report.aiExecutiveSummary.keyStrengths && report.aiExecutiveSummary.keyStrengths.length > 0 && (
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-success-500 mt-0.5">✓</span>
                  <p className="text-sm text-navy-600">{report.aiExecutiveSummary.keyStrengths.slice(0, 2).join(', ')}</p>
                </div>
              )}
              {report.aiExecutiveSummary.keyWeaknesses && report.aiExecutiveSummary.keyWeaknesses.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-warning-500 mt-0.5">!</span>
                  <p className="text-sm text-navy-600">{report.aiExecutiveSummary.keyWeaknesses.slice(0, 2).join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* Critical Issues */}
          {((report.criticalIssues?.length ?? 0) > 0 || (report.criticalFailures?.length ?? 0) > 0) && (
            <div className="bg-danger-50 rounded-xl border border-danger-200 p-4 mb-6">
              <h3 className="text-sm font-semibold text-danger-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Critical Issues ({(report.criticalIssues ?? report.criticalFailures ?? []).length})
              </h3>
              <ul className="space-y-2">
                {(report.criticalIssues ?? report.criticalFailures ?? []).map((issue, i) => (
                  <li key={i} className="text-sm text-danger-700 flex items-start gap-2">
                    <span className="text-danger-400 mt-0.5">•</span>
                    <span>{formatCriticalIssue(issue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Accordion sections */}
          <div className="bg-white rounded-xl border border-navy-200 shadow-sm">
            <div className="px-5">
              <AccordionItem 
                title="Strengths" 
                count={report.summary?.strengths?.length} 
                countColor="bg-success-100 text-success-700"
                defaultOpen={false}
              >
                <ul className="space-y-2">
                  {(report.summary?.strengths ?? []).slice(0, 8).map((item, i) => (
                    <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                      <span className="text-success-500 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </AccordionItem>

              <AccordionItem 
                title="Concerns" 
                count={report.summary?.concerns?.length}
                countColor="bg-warning-100 text-warning-700"
                defaultOpen={false}
              >
                <ul className="space-y-2">
                  {(report.summary?.concerns ?? []).slice(0, 8).map((item, i) => (
                    <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                      <span className="text-warning-500 mt-0.5">!</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}

      {/* Right Column - Score Breakdown */}
      <div className="flex-1 flex flex-col bg-navy-50/30 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Manual Reviews Section */}
          {manualReviews.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </span>
                  Manual Reviews
                </h2>
                <span className="text-sm text-navy-500 bg-navy-100 px-2.5 py-1 rounded-full font-medium">
                  {manualReviews.length} review{manualReviews.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {manualReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} onClick={() => setSelectedReview(review)} />
                ))}
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-navy-900 mb-6">Score Breakdown</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hasRubric && Object.entries(report.scores.rubric!)
              .filter(([key]) => key !== 'overall')
              .map(([key, value]) => {
                const rubricInfo = RUBRIC_LABELS[key];
                if (!rubricInfo) return null;
                return (
                  <ScoreCard
                    key={key}
                    rubricKey={key}
                    value={value}
                    rubricInfo={rubricInfo}
                    assessment={getRubricAssessment(key)}
                  />
                );
              })}
          </div>

          {/* Qualitative Assessments (Non-Scoring) */}
          {report.qualitativeAssessments && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-navy-900 mb-4">Additional Assessments</h3>
              <p className="text-sm text-navy-500 mb-4">These assessments provide additional context but do not factor into the overall score.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* AI-First Mindset */}
                {report.qualitativeAssessments.aiFirstMindset && (
                  <QualitativeAssessmentCard
                    icon="🤖"
                    title="AI-First Mindset"
                    score={report.qualitativeAssessments.aiFirstMindset.score}
                    assessment={report.qualitativeAssessments.aiFirstMindset.assessment}
                    positiveItems={report.qualitativeAssessments.aiFirstMindset.positiveIndicators}
                    positiveLabel="Positive Indicators"
                    negativeItems={report.qualitativeAssessments.aiFirstMindset.negativeIndicators}
                    negativeLabel="Areas of Concern"
                  />
                )}

                {/* Instructions Compliance */}
                {report.qualitativeAssessments.instructionsCompliance && (
                  <QualitativeAssessmentCard
                    icon="📋"
                    title="Instructions Compliance"
                    score={report.qualitativeAssessments.instructionsCompliance.score}
                    assessment={report.qualitativeAssessments.instructionsCompliance.assessment}
                    positiveItems={report.qualitativeAssessments.instructionsCompliance.compliantItems}
                    positiveLabel="Requirements Met"
                    negativeItems={report.qualitativeAssessments.instructionsCompliance.nonCompliantItems}
                    negativeLabel="Requirements Not Met"
                  />
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {(report.summary?.recommendations?.length ?? 0) > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-navy-900 mb-4">Recommendations</h3>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-navy-100">
                <ul className="space-y-3">
                  {(report.summary?.recommendations ?? []).map((item, i) => (
                    <li key={i} className="text-sm text-navy-700 flex items-start gap-3">
                      <span className="text-gold-500 mt-0.5 flex-shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
