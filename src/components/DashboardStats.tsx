'use client';

import { useMemo, memo } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';
import { StatCard, CostsSummary, ScoreDistribution, calculateStats } from './stats';
import { ChartBarIcon, DocumentIcon, PieChartFullIcon, BadgeCheckIcon, WarningIcon } from '@/components/ui';

interface DashboardStatsProps {
  evaluations: EvaluationSummary[];
  costAggregation?: CostAggregation;
  onOpenAnalytics?: () => void;
}

export const DashboardStats = memo(function DashboardStats({ evaluations, costAggregation, onOpenAnalytics }: DashboardStatsProps) {
  const stats = useMemo(() => calculateStats(evaluations), [evaluations]);

  return (
    <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600">
            <ChartBarIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Statistics</h3>
        </div>
        {onOpenAnalytics && evaluations.length > 0 && (
          <button
            onClick={onOpenAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
          >
            <ChartBarIcon className="w-3.5 h-3.5" />
            View Analytics
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Evaluations"
          value={stats.total.toString()}
          icon={<DocumentIcon className="w-4 h-4" />}
          color="navy"
        />
        <StatCard
          label="Average Score"
          value={`${stats.avgScore}/90`}
          icon={<PieChartFullIcon className="w-4 h-4" />}
          color="gold"
        />
        <StatCard
          label="Excellent"
          value={stats.excellent.toString()}
          subtext={`${Math.round((stats.excellent / Math.max(stats.total, 1)) * 100)}%`}
          icon={<BadgeCheckIcon className="w-4 h-4" />}
          color="success"
        />
        <StatCard
          label="Critical Issues"
          value={stats.withCritical.toString()}
          subtext={`${Math.round((stats.withCritical / Math.max(stats.total, 1)) * 100)}%`}
          icon={<WarningIcon className="w-4 h-4" />}
          color="danger"
        />
      </div>

      {/* LLM Costs */}
      {costAggregation && costAggregation.allTime > 0 && (
        <CostsSummary costAggregation={costAggregation} />
      )}

      {/* Score Distribution */}
      <ScoreDistribution
        excellent={stats.excellent}
        proficient={stats.proficient}
        needsWork={stats.needsWork}
        total={stats.total}
      />
    </div>
  );
});
