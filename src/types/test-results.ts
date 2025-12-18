/**
 * Test suite result types for display
 */

import { AiTestAnalysis } from './scores';

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

// Test suites aggregate type
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
