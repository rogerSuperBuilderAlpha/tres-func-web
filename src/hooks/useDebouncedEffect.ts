import { useEffect } from 'react';

/**
 * Hook that runs an effect after a delay, resetting the timer on dependency changes
 * Useful for debouncing API calls based on user input
 * 
 * @param effect - The effect function to run
 * @param deps - Dependencies that trigger the effect
 * @param delayMs - Delay in milliseconds before running the effect
 */
export function useDebouncedEffect(
  effect: () => void | Promise<void>,
  deps: unknown[],
  delayMs: number
): void {
  useEffect(() => {
    const timer = setTimeout(() => {
      void effect();
    }, delayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delayMs]);
}

