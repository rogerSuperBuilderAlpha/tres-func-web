'use client';

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

export function Card({ 
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
}

export function GlassCard({ 
  children, 
  className = '',
  padding = 'lg'
}: Omit<CardProps, 'variant'>) {
  return (
    <div className={`glass rounded-2xl shadow-xl border border-navy-100 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}





