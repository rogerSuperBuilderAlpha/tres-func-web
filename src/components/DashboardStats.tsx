'use client';

import { useMemo } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';
import { StatCard } from './stats/StatCard';
import { calculateStats } from './stats/utils';
import { ChartBarIcon, DocumentIcon, PieChartFullIcon, BadgeCheckIcon, WarningIcon, BoltIcon } from '@/components/ui';

interface DashboardStatsProps {
  evaluations: EvaluationSummary[];
  costAggregation?: CostAggregation;
  onOpenAnalytics?: () => void;
}

export function DashboardStats({ evaluations, costAggregation, onOpenAnalytics }: DashboardStatsProps) {
  const stats = useMemo(() => calculateStats(evaluations), [evaluations]);

  return (
    <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-5">
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
        <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BoltIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide">LLM Costs</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-navy-50/50 dark:bg-navy-800/50 rounded-lg p-2 text-center">
              <p className="text-xs text-navy-400 dark:text-navy-500">Today</p>
              <p className="text-sm font-bold text-navy-900 dark:text-white">${costAggregation.today.toFixed(2)}</p>
            </div>
            <div className="bg-navy-50/50 dark:bg-navy-800/50 rounded-lg p-2 text-center">
              <p className="text-xs text-navy-400 dark:text-navy-500">This Week</p>
              <p className="text-sm font-bold text-navy-900 dark:text-white">${costAggregation.thisWeek.toFixed(2)}</p>
            </div>
            <div className="bg-navy-50/50 dark:bg-navy-800/50 rounded-lg p-2 text-center">
              <p className="text-xs text-navy-400 dark:text-navy-500">This Month</p>
              <p className="text-sm font-bold text-navy-900 dark:text-white">${costAggregation.thisMonth.toFixed(2)}</p>
            </div>
            <div className="bg-navy-50/50 dark:bg-navy-800/50 rounded-lg p-2 text-center">
              <p className="text-xs text-navy-400 dark:text-navy-500">All Time</p>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400">${costAggregation.allTime.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Score Distribution Bar */}
      <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700">
        <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide mb-2">Score Distribution</p>
        <div className="h-3 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden flex">
          {stats.total > 0 && (
            <>
              <div
                className="bg-success-500 h-full transition-all"
                style={{ width: `${(stats.excellent / stats.total) * 100}%` }}
                title={`Excellent: ${stats.excellent}`}
              />
              <div
                className="bg-gold-500 h-full transition-all"
                style={{ width: `${(stats.proficient / stats.total) * 100}%` }}
                title={`Proficient: ${stats.proficient}`}
              />
              <div
                className="bg-danger-500 h-full transition-all"
                style={{ width: `${(stats.needsWork / stats.total) * 100}%` }}
                title={`Needs Work: ${stats.needsWork}`}
              />
            </>
          )}
        </div>
        <div className="flex justify-between mt-1 text-xs text-navy-500 dark:text-navy-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success-500"></span>
            Excellent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gold-500"></span>
            Proficient
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-danger-500"></span>
            Needs Work
          </span>
        </div>
      </div>
    </div>
  );
}
