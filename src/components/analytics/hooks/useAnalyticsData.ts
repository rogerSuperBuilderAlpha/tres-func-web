'use client';

import { useState, useCallback, useEffect } from 'react';
import type { EvaluationSummary, CostAggregation } from '@/types';
import { API_BASE } from '@/lib/api';

export type DateRange = 'last7' | 'last30' | 'last90' | 'thisYear' | 'allTime' | 'custom';

interface UseAnalyticsDataOptions {
  isOpen: boolean;
  initialEvaluations: EvaluationSummary[];
  initialCostAggregation?: CostAggregation;
}

interface UseAnalyticsDataReturn {
  evaluations: EvaluationSummary[];
  costAggregation?: CostAggregation;
  loading: boolean;
  dataInfo: string;
  dateRange: DateRange;
  customFromDate: string;
  customToDate: string;
  setDateRange: (range: DateRange) => void;
  setCustomFromDate: (date: string) => void;
  setCustomToDate: (date: string) => void;
  fetchData: () => Promise<void>;
}

export function useAnalyticsData({
  isOpen,
  initialEvaluations,
  initialCostAggregation,
}: UseAnalyticsDataOptions): UseAnalyticsDataReturn {
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

  // Fetch data
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

  return {
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
  };
}
