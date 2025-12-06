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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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

  // Get explanation for each score from suites data
  const getScoreExplanation = (key: string): string => {
    const suites = report.suites as Record<string, unknown> | undefined;
    if (!suites) return 'Analysis data not available';

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
            <div className={`text-6xl font-bold ${getScoreColor(report.scores.overall)}`}>
              {report.scores.overall}
            </div>
            <p className="text-gray-500">Overall Score</p>
          </div>

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
          {report.criticalFailures.length > 0 && (
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
                Strengths ({report.summary.strengths.length})
              </h3>
              <ul className="space-y-1">
                {report.summary.strengths.slice(0, 4).map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-2 uppercase tracking-wide">
                Concerns ({report.summary.concerns.length})
              </h3>
              <ul className="space-y-1">
                {report.summary.concerns.slice(0, 4).map((item, i) => (
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
            {Object.entries(report.scores)
              .filter(([key]) => key !== 'overall')
              .map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">
                      {scoreLabels[key] || key}
                    </span>
                    <span className={`text-2xl font-bold ${getScoreColor(value)}`}>
                      {value}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mb-3">
                    <div
                      className={`h-full rounded-full ${getScoreBg(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {getScoreExplanation(key)}
                  </p>
                </div>
              ))}
          </div>

          {/* Recommendations */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h3>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {report.summary.recommendations.map((item, i) => (
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
