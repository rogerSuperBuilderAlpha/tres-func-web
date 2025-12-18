'use client';

import { useMemo } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';

interface IssueAnalysis {
  issue: string;
  count: number;
  percentage: number;
}

interface TrendData {
  date: string;
  count: number;
  avgScore: number;
}

export interface AnalyticsData {
  total: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
  excellent: number;
  proficient: number;
  needsWork: number;
  withCritical: number;
  avgCriticalIssues: string;
  topStrengths: IssueAnalysis[];
  topConcerns: IssueAnalysis[];
  trends: TrendData[];
  p25: number;
  p50: number;
  p75: number;
  uniqueRepos: number;
  avgCostPerEval: number;
}

interface UseAnalyticsCalculationsOptions {
  evaluations: EvaluationSummary[];
  costAggregation?: CostAggregation;
}

export function useAnalyticsCalculations({
  evaluations,
  costAggregation,
}: UseAnalyticsCalculationsOptions): AnalyticsData | null {
  return useMemo(() => {
    if (evaluations.length === 0) {
      return null;
    }

    // Basic stats
    const total = evaluations.length;
    const scores = evaluations.map(e => e.overallScore || e.rubricScore || 0);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // Tier distribution
    const excellent = evaluations.filter(e => (e.overallScore || 0) >= 75).length;
    const proficient = evaluations.filter(e => (e.overallScore || 0) >= 54 && (e.overallScore || 0) < 75).length;
    const needsWork = evaluations.filter(e => (e.overallScore || 0) < 54).length;

    // Critical issues analysis
    const withCritical = evaluations.filter(e => e.criticalFailuresCount > 0).length;
    const avgCriticalIssues = evaluations.reduce((sum, e) => sum + (e.criticalFailuresCount || 0), 0) / total;

    // Common strengths and concerns
    const allStrengths: Record<string, number> = {};
    const allConcerns: Record<string, number> = {};
    
    evaluations.forEach(e => {
      e.summary?.strengths?.forEach(s => {
        const key = s.slice(0, 50);
        allStrengths[key] = (allStrengths[key] || 0) + 1;
      });
      e.summary?.concerns?.forEach(c => {
        const key = c.slice(0, 50);
        allConcerns[key] = (allConcerns[key] || 0) + 1;
      });
    });

    const topStrengths = Object.entries(allStrengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count, percentage: Math.round((count / total) * 100) }));

    const topConcerns = Object.entries(allConcerns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count, percentage: Math.round((count / total) * 100) }));

    // Trend data (last 7 days)
    const now = new Date();
    const trends: TrendData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvals = evaluations.filter(e => e.evaluatedAt.startsWith(dateStr));
      trends.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        count: dayEvals.length,
        avgScore: dayEvals.length > 0 
          ? Math.round(dayEvals.reduce((sum, e) => sum + (e.overallScore || 0), 0) / dayEvals.length)
          : 0,
      });
    }

    // Score percentiles
    const sortedScores = [...scores].sort((a, b) => a - b);
    const p25 = sortedScores[Math.floor(sortedScores.length * 0.25)] || 0;
    const p50 = sortedScores[Math.floor(sortedScores.length * 0.5)] || 0;
    const p75 = sortedScores[Math.floor(sortedScores.length * 0.75)] || 0;

    // Unique repos
    const uniqueRepos = new Set(evaluations.map(e => e.repoUrl)).size;

    // LLM cost per evaluation
    const avgCostPerEval = costAggregation && total > 0 
      ? costAggregation.allTime / total 
      : 0;

    return {
      total,
      avgScore,
      maxScore,
      minScore,
      excellent,
      proficient,
      needsWork,
      withCritical,
      avgCriticalIssues: avgCriticalIssues.toFixed(1),
      topStrengths,
      topConcerns,
      trends,
      p25,
      p50,
      p75,
      uniqueRepos,
      avgCostPerEval,
    };
  }, [evaluations, costAggregation]);
}

