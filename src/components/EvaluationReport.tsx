'use client';

import { useState } from 'react';
import type { EvaluationReportData } from '@/types';
import { getScoreTierGradient, getScoreColor, getScoreBg, getGradeLabel } from '@/lib/utils';
import { Spinner } from '@/components/ui';

interface EvaluationReportProps {
  report: EvaluationReportData;
  onReset: () => void;
  pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
  pdfUrl?: string;
  onRetryPdf?: () => void;
}

// Clean accordion item
function AccordionItem({ 
  title, 
  count,
  countColor = 'bg-navy-100 text-navy-600',
  children, 
  defaultOpen = false 
}: { 
  title: string;
  count?: number;
  countColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-navy-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-navy-700">{title}</span>
          {count !== undefined && count > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${countColor}`}>
              {count}
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-navy-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

// PDF Status component for header
export function PdfStatusButton({ 
  pdfStatus, 
  pdfUrl, 
  onRetryPdf 
}: { 
  pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
  pdfUrl?: string;
  onRetryPdf?: () => void;
}) {
  if (pdfStatus === 'ready' && pdfUrl) {
    return (
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-navy-700 to-navy-900 text-white rounded-lg hover:from-navy-600 hover:to-navy-800 transition text-sm font-medium shadow-md"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">Download PDF</span>
      </a>
    );
  }
  
  if (pdfStatus === 'generating') {
    return (
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-navy-100 text-navy-600 rounded-lg text-sm font-medium">
        <Spinner size="sm" />
        <span className="hidden sm:inline">Generating...</span>
      </div>
    );
  }
  
  if (pdfStatus === 'failed') {
    return (
      <button
        onClick={onRetryPdf}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-danger-100 text-danger-700 rounded-lg hover:bg-danger-200 transition text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="hidden sm:inline">Retry PDF</span>
      </button>
    );
  }
  
  return (
    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-navy-100 text-navy-400 rounded-lg text-sm">
      <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="hidden sm:inline">PDF pending...</span>
    </div>
  );
}

export function EvaluationReport({ report }: EvaluationReportProps) {
  const hasRubric = !!report.scores?.rubric;
  const overallScore = report.scores?.rubric?.overall ?? report.scores?.overall ?? 0;
  const maxScore = hasRubric ? 90 : 100;
  const scoreTier = getScoreTierGradient(overallScore, maxScore);

  const rubricLabels: Record<string, { label: string; max: number; icon: string }> = {
    coreFunctionality: { label: 'Core Functionality', max: 20, icon: '⚡' },
    errorHandling: { label: 'Error Handling', max: 20, icon: '🛡️' },
    uxAccessibility: { label: 'UX & Accessibility', max: 20, icon: '✨' },
    codeQuality: { label: 'Code Quality', max: 10, icon: '📐' },
    security: { label: 'Security', max: 10, icon: '🔒' },
    deploymentCompliance: { label: 'Deployment', max: 10, icon: '🚀' },
  };

  const rubricToSuiteMap: Record<string, string[]> = {
    coreFunctionality: ['functional', 'imageEdgeCases'],
    errorHandling: ['formInput', 'resilience', 'imageEdgeCases'],
    uxAccessibility: ['uxTest', 'resilience'],
    codeQuality: ['repoAnalysis', 'aiReview'],
    security: ['security'],
    deploymentCompliance: ['deployment', 'repoAnalysis'],
  };

  const getRubricAssessment = (rubricKey: string): string => {
    const suites = report.suites as Record<string, Record<string, unknown>> | undefined;
    if (!suites) return 'Assessment data not available';

    for (const suiteKey of (rubricToSuiteMap[rubricKey] || [])) {
      const suite = suites[suiteKey];
      const aiAnalysis = suite?.aiAnalysis as { explanation?: string; keyFindings?: string[] } | undefined;
      if (aiAnalysis?.explanation) {
        const findings = aiAnalysis.keyFindings?.slice(0, 2) || [];
        return findings.length > 0 ? `${aiAnalysis.explanation} ${findings.join('. ')}` : aiAnalysis.explanation;
      }
    }

    switch (rubricKey) {
      case 'coreFunctionality': {
        const func = suites.functional as Record<string, { passed?: boolean }> | undefined;
        if (!func) return 'Functional tests completed';
        const passed = [func.scenarioA_Match?.passed, func.scenarioB_BrandMismatch?.passed, func.scenarioC_AbvMismatch?.passed].filter(Boolean).length;
        return passed === 3 ? 'All core verification scenarios pass.' : passed === 0 ? 'Core verification logic not working.' : `${passed}/3 scenarios passed.`;
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
      default: return 'Assessment completed';
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Column - Summary */}
      <div className="w-full lg:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-navy-200 glass overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Score Header */}
          <div className="text-center mb-8">
            <div className={`inline-block px-8 py-3 rounded-2xl shadow-lg mb-3 ${scoreTier.color}`}>
              <span className="text-2xl font-bold">{scoreTier.label}</span>
            </div>
            <div className={`text-6xl font-bold font-mono ${getScoreColor(overallScore, maxScore)}`}>
              {overallScore}
            </div>
            <p className="text-navy-500 mt-1">out of {maxScore} points</p>
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

          {/* Critical Issues - Always visible if present */}
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
                    <span>{issue}</span>
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

              <AccordionItem title="Links & Details" defaultOpen={false}>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-navy-400 mb-1">Repository</p>
                    <a href={report.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-navy-700 hover:text-gold-600 font-medium truncate block">
                      {(report.repoUrl || '').replace('https://github.com/', '')}
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
                </div>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Score Breakdown */}
      <div className="flex-1 flex flex-col bg-navy-50/30 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-navy-900 mb-6">Score Breakdown</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hasRubric && Object.entries(report.scores.rubric!)
              .filter(([key]) => key !== 'overall')
              .map(([key, value]) => {
                const rubricInfo = rubricLabels[key];
                if (!rubricInfo) return null;
                const safeValue = Math.max(0, value || 0);
                const percentage = Math.round((safeValue / rubricInfo.max) * 100);
                const grade = getGradeLabel(percentage);
                return (
                  <div key={key} className="bg-white rounded-xl shadow-sm p-5 border border-navy-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rubricInfo.icon}</span>
                        <span className="font-semibold text-navy-800">{rubricInfo.label}</span>
                      </div>
                      <span className={`text-2xl font-bold font-mono ${getScoreColor(safeValue, rubricInfo.max)}`}>
                        {safeValue}<span className="text-sm text-navy-400">/{rubricInfo.max}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-navy-100 rounded-full mb-4 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${getScoreBg(safeValue, rubricInfo.max)}`} style={{ width: `${Math.min(100, percentage)}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${grade.color}`}>{grade.label}</span>
                    </div>
                    <p className="text-sm text-navy-600 leading-relaxed mt-3">{getRubricAssessment(key)}</p>
                  </div>
                );
              })}
          </div>

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
