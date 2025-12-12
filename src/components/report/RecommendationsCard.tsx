'use client';

import { memo } from 'react';

interface RecommendationsCardProps {
  recommendations: string[];
}

export const RecommendationsCard = memo(function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-navy-900 mb-4">Recommendations</h3>
      <div className="bg-white rounded-xl shadow-sm p-5 border border-navy-100">
        <ul className="space-y-3">
          {recommendations.map((item, i) => (
            <li key={i} className="text-sm text-navy-700 flex items-start gap-3">
              <span className="text-gold-500 mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
