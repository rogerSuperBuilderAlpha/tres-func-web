import type { StatusLevel, StatusLevelStyles } from './types';

// Status level styling helper - keeps class selection centralized
export function getStatusLevelStyles(level: StatusLevel): StatusLevelStyles {
  return {
    bg:
      level === 'critical'
        ? 'bg-danger-100 dark:bg-danger-900/30'
        : level === 'warning'
          ? 'bg-warning-100 dark:bg-warning-900/30'
          : 'bg-gold-100 dark:bg-gold-900/30',
    text:
      level === 'critical'
        ? 'text-danger-600 dark:text-danger-400'
        : level === 'warning'
          ? 'text-warning-600 dark:text-warning-400'
          : 'text-gold-600 dark:text-gold-400',
    timerText:
      level === 'critical'
        ? 'text-danger-600 dark:text-danger-400'
        : level === 'warning'
          ? 'text-warning-600 dark:text-warning-400'
          : 'text-navy-800 dark:text-white',
    progressBar: level === 'critical' ? 'bg-danger-500' : level === 'warning' ? 'bg-warning-500' : 'bg-gold-500',
  };
}



