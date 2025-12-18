/**
 * Miscellaneous types (manual review, LLM costs)
 */

// Manual review types
export interface ManualReview {
  id: string;
  checklist: string[];
  answers: Record<string, string>;
  reviewerName?: string;
  reviewedAt: string;
}

// LLM cost tracking
export interface LlmCostBreakdown {
  operation: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface LlmCostSummary {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  breakdown?: LlmCostBreakdown[];
}

export interface CostAggregation {
  today: number;
  thisWeek: number;
  thisMonth: number;
  last3Months: number;
  allTime: number;
  evaluationCount: number;
}
