'use client';

import type { ManualReview } from '@/types';
import { formatDate } from '@/lib/utils';
import { Modal, ClipboardListIcon, CheckIcon } from '@/components/ui';

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
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Manual Review"
      subtitle={`by ${review.reviewerName || 'Reviewer'} • ${formatDate(review.reviewedAt)}`}
      icon={<ClipboardListIcon className="w-5 h-5 text-white" />}
      size="lg"
    >
      <div className="space-y-6">
        {/* Checklist */}
        <div>
          <h3 className="font-semibold text-navy-900 dark:text-white mb-3">
            Completed Checks ({review.checklist.length}/8)
          </h3>
          <div className="bg-navy-50 dark:bg-navy-800 rounded-xl p-4 space-y-2">
            {review.checklist.map(id => (
              <div key={id} className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-300">
                <CheckIcon className="w-4 h-4 text-success-500" />
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
              <h3 className="font-semibold text-navy-900 dark:text-white mb-2">
                {ANSWER_LABELS[key] || key}
              </h3>
              <div className="bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 p-4">
                <p className="text-sm text-navy-700 dark:text-navy-300 whitespace-pre-wrap">{value}</p>
              </div>
            </div>
          ))}
      </div>
    </Modal>
  );
}






