'use client';

import { useState } from 'react';
import { EvaluationReportData } from '@/app/page';

interface EvaluationReportProps {
  report: EvaluationReportData;
  onReset: () => void;
  pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
  pdfUrl?: string;
  onRetryPdf?: () => void;
  onOpenManualReview?: () => void;
}

// Collapsible section component
function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  badge,
  badgeColor = 'bg-navy-100 text-navy-600'
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  badge?: string | number;
  badgeColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-3 text-left bg-navy-50/50 hover:bg-navy-100/50 transition rounded-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-navy-500">{icon}</span>
          <span className="text-sm font-semibold text-navy-800 uppercase tracking-wide">{title}</span>
          {badge !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-navy-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`collapse-content ${isOpen ? 'open' : ''}`}>
        <div className="pt-3 pb-1 px-1">
          {children}
        </div>
      </div>
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
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy-700 to-navy-900 text-white rounded-lg hover:from-navy-600 hover:to-navy-800 transition text-sm font-medium shadow-md"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">Download PDF</span>
        <span className="sm:hidden">PDF</span>
      </a>
    );
  }
  
  if (pdfStatus === 'generating') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 text-navy-600 rounded-lg text-sm font-medium">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="hidden sm:inline">Generating...</span>
      </div>
    );
  }
  
  if (pdfStatus === 'failed') {
    return (
      <button
        onClick={onRetryPdf}
        className="inline-flex items-center gap-2 px-4 py-2 bg-danger-100 text-danger-700 rounded-lg hover:bg-danger-200 transition text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="hidden sm:inline">Retry PDF</span>
      </button>
    );
  }
  
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 text-navy-400 rounded-lg text-sm">
      <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="hidden sm:inline">PDF pending...</span>
    </div>
  );
}

