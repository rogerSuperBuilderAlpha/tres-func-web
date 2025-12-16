'use client';

import { memo } from 'react';
import type { ManualReview } from '@/types';
import { ReviewCard } from './ReviewCard';

interface ManualReviewsSectionProps {
  reviews: ManualReview[];
  onSelect: (review: ManualReview) => void;
}

export const ManualReviewsSection = memo(function ManualReviewsSection({ reviews, onSelect }: ManualReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </span>
          Manual Reviews
        </h2>

        <span className="text-sm text-navy-500 bg-navy-100 px-2.5 py-1 rounded-full font-medium">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onClick={() => onSelect(review)} />
        ))}
      </div>
    </div>
  );
});


