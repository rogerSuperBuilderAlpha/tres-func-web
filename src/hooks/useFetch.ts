import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '@/lib/api';

// Request deduplication - prevents duplicate concurrent requests
const inflightRequests = new Map<string, Promise<Response>>();

async function deduplicatedFetch(url: string, options?: RequestInit): Promise<Response> {
  const key = `${options?.method || 'GET'}:${url}`;
  
  // If there's already a request in flight, return it
  const existing = inflightRequests.get(key);
  if (existing) {
    return existing.then(res => res.clone());
  }
  
  // Start new request
  const promise = fetch(url, options);
  inflightRequests.set(key, promise);
  
  try {
    const response = await promise;
    return response;
  } finally {
    // Clean up after request completes
    inflightRequests.delete(key);
  }
}

// Retry with exponential backoff for transient errors
async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 2,
  baseDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await deduplicatedFetch(url, options);
      
      // Only retry on server errors (5xx), not client errors (4xx)
      if (response.status >= 500 && attempt < maxRetries) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      
      // Don't retry on abort
      if (lastError.name === 'AbortError') throw lastError;
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

interface FetchState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface UseFetchOptions {
  /** Don't fetch on mount, wait for manual trigger */
  manual?: boolean;
  /** Initial data before first fetch */
  initialData?: unknown;
  /** Dependencies that trigger refetch */
  deps?: unknown[];
}

/**
 * Generic hook for fetching data from the API
 */
export function useFetch<T>(
  endpoint: string | null,
  options: UseFetchOptions = {}
): FetchState<T> & { refetch: () => Promise<void>; setData: (data: T | null) => void } {
  const { manual = false, initialData = null, deps = [] } = options;
  
  const [data, setData] = useState<T | null>(initialData as T | null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!manual && !!endpoint);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
      const response = await fetchWithRetry(url, {
        signal: abortControllerRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  // Fetch on mount if not manual
  useEffect(() => {
    if (!manual && endpoint) {
      fetchData();
    }
    
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [manual, endpoint, fetchData, ...deps]);

  return { data, error, isLoading, refetch: fetchData, setData };
}

interface MutationState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for POST/PUT/DELETE mutations
 */
export function useMutation<TInput, TOutput = unknown>(
  endpoint: string,
  options: UseMutationOptions<TOutput> = {}
): MutationState<TOutput> & { mutate: (data: TInput) => Promise<TOutput | null> } {
  const [data, setData] = useState<TOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (input: TInput): Promise<TOutput | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, options]);

  return { data, error, isLoading, mutate };
}

/**
 * Hook for parallel batch mutations
 */
export function useBatchMutation<TInput, TOutput = unknown>(
  endpoint: string
): {
  results: Array<{ status: 'fulfilled' | 'rejected'; value?: TOutput; reason?: string }>;
  isLoading: boolean;
  pendingCount: number;
  mutateAll: (inputs: TInput[]) => Promise<{ successful: number; failed: number }>;
} {
  const [results, setResults] = useState<Array<{ status: 'fulfilled' | 'rejected'; value?: TOutput; reason?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const mutateAll = useCallback(async (inputs: TInput[]): Promise<{ successful: number; failed: number }> => {
    setIsLoading(true);
    setPendingCount(inputs.length);
    setResults([]);

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    const promises = inputs.map(async (input) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Request failed: ${response.status}`);
      }

      return response.json();
    });

    const settledResults = await Promise.allSettled(promises);
    
    const formattedResults = settledResults.map((result) => {
      if (result.status === 'fulfilled') {
        return { status: 'fulfilled' as const, value: result.value };
      }
      return { status: 'rejected' as const, reason: result.reason?.message || 'Failed' };
    });

    setResults(formattedResults);
    setIsLoading(false);
    setPendingCount(0);

    const successful = formattedResults.filter(r => r.status === 'fulfilled').length;
    const failed = formattedResults.filter(r => r.status === 'rejected').length;

    return { successful, failed };
  }, [endpoint]);

  return { results, isLoading, pendingCount, mutateAll };
}
