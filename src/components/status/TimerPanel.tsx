'use client';

import type { StatusLevelStyles } from './types';

interface TimerPanelProps {
  statusStyles: StatusLevelStyles;
  elapsedMinutes: number;
  remainingSeconds: number;
  completedCount: number;
  totalTests: number;
  progressPercent: number;
  currentTestName: string;
  isStuck: boolean;
  stuckSeconds: number;
  repoUrl?: string;
  deployedUrl?: string;
}

export function TimerPanel({
  statusStyles,
  elapsedMinutes,
  remainingSeconds,
  completedCount,
  totalTests,
  progressPercent,
  currentTestName,
  isStuck,
  stuckSeconds,
  repoUrl,
  deployedUrl,
}: TimerPanelProps) {
  return (
    <div className="lg:col-span-3 p-5">
      <div className="flex flex-col items-center text-center">
        {/* Spinning indicator */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${statusStyles.bg}`}>
          <svg
            className={`animate-spin h-8 w-8 ${statusStyles.text}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        {/* Timer */}
        <div className={`text-4xl font-mono font-bold mb-1 ${statusStyles.timerText}`}>
          {elapsedMinutes}:{remainingSeconds.toString().padStart(2, '0')}
        </div>
        <p className="text-xs text-navy-500 dark:text-navy-400 mb-4">Elapsed</p>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-navy-600 dark:text-navy-400 mb-1">
            <span>Progress</span>
            <span className="font-mono">
              {completedCount}/{totalTests}
            </span>
          </div>
          <div className="w-full bg-navy-200 dark:bg-navy-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${statusStyles.progressBar}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current task */}
        <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700 w-full">
          <p className="text-[10px] uppercase tracking-wide text-navy-400 dark:text-navy-500 mb-1">Currently Running</p>
          <p className={`text-sm font-medium ${isStuck ? 'text-warning-600 dark:text-warning-400' : 'text-navy-700 dark:text-navy-200'}`}>
            {currentTestName}
          </p>
          {isStuck && (
            <p className="text-[10px] text-warning-500 mt-1">
              Slow response ({Math.floor(stuckSeconds / 60)}m {stuckSeconds % 60}s)
            </p>
          )}
        </div>

        {/* Links for manual testing */}
        {(repoUrl || deployedUrl) && (
          <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700 w-full">
            <p className="text-[10px] uppercase tracking-wide text-navy-400 dark:text-navy-500 mb-2">Quick Links</p>
            <div className="space-y-2">
              {repoUrl && (
                <a
                  href={repoUrl.startsWith('http') ? repoUrl : `https://github.com/${repoUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="truncate">View Repository</span>
                </a>
              )}
              {deployedUrl && (
                <a
                  href={deployedUrl.startsWith('http') ? deployedUrl : `https://${deployedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span className="truncate">Open Live App</span>
                </a>
              )}
            </div>

            {/* Encouragement message */}
            <div className="mt-3 p-2 bg-gold-50 dark:bg-gold-900/20 rounded-lg border border-gold-200 dark:border-gold-800/50">
              <p className="text-[10px] text-gold-700 dark:text-gold-300 leading-relaxed">
                💡 <strong>Pro tip:</strong> While waiting, try the app yourself! Manual testing helps you assess UX and edge cases the AI might miss.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



