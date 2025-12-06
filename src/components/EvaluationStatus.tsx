'use client';

import { useState, useEffect } from 'react';

export interface TestProgress {
  repoAnalysis: 'pending' | 'running' | 'complete' | 'failed';
  security: 'pending' | 'running' | 'complete' | 'failed';
  imageEdgeCases: 'pending' | 'running' | 'complete' | 'failed';
  formInput: 'pending' | 'running' | 'complete' | 'failed';
  resilience: 'pending' | 'running' | 'complete' | 'failed';
  functional: 'pending' | 'running' | 'complete' | 'failed';
  uxTest: 'pending' | 'running' | 'complete' | 'failed';
  aiReview: 'pending' | 'running' | 'complete' | 'failed';
  deployment: 'pending' | 'running' | 'complete' | 'failed';
  reportGeneration: 'pending' | 'running' | 'complete' | 'failed';
}

export interface DetailedProgress {
  testName: string;
  stage: string;
  message: string;
  details?: string;
  percentage?: number;
  timestamp: number;
}

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
  const totalTests = 10;
  const progressPercent = Math.round((completedCount / totalTests) * 100);

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Evaluation in Progress
        </h2>

        <div className="flex gap-4">
          {/* Left side - Status info */}
          <div className="flex-1 space-y-4">
            {/* Header with spinner */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Running comprehensive tests...</p>
                <p className="text-xs text-gray-400 font-mono">{evaluationId}</p>
              </div>
            </div>

            {/* Timer and Progress */}
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-mono font-bold text-gray-800">
                  {elapsedMinutes > 0 ? `${elapsedMinutes}:${remainingSeconds.toString().padStart(2, '0')}` : `0:${remainingSeconds.toString().padStart(2, '0')}`}
                </div>
                <p className="text-xs text-gray-500">Elapsed</p>
              </div>
              {progress && (
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{completedCount}/{totalTests}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Typically takes 2-5 minutes...
            </p>
          </div>

          {/* Right side - Test status list */}
          <div className="w-56 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2 text-xs uppercase tracking-wide">Test Status</h3>
            <div className="space-y-1.5">
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
            </div>
          </div>
        </div>

        {/* Live activity log */}
        {detailedProgress && detailedProgress.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium text-gray-800 mb-2 text-xs uppercase tracking-wide">Live Activity</h3>
            <div className="bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto font-mono text-xs">
              {detailedProgress.slice(0, 10).map((item, index) => (
                <div key={`${item.timestamp}-${index}`} className="flex items-start gap-2 py-0.5">
                  <span className={`flex-shrink-0 ${
                    item.stage === 'error' ? 'text-red-400' :
                    item.stage === 'complete' ? 'text-green-400' :
                    'text-blue-400'
                  }`}>
                    {item.stage === 'error' ? '✗' : item.stage === 'complete' ? '✓' : '→'}
                  </span>
                  <span className="text-gray-400">[{item.testName}]</span>
                  <span className="text-gray-200">{item.message}</span>
                  {item.percentage !== undefined && (
                    <span className="text-gray-500 ml-auto">{item.percentage}%</span>
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

function StatusItem({ label, status }: { label: string; status: 'pending' | 'running' | 'complete' | 'failed' }) {
  return (
    <div className="flex items-center space-x-2">
      {status === 'pending' && (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
      )}
      {status === 'running' && (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      )}
      {status === 'complete' && (
        <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {status === 'failed' && (
        <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <span className={`text-xs ${
        status === 'pending' ? 'text-gray-400' :
        status === 'failed' ? 'text-red-600' :
        status === 'complete' ? 'text-green-600' :
        'text-gray-700'
      }`}>
        {label}
      </span>
    </div>
  );
}
