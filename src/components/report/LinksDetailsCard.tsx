'use client';

import { memo, useMemo } from 'react';
import type { EvaluationReportData } from '@/types';
import { formatDeployedDisplayUrl, formatRepoDisplayUrl } from './utils';
import { LinkIcon } from '@/components/ui';

interface LinksDetailsCardProps {
  report: EvaluationReportData;
}

export const LinksDetailsCard = memo(function LinksDetailsCard({ report }: LinksDetailsCardProps) {
  const evaluatedAtDisplay = useMemo(
    () => (report.evaluatedAt ? new Date(report.evaluatedAt).toLocaleString() : 'Unknown'),
    [report.evaluatedAt]
  );

  return (
    <div className="bg-white rounded-xl border border-navy-200 p-5 mb-6 shadow-sm">
      <h3 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center">
          <LinkIcon className="w-3.5 h-3.5 text-navy-600" />
        </span>
        Links & Details
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-navy-400 mb-1">Repository</p>
          <a
            href={report.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-navy-700 hover:text-gold-600 font-medium truncate block"
          >
            {formatRepoDisplayUrl(report.repoUrl)}
          </a>
        </div>

        <div>
          <p className="text-xs text-navy-400 mb-1">Deployed App</p>
          <a
            href={report.deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-navy-700 hover:text-gold-600 font-medium truncate block"
          >
            {formatDeployedDisplayUrl(report.deployedUrl)}
          </a>
        </div>

        <div>
          <p className="text-xs text-navy-400 mb-1">Evaluated</p>
          <p className="text-sm text-navy-700 font-medium">{evaluatedAtDisplay}</p>
        </div>

        {report.llmCosts && report.llmCosts.totalCostUsd > 0 && (
          <div className="pt-3 border-t border-navy-100 mt-3">
            <p className="text-xs text-navy-400 mb-1">LLM Evaluation Cost</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-navy-700 font-medium">${report.llmCosts.totalCostUsd.toFixed(4)}</span>
              <span className="text-xs text-navy-400">
                ({(report.llmCosts.totalTokens || 0).toLocaleString()} tokens)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});


