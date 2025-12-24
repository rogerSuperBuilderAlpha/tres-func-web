'use client';

import { memo } from 'react';
import type { EvaluationReportData } from '@/types';
import { ScoreCard } from './ScoreCard';
import { getRubricAssessment, isRubricKey, RUBRIC_LABELS } from './utils';

interface RubricScoreGridProps {
  report: EvaluationReportData;
}

export const RubricScoreGrid = memo(function RubricScoreGrid({ report }: RubricScoreGridProps) {
  const rubric = report.scores?.rubric;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {rubric &&
        Object.entries(rubric).map(([key, value]) => {
          if (key === 'overall' || key === 'playwrightStats' || key === 'breakdowns' || !isRubricKey(key)) return null;
          const rubricInfo = RUBRIC_LABELS[key];
          return (
            <ScoreCard
              key={key}
              value={typeof value === 'number' ? value : 0}
              rubricInfo={rubricInfo}
              assessment={getRubricAssessment(report, key)}
              categoryKey={key}
              breakdowns={rubric.breakdowns}
            />
          );
        })}
    </div>
  );
});



