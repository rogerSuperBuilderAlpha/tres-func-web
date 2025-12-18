'use client';

import { memo } from 'react';
import { InfoCircleIcon } from '@/components/ui';

interface RecommendationsCardProps {
  recommendations: string[];
}

export const RecommendationsCard = memo(function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-navy-900 dark:text-white mb-4">Recommendations</h3>
      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm p-5 border border-navy-100 dark:border-navy-700">
        <ul className="space-y-3">
          {recommendations.map((item, i) => (
            <li key={i} className="text-sm text-navy-700 dark:text-navy-300 flex items-start gap-3">
              <span className="text-gold-500 mt-0.5 flex-shrink-0">
                <InfoCircleIcon className="w-4 h-4" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
