/**
 * Evaluation and report types
 */

import { TestProgress, DetailedProgress } from './progress';
import { RubricScores, AiExecutiveSummary, ScoreReasoning, CriticalIssue, QualitativeAssessments } from './scores';
import { EvaluationSuites } from './test-results';
import { LlmCostSummary, ManualReview } from './misc';

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
  repoUrl?: string;
  deployedUrl?: string;
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
  llmCosts?: {
    totalCostUsd: number;
    totalTokens: number;
    inputTokens?: number;
    outputTokens?: number;
  };
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
  criticalIssues?: (string | CriticalIssue)[];
  criticalFailures?: string[]; // Deprecated - kept for backward compatibility
  summary: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  aiExecutiveSummary?: AiExecutiveSummary;
  scoreReasoning?: ScoreReasoning;
  suites?: EvaluationSuites;
  qualitativeAssessments?: QualitativeAssessments;
  llmCosts?: LlmCostSummary;
}
