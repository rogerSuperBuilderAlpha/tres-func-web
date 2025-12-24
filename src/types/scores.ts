/**
 * Score and AI analysis types
 */

// AI Analysis types
export interface AiTestAnalysis {
  testRanSuccessfully: boolean;
  failureAttribution: 'app' | 'test_infrastructure' | 'unclear' | 'none';
  explanation: string;
  scoreAdjustment: number;
  keyFindings: string[];
  shouldCountInScore: boolean;
}

export interface AiExecutiveSummary {
  overallAssessment: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  fairnessConsiderations: string[];
  scoreBreakdown?: string;
}

export interface ScoreReasoning {
  coreFunctionality: string;
  errorHandling: string;
  uxAccessibility: string;
  codeQuality: string;
  security: string;
  deploymentCompliance: string;
}

// Score types (100 point scale)
export interface RubricScores {
  coreFunctionality: number;    // 50 points - Playwright 20-test + HTTP tests
  errorHandling: number;        // 15 points
  uxAccessibility: number;      // 15 points
  codeQuality: number;          // 8 points
  security: number;             // 7 points
  deploymentCompliance: number; // 5 points
  overall: number;              // 100 points max
  playwrightStats?: PlaywrightStats;
  breakdowns?: ScoreBreakdowns;
}

export interface PlaywrightStats {
  attempted: number;
  successful: number;
  accurateSubmissions: number;
  inaccurateSubmissions: number;
  successRate: number;
}

// Detailed score breakdowns
export interface ScoreBreakdowns {
  coreFunctionality?: CoreFunctionalityBreakdown;
  errorHandling?: ErrorHandlingBreakdown;
  uxAccessibility?: UxAccessibilityBreakdown;
  codeQuality?: CodeQualityBreakdown;
  security?: SecurityBreakdown;
  deploymentCompliance?: DeploymentBreakdown;
}

export interface PlaywrightSubmission {
  index: number;
  scenarioType: 'accurate' | 'inaccurate';
  errorType?: string;
  brand: string;
  product: string;
  abv: string;
  volume: string;
  submitted: boolean;
  responseReceived: boolean;
  responseType: string;
  responseTimeMs: number;
  showedResultScreen: boolean;
  formFilledScreenshot?: string;
  completedScreenshot?: string;
}

export interface CoreFunctionalityBreakdown {
  playwrightSubmissions: PlaywrightSubmission[];
  playwrightSuccessRate: number;
  playwrightPoints: number;
  httpTestsPassed: number;
  httpTestsTotal: number;
  httpPoints: number;
  totalPoints: number;
  maxPoints: number;
  details: string[];
}

export interface ErrorHandlingBreakdown {
  http500Errors: { test: string; count: number }[];
  validationMessages: boolean;
  gracefulImageHandling: boolean;
  crashCount: number;
  totalPoints: number;
  maxPoints: number;
  details: string[];
}

export interface UxAccessibilityBreakdown {
  mobileResponsive: boolean;
  hasLoadingIndicators: boolean;
  formLabelsPresent: boolean;
  hasAltText: boolean;
  colorContrastPasses: boolean;
  loadTimeMs: number;
  totalPoints: number;
  maxPoints: number;
  details: string[];
}

export interface CodeQualityBreakdown {
  hasTests: boolean;
  testFileCount: number;
  usesTypeScript: boolean;
  hasSeparation: boolean;
  hasGitignore: boolean;
  hasReadme: boolean;
  llmProvider?: string;
  llmProviderType?: 'direct' | 'reseller';
  totalPoints: number;
  maxPoints: number;
  details: string[];
}

export interface SecurityBreakdown {
  secretsInCode: number;
  secretsInHistory: number;
  xssVulnerable: boolean;
  sqlInjectionAccepted: boolean;
  debugModeEnabled: boolean;
  acceptsExeAsJpg: boolean;
  apiKeysInClient: boolean;
  totalPoints: number;
  maxPoints: number;
  details: string[];
}

export interface DeploymentBreakdown {
  urlAccessible: boolean;
  formRendersCorrectly: boolean;
  fileUploadWorks: boolean;
  appStartsWithoutModification: boolean;
  readmeHasSetupInstructions: boolean;
  isEphemeralUrl: boolean;
  totalPoints: number;
  maxPoints: number;
  details: string[];
}

// Critical issue type (can be string for legacy or object for AI-generated)
export interface CriticalIssue {
  type?: string;
  category?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  issue?: string; // Alternative field name used by AI
}

// Qualitative assessments (non-scoring)
export interface QualitativeAssessments {
  aiFirstMindset?: {
    score: 'strong' | 'moderate' | 'weak' | 'none';
    assessment: string;
    positiveIndicators: string[];
    negativeIndicators: string[];
  };
  instructionsCompliance?: {
    score: 'full' | 'partial' | 'minimal' | 'non_compliant';
    assessment: string;
    compliantItems: string[];
    nonCompliantItems: string[];
  };
}
