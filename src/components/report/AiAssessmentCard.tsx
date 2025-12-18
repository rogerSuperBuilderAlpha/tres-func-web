'use client';

import { memo } from 'react';
import type { AiExecutiveSummary } from '@/types';
import { LightbulbIcon } from '@/components/ui';

interface AiAssessmentCardProps {
  aiExecutiveSummary: AiExecutiveSummary;
}

export const AiAssessmentCard = memo(function AiAssessmentCard({ aiExecutiveSummary }: AiAssessmentCardProps) {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 p-5 mb-6 shadow-sm">
      <h3 className="text-sm font-semibold text-navy-800 dark:text-white mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
          <LightbulbIcon className="w-3.5 h-3.5 text-gold-600" />
        </span>
        AI Assessment
      </h3>

      <p className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed mb-4">{aiExecutiveSummary.overallAssessment}</p>

      {aiExecutiveSummary.keyStrengths && aiExecutiveSummary.keyStrengths.length > 0 && (
        <div className="flex items-start gap-2 mb-2">
          <span className="text-success-500 mt-0.5">✓</span>
          <p className="text-sm text-navy-600 dark:text-navy-300">{aiExecutiveSummary.keyStrengths.slice(0, 2).join(', ')}</p>
        </div>
      )}

      {aiExecutiveSummary.keyWeaknesses && aiExecutiveSummary.keyWeaknesses.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="text-warning-500 mt-0.5">!</span>
          <p className="text-sm text-navy-600 dark:text-navy-300">{aiExecutiveSummary.keyWeaknesses.slice(0, 2).join(', ')}</p>
        </div>
      )}
    </div>
  );
});
