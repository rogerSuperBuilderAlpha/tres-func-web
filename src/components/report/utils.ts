import type { CriticalIssue, EvaluationReportData } from '@/types';

// Rubric configuration
export const RUBRIC_LABELS = {
  coreFunctionality: { label: 'Core Functionality', max: 20, icon: '⚡' },
  errorHandling: { label: 'Error Handling', max: 20, icon: '🛡️' },
  uxAccessibility: { label: 'UX & Accessibility', max: 20, icon: '✨' },
  codeQuality: { label: 'Code Quality', max: 10, icon: '📐' },
  security: { label: 'Security', max: 10, icon: '🔒' },
  deploymentCompliance: { label: 'Deployment', max: 10, icon: '🚀' },
} as const;

export type RubricKey = keyof typeof RUBRIC_LABELS;

export function isRubricKey(key: string): key is RubricKey {
  return key in RUBRIC_LABELS;
}

const RUBRIC_TO_SUITE_MAP: Record<string, string[]> = {
  coreFunctionality: ['functional', 'imageEdgeCases'],
  errorHandling: ['formInput', 'resilience', 'imageEdgeCases'],
  uxAccessibility: ['uxTest', 'resilience'],
  codeQuality: ['repoAnalysis', 'aiReview'],
  security: ['security'],
  deploymentCompliance: ['deployment', 'repoAnalysis'],
};

type Suites = Record<string, Record<string, unknown>>;

export function formatCriticalIssue(issue: string | CriticalIssue): string {
  if (typeof issue === 'string') return issue;

  const description = issue.description || issue.issue || 'Unknown issue';
  const severity = issue.severity ? `[${issue.severity.toUpperCase()}]` : '';
  const category = issue.category || issue.type || '';

  if (category && severity) return `${severity} ${category}: ${description}`;
  if (category) return `${category}: ${description}`;
  if (severity) return `${severity} ${description}`;
  return description;
}

export function formatRepoDisplayUrl(url?: string): string {
  return (url || '').replace('https://github.com/', '').replace('https://gitlab.com/', '');
}

export function formatDeployedDisplayUrl(url?: string): string {
  return (url || '').replace('https://', '');
}

function getFallbackAssessment(rubricKey: RubricKey, suites: Suites, percentage: number): string {
  switch (rubricKey) {
    case 'coreFunctionality': {
      const func = suites.functional as Record<string, { passed?: boolean }> | undefined;
      if (!func) return 'Functional tests completed';
      const passed = [
        func.scenarioA_Match?.passed,
        func.scenarioB_BrandMismatch?.passed,
        func.scenarioC_AbvMismatch?.passed,
      ].filter(Boolean).length;
      const baseText =
        passed === 3
          ? 'All core verification scenarios pass.'
          : passed === 0
            ? 'Core verification logic not working.'
            : `${passed}/3 scenarios passed.`;
      return passed === 3 && percentage < 60
        ? `${baseText} Additional scoring factors need improvement.`
        : baseText;
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
      if (loadTime && loadTime < 2000) parts.push(`Fast load (${(loadTime / 1000).toFixed(1)}s)`);
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

export function getRubricAssessment(report: EvaluationReportData, rubricKey: RubricKey): string {
  const suites = report.suites as Suites | undefined;
  const rubric = report.scores?.rubric as Record<string, number> | undefined;
  const score = rubric?.[rubricKey] || 0;
  const maxScoreForKey = RUBRIC_LABELS[rubricKey]?.max || 20;
  const percentage = Math.round((score / maxScoreForKey) * 100);

  // First, check for overall scoreReasoning (this considers ALL tests including Playwright)
  const scoreReasoning = report.scoreReasoning;
  if (scoreReasoning?.[rubricKey] && scoreReasoning[rubricKey] !== 'Fallback scoring - AI unavailable') {
    return scoreReasoning[rubricKey];
  }

  // For Core Functionality, prioritize showing Playwright results since they reflect real user experience
  if (rubricKey === 'coreFunctionality' && suites?.uxTest) {
    const uxTest = suites.uxTest as Record<string, unknown>;
    const formInteraction = uxTest.formInteraction as {
      submissionResult?: { submitted?: boolean; responseReceived?: boolean; showedResultScreen?: boolean };
    } | undefined;
    const result = formInteraction?.submissionResult;
    if (result?.submitted && result?.responseReceived && result?.showedResultScreen) {
      return `Playwright browser tests show the application works for real users: form was found, fields were filled, image was uploaded, form was submitted successfully, and results were displayed. This indicates core functionality works from the user's perspective. HTTP API tests may have failed due to endpoint path differences, but the user-facing experience is functional.`;
    }
  }

  if (!suites) return 'Assessment data not available';

  // Fall back to suite-level AI analysis
  for (const suiteKey of RUBRIC_TO_SUITE_MAP[rubricKey] || []) {
    const suite = suites[suiteKey];
    const aiAnalysis = suite?.aiAnalysis as { explanation?: string; keyFindings?: string[] } | undefined;
    if (aiAnalysis?.explanation) {
      const findings = aiAnalysis.keyFindings?.slice(0, 2) || [];
      let explanation =
        findings.length > 0 ? `${aiAnalysis.explanation} ${findings.join('. ')}` : aiAnalysis.explanation;

      if (
        percentage < 60 &&
        !explanation.toLowerCase().includes('issue') &&
        !explanation.toLowerCase().includes('fail') &&
        !explanation.toLowerCase().includes('crash')
      ) {
        explanation = `${explanation} ${percentage < 40 ? 'Significant room for improvement.' : 'Some areas need work.'}`;
      }
      return explanation;
    }
  }

  return getFallbackAssessment(rubricKey, suites, percentage);
}






