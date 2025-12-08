'use client';

import { useState, useEffect } from 'react';
import type { TestProgress, DetailedProgress } from '@/types';

// Re-export types for backward compatibility
export type { TestProgress, DetailedProgress } from '@/types';

interface EvaluationStatusProps {
  evaluationId: string;
  progress?: TestProgress;
  startTime?: string;
  detailedProgress?: DetailedProgress[];
}

export function EvaluationStatus({ evaluationId, progress, startTime, detailedProgress }: EvaluationStatusProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Real-time timer that updates every second
  useEffect(() => {
    const startDate = startTime ? new Date(startTime) : new Date();

    const updateElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startDate.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    };

    // Update immediately
    updateElapsed();

    // Then update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

  // Calculate completion percentage
  const getCompletedCount = () => {
    if (!progress) return 0;
    return Object.values(progress).filter(s => s === 'complete').length;
  };

  const completedCount = getCompletedCount();
  const totalTests = 12;
  const progressPercent = Math.round((completedCount / totalTests) * 100);

  return (
    <div className="w-full max-w-4xl">
      <div className="glass rounded-2xl shadow-xl p-6 border border-navy-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy-900">
              Evaluation in Progress
            </h2>
            <p className="text-xs text-navy-400 font-mono">{evaluationId}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Status info */}
          <div className="flex-1 space-y-4">
            {/* Timer and Progress */}
            <div className="flex items-center gap-6">
              <div className="bg-navy-900 rounded-xl px-5 py-3 shadow-lg">
                <div className="text-3xl font-mono font-bold text-gold-400 tabular-nums">
                  {elapsedMinutes > 0 ? `${elapsedMinutes}:${remainingSeconds.toString().padStart(2, '0')}` : `0:${remainingSeconds.toString().padStart(2, '0')}`}
                </div>
                <p className="text-xs text-navy-400 text-center mt-1">Elapsed</p>
              </div>
              {progress && (
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-navy-600 mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="font-mono">{completedCount}/{totalTests}</span>
                  </div>
                  <div className="w-full bg-navy-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-gold-400 to-gold-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-navy-500">
              Running comprehensive tests... typically takes 2-5 minutes.
            </p>
          </div>

          {/* Right side - Test status list */}
          <div className="w-full md:w-56 bg-navy-50 rounded-xl p-4">
            <h3 className="font-semibold text-navy-800 mb-3 text-xs uppercase tracking-wider">Test Status</h3>
            <div className="space-y-2">
              <StatusItem label="Pre-flight Check" status={progress?.preflight || 'pending'} />
              <StatusItem label="Repo Analysis" status={progress?.repoAnalysis || 'pending'} />
              <StatusItem label="Security" status={progress?.security || 'pending'} />
              <StatusItem label="Image Edge Cases" status={progress?.imageEdgeCases || 'pending'} />
              <StatusItem label="Form Validation" status={progress?.formInput || 'pending'} />
              <StatusItem label="Resilience" status={progress?.resilience || 'pending'} />
              <StatusItem label="Functional" status={progress?.functional || 'pending'} />
              <StatusItem label="UX Testing" status={progress?.uxTest || 'pending'} />
              <StatusItem label="AI Review" status={progress?.aiReview || 'pending'} />
              <StatusItem label="Deployment" status={progress?.deployment || 'pending'} />
              <StatusItem label="Report Gen" status={progress?.reportGeneration || 'pending'} />
              <StatusItem label="PDF Report" status={progress?.pdfGeneration || 'pending'} />
            </div>
          </div>
        </div>

        {/* Live activity log */}
        {detailedProgress && detailedProgress.length > 0 && (
          <div className="mt-6 border-t border-navy-200 pt-5">
            <h3 className="font-semibold text-navy-800 mb-3 text-xs uppercase tracking-wider">Live Activity</h3>
            <div className="bg-navy-900 rounded-xl p-4 max-h-40 overflow-y-auto font-mono text-xs shadow-inner">
              {detailedProgress.slice(0, 10).map((item, index) => (
                <div key={`${item.timestamp}-${index}`} className="flex items-start gap-2 py-1">
                  <span className={`flex-shrink-0 ${
                    item.stage === 'error' ? 'text-danger-400' :
                    item.stage === 'complete' ? 'text-success-500' :
                    'text-gold-400'
                  }`}>
                    {item.stage === 'error' ? '✗' : item.stage === 'complete' ? '✓' : '→'}
                  </span>
                  <span className="text-navy-400">[{item.testName}]</span>
                  <span className="text-navy-200">{item.message}</span>
                  {item.percentage !== undefined && (
                    <span className="text-navy-500 ml-auto">{item.percentage}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: 'pending' | 'running' | 'complete' | 'failed' | 'warning' }) {
  return (
    <div className="flex items-center space-x-2.5">
      {status === 'pending' && (
        <div className="w-4 h-4 rounded-full border-2 border-navy-300 flex-shrink-0" />
      )}
      {status === 'running' && (
        <div className="w-4 h-4 rounded-full border-2 border-gold-500 border-t-transparent animate-spin flex-shrink-0" />
      )}
      {status === 'complete' && (
        <div className="w-4 h-4 rounded-full bg-success-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {status === 'warning' && (
        <div className="w-4 h-4 rounded-full bg-warning-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
          </svg>
        </div>
      )}
      {status === 'failed' && (
        <div className="w-4 h-4 rounded-full bg-danger-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <span className={`text-xs ${
        status === 'pending' ? 'text-navy-400' :
        status === 'failed' ? 'text-danger-600' :
        status === 'warning' ? 'text-warning-600' :
        status === 'complete' ? 'text-success-600' :
        'text-navy-700 font-medium'
      }`}>
        {label}
      </span>
    </div>
  );
}
