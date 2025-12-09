'use client';

import { useState, useEffect } from 'react';
import type { EvaluationSummary } from '@/types';

interface DashboardStatsProps {
  evaluations: EvaluationSummary[];
}

export function DashboardStats({ evaluations }: DashboardStatsProps) {
  const stats = calculateStats(evaluations);

  return (
    <div className="glass dark:bg-navy-900/90 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Statistics</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Evaluations"
          value={stats.total.toString()}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="navy"
        />
        <StatCard
          label="Average Score"
          value={`${stats.avgScore}/90`}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
          color="gold"
        />
        <StatCard
          label="Excellent"
          value={stats.excellent.toString()}
          subtext={`${Math.round((stats.excellent / Math.max(stats.total, 1)) * 100)}%`}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          color="success"
        />
        <StatCard
          label="Critical Issues"
          value={stats.withCritical.toString()}
          subtext={`${Math.round((stats.withCritical / Math.max(stats.total, 1)) * 100)}%`}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="danger"
        />
      </div>

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

function StatCard({
  label,
  value,
  subtext,
  icon,
  color,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  color: 'navy' | 'gold' | 'success' | 'danger';
}) {
  const colorClasses = {
    navy: 'bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300',
    gold: 'bg-gold-100 dark:bg-gold-900/50 text-gold-600 dark:text-gold-400',
    success: 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    danger: 'bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400',
  };

  return (
    <div className="bg-navy-50/50 dark:bg-navy-800/50 rounded-xl p-3">
      <div className={`w-7 h-7 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-xs text-navy-500 dark:text-navy-400">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-lg font-bold text-navy-900 dark:text-white">{value}</p>
        {subtext && <span className="text-xs text-navy-400 dark:text-navy-500">{subtext}</span>}
      </div>
    </div>
  );
}

function calculateStats(evaluations: EvaluationSummary[]) {
  const total = evaluations.length;
  let totalScore = 0;
  let excellent = 0;
  let proficient = 0;
  let needsWork = 0;
  let withCritical = 0;

  for (const evaluation of evaluations) {
    const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;
    totalScore += score;

    if (score >= 75) excellent++;
    else if (score >= 54) proficient++;
    else needsWork++;

    if (evaluation.criticalFailuresCount > 0) withCritical++;
  }

  return {
    total,
    avgScore: total > 0 ? Math.round(totalScore / total) : 0,
    excellent,
    proficient,
    needsWork,
    withCritical,
  };
}

