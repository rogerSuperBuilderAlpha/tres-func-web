'use client';

import { memo } from 'react';
import type { AiExecutiveSummary } from '@/types';

interface AiAssessmentCardProps {
  aiExecutiveSummary: AiExecutiveSummary;
}

export const AiAssessmentCard = memo(function AiAssessmentCard({ aiExecutiveSummary }: AiAssessmentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-navy-200 p-5 mb-6 shadow-sm">
      <h3 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-gold-100 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </span>
        AI Assessment
      </h3>

      <p className="text-sm text-navy-600 leading-relaxed mb-4">{aiExecutiveSummary.overallAssessment}</p>

      {aiExecutiveSummary.keyStrengths && aiExecutiveSummary.keyStrengths.length > 0 && (
        <div className="flex items-start gap-2 mb-2">
          <span className="text-success-500 mt-0.5">✓</span>
          <p className="text-sm text-navy-600">{aiExecutiveSummary.keyStrengths.slice(0, 2).join(', ')}</p>
        </div>
      )}

      {aiExecutiveSummary.keyWeaknesses && aiExecutiveSummary.keyWeaknesses.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="text-warning-500 mt-0.5">!</span>
          <p className="text-sm text-navy-600">{aiExecutiveSummary.keyWeaknesses.slice(0, 2).join(', ')}</p>
        </div>
      )}
    </div>
  );
});


