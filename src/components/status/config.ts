import type { TestProgress } from '@/types';

// Test status configuration - data-driven for the checklist
export const TEST_STATUS_CONFIG: Array<{ key: keyof TestProgress; label: string }> = [
  { key: 'preflight', label: 'Pre-flight Check' },
  { key: 'repoAnalysis', label: 'Repo Analysis' },
  { key: 'security', label: 'Security' },
  { key: 'imageEdgeCases', label: 'Image Edge Cases' },
  { key: 'formInput', label: 'Form Validation' },
  { key: 'resilience', label: 'Resilience' },
  { key: 'functional', label: 'Functional' },
  { key: 'uxTest', label: 'UX Testing' },
  { key: 'aiReview', label: 'AI Review' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'reportGeneration', label: 'Report Gen' },
  { key: 'pdfGeneration', label: 'PDF Report' },
];




