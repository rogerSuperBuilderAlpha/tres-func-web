'use client';

import { memo } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = memo(function Card({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md'
}: CardProps) {
  const baseClasses = 'rounded-xl border border-navy-100 shadow-sm';
  const variantClasses = variant === 'glass' 
    ? 'glass' 
    : 'bg-white';

  return (
    <div className={`${baseClasses} ${variantClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
});

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/** Glass card with dark mode support - use for main content panels */
export const GlassCard = memo(function GlassCard({ 
  children, 
  className = '',
  padding = 'lg'
}: GlassCardProps) {
  return (
    <div className={`glass dark:bg-navy-900/90 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
});






