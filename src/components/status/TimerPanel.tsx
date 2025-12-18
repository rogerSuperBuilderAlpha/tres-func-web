'use client';

import { memo } from 'react';
import type { StatusLevelStyles } from './types';
import { SpinnerIcon, GitHubIcon, GlobeIcon } from '@/components/ui';

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

export const TimerPanel = memo(function TimerPanel({
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
          <SpinnerIcon className={`animate-spin h-8 w-8 ${statusStyles.text}`} />
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
                  <GitHubIcon className="w-3.5 h-3.5 flex-shrink-0" />
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
                  <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0" />
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
});

