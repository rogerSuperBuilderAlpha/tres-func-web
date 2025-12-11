'use client';

import { useState } from 'react';
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
  onReset: () => void;
  pdfStatus?: 'pending' | 'generating' | 'ready' | 'failed';
  pdfUrl?: string;
  onRetryPdf?: () => void;
  manualReviews?: ManualReview[];
}

// Backward-compatible re-export (used by app page)
export { PdfStatusButton } from './report/PdfStatusButton';

export function EvaluationReport({ report, manualReviews = [] }: EvaluationReportProps) {
  const [selectedReview, setSelectedReview] = useState<ManualReview | null>(null);
  const hasRubric = !!report.scores?.rubric;
  const criticalIssues = report.criticalIssues ?? report.criticalFailures ?? [];
  const strengths = report.summary?.strengths ?? [];
  const concerns = report.summary?.concerns ?? [];
  const recommendations = report.summary?.recommendations ?? [];

  const overallScore = report.scores?.rubric?.overall ?? report.scores?.overall ?? 0;
  const maxScore = hasRubric ? 90 : 100;
  const scoreTier = getScoreTierGradient(overallScore, maxScore);

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
        <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}

      {/* Right Column - Score Breakdown */}
      <div className="flex-1 flex flex-col bg-navy-50/30 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <ManualReviewsSection reviews={manualReviews} onSelect={(review) => setSelectedReview(review)} />

          <h2 className="text-xl font-semibold text-navy-900 mb-6">Score Breakdown</h2>

          <RubricScoreGrid report={report} />

          {/* Qualitative Assessments (Non-Scoring) */}
          <QualitativeAssessmentsSection assessments={report.qualitativeAssessments} />

          {/* Recommendations */}
          <RecommendationsCard recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}
