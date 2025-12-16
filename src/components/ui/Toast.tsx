'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode, memo } from 'react';
import { CheckIcon, XIcon, WarningIcon, ExclamationCircleIcon } from './Icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastStyles: Record<ToastType, string> = {
  success: 'bg-success-500 text-white',
  error: 'bg-danger-500 text-white',
  warning: 'bg-warning-500 text-white',
  info: 'bg-navy-700 text-white',
};

const toastIcons: Record<ToastType, ReactNode> = {
  success: <CheckIcon className="w-5 h-5" />,
  error: <XIcon className="w-5 h-5" />,
  warning: <WarningIcon className="w-5 h-5" />,
  info: <ExclamationCircleIcon className="w-5 h-5" />,
};

const ToastItem = memo(function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onRemove, toast.duration || 5000);
    return () => clearTimeout(timeout);
  }, [toast.duration, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${toastStyles[toast.type]}`}
      role="alert"
    >
      {toastIcons[toast.type]}
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={onRemove}
        className="ml-2 p-1 hover:bg-white/20 rounded transition"
        aria-label="Dismiss"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
