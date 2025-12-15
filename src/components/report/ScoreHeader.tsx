'use client';

import { memo } from 'react';
import type { CSSProperties } from 'react';
import { getScoreColor } from '@/lib/utils';

interface ScoreHeaderProps {
  tierLabel: string;
  tierStyle?: CSSProperties;
  overallScore: number;
  maxScore: number;
}

export const ScoreHeader = memo(function ScoreHeader({ tierLabel, tierStyle, overallScore, maxScore }: ScoreHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="inline-block px-8 py-3 rounded-2xl shadow-lg mb-3" style={tierStyle}>
        <span className="text-2xl font-bold text-white">{tierLabel}</span>
      </div>
      <div className={`text-6xl font-bold font-mono ${getScoreColor(overallScore, maxScore)}`}>{overallScore}</div>
      <p className="text-navy-500 mt-1">out of {maxScore} points</p>
    </div>
  );
});

