/**
 * Shared type definitions for the TTB Evaluator frontend
 */

// Progress types
export interface DetailedProgress {
  testName: string;
  stage: string;
  message: string;
  details?: string;
  percentage?: number;
  timestamp: number;
}

export type TestStageStatus = 'pending' | 'running' | 'complete' | 'failed' | 'warning';

export interface TestProgress {
  preflight: TestStageStatus;
  repoAnalysis: TestStageStatus;
  security: TestStageStatus;
  imageEdgeCases: TestStageStatus;
  formInput: TestStageStatus;
  resilience: TestStageStatus;
  functional: TestStageStatus;
  uxTest: TestStageStatus;
  aiReview: TestStageStatus;
  deployment: TestStageStatus;
  reportGeneration: TestStageStatus;
  pdfGeneration: TestStageStatus;
}

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

// Score types
export interface RubricScores {
  coreFunctionality: number;    // 20 points - includes image processing
  errorHandling: number;        // 20 points - includes form validation
  uxAccessibility: number;      // 20 points - includes load/performance
  codeQuality: number;          // 10 points
  security: number;             // 10 points
  deploymentCompliance: number; // 10 points
  overall: number;              // 90 points max
}

// Evaluation types
export interface Evaluation {
  evaluationId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  reportUrl?: string;
  report?: EvaluationReportData;
  error?: string;
  progress?: TestProgress;
  startTime?: string;
  detailedProgress?: DetailedProgress[];
  pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
  pdfUrl?: string;
  manualReviews?: ManualReview[];
}

export interface EvaluationSummary {
  evaluationId: string;
  evaluatedAt: string;
  repoUrl: string;
  deployedUrl: string;
  tier?: string; // Legacy field - no longer used for display
  tierReason?: string;
  overallScore: number;
  rubricScore?: number;
  criticalFailuresCount: number;
  reportUrl: string;
  summary?: {
    strengths: string[];
    concerns: string[];
  };
  aiAssessment?: string;
}

// Report data types
export interface EvaluationReportData {
  submissionId: string;
  evaluatedAt: string;
  repoUrl: string;
  deployedUrl: string;
  scores: {
    security: number;
    errorHandling: number;
    edgeCases: number;
    codeQuality: number;
    documentation: number;
    functional: number;
    uxDesign: number;
    aiReview: number;
    overall: number;
    rubric?: RubricScores;
  };
  tier?: string; // Legacy field - no longer used
  tierReason?: string; // Legacy field - no longer used
  criticalIssues?: string[];
  criticalFailures?: string[]; // Deprecated - kept for backward compatibility
  summary: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  aiExecutiveSummary?: AiExecutiveSummary;
  suites?: EvaluationSuites;
}

// Test suite types
export interface EvaluationSuites {
  preflight?: {
    passed?: boolean;
    recommendation?: 'proceed' | 'warning' | 'block';
    summary?: string;
    securityIssues?: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
    cheatingIndicators?: Array<{
      type: string;
      severity: string;
      description: string;
      evidence?: string;
    }>;
    repoMetadata?: {
      commitCount: number;
      firstCommitDate?: string;
      lastCommitDate?: string;
      authors: string[];
    };
    aiAnalysis?: AiTestAnalysis;
  };
  repoAnalysis?: {
    cloneSuccess: boolean;
    cloneError?: string;
    hasTests?: boolean;
    hasSourceDirectory?: boolean;
    separatesFrontendBackend?: boolean;
    readmeExists?: boolean;
    readmeHasSetupInstructions?: boolean;
    aiAnalysis?: AiTestAnalysis;
  };
  security?: {
    xss?: { brandNameFieldVulnerable?: boolean; productTypeFieldVulnerable?: boolean };
    injection?: { sqlInjectionPayloadsAccepted?: boolean };
    disclosure?: { apiKeysInClientCode?: boolean };
    fileUpload?: {
      acceptsExecutablesAsImages?: boolean;
      missingFileSizeLimit?: boolean;
      exeAsJpg?: { accepted?: boolean };
      oversizedFile?: { accepted?: boolean };
      htmlAsImage?: { accepted?: boolean };
      svgWithScript?: { accepted?: boolean };
    };
    aiAnalysis?: AiTestAnalysis;
  };
  imageEdgeCases?: {
    aiAnalysis?: AiTestAnalysis;
    solidBlackImage?: TestCaseResult;
    solidWhiteImage?: TestCaseResult;
    rotated90?: TestCaseResult;
    rotated180?: TestCaseResult;
    veryLowRes?: TestCaseResult;
    veryHighRes?: TestCaseResult;
    oversizedFile?: TestCaseResult;
  };
  formInput?: {
    aiAnalysis?: AiTestAnalysis;
    cases?: FormTestCaseResult[];
  };
  resilience?: {
    rapidSubmission?: ResilienceTestResult;
    concurrentSubmission?: ResilienceTestResult;
    recoveryAfterError?: ResilienceTestResult;
    largeImageTimeout?: ResilienceTestResult;
    aiAnalysis?: AiTestAnalysis;
  };
  functional?: {
    scenarioA_Match?: ScenarioResult;
    scenarioB_BrandMismatch?: ScenarioResult;
    scenarioC_AbvMismatch?: ScenarioResult;
    multipleMismatches?: MultipleMismatchResult;
    partialMatch?: PartialMatchResult;
    formatTolerance?: FormatToleranceResult;
    aiAnalysis?: AiTestAnalysis;
  };
  uxTest?: UxTestResult;
  aiReview?: AiReviewResult;
  deployment?: DeploymentTestResult;
}

