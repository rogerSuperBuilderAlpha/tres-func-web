'use client';

import { memo } from 'react';
import { Badge, DocumentIcon, CheckCircleSolidIcon } from '@/components/ui';

interface PreflightSummaryProps {
  repoValid: boolean;
  siteValid: boolean;
  isReady: boolean;
}

const testSuites = [
  { name: 'Pre-flight Security', icon: '🔒', time: '~15s' },
  { name: 'Repository Analysis', icon: '📁', time: '~30s' },
  { name: 'Security Testing', icon: '🛡️', time: '~45s' },
  { name: 'Functional Testing', icon: '⚙️', time: '~60s' },
  { name: 'Image Edge Cases', icon: '🖼️', time: '~45s' },
  { name: 'Form Validation', icon: '📝', time: '~30s' },
  { name: 'Resilience Testing', icon: '💪', time: '~45s' },
  { name: 'UX & Accessibility', icon: '♿', time: '~50s' },
  { name: 'AI Code Review', icon: '🤖', time: '~60s' },
  { name: 'Report Generation', icon: '📊', time: '~90s' },
];

export const PreflightSummary = memo(function PreflightSummary({ repoValid, siteValid, isReady }: PreflightSummaryProps) {
  const checksPass = repoValid && siteValid;

  return (
    <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <DocumentIcon className="w-5 h-5 text-gold-400" />
          Pre-flight Summary
        </h3>
        <Badge variant={checksPass ? 'success' : 'warning'} size="sm">
          {checksPass ? 'Ready' : 'Waiting'}
        </Badge>
      </div>

      {/* Pre-checks */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className={`flex items-center gap-2 p-2 rounded-lg ${repoValid ? 'bg-success-600/20' : 'bg-navy-700/50'}`}>
          {repoValid ? (
            <CheckCircleSolidIcon className="w-4 h-4 text-success-400" />
          ) : (
            <div className="w-4 h-4 border-2 border-navy-500 rounded-full"></div>
          )}
          <span className="text-sm">Repository</span>
        </div>
        <div className={`flex items-center gap-2 p-2 rounded-lg ${siteValid ? 'bg-success-600/20' : 'bg-navy-700/50'}`}>
          {siteValid ? (
            <CheckCircleSolidIcon className="w-4 h-4 text-success-400" />
          ) : (
            <div className="w-4 h-4 border-2 border-navy-500 rounded-full"></div>
          )}
          <span className="text-sm">Deployed Site</span>
        </div>
      </div>

      {/* Test suites */}
      <div className="space-y-1">
        <p className="text-xs text-navy-300 uppercase tracking-wide mb-2">Test Suites (10 total)</p>
        <div className="grid grid-cols-2 gap-1">
          {testSuites.map((suite) => (
            <div
              key={suite.name}
              className="flex items-center gap-2 px-2 py-1.5 bg-navy-700/30 rounded text-xs"
            >
              <span>{suite.icon}</span>
              <span className="flex-1 truncate">{suite.name}</span>
              <span className="text-navy-400">{suite.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated time */}
      <div className="mt-4 pt-4 border-t border-navy-700 flex items-center justify-between">
        <span className="text-sm text-navy-300">Estimated total time</span>
        <span className="font-mono font-semibold text-gold-400">~8-12 minutes</span>
      </div>
    </div>
  );
});



