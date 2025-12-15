'use client';

import { memo, type ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  variant?: AlertVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

// Map variants to ARIA roles
const ARIA_ROLES: Record<AlertVariant, 'status' | 'alert'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};

const DEFAULT_ICONS: Record<AlertVariant, ReactNode> = {
  info: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  danger: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES: Record<AlertVariant, string> = {
  info: 'bg-navy-50 border-navy-200 text-navy-700 dark:bg-navy-900/20 dark:border-navy-700 dark:text-navy-200',
  success:
    'bg-success-50 border-success-200 text-success-700 dark:bg-success-900/20 dark:border-success-800 dark:text-success-200',
  warning:
    'bg-warning-50 border-warning-200 text-warning-700 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-200',
  danger:
    'bg-danger-50 border-danger-200 text-danger-700 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-200',
};

export const Alert = memo(function Alert({ variant = 'info', icon, children, className }: AlertProps) {
  return (
    <div 
      role={ARIA_ROLES[variant]}
      aria-live={variant === 'danger' || variant === 'warning' ? 'assertive' : 'polite'}
      className={`p-3 border rounded-xl text-sm flex items-center gap-2 ${STYLES[variant]} ${className || ''}`}
    >
      <span className="flex-shrink-0" aria-hidden="true">{icon ?? DEFAULT_ICONS[variant]}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
});



