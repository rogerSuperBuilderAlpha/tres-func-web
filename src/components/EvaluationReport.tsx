'use client';

import { EvaluationReportData } from '@/app/page';

interface EvaluationReportProps {
  report: EvaluationReportData;
  onReset: () => void;
  pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
  pdfUrl?: string;
  onRetryPdf?: () => void;
  onOpenManualReview?: () => void;
}

export function EvaluationReport({ report, pdfStatus, pdfUrl, onRetryPdf, onOpenManualReview }: EvaluationReportProps) {
  const hasRubric = !!report.scores?.rubric;

  // Get performance tier based on score percentage
  const getScoreTier = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 83) return { label: 'Excellent', color: 'bg-green-500 text-white' };
    if (pct >= 60) return { label: 'Good', color: 'bg-yellow-500 text-white' };
    return { label: 'Needs Work', color: 'bg-orange-500 text-white' };
  };

  const overallScore = report.scores?.rubric?.overall ?? report.scores?.overall ?? 0;
  const maxScore = hasRubric ? 90 : 100;
  const scoreTier = getScoreTier(overallScore, maxScore);

  const getScoreColor = (score: number, max: number = 100) => {
    const safeScore = Math.max(0, score || 0);
    const safeMax = Math.max(1, max || 100);
    const pct = (safeScore / safeMax) * 100;
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number, max: number = 100) => {
    const safeScore = Math.max(0, score || 0);
    const safeMax = Math.max(1, max || 100);
    const pct = (safeScore / safeMax) * 100;
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // New consolidated rubric labels (90-point scale, 6 categories)
  const rubricLabels: Record<string, { label: string; max: number; description: string }> = {
    coreFunctionality: {
      label: 'Core Functionality',
      max: 20,
      description: 'Verification logic & image processing quality'
    },
    errorHandling: {
      label: 'Error Handling & Resilience',
      max: 20,
      description: 'Error messages, form validation & stability'
    },
    uxAccessibility: {
      label: 'UX & Accessibility',
      max: 20,
      description: 'User experience, accessibility & performance'
    },
    codeQuality: {
      label: 'Code Quality & Structure',
      max: 10,
      description: 'Code organization & best practices'
    },
    security: {
      label: 'Security & Vulnerability',
      max: 10,
      description: 'Security practices & vulnerability protection'
    },
    deploymentCompliance: {
      label: 'Deployment & Instructions',
      max: 10,
      description: 'Deployment setup & documentation'
    },
  };

  // Map rubric categories to their data sources
  const rubricToSuiteMap: Record<string, string[]> = {
    coreFunctionality: ['functional', 'imageEdgeCases'],
    errorHandling: ['formInput', 'resilience', 'imageEdgeCases'],
    uxAccessibility: ['uxTest', 'resilience'],
    codeQuality: ['repoAnalysis', 'aiReview'],
    security: ['security'],
    deploymentCompliance: ['deployment', 'repoAnalysis'],
  };

  // Get AI assessment for rubric category
  const getRubricAssessment = (rubricKey: string): string => {
    const suites = report.suites as Record<string, Record<string, unknown>> | undefined;
    if (!suites) return 'Assessment data not available';

    const suiteKeys = rubricToSuiteMap[rubricKey] || [];

    // Collect AI analyses from relevant suites
    for (const suiteKey of suiteKeys) {
      const suite = suites[suiteKey];
      if (!suite) continue;

      const aiAnalysis = suite.aiAnalysis as {
        explanation?: string;
        keyFindings?: string[];
      } | undefined;

      if (aiAnalysis?.explanation) {
        const findings = aiAnalysis.keyFindings?.slice(0, 2) || [];
        return findings.length > 0
          ? `${aiAnalysis.explanation} ${findings.join('. ')}`
          : aiAnalysis.explanation;
      }
    }

    // Fallback assessments based on rubric category (new 6-category structure)
    switch (rubricKey) {
      case 'coreFunctionality': {
        const func = suites.functional as Record<string, { passed?: boolean }> | undefined;
        const img = suites.imageEdgeCases as Record<string, unknown> | undefined;
        if (!func) return 'Functional tests completed';
        const scenarios = [
          func.scenarioA_Match?.passed,
          func.scenarioB_BrandMismatch?.passed,
          func.scenarioC_AbvMismatch?.passed,
        ];
        const passed = scenarios.filter(Boolean).length;
        const imgNote = img ? ' Image processing evaluated.' : '';
        if (passed === 3) return 'All core verification scenarios pass correctly.' + imgNote;
        if (passed === 0) return 'Core verification logic not working - none of the test scenarios passed.' + imgNote;
        return `${passed}/3 verification scenarios passed.` + imgNote;
      }
      case 'errorHandling': {
        const form = suites.formInput as Record<string, unknown> | undefined;
        const res = suites.resilience as Record<string, unknown> | undefined;
        const parts: string[] = [];
        if (res?.recoversAfterError) parts.push('Recovers gracefully from errors');
        if (res?.rapidSubmissions) parts.push('Handles rapid submissions');
        if (form) parts.push('Form validation tested');
        return parts.length > 0 ? parts.join('. ') : 'Error handling and form validation tested';
      }
      case 'uxAccessibility': {
        const ux = suites.uxTest as Record<string, unknown> | undefined;
        const res = suites.resilience as Record<string, unknown> | undefined;
        if (!ux) return 'UX evaluation completed';
        const parts: string[] = [];
        if (ux.isMobileResponsive) parts.push('Mobile responsive');
        if (ux.hasProperHeadings) parts.push('Proper heading structure');
        if (ux.formLabelsPresent) parts.push('Form labels present');
        const loadTime = ux.loadTimeMs as number | undefined;
        if (loadTime && loadTime < 2000) parts.push(`Fast load (${(loadTime/1000).toFixed(1)}s)`);
        return parts.length > 0 ? parts.join('. ') : 'UX, accessibility & performance evaluated';
      }
      case 'codeQuality': {
        const repo = suites.repoAnalysis as Record<string, unknown> | undefined;
        const ai = suites.aiReview as Record<string, unknown> | undefined;
        const parts: string[] = [];
        if (repo?.hasTests) parts.push('Has test coverage');
        if (repo?.separatesFrontendBackend) parts.push('Clean architecture');
        if (ai?.codeQualityRating) parts.push(`AI rated: ${ai.codeQualityRating}`);
        return parts.length > 0 ? parts.join('. ') : 'Code structure analysis completed';
      }
      case 'security': {
        const sec = suites.security as Record<string, Record<string, boolean>> | undefined;
        if (!sec) return 'Security assessment completed';
        const issues: string[] = [];
        if (sec.xss?.brandNameFieldVulnerable) issues.push('XSS vulnerability detected');
        if (sec.injection?.sqlInjectionPayloadsAccepted) issues.push('SQL injection risk');
        if (sec.disclosure?.apiKeysInClientCode) issues.push('API keys exposed in client code');
        return issues.length > 0 ? issues.join('. ') : 'No critical security vulnerabilities found';
      }
      case 'deploymentCompliance': {
        const dep = suites.deployment as Record<string, unknown> | undefined;
        const repo = suites.repoAnalysis as Record<string, unknown> | undefined;
        const parts: string[] = [];
        if (dep?.urlAccessible) parts.push('URL accessible');
        if (dep?.formRendersCorrectly) parts.push('Form renders correctly');
        if (repo?.readmeHasSetupInstructions) parts.push('README has setup instructions');
        return parts.length > 0 ? parts.join('. ') : 'Deployment compliance verified';
      }
      default:
        return 'Assessment completed';
    }
  };

  // Legacy labels (100-point scale)
  const scoreLabels: Record<string, string> = {
    security: 'Security',
    errorHandling: 'Error Handling',
    edgeCases: 'Edge Cases',
    codeQuality: 'Code Quality',
    documentation: 'Documentation',
    functional: 'Functional',
    uxDesign: 'UX Design',
    aiReview: 'AI Review',
  };

  // Map score keys to suite keys for AI analysis
  const scoreToSuiteMap: Record<string, string> = {
    security: 'security',
    errorHandling: 'formInput', // Uses form and image tests
    edgeCases: 'imageEdgeCases', // Uses image and resilience tests
    codeQuality: 'repoAnalysis',
    documentation: 'repoAnalysis',
    functional: 'functional',
    uxDesign: 'uxTest',
    aiReview: 'aiReview',
  };

  // Get explanation for each score - prefer AI analysis if available
  const getScoreExplanation = (key: string): string => {
    const suites = report.suites as Record<string, Record<string, unknown>> | undefined;
    if (!suites) return 'Analysis data not available';

    // Try to get AI analysis for this score
    const suiteKey = scoreToSuiteMap[key];
    const suite = suiteKey ? suites[suiteKey] : undefined;
    const aiAnalysis = suite?.aiAnalysis as { explanation?: string; keyFindings?: string[]; failureAttribution?: string } | undefined;

    // If AI analysis available, prefer that explanation
    if (aiAnalysis?.explanation) {
      // Add key findings if available
      const keyFindings = aiAnalysis.keyFindings || [];
      if (keyFindings.length > 0) {
        return `${aiAnalysis.explanation} ${keyFindings.slice(0, 2).join('. ')}`;
      }
      return aiAnalysis.explanation;
    }

    // Fallback to manual explanations
    switch (key) {
      case 'security':
        const sec = suites.security as Record<string, unknown> | undefined;
        if (!sec) return 'Security tests completed';
        const issues: string[] = [];
        if ((sec.xss as Record<string, boolean>)?.brandNameFieldVulnerable) issues.push('XSS vulnerability in brand field');
        if ((sec.injection as Record<string, boolean>)?.sqlInjectionPayloadsAccepted) issues.push('SQL injection possible');
        if ((sec.disclosure as Record<string, boolean>)?.apiKeysInClientCode) issues.push('API keys exposed');
        return issues.length > 0 ? issues.join('. ') : 'No major security vulnerabilities detected';

      case 'functional':
        const func = suites.functional as Record<string, { passed?: boolean }> | undefined;
        if (!func) return 'Functional tests completed';
        const passed = [
          func.scenarioA_Match?.passed,
          func.scenarioB_BrandMismatch?.passed,
          func.scenarioC_AbvMismatch?.passed,
        ].filter(Boolean).length;
        return `${passed}/3 core verification scenarios passed`;

      case 'uxDesign':
        const ux = suites.uxTest as Record<string, unknown> | undefined;
        if (!ux) return 'UX testing completed';
        const findings = (ux.findings as string[]) || [];
        return findings.length > 0 ? findings.slice(0, 2).join('. ') : 'Page loads correctly with good UX';

      case 'aiReview':
        const ai = suites.aiReview as Record<string, unknown> | undefined;
        if (!ai) return 'AI review completed';
        return (ai.overallAssessment as string) || 'Code analysis completed';

      case 'codeQuality':
        const repo = suites.repoAnalysis as Record<string, unknown> | undefined;
        if (!repo) return 'Repository analysis completed';
        const quality: string[] = [];
        if (repo.hasTests) quality.push('Has tests');
        if (repo.hasSourceDirectory) quality.push('Organized structure');
        if (repo.separatesFrontendBackend) quality.push('Separated frontend/backend');
        return quality.length > 0 ? quality.join(', ') : 'Basic code structure';

      case 'documentation':
        const docs = suites.repoAnalysis as Record<string, unknown> | undefined;
        if (!docs) return 'Documentation check completed';
        if (!docs.readmeExists) return 'No README file found';
        if (!docs.readmeHasSetupInstructions) return 'README lacks setup instructions';
        return 'README with setup instructions found';

      case 'errorHandling':
        return 'Tested error responses for edge cases and invalid inputs';

      case 'edgeCases':
        return 'Tested image formats, sizes, and unusual inputs';

      default:
        return 'Analysis completed';
    }
  };

  // Get failure attribution badge if test failed due to infrastructure
  const getAttributionBadge = (key: string): string | null => {
    const suites = report.suites as Record<string, Record<string, unknown>> | undefined;
    if (!suites) return null;

    const suiteKey = scoreToSuiteMap[key];
    const suite = suiteKey ? suites[suiteKey] : undefined;
    const aiAnalysis = suite?.aiAnalysis as { failureAttribution?: string } | undefined;

    if (aiAnalysis?.failureAttribution === 'test_infrastructure') {
      return 'Test infrastructure issue - not penalized';
    }
    return null;
  };

  return (
    <div className="h-full flex">
      {/* Left Column - Summary */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Score Badge */}
          <div className="text-center mb-6">
            <div className={`inline-block px-6 py-3 rounded-lg ${scoreTier.color}`}>
              <span className="text-2xl font-bold">{scoreTier.label}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {Math.round((overallScore / maxScore) * 100)}% Score • Technical Assessment
            </p>
          </div>

          {/* Overall Score */}
          <div className="text-center mb-6 pb-6 border-b">
            {hasRubric ? (
              <>
                <div className={`text-6xl font-bold ${getScoreColor(report.scores.rubric?.overall ?? 0, 90)}`}>
                  {report.scores.rubric?.overall ?? 0}
                </div>
                <p className="text-gray-500">Overall Score (out of 90)</p>
              </>
            ) : (
              <>
                <div className={`text-6xl font-bold ${getScoreColor(report.scores?.overall ?? 0)}`}>
                  {report.scores?.overall ?? 0}
                </div>
                <p className="text-gray-500">Overall Score</p>
              </>
            )}
          </div>

          {/* AI Executive Summary */}
          {report.aiExecutiveSummary && (
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 uppercase tracking-wide">
                AI Technical Assessment
              </h3>
              <p className="text-sm text-gray-700 mb-2">{report.aiExecutiveSummary.overallAssessment}</p>
              {report.aiExecutiveSummary.keyStrengths && report.aiExecutiveSummary.keyStrengths.length > 0 && (
                <div className="bg-green-50 rounded p-2 text-sm mb-2">
                  <span className="font-medium text-green-800">Key Strengths: </span>
                  <span className="text-green-700">{report.aiExecutiveSummary.keyStrengths.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {report.aiExecutiveSummary.keyWeaknesses && report.aiExecutiveSummary.keyWeaknesses.length > 0 && (
                <div className="bg-yellow-50 rounded p-2 text-sm mb-2">
                  <span className="font-medium text-yellow-800">Areas to Improve: </span>
                  <span className="text-yellow-700">{report.aiExecutiveSummary.keyWeaknesses.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {report.aiExecutiveSummary.fairnessConsiderations && report.aiExecutiveSummary.fairnessConsiderations.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Note: </span>
                  {report.aiExecutiveSummary.fairnessConsiderations[0]}
                </div>
              )}
              {/* Manual Review Button */}
              {onOpenManualReview && (
                <button
                  onClick={onOpenManualReview}
                  className="mt-3 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Complete Manual Review
                </button>
              )}
            </div>
          )}

          {/* Links */}
          <div className="space-y-3 mb-6 pb-6 border-b">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Repository</p>
              <a
                href={report.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm truncate block"
              >
                {(report.repoUrl || '').replace('https://github.com/', '')}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Deployed App</p>
              <a
                href={report.deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm truncate block"
              >
                {(report.deployedUrl || '').replace('https://', '')}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Evaluated</p>
              <p className="text-sm text-gray-700">
                {report.evaluatedAt ? new Date(report.evaluatedAt).toLocaleString() : 'Unknown'}
              </p>
            </div>
          </div>

          {/* PDF Report Download */}
          <div className="mb-6 pb-6 border-b">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Expert Report</p>
            {pdfStatus === 'ready' && pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Report
              </a>
            ) : pdfStatus === 'generating' ? (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating expert report...
              </div>
            ) : pdfStatus === 'failed' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  PDF generation failed
                </div>
                {onRetryPdf && (
                  <button
                    onClick={onRetryPdf}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry PDF Generation
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF report pending...
              </div>
            )}
          </div>

          {/* Pre-flight Issues */}
          {report.suites?.preflight && report.suites.preflight.recommendation !== 'proceed' && (
            <div className="mb-6 pb-6 border-b">
              <h3 className={`text-sm font-semibold mb-2 uppercase tracking-wide ${
                report.suites.preflight.recommendation === 'block' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                Pre-flight {report.suites.preflight.recommendation === 'block' ? 'Blocked' : 'Warnings'}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{report.suites.preflight.summary}</p>

              {/* Security Issues */}
              {(report.suites.preflight.securityIssues?.length ?? 0) > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Security Issues:</p>
                  <ul className="space-y-1">
                    {report.suites.preflight.securityIssues?.map((issue, i) => (
                      <li key={i} className="text-xs text-red-600 flex items-start">
                        <span className={`mr-1 px-1 rounded text-white text-[10px] ${
                          issue.severity === 'critical' ? 'bg-red-600' :
                          issue.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>{issue.severity}</span>
                        {issue.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Integrity Concerns */}
              {(report.suites.preflight.cheatingIndicators?.length ?? 0) > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Integrity Concerns:</p>
                  <ul className="space-y-1">
                    {report.suites.preflight.cheatingIndicators?.map((indicator, i) => (
                      <li key={i} className="text-xs text-yellow-700 flex items-start flex-wrap">
                        <span className={`mr-1 px-1 rounded text-white text-[10px] ${
                          indicator.severity === 'critical' ? 'bg-red-600' :
                          indicator.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>{indicator.severity}</span>
                        {indicator.description}
                        {indicator.evidence && (
                          <span className="text-gray-500 ml-1">({indicator.evidence})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Analysis */}
              {report.suites.preflight.aiAnalysis?.explanation && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                  <span className="font-medium">AI Assessment: </span>
                  {report.suites.preflight.aiAnalysis.explanation}
                </div>
              )}
            </div>
          )}

          {/* Critical Issues */}
          {((report.criticalIssues?.length ?? 0) > 0 || (report.criticalFailures?.length ?? 0) > 0) && (
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-semibold text-orange-800 mb-2 uppercase tracking-wide">
                Critical Issues
              </h3>
              <ul className="space-y-1">
                {(report.criticalIssues ?? report.criticalFailures ?? []).map((issue, i) => (
                  <li key={i} className="text-sm text-orange-700 flex items-start">
                    <span className="mr-2">⚠</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Summary */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-green-800 mb-2 uppercase tracking-wide">
                Strengths ({report.summary?.strengths?.length ?? 0})
              </h3>
              <ul className="space-y-1">
                {(report.summary?.strengths ?? []).slice(0, 4).map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-2 uppercase tracking-wide">
                Concerns ({report.summary?.concerns?.length ?? 0})
              </h3>
              <ul className="space-y-1">
                {(report.summary?.concerns ?? []).slice(0, 4).map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <span className="text-yellow-500 mr-2">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Score Details */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h2>

          <div className="grid grid-cols-2 gap-4">
            {hasRubric ? (
              // New rubric-based scoring (90 points total)
              Object.entries(report.scores.rubric!)
                .filter(([key]) => key !== 'overall')
                .map(([key, value]) => {
                  const rubricInfo = rubricLabels[key];
                  if (!rubricInfo) return null;
                  const safeValue = Math.max(0, value || 0);
                  const maxScore = rubricInfo.max;
                  const percentage = Math.round((safeValue / maxScore) * 100);
                  const gradeLabel = percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Needs Improvement' : 'Poor';
                  const gradeColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
                  return (
                    <div key={key} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {rubricInfo.label}
                        </span>
                        <span className={`text-2xl font-bold ${getScoreColor(safeValue, maxScore)}`}>
                          {safeValue}/{maxScore}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mb-2">
                        <div
                          className={`h-full rounded-full ${getScoreBg(safeValue, maxScore)}`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                      <div className="mb-2">
                        <span className={`text-xs font-semibold ${gradeColor}`}>{gradeLabel}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {getRubricAssessment(key)}
                      </p>
                    </div>
                  );
                })
            ) : (
              // Legacy scoring (100 points each)
              Object.entries(report.scores)
                .filter(([key]) => key !== 'overall' && key !== 'rubric')
                .map(([key, value]) => {
                  const attributionBadge = getAttributionBadge(key);
                  return (
                    <div key={key} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {scoreLabels[key] || key}
                        </span>
                        <span className={`text-2xl font-bold ${getScoreColor(value as number)}`}>
                          {value as number}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mb-3">
                        <div
                          className={`h-full rounded-full ${getScoreBg(value as number)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      {attributionBadge && (
                        <div className="mb-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                          {attributionBadge}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {getScoreExplanation(key)}
                      </p>
                    </div>
                  );
                })
            )}
          </div>

          {/* Recommendations */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h3>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {(report.summary?.recommendations ?? []).map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2 mt-0.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
