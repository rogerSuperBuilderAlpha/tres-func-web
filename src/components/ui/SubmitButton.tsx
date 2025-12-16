import { memo, type ReactNode } from 'react';
import { Spinner } from './Spinner';
import { BoltIcon } from './Icons';

interface SubmitButtonProps {
  disabled?: boolean;
  isSubmitting?: boolean;
  submittingText?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export const SubmitButton = memo(function SubmitButton({
  disabled,
  isSubmitting,
  submittingText = 'Submitting...',
  children,
  className = '',
  icon,
}: SubmitButtonProps) {
  const isDisabled = disabled || isSubmitting;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
        !isDisabled
          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-400 hover:to-gold-500 shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/30 hover:-translate-y-0.5'
          : 'bg-navy-200 dark:bg-navy-700 text-navy-400 dark:text-navy-500 cursor-not-allowed'
      } ${className}`}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center">
          <Spinner size="sm" className="mr-2 text-white" />
          {submittingText}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon || <BoltIcon className="w-5 h-5" />}
          {children}
        </span>
      )}
    </button>
  );
});
