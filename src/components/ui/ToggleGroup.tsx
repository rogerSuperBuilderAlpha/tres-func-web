'use client';

import { memo } from 'react';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ToggleOption<T>[];
  disabled?: boolean;
  className?: string;
}

export const ToggleGroup = memo(function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
}: ToggleGroupProps<T>) {
  return (
    <div className={`flex items-center gap-2 p-1 bg-navy-100 dark:bg-navy-800 rounded-lg w-fit ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition disabled:opacity-50 ${
            value === option.value
              ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
              : 'text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}) as <T extends string>(props: ToggleGroupProps<T>) => JSX.Element;
