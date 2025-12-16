'use client';

import { memo } from 'react';
import { Spinner, CheckCircleSolidIcon, ErrorCircleSolidIcon } from '@/components/ui';

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

export const ValidatedUrlInput = memo(function ValidatedUrlInput({
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
            <CheckCircleSolidIcon className="w-5 h-5 text-success-500" />
          ) : validation.error && value ? (
            <ErrorCircleSolidIcon className="w-5 h-5 text-danger-500" />
          ) : null}
        </div>
      </div>
      {validation.error && value && (
        <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
          <ErrorCircleSolidIcon className="w-3 h-3" />
          {validation.error}
        </p>
      )}
    </div>
  );
});




