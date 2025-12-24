/**
 * Shared type definitions for the TTB Evaluator frontend
 *
 * Types are now organized in modular files:
 * - progress.ts - Progress tracking types
 * - scores.ts - Score, AI analysis, and qualitative assessment types
 * - test-results.ts - Individual test suite result types
 * - evaluation.ts - Evaluation and report types
 * - misc.ts - Manual review and LLM cost types
 */

// Progress types
export type {
  DetailedProgress,
  TestStageStatus,
  TestProgress,
} from './progress';

// Score and AI analysis types
export type {
  AiTestAnalysis,
  AiExecutiveSummary,
  ScoreReasoning,
  RubricScores,
  PlaywrightStats,
  ScoreBreakdowns,
  PlaywrightSubmission,
  CoreFunctionalityBreakdown,
  ErrorHandlingBreakdown,
  UxAccessibilityBreakdown,
  CodeQualityBreakdown,
  SecurityBreakdown,
  DeploymentBreakdown,
  CriticalIssue,
  QualitativeAssessments,
} from './scores';

// Test result types
export type {
  TestCaseResult,
  FormTestCaseResult,
  ResilienceTestResult,
  ScenarioResult,
  MultipleMismatchResult,
  PartialMatchResult,
  FormatToleranceResult,
  UxTestResult,
  AiReviewResult,
  DeploymentTestResult,
  EvaluationSuites,
} from './test-results';

// Evaluation types
export type {
  Evaluation,
  EvaluationSummary,
  EvaluationReportData,
} from './evaluation';

// Misc types
export type {
  ManualReview,
  LlmCostBreakdown,
  LlmCostSummary,
  CostAggregation,
} from './misc';