export function EvaluationReport({ report, pdfStatus, pdfUrl, onRetryPdf, onOpenManualReview }: EvaluationReportProps) {
  const hasRubric = !!report.scores?.rubric;

  // Get performance tier based on score percentage
  const getScoreTier = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 83) return { label: 'Excellent', color: 'bg-gradient-to-r from-success-500 to-success-600 text-white' };
    if (pct >= 60) return { label: 'Good', color: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white' };
    return { label: 'Needs Work', color: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white' };
  };

  const overallScore = report.scores?.rubric?.overall ?? report.scores?.overall ?? 0;
  const maxScore = hasRubric ? 90 : 100;
  const scoreTier = getScoreTier(overallScore, maxScore);

  const getScoreColor = (score: number, max: number = 100) => {
    const safeScore = Math.max(0, score || 0);
    const safeMax = Math.max(1, max || 100);
    const pct = (safeScore / safeMax) * 100;
    if (pct >= 80) return 'text-success-600';
    if (pct >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreBg = (score: number, max: number = 100) => {
    const safeScore = Math.max(0, score || 0);
    const safeMax = Math.max(1, max || 100);
    const pct = (safeScore / safeMax) * 100;
    if (pct >= 80) return 'bg-success-500';
    if (pct >= 60) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  // Rubric labels
  const rubricLabels: Record<string, { label: string; max: number; description: string; icon: string }> = {
    coreFunctionality: { label: 'Core Functionality', max: 20, description: 'Verification logic & image processing quality', icon: '⚡' },
    errorHandling: { label: 'Error Handling', max: 20, description: 'Error messages, form validation & stability', icon: '🛡️' },
    uxAccessibility: { label: 'UX & Accessibility', max: 20, description: 'User experience, accessibility & performance', icon: '✨' },
    codeQuality: { label: 'Code Quality', max: 10, description: 'Code organization & best practices', icon: '📐' },
    security: { label: 'Security', max: 10, description: 'Security practices & vulnerability protection', icon: '🔒' },
    deploymentCompliance: { label: 'Deployment', max: 10, description: 'Deployment setup & documentation', icon: '🚀' },
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

    const suiteKeys = rubricToSuiteMap[rubricKey] || [];

    for (const suiteKey of suiteKeys) {
      const suite = suites[suiteKey];
      if (!suite) continue;
      const aiAnalysis = suite.aiAnalysis as { explanation?: string; keyFindings?: string[] } | undefined;
      if (aiAnalysis?.explanation) {
        const findings = aiAnalysis.keyFindings?.slice(0, 2) || [];
        return findings.length > 0 ? `${aiAnalysis.explanation} ${findings.join('. ')}` : aiAnalysis.explanation;
      }
    }

    // Fallback assessments
    switch (rubricKey) {
      case 'coreFunctionality': {
        const func = suites.functional as Record<string, { passed?: boolean }> | undefined;
        if (!func) return 'Functional tests completed';
        const scenarios = [func.scenarioA_Match?.passed, func.scenarioB_BrandMismatch?.passed, func.scenarioC_AbvMismatch?.passed];
        const passed = scenarios.filter(Boolean).length;
        if (passed === 3) return 'All core verification scenarios pass correctly.';
        if (passed === 0) return 'Core verification logic not working.';
        return `${passed}/3 verification scenarios passed.`;
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
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Column - Summary */}
      <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-navy-200 glass overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Score Badge */}
          <div className="text-center mb-8">
            <div className={`inline-block px-8 py-3 rounded-2xl shadow-lg ${scoreTier.color}`}>
              <span className="text-2xl font-bold">{scoreTier.label}</span>
            </div>
            <p className="text-sm text-navy-500 mt-3">
              {Math.round((overallScore / maxScore) * 100)}% Score • Technical Assessment
            </p>
          </div>

          {/* Overall Score */}
          <div className="text-center mb-8 pb-8 border-b border-navy-200">
            <div className={`text-6xl font-bold font-mono ${getScoreColor(overallScore, maxScore)}`}>
              {overallScore}
            </div>
            <p className="text-navy-500 mt-1">Overall Score (out of {maxScore})</p>
          </div>

          {/* AI Executive Summary */}
          {report.aiExecutiveSummary && (
            <CollapsibleSection
              title="AI Assessment"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
              defaultOpen={true}
            >
              <p className="text-sm text-navy-700 mb-4 leading-relaxed">{report.aiExecutiveSummary.overallAssessment}</p>
              {report.aiExecutiveSummary.keyStrengths && report.aiExecutiveSummary.keyStrengths.length > 0 && (
                <div className="bg-success-50 border border-success-200 rounded-xl p-3 text-sm mb-3">
                  <span className="font-semibold text-success-700">Strengths: </span>
                  <span className="text-success-600">{report.aiExecutiveSummary.keyStrengths.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {report.aiExecutiveSummary.keyWeaknesses && report.aiExecutiveSummary.keyWeaknesses.length > 0 && (
                <div className="bg-warning-50 border border-warning-200 rounded-xl p-3 text-sm mb-3">
                  <span className="font-semibold text-warning-700">Areas to Improve: </span>
                  <span className="text-warning-600">{report.aiExecutiveSummary.keyWeaknesses.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {report.aiExecutiveSummary.fairnessConsiderations && report.aiExecutiveSummary.fairnessConsiderations.length > 0 && (
                <div className="text-xs text-navy-500 bg-navy-50 rounded-lg p-3 mb-3">
                  <span className="font-medium">Note: </span>
                  {report.aiExecutiveSummary.fairnessConsiderations[0]}
                </div>
              )}
              {onOpenManualReview && (
                <button
                  onClick={onOpenManualReview}
                  className="w-full px-4 py-2.5 bg-navy-100 text-navy-700 rounded-xl hover:bg-navy-200 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Complete Manual Review
                </button>
              )}
            </CollapsibleSection>
          )}

          {/* Links */}
          <CollapsibleSection
            title="Links & Details"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
            defaultOpen={false}
          >
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-3 border border-navy-100">
                <p className="text-xs text-navy-400 uppercase tracking-wide mb-1">Repository</p>
                <a href={report.repoUrl} target="_blank" rel="noopener noreferrer" className="text-navy-700 hover:text-gold-600 text-sm truncate block font-medium">
                  {(report.repoUrl || '').replace('https://github.com/', '')}
                </a>
              </div>
              <div className="bg-white rounded-lg p-3 border border-navy-100">
                <p className="text-xs text-navy-400 uppercase tracking-wide mb-1">Deployed App</p>
                <a href={report.deployedUrl} target="_blank" rel="noopener noreferrer" className="text-navy-700 hover:text-gold-600 text-sm truncate block font-medium">
                  {(report.deployedUrl || '').replace('https://', '')}
                </a>
              </div>
              <div className="bg-white rounded-lg p-3 border border-navy-100">
                <p className="text-xs text-navy-400 uppercase tracking-wide mb-1">Evaluated</p>
                <p className="text-sm text-navy-700 font-medium">
                  {report.evaluatedAt ? new Date(report.evaluatedAt).toLocaleString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Pre-flight Issues */}
          {report.suites?.preflight && report.suites.preflight.recommendation !== 'proceed' && (
            <CollapsibleSection
              title={report.suites.preflight.recommendation === 'block' ? 'Pre-flight Blocked' : 'Pre-flight Warnings'}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              defaultOpen={true}
              badgeColor={report.suites.preflight.recommendation === 'block' ? 'bg-danger-100 text-danger-600' : 'bg-warning-100 text-warning-600'}
            >
              <p className="text-sm text-navy-600 mb-3">{report.suites.preflight.summary}</p>
              {(report.suites.preflight.securityIssues?.length ?? 0) > 0 && (
                <ul className="space-y-2">
                  {report.suites.preflight.securityIssues?.map((issue, i) => (
                    <li key={i} className="text-xs text-danger-600 flex items-start gap-2 bg-danger-50 rounded-lg p-2">
                      <span className={`px-1.5 py-0.5 rounded text-white text-[10px] font-medium flex-shrink-0 ${
                        issue.severity === 'critical' ? 'bg-danger-600' : issue.severity === 'high' ? 'bg-warning-600' : 'bg-warning-500'
                      }`}>{issue.severity}</span>
                      <span>{issue.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleSection>
          )}

          {/* Critical Issues */}
          {((report.criticalIssues?.length ?? 0) > 0 || (report.criticalFailures?.length ?? 0) > 0) && (
            <CollapsibleSection
              title="Critical Issues"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              defaultOpen={true}
              badge={(report.criticalIssues ?? report.criticalFailures ?? []).length}
              badgeColor="bg-danger-100 text-danger-600"
            >
              <ul className="space-y-2">
                {(report.criticalIssues ?? report.criticalFailures ?? []).map((issue, i) => (
                  <li key={i} className="text-sm text-danger-700 flex items-start gap-2 bg-danger-50 rounded-lg p-3">
                    <span className="text-danger-500 mt-0.5 flex-shrink-0">⚠</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Strengths */}
          <CollapsibleSection
            title="Strengths"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            defaultOpen={false}
            badge={report.summary?.strengths?.length ?? 0}
            badgeColor="bg-success-100 text-success-600"
          >
            <ul className="space-y-2">
              {(report.summary?.strengths ?? []).slice(0, 6).map((item, i) => (
                <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                  <span className="text-success-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* Concerns */}
          <CollapsibleSection
            title="Concerns"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            defaultOpen={false}
            badge={report.summary?.concerns?.length ?? 0}
            badgeColor="bg-warning-100 text-warning-600"
          >
            <ul className="space-y-2">
              {(report.summary?.concerns ?? []).slice(0, 6).map((item, i) => (
                <li key={i} className="text-sm text-navy-600 flex items-start gap-2">
                  <span className="text-warning-500 mt-0.5 flex-shrink-0">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        </div>
      </div>

      {/* Right Column - Score Details */}
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
                const maxScore = rubricInfo.max;
                const percentage = Math.round((safeValue / maxScore) * 100);
                const gradeLabel = percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Fair' : 'Needs Work';
                const gradeColor = percentage >= 80 ? 'text-success-600 bg-success-50' : percentage >= 60 ? 'text-warning-600 bg-warning-50' : 'text-danger-600 bg-danger-50';
                return (
                  <div key={key} className="glass rounded-xl shadow-md p-5 border border-navy-100 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rubricInfo.icon}</span>
                        <span className="font-semibold text-navy-800">{rubricInfo.label}</span>
                      </div>
                      <span className={`text-2xl font-bold font-mono ${getScoreColor(safeValue, maxScore)}`}>
                        {safeValue}<span className="text-sm text-navy-400">/{maxScore}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-navy-200 rounded-full mb-4 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${getScoreBg(safeValue, maxScore)}`} style={{ width: `${Math.min(100, percentage)}%` }} />
                    </div>
                    <div className="mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${gradeColor}`}>{gradeLabel}</span>
                    </div>
                    <p className="text-sm text-navy-600 leading-relaxed">{getRubricAssessment(key)}</p>
                  </div>
                );
              })}
          </div>

          {/* Recommendations */}
          {(report.summary?.recommendations?.length ?? 0) > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-navy-900 mb-4">Recommendations</h3>
              <div className="glass rounded-xl shadow-md p-5 border border-navy-100">
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
