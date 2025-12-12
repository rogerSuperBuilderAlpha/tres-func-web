'use client';

/**
 * Reusable card component for qualitative (non-scoring) assessments
 * Used for AI-First Mindset and Instructions Compliance assessments
 */

interface QualitativeAssessmentCardProps {
  icon: string;
  title: string;
  score: string;
  scoreLabel?: string;
  assessment: string;
  positiveItems?: string[];
  positiveLabel?: string;
  negativeItems?: string[];
  negativeLabel?: string;
}

/**
 * Get the appropriate color class for a qualitative score
 */
function getScoreColor(score: string): string {
  switch (score.toLowerCase()) {
    case 'strong':
    case 'full':
      return 'bg-success-100 text-success-700';
    case 'moderate':
    case 'partial':
      return 'bg-gold-100 text-gold-700';
    case 'weak':
    case 'minimal':
      return 'bg-warning-100 text-warning-700';
    case 'none':
    case 'non_compliant':
    case 'non-compliant':
      return 'bg-danger-100 text-danger-700';
    default:
      return 'bg-navy-100 text-navy-700';
  }
}

/**
 * Format a score string for display (handle underscores, capitalize)
 */
function formatScore(score: string): string {
  return score
    .replace(/_/g, '-')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function QualitativeAssessmentCard({
  icon,
  title,
  score,
  scoreLabel,
  assessment,
  positiveItems = [],
  positiveLabel = 'Positive Indicators',
  negativeItems = [],
  negativeLabel = 'Areas of Concern',
}: QualitativeAssessmentCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-navy-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-navy-800 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h4>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
          {scoreLabel || formatScore(score)}
        </span>
      </div>
      
      <p className="text-sm text-navy-600 mb-3">{assessment}</p>
      
      {positiveItems.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-navy-500 mb-1">{positiveLabel}:</p>
          <ul className="space-y-1">
            {positiveItems.map((item, i) => (
              <li key={i} className="text-xs text-success-600 flex items-start gap-1">
                <span>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {negativeItems.length > 0 && (
        <div>
          <p className="text-xs font-medium text-navy-500 mb-1">{negativeLabel}:</p>
          <ul className="space-y-1">
            {negativeItems.map((item, i) => (
              <li key={i} className="text-xs text-warning-600 flex items-start gap-1">
                <span>!</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


