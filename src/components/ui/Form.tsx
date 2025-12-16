'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import { CheckIcon, ExclamationCircleIcon } from './Icons';
import { Spinner } from './Spinner';

// Shared styles
const baseInputStyles = 'w-full px-4 py-2.5 bg-white dark:bg-navy-800 border rounded-xl text-sm text-navy-900 dark:text-white placeholder:text-navy-400 dark:placeholder:text-navy-500 transition-colors';
const focusStyles = 'focus:ring-2 focus:ring-gold-400 focus:border-gold-400 dark:focus:ring-gold-500 dark:focus:border-gold-500';
const errorStyles = 'border-danger-300 dark:border-danger-600 focus:ring-danger-400 focus:border-danger-400';
const validStyles = 'border-success-300 dark:border-success-600';
const normalStyles = 'border-navy-200 dark:border-navy-600';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  isValid?: boolean;
  isChecking?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Form field wrapper with label, error, and hint support
 */
export function FormField({
  label,
  error,
  hint,
  required,
  optional,
  isValid,
  isChecking,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">
          {label}
          {required && <span className="text-danger-500">*</span>}
          {optional && <span className="text-navy-400 dark:text-navy-500 font-normal">(optional)</span>}
          {isChecking && <Spinner size="xs" className="text-navy-400" />}
          {isValid && !isChecking && <CheckIcon className="w-4 h-4 text-success-500" />}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1">
          <ExclamationCircleIcon className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-navy-500 dark:text-navy-400">{hint}</p>
      )}
    </div>
  );
}

// ============================================
// TextInput
// ============================================

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  error?: string;
  isValid?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, isValid, leftIcon, rightIcon, ...props }, ref) => {
    const stateStyles = error ? errorStyles : isValid ? validStyles : normalStyles;
    
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 dark:text-navy-500">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseInputStyles} ${focusStyles} ${stateStyles} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 dark:text-navy-500">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

// ============================================
// TextArea
// ============================================

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  error?: string;
  isValid?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, isValid, ...props }, ref) => {
    const stateStyles = error ? errorStyles : isValid ? validStyles : normalStyles;
    
    return (
      <textarea
        ref={ref}
        className={`${baseInputStyles} ${focusStyles} ${stateStyles} min-h-[100px] resize-y`}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'TextArea';

// ============================================
// Select
// ============================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: SelectOption[];
  error?: string;
  isValid?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, isValid, placeholder, ...props }, ref) => {
    const stateStyles = error ? errorStyles : isValid ? validStyles : normalStyles;
    
    return (
      <select
        ref={ref}
        className={`${baseInputStyles} ${focusStyles} ${stateStyles} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%23627d98%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpath%20d%3d%22m6%209%206%206%206-6%22%2f%3e%3c%2fsvg%3e')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

// ============================================
// Checkbox
// ============================================

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <div className="w-5 h-5 border-2 border-navy-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-800 peer-checked:bg-gold-500 peer-checked:border-gold-500 peer-focus:ring-2 peer-focus:ring-gold-400 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-navy-900 transition-colors" />
          <CheckIcon className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        <div>
          <span className="text-sm font-medium text-navy-800 dark:text-navy-200 group-hover:text-navy-900 dark:group-hover:text-white transition-colors">
            {label}
          </span>
          {description && (
            <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">{description}</p>
          )}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// ============================================
// RadioGroup
// ============================================

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  orientation = 'vertical',
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={`flex ${orientation === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'}`}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-start gap-3 cursor-pointer group ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-navy-300 dark:border-navy-600 rounded-full bg-white dark:bg-navy-800 peer-checked:border-gold-500 peer-focus:ring-2 peer-focus:ring-gold-400 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-navy-900 transition-colors" />
            <div className="w-2.5 h-2.5 bg-gold-500 rounded-full absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-sm font-medium text-navy-800 dark:text-navy-200 group-hover:text-navy-900 dark:group-hover:text-white transition-colors">
              {option.label}
            </span>
            {option.description && (
              <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
