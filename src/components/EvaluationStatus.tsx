'use client';

interface EvaluationStatusProps {
  evaluationId: string;
  pollAttempts?: number;
}

export function EvaluationStatus({ evaluationId, pollAttempts = 0 }: EvaluationStatusProps) {
  const elapsedSeconds = pollAttempts * 5;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

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
        <p className="font-mono text-gray-800">{evaluationId}</p>
      </div>

      {pollAttempts > 0 && (
        <div className="mb-6 text-sm text-gray-500">
          Elapsed time: {elapsedMinutes > 0 ? `${elapsedMinutes}m ` : ''}{remainingSeconds}s
        </div>
      )}

      <div className="space-y-3 text-left max-w-sm mx-auto">
        <StatusItem label="Repository Analysis" status={pollAttempts >= 1 ? 'running' : 'pending'} />
        <StatusItem label="Security Testing" status={pollAttempts >= 2 ? 'running' : 'pending'} />
        <StatusItem label="Image Edge Cases" status={pollAttempts >= 3 ? 'running' : 'pending'} />
        <StatusItem label="Form Validation" status={pollAttempts >= 4 ? 'running' : 'pending'} />
        <StatusItem label="Resilience Testing" status={pollAttempts >= 5 ? 'running' : 'pending'} />
        <StatusItem label="Functional Verification" status={pollAttempts >= 6 ? 'running' : 'pending'} />
        <StatusItem label="Report Generation" status={pollAttempts >= 7 ? 'running' : 'pending'} />
      </div>

      <p className="mt-6 text-sm text-gray-500">
        This typically takes 2-5 minutes. Please wait...
      </p>

      <div className="mt-4 text-xs text-gray-400">
        Status check #{pollAttempts} of 60
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: 'pending' | 'running' | 'complete' }) {
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
      <span className={`text-sm ${status === 'pending' ? 'text-gray-400' : 'text-gray-700'}`}>
        {label}
      </span>
    </div>
  );
}
