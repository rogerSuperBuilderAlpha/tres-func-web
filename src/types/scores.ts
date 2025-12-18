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
