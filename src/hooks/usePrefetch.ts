import { useCallback, useRef } from 'react';
import { API_BASE } from '@/lib/api';

// Simple in-memory cache for prefetched data
const prefetchCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Hook for prefetching evaluation data on hover
 * Returns a function to call on mouseEnter that prefetches the evaluation status
 */
export function usePrefetch() {
  const pendingRef = useRef<Set<string>>(new Set());

  const prefetchEvaluation = useCallback((evaluationId: string) => {
    // Skip if already prefetching or cached
    if (pendingRef.current.has(evaluationId)) return;
    
    const cached = prefetchCache.get(evaluationId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return;

    // Mark as pending
    pendingRef.current.add(evaluationId);

    // Prefetch with low priority
    fetch(`${API_BASE}/status/${evaluationId}`, {
      priority: 'low',
    } as RequestInit)
      .then(res => res.json())
      .then(data => {
        prefetchCache.set(evaluationId, { data, timestamp: Date.now() });
      })
      .catch(() => {
        // Silently ignore prefetch errors
      })
      .finally(() => {
        pendingRef.current.delete(evaluationId);
      });
  }, []);

  return { prefetchEvaluation };
}

/**
 * Get cached prefetch data if available
 */
export function getPrefetchedData(evaluationId: string): unknown | null {
  const cached = prefetchCache.get(evaluationId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
