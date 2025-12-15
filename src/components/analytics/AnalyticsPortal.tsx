'use client';

import { useMemo, useState, useEffect, useCallback, memo } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';
import { API_BASE } from '@/lib/api';

type DateRange = 'last7' | 'last30' | 'last90' | 'thisYear' | 'allTime' | 'custom';

interface AnalyticsPortalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluations: EvaluationSummary[];
  costAggregation?: CostAggregation;
}

interface CategoryStats {
  name: string;
  avgScore: number;
  maxScore: number;
  color: string;
}

interface TrendData {
  date: string;
  count: number;
  avgScore: number;
}

interface IssueAnalysis {
  issue: string;
  count: number;
  percentage: number;
}

export function AnalyticsPortal({ isOpen, onClose, evaluations: initialEvaluations, costAggregation: initialCostAggregation }: AnalyticsPortalProps) {
  const [dateRange, setDateRange] = useState<DateRange>('last30');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>(initialEvaluations);
  const [costAggregation, setCostAggregation] = useState<CostAggregation | undefined>(initialCostAggregation);
  const [loading, setLoading] = useState(false);
  const [dataInfo, setDataInfo] = useState<string>('');

  // Calculate date range bounds
  const getDateBounds = useCallback((range: DateRange): { fromDate?: string; toDate?: string; all?: boolean } => {
    const now = new Date();
    const toDate = now.toISOString();
    
    switch (range) {
      case 'last7': {
        const from = new Date(now);
        from.setDate(from.getDate() - 7);
        return { fromDate: from.toISOString(), toDate };
      }
      case 'last30': {
        const from = new Date(now);
        from.setDate(from.getDate() - 30);
        return { fromDate: from.toISOString(), toDate };
      }
      case 'last90': {
        const from = new Date(now);
        from.setDate(from.getDate() - 90);
        return { fromDate: from.toISOString(), toDate };
      }
      case 'thisYear': {
        const from = new Date(now.getFullYear(), 0, 1);
        return { fromDate: from.toISOString(), toDate };
      }
      case 'allTime':
        return { all: true };
      case 'custom':
        return {
          fromDate: customFromDate ? new Date(customFromDate).toISOString() : undefined,
          toDate: customToDate ? new Date(customToDate + 'T23:59:59').toISOString() : undefined,
        };
      default:
        return {};
    }
  }, [customFromDate, customToDate]);

  // Fetch data when date range changes
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const bounds = getDateBounds(dateRange);
      const params = new URLSearchParams();
      
      if (bounds.all) {
        params.set('all', 'true');
      } else {
        params.set('limit', '500');
      }
      if (bounds.fromDate) params.set('fromDate', bounds.fromDate);
      if (bounds.toDate) params.set('toDate', bounds.toDate);

      const response = await fetch(`${API_BASE}/evaluations?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setEvaluations(data.evaluations || []);
      setCostAggregation(data.costAggregation);
      setDataInfo(`${data.evaluations?.length || 0} evaluations loaded`);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setDataInfo('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, getDateBounds]);

  // Fetch on open and when date range changes
  useEffect(() => {
    if (isOpen && dateRange !== 'last30') {
      fetchData();
    } else if (isOpen) {
      // Use initial data for last30 (default)
      setEvaluations(initialEvaluations);
      setCostAggregation(initialCostAggregation);
      setDataInfo(`${initialEvaluations.length} evaluations loaded`);
    }
  }, [isOpen, dateRange, fetchData, initialEvaluations, initialCostAggregation]);

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] m-4 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-navy-100 dark:border-navy-700 bg-gradient-to-r from-navy-50 to-white dark:from-navy-800 dark:to-navy-900">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900 dark:text-white">Analytics Dashboard</h2>
                <p className="text-sm text-navy-500 dark:text-navy-400">
                  {loading ? 'Loading...' : dataInfo || 'Comprehensive evaluation insights'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="px-6 pb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-navy-600 dark:text-navy-400">Time Range:</span>
            <div className="flex flex-wrap gap-1">
              {[
                { value: 'last7', label: '7 Days' },
                { value: 'last30', label: '30 Days' },
                { value: 'last90', label: '90 Days' },
                { value: 'thisYear', label: 'This Year' },
                { value: 'allTime', label: 'All Time' },
                { value: 'custom', label: 'Custom' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value as DateRange)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    dateRange === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs */}
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white"
                />
                <span className="text-navy-400">to</span>
                <input
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white"
                />
                <button
                  onClick={fetchData}
                  disabled={loading || (!customFromDate && !customToDate)}
                  className="px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Apply
                </button>
              </div>
            )}

            {loading && (
              <div className="ml-2">
                <svg className="animate-spin h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!analytics ? (
            <div className="flex flex-col items-center justify-center py-16 text-navy-400">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">No data yet</p>
              <p className="text-sm">Run some evaluations to see analytics</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overview Cards */}
              <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                <MetricCard label="Total Evaluations" value={analytics.total.toString()} color="navy" />
                <MetricCard label="Unique Repos" value={analytics.uniqueRepos.toString()} color="purple" />
                <MetricCard label="Average Score" value={`${analytics.avgScore}/90`} color="gold" />
                <MetricCard label="Highest Score" value={`${analytics.maxScore}/90`} color="success" />
                <MetricCard label="Lowest Score" value={`${analytics.minScore}/90`} color="danger" />
                <MetricCard label="Avg Cost/Eval" value={`$${analytics.avgCostPerEval.toFixed(2)}`} color="purple" />
              </div>

              {/* Score Distribution */}
              <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Score Distribution
                </h3>
                <div className="space-y-3">
                  <DistributionBar 
                    label="Excellent (75+)" 
                    count={analytics.excellent} 
                    total={analytics.total} 
                    color="bg-success-500" 
                  />
                  <DistributionBar 
                    label="Proficient (54-74)" 
                    count={analytics.proficient} 
                    total={analytics.total} 
                    color="bg-gold-500" 
                  />
                  <DistributionBar 
                    label="Needs Work (<54)" 
                    count={analytics.needsWork} 
                    total={analytics.total} 
                    color="bg-danger-500" 
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-navy-200 dark:border-navy-700">
                  <p className="text-xs text-navy-500 dark:text-navy-400 mb-2">Percentiles</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-navy-900 dark:text-white">{analytics.p25}</p>
                      <p className="text-xs text-navy-400">25th</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gold-600 dark:text-gold-400">{analytics.p50}</p>
                      <p className="text-xs text-navy-400">Median</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-navy-900 dark:text-white">{analytics.p75}</p>
                      <p className="text-xs text-navy-400">75th</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Issues */}
              <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Critical Issues
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-navy-600 dark:text-navy-300">Evals with Issues</span>
                    <span className="font-bold text-danger-600 dark:text-danger-400">
                      {analytics.withCritical} ({Math.round((analytics.withCritical / analytics.total) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-navy-600 dark:text-navy-300">Avg Issues/Eval</span>
                    <span className="font-bold text-navy-900 dark:text-white">{analytics.avgCriticalIssues}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-navy-200 dark:border-navy-700">
                  <p className="text-xs text-navy-500 dark:text-navy-400 mb-2">Top Concerns</p>
                  <div className="space-y-2">
                    {analytics.topConcerns.slice(0, 3).map((concern, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400 flex items-center justify-center text-xs font-bold">
                          {concern.count}
                        </span>
                        <span className="text-navy-600 dark:text-navy-300 truncate">{concern.issue}...</span>
                      </div>
                    ))}
                    {analytics.topConcerns.length === 0 && (
                      <p className="text-sm text-navy-400">No concerns recorded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  LLM Costs
                </h3>
                {costAggregation ? (
                  <div className="space-y-3">
                    <CostRow label="Today" value={costAggregation.today} />
                    <CostRow label="This Week" value={costAggregation.thisWeek} />
                    <CostRow label="This Month" value={costAggregation.thisMonth} />
                    <CostRow label="Last 3 Months" value={costAggregation.last3Months} highlight />
                    <div className="pt-3 mt-3 border-t border-navy-200 dark:border-navy-700">
                      <CostRow label="All Time Total" value={costAggregation.allTime} bold />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-navy-400">No cost data available</p>
                )}
              </div>

              {/* 7-Day Trend */}
              <div className="lg:col-span-2 bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  7-Day Activity
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {analytics.trends.map((day, i) => (
                    <div key={i} className="text-center">
                      <div className="h-24 bg-navy-100 dark:bg-navy-700 rounded-lg relative mb-2 overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gold-500 to-gold-400 transition-all"
                          style={{ height: `${Math.min((day.count / Math.max(...analytics.trends.map(t => t.count), 1)) * 100, 100)}%` }}
                        />
                        {day.count > 0 && (
                          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-navy-900/50 rounded px-1">
                            {day.count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-navy-500 dark:text-navy-400 truncate">{day.date.split(' ')[0]}</p>
                      {day.count > 0 && (
                        <p className="text-xs font-medium text-navy-700 dark:text-navy-300">{day.avgScore}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Strengths */}
              <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Common Strengths
                </h3>
                <div className="space-y-2">
                  {analytics.topStrengths.map((strength, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 flex items-center justify-center text-xs font-bold">
                        {strength.count}
                      </span>
                      <span className="text-navy-600 dark:text-navy-300 truncate flex-1">{strength.issue}...</span>
                      <span className="text-xs text-navy-400">{strength.percentage}%</span>
                    </div>
                  ))}
                  {analytics.topStrengths.length === 0 && (
                    <p className="text-sm text-navy-400">No strengths recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
const COLOR_CLASSES: Record<string, string> = {
  navy: 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300',
  gold: 'bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400',
  success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
  danger: 'bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

const MetricCard = memo(function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${COLOR_CLASSES[color] || COLOR_CLASSES.navy}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
});

const DistributionBar = memo(function DistributionBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-navy-600 dark:text-navy-300">{label}</span>
        <span className="font-medium text-navy-900 dark:text-white">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-navy-200 dark:bg-navy-600 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
});

const CostRow = memo(function CostRow({ label, value, highlight, bold }: { label: string; value: number; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-medium text-navy-900 dark:text-white' : 'text-navy-600 dark:text-navy-300'}`}>
        {label}
      </span>
      <span className={`font-bold ${highlight ? 'text-purple-600 dark:text-purple-400' : bold ? 'text-lg text-navy-900 dark:text-white' : 'text-navy-900 dark:text-white'}`}>
        ${value.toFixed(2)}
      </span>
    </div>
  );
});


