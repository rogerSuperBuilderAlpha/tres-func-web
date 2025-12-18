/**
 * Progress tracking types
 */

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
