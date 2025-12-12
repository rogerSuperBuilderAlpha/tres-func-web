'use client';

import type { ManualReview } from '@/types';
import { formatDate } from '@/lib/utils';

// Checklist label mapping
const CHECKLIST_LABELS: Record<string, string> = {
  code_review: 'Code Review',
  readme_check: 'README Check',
  manual_test: 'Manual Test',
  edge_cases: 'Edge Cases',
  security_check: 'Security',
  ui_ux: 'UI/UX',
  error_handling: 'Error Handling',
  score_fair: 'Score Verified',
};

interface ReviewCardProps {
  review: ManualReview;
  onClick: () => void;
}

export function ReviewCard({ review, onClick }: ReviewCardProps) {
  const assessmentPreview = review.answers.recommendation || review.answers.strengths || review.answers.notes || '';
  const truncated = assessmentPreview.length > 80 ? assessmentPreview.slice(0, 80) + '...' : assessmentPreview;
  
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-navy-200 p-4 text-left hover:shadow-md hover:border-gold-300 transition group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-navy-800">{review.reviewerName || 'Reviewer'}</span>
        <span className="text-xs text-navy-400">{formatDate(review.reviewedAt).split(',')[0]}</span>
      </div>
      <p className="text-xs text-navy-600 mb-3 line-clamp-2">{truncated || 'No notes'}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {review.checklist.slice(0, 3).map(id => (
            <span key={id} className="text-[10px] bg-navy-100 text-navy-600 px-1.5 py-0.5 rounded">
              {CHECKLIST_LABELS[id] || id}
            </span>
          ))}
          {review.checklist.length > 3 && (
            <span className="text-[10px] bg-navy-100 text-navy-600 px-1.5 py-0.5 rounded">
              +{review.checklist.length - 3}
            </span>
          )}
        </div>
        <svg className="w-4 h-4 text-navy-300 group-hover:text-gold-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}




