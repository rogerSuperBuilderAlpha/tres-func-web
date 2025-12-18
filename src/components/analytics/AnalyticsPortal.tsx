'use client';

import type { EvaluationSummary, CostAggregation } from '@/types';
import { 
  Modal, 
  Spinner,
  ChartBarIcon, 
  PieChartIcon, 
  WarningIcon, 
  CurrencyDollarIcon, 
  TrendingUpIcon, 
  BadgeCheckIcon 
} from '@/components/ui';
import { MetricCard, DistributionBar, CostRow } from './components';
import { useAnalyticsData, useAnalyticsCalculations, type DateRange } from './hooks';

interface AnalyticsPortalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluations: EvaluationSummary[];
  costAggregation?: CostAggregation;
}

const DATE_RANGE_OPTIONS: Array<{ value: DateRange; label: string }> = [
  { value: 'last7', label: '7 Days' },
  { value: 'last30', label: '30 Days' },
  { value: 'last90', label: '90 Days' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'allTime', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
];

export function AnalyticsPortal({ isOpen, onClose, evaluations: initialEvaluations, costAggregation: initialCostAggregation }: AnalyticsPortalProps) {
  const {
    evaluations,
    costAggregation,
    loading,
    dataInfo,
    dateRange,
    customFromDate,
    customToDate,
    setDateRange,
    setCustomFromDate,
    setCustomToDate,
    fetchData,
  } = useAnalyticsData({
    isOpen,
    initialEvaluations,
    initialCostAggregation,
  });

  const analytics = useAnalyticsCalculations({ evaluations, costAggregation });

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Analytics Dashboard"
      subtitle={loading ? 'Loading...' : dataInfo || 'Comprehensive evaluation insights'}
      icon={<ChartBarIcon className="w-5 h-5 text-white" />}
      size="xl"
    >
      {/* Date Range Header */}
      <div className="mb-6 pb-4 border-b border-navy-100 dark:border-navy-700">
        <DateRangeSelector
          dateRange={dateRange}
          customFromDate={customFromDate}
          customToDate={customToDate}
          loading={loading}
          onDateRangeChange={setDateRange}
          onCustomFromDateChange={setCustomFromDate}
          onCustomToDateChange={setCustomToDate}
          onApplyCustom={fetchData}
        />
      </div>

      {/* Content */}
      {!analytics ? (
        <EmptyState />
      ) : (
        <AnalyticsContent analytics={analytics} costAggregation={costAggregation} />
      )}
    </Modal>
  );
}

// Date Range Selector Component
function DateRangeSelector({
  dateRange,
  customFromDate,
  customToDate,
  loading,
  onDateRangeChange,
  onCustomFromDateChange,
  onCustomToDateChange,
  onApplyCustom,
}: {
  dateRange: DateRange;
  customFromDate: string;
  customToDate: string;
  loading: boolean;
  onDateRangeChange: (range: DateRange) => void;
  onCustomFromDateChange: (date: string) => void;
  onCustomToDateChange: (date: string) => void;
  onApplyCustom: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-navy-600 dark:text-navy-400">Time Range:</span>
      <div className="flex flex-wrap gap-1">
        {DATE_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onDateRangeChange(option.value)}
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

      {dateRange === 'custom' && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={customFromDate}
            onChange={(e) => onCustomFromDateChange(e.target.value)}
            className="px-2 py-1 text-xs rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white"
          />
          <span className="text-navy-400">to</span>
          <input
            type="date"
            value={customToDate}
            onChange={(e) => onCustomToDateChange(e.target.value)}
            className="px-2 py-1 text-xs rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white"
          />
          <button
            onClick={onApplyCustom}
            disabled={loading || (!customFromDate && !customToDate)}
            className="px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Apply
          </button>
        </div>
      )}

      {loading && <Spinner size="sm" className="ml-2 text-purple-600" />}
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-navy-400">
      <ChartBarIcon className="w-16 h-16 mb-4" />
      <p className="text-lg font-medium">No data yet</p>
      <p className="text-sm">Run some evaluations to see analytics</p>
    </div>
  );
}

// Main Analytics Content Component
function AnalyticsContent({ 
  analytics, 
  costAggregation 
}: { 
  analytics: NonNullable<ReturnType<typeof useAnalyticsCalculations>>; 
  costAggregation?: CostAggregation;
}) {
  return (
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
      <ScoreDistributionCard analytics={analytics} />

      {/* Critical Issues */}
      <CriticalIssuesCard analytics={analytics} />

      {/* Cost Analysis */}
      <CostAnalysisCard costAggregation={costAggregation} />

      {/* 7-Day Trend */}
      <TrendChart analytics={analytics} />

      {/* Top Strengths */}
      <TopStrengthsCard analytics={analytics} />
    </div>
  );
}

// Score Distribution Card
function ScoreDistributionCard({ analytics }: { analytics: NonNullable<ReturnType<typeof useAnalyticsCalculations>> }) {
  return (
    <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
      <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
        <PieChartIcon className="w-5 h-5 text-gold-500" />
        Score Distribution
      </h3>
      <div className="space-y-3">
        <DistributionBar label="Excellent (75+)" count={analytics.excellent} total={analytics.total} color="bg-success-500" />
        <DistributionBar label="Proficient (54-74)" count={analytics.proficient} total={analytics.total} color="bg-gold-500" />
        <DistributionBar label="Needs Work (<54)" count={analytics.needsWork} total={analytics.total} color="bg-danger-500" />
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
  );
}

// Critical Issues Card
function CriticalIssuesCard({ analytics }: { analytics: NonNullable<ReturnType<typeof useAnalyticsCalculations>> }) {
  return (
    <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
      <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
        <WarningIcon className="w-5 h-5 text-danger-500" />
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
  );
}

// Cost Analysis Card
function CostAnalysisCard({ costAggregation }: { costAggregation?: CostAggregation }) {
  return (
    <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
      <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
        <CurrencyDollarIcon className="w-5 h-5 text-purple-500" />
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
  );
}

// Trend Chart Component
function TrendChart({ analytics }: { analytics: NonNullable<ReturnType<typeof useAnalyticsCalculations>> }) {
  const maxCount = Math.max(...analytics.trends.map(t => t.count), 1);

  return (
    <div className="lg:col-span-2 bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
      <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUpIcon className="w-5 h-5 text-navy-500" />
        7-Day Activity
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {analytics.trends.map((day, i) => (
          <div key={i} className="text-center">
            <div className="h-24 bg-navy-100 dark:bg-navy-700 rounded-lg relative mb-2 overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gold-500 to-gold-400 transition-all"
                style={{ height: `${Math.min((day.count / maxCount) * 100, 100)}%` }}
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
  );
}

// Top Strengths Card
function TopStrengthsCard({ analytics }: { analytics: NonNullable<ReturnType<typeof useAnalyticsCalculations>> }) {
  return (
    <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-5">
      <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
        <BadgeCheckIcon className="w-5 h-5 text-success-500" />
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
  );
}