// Test result types
export interface TestCaseResult {
  passed?: boolean;
  handledGracefully?: boolean;
  providedUserMessage?: boolean;
  responseType?: string;
  userMessage?: string;
  httpStatus?: number;
}

export interface FormTestCaseResult {
  name: string;
  passed: boolean;
  handledGracefully: boolean;
  providedUserMessage: boolean;
  responseType?: string;
  userMessage?: string;
  httpStatus?: number;
}

export interface ResilienceTestResult {
  passed?: boolean;
  maintainedPerformance?: boolean;
  allRequestsProcessed?: boolean;
  successRate?: number;
  averageResponseTime?: number;
  recoverySuccessful?: boolean;
  responseTime?: number;
}

export interface ScenarioResult {
  passed: boolean;
  correctlyIdentifiedMatch?: boolean;
  correctlyIdentifiedMismatch?: boolean;
  specifiedWhichField?: boolean;
  showedBothValues?: boolean;
  responseDetails?: string;
}

export interface MultipleMismatchResult {
  passed: boolean;
  identifiedAllMismatches?: boolean;
  mismatchCount?: number;
}

export interface PartialMatchResult {
  passed: boolean;
  handledGracefully?: boolean;
  indicatedWhichMatched?: boolean;
}

export interface FormatToleranceResult {
  handles45PercentVs45?: boolean;
  handles750mlVs750mL?: boolean;
  handlesAlcByVolFormat?: boolean;
}

export interface UxTestResult {
  pageLoads?: boolean;
  loadTimeMs?: number;
  hasTitle?: boolean;
  title?: string;
  isMobileResponsive?: boolean;
  hasFileUpload?: boolean;
  hasFormFields?: boolean;
  hasSubmitButton?: boolean;
  uxScore?: number;
  findings?: string[];
  recommendations?: string[];
  aiAnalysis?: AiTestAnalysis;
}

export interface AiReviewResult {
  overallAssessment?: string;
  codeQualityRating?: 'excellent' | 'good' | 'adequate' | 'poor';
  architectureAnalysis?: string;
  architectureStrengths?: string[];
  architectureWeaknesses?: string[];
  bestPracticesFollowed?: string[];
  bestPracticesViolated?: string[];
  topRecommendations?: string[];
  ttbRequirementsCoverage?: string;
  verificationLogicAssessment?: string;
  imageHandlingAssessment?: string;
}

export interface DeploymentTestResult {
  urlAccessible?: boolean;
  responseTimeMs?: number;
  httpStatus?: number;
  appStartsWithoutModification?: boolean;
  formRendersCorrectly?: boolean;
  fileUploadWorks?: boolean;
  readmeExists?: boolean;
  readmeHasSetupSteps?: boolean;
  readmeIsComplete?: boolean;
  deployedUrlProvided?: boolean;
  repoUrlProvided?: boolean;
  findings?: string[];
  aiAnalysis?: AiTestAnalysis;
}

// Manual review types
export interface ManualReview {
  id: string;
  checklist: string[];
  answers: Record<string, string>;
  reviewerName?: string;
  reviewedAt: string;
}
