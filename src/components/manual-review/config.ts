interface ChecklistItemConfig {
  id: string;
  label: string;
}

export interface ReviewQuestionConfig {
  id: string;
  question: string;
  placeholder: string;
}

export const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  { id: 'code_review', label: 'Reviewed code structure and organization' },
  { id: 'readme_check', label: 'Verified README has clear setup instructions' },
  { id: 'manual_test', label: 'Manually tested the deployed application' },
  { id: 'edge_cases', label: 'Tested edge cases not covered by automation' },
  { id: 'security_check', label: 'Checked for obvious security issues' },
  { id: 'ui_ux', label: 'Assessed UI/UX quality and responsiveness' },
  { id: 'error_handling', label: 'Verified error handling behavior' },
  { id: 'score_fair', label: 'Confirmed automated scores seem fair' },
];

export const REVIEW_QUESTIONS: ReviewQuestionConfig[] = [
  { id: 'strengths', question: 'What are the notable strengths?', placeholder: 'e.g., Clean code, good error handling...' },
  { id: 'concerns', question: 'What concerns did you find?', placeholder: 'e.g., Missing validation, poor UX...' },
  {
    id: 'recommendation',
    question: 'Overall assessment?',
    placeholder: 'e.g., Solid implementation with room for improvement...',
  },
  { id: 'notes', question: 'Additional notes?', placeholder: 'e.g., Shows good understanding of core concepts...' },
];




