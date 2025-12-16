'use client';

import { useEffect, useRef, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import { XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Accessible modal component with:
 * - Escape key to close
 * - Focus trap (Tab cycles within modal)
 * - Focus restoration on close
 * - Click outside to close
 * - Proper ARIA attributes
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = 'lg',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element and focus the modal
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the modal container after a small delay to ensure it's rendered
      setTimeout(() => {
        modalRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap - cycle through focusable elements
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: go to last element if on first
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: go to first element if on last
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal positioning */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal container */}
        <div
          ref={modalRef}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={`relative glass dark:bg-navy-900/95 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden border border-navy-200 dark:border-navy-700 outline-none`}
        >
          {/* Header */}
          <div className="sticky top-0 glass dark:bg-navy-800/90 border-b border-navy-200 dark:border-navy-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
                  {icon}
                </div>
              )}
              <div>
                <h2 id="modal-title" className="text-lg font-semibold text-navy-900 dark:text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-navy-500 dark:text-navy-400">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg transition"
              aria-label="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="sticky bottom-0 glass dark:bg-navy-800/90 border-t border-navy-200 dark:border-navy-700 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
