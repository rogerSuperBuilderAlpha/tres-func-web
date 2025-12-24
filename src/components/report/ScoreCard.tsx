'use client';

import { memo, useState } from 'react';
import { getScoreColor, getScoreHex, getGradeLabel } from '@/lib/utils';
import { ScoreBreakdownModal } from './ScoreBreakdownModal';
import type { ScoreBreakdowns } from '@/types';

interface RubricInfo {
  label: string;
  max: number;
  icon: string;
}

interface ScoreCardProps {
  value: number;
  rubricInfo: RubricInfo;
  assessment: string;
  categoryKey: string;
  breakdowns?: ScoreBreakdowns;
}

export const ScoreCard = memo(function ScoreCard({ 
  value, 
  rubricInfo, 
  assessment,
  categoryKey,
  breakdowns,
}: ScoreCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const safeValue = Math.max(0, value || 0);
  const percentage = Math.round((safeValue / rubricInfo.max) * 100);
  const grade = getGradeLabel(percentage);

  // Get the specific breakdown for this category
  const breakdown = breakdowns?.[categoryKey as keyof ScoreBreakdowns];

  return (
    <>
      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm p-5 border border-navy-100 dark:border-navy-700 hover:shadow-md transition">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{rubricInfo.icon}</span>
            <span className="font-semibold text-navy-800 dark:text-white">{rubricInfo.label}</span>
          </div>
          <span className={`text-2xl font-bold font-mono ${getScoreColor(safeValue, rubricInfo.max)}`}>
            {safeValue}<span className="text-sm text-navy-400">/{rubricInfo.max}</span>
          </span>
        </div>
        <div className="h-3 bg-navy-100 dark:bg-navy-700 rounded-full mb-4 overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
            style={{ 
              width: `${percentage}%`,
              minWidth: percentage > 0 ? '8px' : '0',
              backgroundColor: getScoreHex(safeValue, rubricInfo.max),
            }} 
          />
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${grade.color}`}>{grade.label}</span>
          {breakdown && (
            <button
              onClick={() => setShowBreakdown(true)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              View Details
            </button>
          )}
        </div>
        <p className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed mt-3">{assessment}</p>
      </div>

      <ScoreBreakdownModal
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        title={rubricInfo.label}
        icon={rubricInfo.icon}
        score={safeValue}
        maxScore={rubricInfo.max}
        breakdown={breakdown}
        categoryKey={categoryKey}
      />
    </>
  );
});

