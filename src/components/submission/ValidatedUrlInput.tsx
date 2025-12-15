'use client';

import { Spinner } from '@/components/ui';

export interface ValidationState {
  checking: boolean;
  valid: boolean;
  error?: string;
}

interface ValidatedUrlInputProps {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  validation: ValidationState;
  optional?: boolean;
}

export function ValidatedUrlInput({
  id,
  label,
  required,
  value,
  onChange,
  placeholder,
  validation,
}: ValidatedUrlInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">
        {label}{' '}
        {required ? (
          <span className="text-danger-500">*</span>
        ) : (
          <span className="text-navy-400 dark:text-navy-500 font-normal">(optional)</span>
        )}
      </label>
      <div className="relative">
        <input
          type="url"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 pr-10 bg-white dark:bg-navy-800 border rounded-xl focus:ring-2 transition text-sm text-navy-900 dark:text-navy-100 placeholder:text-navy-400 dark:placeholder:text-navy-500 ${
            validation.error && value
              ? 'border-danger-300 dark:border-danger-500/50 focus:ring-danger-400 focus:border-danger-400'
              : validation.valid
                ? 'border-success-300 dark:border-success-500/50 focus:ring-success-400 focus:border-success-400'
                : 'border-navy-200 dark:border-navy-600 focus:ring-gold-400 focus:border-gold-400'
          }`}
          required={required}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validation.checking ? (
            <Spinner size="sm" className="text-navy-400" />
          ) : validation.valid && value ? (
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : validation.error && value ? (
            <svg className="w-5 h-5 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : null}
        </div>
      </div>
      {validation.error && value && (
        <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {validation.error}
        </p>
      )}
    </div>
  );
}



