'use client';

import type { QualitativeAssessments } from '@/types';
import { QualitativeAssessmentCard } from './QualitativeAssessmentCard';

interface QualitativeAssessmentsSectionProps {
  assessments?: QualitativeAssessments;
}

export function QualitativeAssessmentsSection({ assessments }: QualitativeAssessmentsSectionProps) {
  if (!assessments) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-navy-900 mb-4">Additional Assessments</h3>
      <p className="text-sm text-navy-500 mb-4">
        These assessments provide additional context but do not factor into the overall score.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* AI-First Mindset */}
        {assessments.aiFirstMindset && (
          <QualitativeAssessmentCard
            icon="🤖"
            title="AI-First Mindset"
            score={assessments.aiFirstMindset.score}
            assessment={assessments.aiFirstMindset.assessment}
            positiveItems={assessments.aiFirstMindset.positiveIndicators}
            positiveLabel="Positive Indicators"
            negativeItems={assessments.aiFirstMindset.negativeIndicators}
            negativeLabel="Areas of Concern"
          />
        )}

        {/* Instructions Compliance */}
        {assessments.instructionsCompliance && (
          <QualitativeAssessmentCard
            icon="📋"
            title="Instructions Compliance"
            score={assessments.instructionsCompliance.score}
            assessment={assessments.instructionsCompliance.assessment}
            positiveItems={assessments.instructionsCompliance.compliantItems}
            positiveLabel="Requirements Met"
            negativeItems={assessments.instructionsCompliance.nonCompliantItems}
            negativeLabel="Requirements Not Met"
          />
        )}
      </div>
    </div>
  );
}


