'use client';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-600',
  success: 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400 border-success-500/30',
  warning: 'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 border-warning-500/30',
  danger: 'bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400 border-danger-500/30',
  info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-500/30',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ variant = 'default', size = 'sm', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

