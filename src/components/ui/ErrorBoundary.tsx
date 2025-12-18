'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshIcon, ExclamationCircleIcon } from './Icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-100 dark:bg-danger-900/30 mb-4">
            <ExclamationCircleIcon className="w-8 h-8 text-danger-600 dark:text-danger-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-navy-600 dark:text-navy-400 mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 rounded-lg hover:bg-navy-200 dark:hover:bg-navy-700 transition text-sm font-medium"
          >
            <RefreshIcon className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component for easier use with specific error messages
 */
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  name?: string;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  name?: string
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary
      onError={(error) => {
        console.error(`Error in ${name || WrappedComponent.displayName || 'Component'}:`, error);
      }}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${name || WrappedComponent.displayName || 'Component'})`;
  return WithErrorBoundary;
}

