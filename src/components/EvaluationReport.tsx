'use client';

import { EvaluationReportData } from '@/app/page';

interface EvaluationReportProps {
  report: EvaluationReportData;
  onReset: () => void;
}

export function EvaluationReport({ report }: EvaluationReportProps) {
  const tierColors = {
    STRONG_HIRE: 'bg-green-500 text-white',
    MAYBE: 'bg-yellow-500 text-white',
    NO_HIRE: 'bg-red-500 text-white',
  };

  const tierLabels = {
    STRONG_HIRE: 'Strong Hire',
    MAYBE: 'Maybe',
    NO_HIRE: 'No Hire',
  };

  const hasRubric = !!report.scores?.rubric;

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

  // New rubric labels (90-point scale)
  const rubricLabels: Record<string, { label: string; max: number }> = {
    coreFunctionality: { label: 'Core Functionality', max: 20 },
    codeQuality: { label: 'Code Quality & Structure', max: 15 },
    security: { label: 'Security & Vulnerability', max: 10 },
    errorHandling: { label: 'Error Handling & Resilience', max: 10 },
    imageProcessing: { label: 'Image Processing Quality', max: 10 },
    formValidation: { label: 'Form Validation', max: 5 },
    uxAccessibility: { label: 'UX & Accessibility', max: 5 },
    deploymentCompliance: { label: 'Deployment & Instructions', max: 10 },
    loadPerformance: { label: 'Load & Performance', max: 5 },
  };

  // Map rubric categories to their data sources
  const rubricToSuiteMap: Record<string, string[]> = {
    coreFunctionality: ['functional'],
    codeQuality: ['repoAnalysis', 'aiReview'],
    security: ['security'],
    errorHandling: ['formInput', 'resilience'],
    imageProcessing: ['imageEdgeCases'],
    formValidation: ['formInput'],
    uxAccessibility: ['uxTest'],
    deploymentCompliance: ['deployment'],
    loadPerformance: ['uxTest', 'deployment'],
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

    // Fallback assessments based on rubric category
    switch (rubricKey) {
      case 'coreFunctionality': {
        const func = suites.functional as Record<string, { passed?: boolean }> | undefined;
        if (!func) return 'Functional tests completed';
        const scenarios = [
          func.scenarioA_Match?.passed,
          func.scenarioB_BrandMismatch?.passed,
          func.scenarioC_AbvMismatch?.passed,
        ];
        const passed = scenarios.filter(Boolean).length;
        if (passed === 3) return 'All core verification scenarios pass correctly';
        if (passed === 0) return 'Core verification logic is not working - none of the test scenarios passed';
        return `${passed}/3 verification scenarios passed - core logic needs improvement`;
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
      case 'errorHandling': {
        const form = suites.formInput as Record<string, unknown> | undefined;
        const res = suites.resilience as Record<string, unknown> | undefined;
        const parts: string[] = [];
        if (res?.recoversAfterError) parts.push('Recovers gracefully from errors');
        if (res?.rapidSubmissions) parts.push('Handles rapid submissions');
        return parts.length > 0 ? parts.join('. ') : 'Error handling tested';
      }
      case 'imageProcessing': {
        const img = suites.imageEdgeCases as Record<string, unknown> | undefined;
        if (!img) return 'Image processing tests completed';
        return 'Image format handling and edge cases evaluated';
      }
      case 'formValidation': {
        const form = suites.formInput as Record<string, unknown> | undefined;
        if (!form) return 'Form validation tests completed';
        return 'Form input validation and sanitization checked';
      }
      case 'uxAccessibility': {
        const ux = suites.uxTest as Record<string, unknown> | undefined;
        if (!ux) return 'UX evaluation completed';
        const parts: string[] = [];
        if (ux.isMobileResponsive) parts.push('Mobile responsive');
        if (ux.hasProperHeadings) parts.push('Proper heading structure');
        if (ux.formLabelsPresent) parts.push('Form labels present');
        return parts.length > 0 ? parts.join('. ') : 'UX and accessibility evaluated';
      }
      case 'deploymentCompliance': {
        const dep = suites.deployment as Record<string, unknown> | undefined;
        if (!dep) return 'Deployment check completed';
        const parts: string[] = [];
        if (dep.urlAccessible) parts.push('URL accessible');
        if (dep.formRendersCorrectly) parts.push('Form renders correctly');
        if (dep.readmeHasSetupSteps) parts.push('README has setup instructions');
        return parts.length > 0 ? parts.join('. ') : 'Deployment compliance verified';
      }
      case 'loadPerformance': {
        const ux = suites.uxTest as Record<string, unknown> | undefined;
        if (!ux) return 'Performance evaluation completed';
        const loadTime = ux.loadTimeMs as number | undefined;
        if (loadTime) {
          if (loadTime < 2000) return `Fast load time (${(loadTime/1000).toFixed(1)}s)`;
          if (loadTime < 4000) return `Acceptable load time (${(loadTime/1000).toFixed(1)}s)`;
          return `Slow load time (${(loadTime/1000).toFixed(1)}s) - optimization needed`;
        }
        return 'Page load performance measured';
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
          {/* Tier Badge */}
          <div className="text-center mb-6">
            <div className={`inline-block px-6 py-3 rounded-lg ${tierColors[report.tier]}`}>
              <span className="text-2xl font-bold">{tierLabels[report.tier]}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{report.tierReason}</p>
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
                AI Assessment
              </h3>
              <p className="text-sm text-gray-700 mb-2">{report.aiExecutiveSummary.overallAssessment}</p>
              <div className="bg-blue-50 rounded p-2 text-sm">
                <span className="font-medium text-blue-800">Recommendation: </span>
                <span className="text-blue-700">{report.aiExecutiveSummary.hiringRecommendation}</span>
              </div>
              {report.aiExecutiveSummary.fairnessConsiderations && report.aiExecutiveSummary.fairnessConsiderations.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Note: </span>
                  {report.aiExecutiveSummary.fairnessConsiderations[0]}
                </div>
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
                {report.repoUrl.replace('https://github.com/', '')}
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
                {report.deployedUrl.replace('https://', '')}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Evaluated</p>
              <p className="text-sm text-gray-700">
                {new Date(report.evaluatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Critical Failures */}
          {(report.criticalFailures?.length ?? 0) > 0 && (
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-semibold text-red-800 mb-2 uppercase tracking-wide">
                Critical Failures
              </h3>
              <ul className="space-y-1">
                {report.criticalFailures.map((failure, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start">
                    <span className="mr-2">•</span>
                    {failure}
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
