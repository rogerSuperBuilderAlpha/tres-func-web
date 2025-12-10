'use client';

import type { ManualReview } from '@/types';
import { formatDate } from '@/lib/utils';

// Full checklist labels for modal
const CHECKLIST_FULL_LABELS: Record<string, string> = {
  code_review: 'Reviewed code structure and organization',
  readme_check: 'Verified README has clear setup instructions',
  manual_test: 'Manually tested the deployed application',
  edge_cases: 'Tested edge cases not covered by automation',
  security_check: 'Checked for obvious security issues',
  ui_ux: 'Assessed UI/UX quality and responsiveness',
  error_handling: 'Verified error handling behavior',
  score_fair: 'Confirmed automated scores seem fair',
};

// Answer question labels
const ANSWER_LABELS: Record<string, string> = {
  strengths: 'Notable Strengths',
  concerns: 'Concerns Found',
  recommendation: 'Overall Assessment',
  notes: 'Additional Notes',
};

interface ReviewDetailModalProps {
  review: ManualReview;
  onClose: () => void;
}

export function ReviewDetailModal({ review, onClose }: ReviewDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative glass rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-navy-200">
          {/* Header */}
          <div className="sticky top-0 glass border-b border-navy-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy-900">Manual Review</h2>
                <p className="text-sm text-navy-500">by {review.reviewerName || 'Reviewer'} • {formatDate(review.reviewedAt)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            {/* Checklist */}
            <div>
              <h3 className="font-semibold text-navy-900 mb-3">Completed Checks ({review.checklist.length}/8)</h3>
              <div className="bg-navy-50 rounded-xl p-4 space-y-2">
                {review.checklist.map(id => (
                  <div key={id} className="flex items-center gap-2 text-sm text-navy-700">
                    <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {CHECKLIST_FULL_LABELS[id] || id}
                  </div>
                ))}
              </div>
            </div>

            {/* Answers */}
            {Object.entries(review.answers)
              .filter(([, value]) => value && value.trim())
              .map(([key, value]) => (
                <div key={key}>
                  <h3 className="font-semibold text-navy-900 mb-2">{ANSWER_LABELS[key] || key}</h3>
                  <div className="bg-white rounded-xl border border-navy-200 p-4">
                    <p className="text-sm text-navy-700 whitespace-pre-wrap">{value}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

