import type { EvaluationSummary } from '@/types';
import { SCORE_THRESHOLDS } from '@/lib/constants';

export function calculateStats(evaluations: EvaluationSummary[]) {
  const total = evaluations.length;
  let totalScore = 0;
  let excellent = 0;
  let proficient = 0;
  let needsWork = 0;
  let withCritical = 0;

  for (const evaluation of evaluations) {
    const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
    totalScore += score;

    if (score >= SCORE_THRESHOLDS.EXCELLENT_MIN) excellent++;
    else if (score >= SCORE_THRESHOLDS.PROFICIENT_MIN) proficient++;
    else needsWork++;

    if (evaluation.criticalFailuresCount > 0) withCritical++;
  }

  return {
    total,
    avgScore: total > 0 ? Math.round(totalScore / total) : 0,
    excellent,
    proficient,
    needsWork,
    withCritical,
  };
}


