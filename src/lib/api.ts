/**
 * API client and utilities for the TTB Evaluator
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://3mw2hq6l57.execute-api.us-east-1.amazonaws.com/prod';

/**
 * Wrapper for fetch with error handling and JSON parsing
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `API error: ${response.status}`);
  }

  return data;
}

/**
 * Start a new evaluation
 */
export async function startEvaluation(repoUrl: string, deployedUrl: string, backendRepoUrl?: string) {
  return apiRequest<{ evaluationId: string; reportUrl: string }>('/evaluate', {
    method: 'POST',
    body: JSON.stringify({ repoUrl, deployedUrl, backendRepoUrl }),
  });
}

/**
 * Get evaluation status
 */
export async function getEvaluationStatus(evaluationId: string) {
  return apiRequest<{
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress?: Record<string, string>;
    startTime?: string;
    detailedProgress?: Array<{ testName: string; stage: string; message: string; percentage?: number; timestamp: number }>;
    report?: unknown;
    reportUrl?: string;
    pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
    pdfUrl?: string;
    error?: string;
  }>(`/status/${evaluationId}`);
}

/**
 * Get list of evaluations
 */
export async function getEvaluations(limit = 20) {
  return apiRequest<{ evaluations: Array<unknown> }>(`/evaluations?limit=${limit}`);
}

/**
 * Retry PDF generation
 */
export async function retryPdfGeneration(evaluationId: string) {
  return apiRequest<{ success: boolean }>(`/retry-pdf/${evaluationId}`, {
    method: 'POST',
  });
}

/**
 * Save manual review
 */
export async function saveManualReview(evaluationId: string, reviewData: unknown) {
  return apiRequest<{ success: boolean }>(`/review/${evaluationId}`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}






