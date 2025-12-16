'use client';

import { memo, type ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton loading placeholder component
 */
export const Skeleton = memo(function Skeleton({
  className = '',
  width,
  height,
  variant = 'text',
  animation = 'pulse',
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'skeleton', // Uses CSS animation from globals.css
    none: '',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={`bg-navy-200 dark:bg-navy-700 ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
});

// ============================================
// Preset Skeleton Components
// ============================================

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/**
 * Skeleton for text content with multiple lines
 */
export const SkeletonText = memo(function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '75%' : '100%'}
          height={16}
        />
      ))}
    </div>
  );
});

/**
 * Skeleton for avatar/profile image
 */
export const SkeletonAvatar = memo(function SkeletonAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <Skeleton variant="circular" width={size} height={size} className={className} />;
});

/**
 * Skeleton for card content
 */
export const SkeletonCard = memo(function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-navy-800 rounded-xl border border-navy-100 dark:border-navy-700 p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={16} className="mb-2" />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  );
});

/**
 * Skeleton for list items
 */
export const SkeletonListItem = memo(function SkeletonListItem({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 ${className}`}>
      <Skeleton variant="rounded" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="70%" height={16} className="mb-2" />
        <Skeleton variant="text" width="50%" height={12} />
      </div>
      <Skeleton variant="rounded" width={60} height={24} />
    </div>
  );
});

/**
 * Skeleton for table rows
 */
export const SkeletonTable = memo(function SkeletonTable({ rows = 5, columns = 4, className = '' }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 p-3 bg-navy-50 dark:bg-navy-800/50 rounded-lg">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={14} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} height={16} />
          ))}
        </div>
      ))}
    </div>
  );
});

/**
 * Skeleton for form fields
 */
export const SkeletonForm = memo(function SkeletonForm({ fields = 3, className = '' }: { fields?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton variant="text" width={80} height={14} className="mb-2" />
          <Skeleton variant="rounded" width="100%" height={42} />
        </div>
      ))}
      <Skeleton variant="rounded" width="100%" height={48} className="mt-6" />
    </div>
  );
});

// ============================================
// Skeleton Wrapper
// ============================================

interface SkeletonWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

/**
 * Wrapper component that shows skeleton while loading
 */
export const SkeletonWrapper = memo(function SkeletonWrapper({ isLoading, skeleton, children }: SkeletonWrapperProps) {
  if (isLoading) {
    return <>{skeleton}</>;
  }
  return <>{children}</>;
});
