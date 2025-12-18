'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import type { EvaluationReportData, ManualReview } from '@/types';
import { getScoreTierGradient } from '@/lib/utils';
import {
  AiAssessmentCard,
  CriticalIssuesCard,
  LinksDetailsCard,
  ManualReviewsSection,
  QualitativeAssessmentsSection,
  RecommendationsCard,
  ReviewDetailModal,
  ScoreHeader,
  RubricScoreGrid,
  SummaryAccordionCard,
} from './report';

interface EvaluationReportProps {
  report: EvaluationReportData;
  manualReviews?: ManualReview[];
}

// Backward-compatible re-export (used by app page)
export { PdfStatusButton } from './report/PdfStatusButton';

export const EvaluationReport = memo(function EvaluationReport({ report, manualReviews = [] }: EvaluationReportProps) {
  const [selectedReview, setSelectedReview] = useState<ManualReview | null>(null);

  const { criticalIssues, strengths, concerns, recommendations, overallScore, maxScore, scoreTier } = useMemo(() => {
    const hasRubric = !!report.scores?.rubric;
    const overall = report.scores?.rubric?.overall ?? report.scores?.overall ?? 0;
    const max = hasRubric ? 90 : 100;
    return {
      criticalIssues: report.criticalIssues ?? report.criticalFailures ?? [],
      strengths: report.summary?.strengths ?? [],
      concerns: report.summary?.concerns ?? [],
      recommendations: report.summary?.recommendations ?? [],
      overallScore: overall,
      maxScore: max,
      scoreTier: getScoreTierGradient(overall, max),
    };
  }, [report]);

  const handleCloseModal = useCallback(() => setSelectedReview(null), []);
  const handleSelectReview = useCallback((review: ManualReview) => setSelectedReview(review), []);

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Column - Summary */}
      <div className="w-full lg:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-navy-200 glass overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Score Header */}
          <ScoreHeader
            tierLabel={scoreTier.label}
            tierStyle={scoreTier.style ?? {}}
            overallScore={overallScore}
            maxScore={maxScore}
          />

          {/* Links & Details */}
          <LinksDetailsCard report={report} />

          {/* AI Summary Card */}
          {report.aiExecutiveSummary && <AiAssessmentCard aiExecutiveSummary={report.aiExecutiveSummary} />}

          {/* Critical Issues */}
          <CriticalIssuesCard issues={criticalIssues} />

          {/* Accordion sections */}
          <SummaryAccordionCard strengths={strengths} concerns={concerns} />
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal review={selectedReview} onClose={handleCloseModal} />
      )}

      {/* Right Column - Score Breakdown */}
      <div className="flex-1 flex flex-col bg-navy-50/30 dark:bg-navy-900/30 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <ManualReviewsSection reviews={manualReviews} onSelect={handleSelectReview} />

          <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-6">Score Breakdown</h2>

          <RubricScoreGrid report={report} />

          {/* Qualitative Assessments (Non-Scoring) */}
          <QualitativeAssessmentsSection assessments={report.qualitativeAssessments} />

          {/* Recommendations */}
          <RecommendationsCard recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
});
