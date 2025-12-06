'use client';

import { EvaluationReportData } from '@/app/page';

interface EvaluationReportProps {
  report: EvaluationReportData;
  onReset: () => void;
}

export function EvaluationReport({ report, onReset }: EvaluationReportProps) {
  const tierColors = {
    STRONG_HIRE: 'bg-green-100 text-green-800 border-green-300',
    MAYBE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    NO_HIRE: 'bg-red-100 text-red-800 border-red-300',
  };

  const tierLabels = {
    STRONG_HIRE: 'Strong Hire',
    MAYBE: 'Maybe',
    NO_HIRE: 'No Hire',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header with Tier */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Evaluation Results</h2>
            <p className="text-gray-500 text-sm">
              Completed {new Date(report.evaluatedAt).toLocaleString()}
            </p>
          </div>
          <div className={`px-6 py-3 rounded-lg border-2 ${tierColors[report.tier]}`}>
            <span className="text-lg font-bold">{tierLabels[report.tier]}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-700">{report.tierReason}</p>
        </div>

        {/* Overall Score */}
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold ${getScoreColor(report.scores.overall)}`}>
            {report.scores.overall}
          </div>
          <p className="text-gray-500">Overall Score</p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Repository</p>
            <a
              href={report.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate block"
            >
              {report.repoUrl}
            </a>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Deployed App</p>
            <a
              href={report.deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate block"
            >
              {report.deployedUrl}
            </a>
          </div>
        </div>
      </div>

      {/* Critical Failures */}
      {report.criticalFailures.length > 0 && (
        <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Critical Failures</h3>
          <ul className="space-y-2">
            {report.criticalFailures.map((failure, i) => (
              <li key={i} className="flex items-start text-red-700">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {failure}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scores Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(report.scores)
            .filter(([key]) => key !== 'overall')
            .map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`font-medium ${getScoreColor(value)}`}>{value}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBarColor(value)} transition-all duration-500`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Strengths</h3>
          <ul className="space-y-2">
            {report.summary.strengths.map((item, i) => (
              <li key={i} className="flex items-start text-green-700 text-sm">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        <div className="bg-yellow-50 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Concerns</h3>
          <ul className="space-y-2">
            {report.summary.concerns.map((item, i) => (
              <li key={i} className="flex items-start text-yellow-700 text-sm">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {report.summary.recommendations.map((item, i) => (
              <li key={i} className="flex items-start text-blue-700 text-sm">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Evaluate Another Submission
        </button>
      </div>
    </div>
  );
}
