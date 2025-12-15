'use client';

import { memo } from 'react';
import { getScoreColor, getGradeLabel } from '@/lib/utils';

interface RubricInfo {
  label: string;
  max: number;
  icon: string;
}

interface ScoreCardProps {
  value: number;
  rubricInfo: RubricInfo;
  assessment: string;
}

export const ScoreCard = memo(function ScoreCard({ value, rubricInfo, assessment }: ScoreCardProps) {
  const safeValue = Math.max(0, value || 0);
  const percentage = Math.round((safeValue / rubricInfo.max) * 100);
  const grade = getGradeLabel(percentage);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-navy-100 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{rubricInfo.icon}</span>
          <span className="font-semibold text-navy-800">{rubricInfo.label}</span>
        </div>
        <span className={`text-2xl font-bold font-mono ${getScoreColor(safeValue, rubricInfo.max)}`}>
          {safeValue}<span className="text-sm text-navy-400">/{rubricInfo.max}</span>
        </span>
      </div>
      <div className="h-3 bg-navy-100 rounded-full mb-4 overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${percentage}%`,
            minWidth: percentage > 0 ? '8px' : '0',
            backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444'
          }} 
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${grade.color}`}>{grade.label}</span>
      </div>
      <p className="text-sm text-navy-600 leading-relaxed mt-3">{assessment}</p>
    </div>
  );
});

