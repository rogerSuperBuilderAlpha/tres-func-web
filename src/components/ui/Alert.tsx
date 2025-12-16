'use client';

import { memo, type ReactNode } from 'react';
import { ExclamationCircleIcon, CheckIcon, WarningIcon } from './Icons';

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
  info: <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />,
  success: <CheckIcon className="w-4 h-4 flex-shrink-0" />,
  warning: <WarningIcon className="w-4 h-4 flex-shrink-0" />,
  danger: <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />,
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
