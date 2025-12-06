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
  reportGeneration: 'pending' | 'running' | 'complete' | 'failed';
}

interface EvaluationStatusProps {
  evaluationId: string;
  progress?: TestProgress;
  startTime?: string;
}

export function EvaluationStatus({ evaluationId, progress, startTime }: EvaluationStatusProps) {
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
  const totalTests = 9;
  const progressPercent = Math.round((completedCount / totalTests) * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Evaluation in Progress
        </h2>
        <p className="text-gray-600">
          Running comprehensive tests on the submission...
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500 mb-1">Evaluation ID</p>
        <p className="font-mono text-gray-800 text-sm">{evaluationId}</p>
      </div>

      {/* Timer */}
      <div className="mb-6">
        <div className="text-3xl font-mono font-bold text-gray-800">
          {elapsedMinutes > 0 ? `${elapsedMinutes}:${remainingSeconds.toString().padStart(2, '0')}` : `0:${remainingSeconds.toString().padStart(2, '0')}`}
        </div>
        <p className="text-sm text-gray-500 mt-1">Elapsed time</p>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{completedCount}/{totalTests} tests complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 text-left max-w-sm mx-auto">
        <StatusItem
          label="Repository Analysis"
          status={progress?.repoAnalysis || 'pending'}
        />
        <StatusItem
          label="Security Testing"
          status={progress?.security || 'pending'}
        />
        <StatusItem
          label="Image Edge Cases"
          status={progress?.imageEdgeCases || 'pending'}
        />
        <StatusItem
          label="Form Validation"
          status={progress?.formInput || 'pending'}
        />
        <StatusItem
          label="Resilience Testing"
          status={progress?.resilience || 'pending'}
        />
        <StatusItem
          label="Functional Verification"
          status={progress?.functional || 'pending'}
        />
        <StatusItem
          label="UX Testing"
          status={progress?.uxTest || 'pending'}
        />
        <StatusItem
          label="AI Code Review"
          status={progress?.aiReview || 'pending'}
        />
        <StatusItem
          label="Report Generation"
          status={progress?.reportGeneration || 'pending'}
        />
      </div>

      <p className="mt-6 text-sm text-gray-500">
        This typically takes 2-5 minutes. Please wait...
      </p>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: 'pending' | 'running' | 'complete' | 'failed' }) {
  return (
    <div className="flex items-center space-x-3">
      {status === 'pending' && (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      )}
      {status === 'running' && (
        <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      )}
      {status === 'complete' && (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {status === 'failed' && (
        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <span className={`text-sm ${
        status === 'pending' ? 'text-gray-400' :
        status === 'failed' ? 'text-red-600' :
        status === 'complete' ? 'text-green-600' :
        'text-gray-700'
      }`}>
        {label}
        {status === 'complete' && ' ✓'}
        {status === 'failed' && ' ✗'}
      </span>
    </div>
  );
}
