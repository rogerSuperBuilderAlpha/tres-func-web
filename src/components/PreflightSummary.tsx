'use client';

import { Badge } from '@/components/ui';

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

export function PreflightSummary({ repoValid, siteValid, isReady }: PreflightSummaryProps) {
  const checksPass = repoValid && siteValid;

  return (
    <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
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
            <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <div className="w-4 h-4 border-2 border-navy-500 rounded-full"></div>
          )}
          <span className="text-sm">Repository</span>
        </div>
        <div className={`flex items-center gap-2 p-2 rounded-lg ${siteValid ? 'bg-success-600/20' : 'bg-navy-700/50'}`}>
          {siteValid ? (
            <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
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
        <span className="font-mono font-semibold text-gold-400">~6-8 minutes</span>
      </div>
    </div>
  );
}


