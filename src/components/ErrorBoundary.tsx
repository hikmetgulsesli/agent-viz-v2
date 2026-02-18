import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './ErrorBoundary.css';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component - catches React rendering errors and displays
 * a fallback UI with retry functionality
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    // If custom fallback is provided, use it
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <div className="error-boundary" data-testid="error-boundary">
        <div className="error-boundary__content">
          <div className="error-boundary__icon-wrapper">
            <AlertTriangle
              className="error-boundary__icon"
              aria-label="Error"
              data-testid="error-icon"
            />
          </div>
          <h2 className="error-boundary__title" data-testid="error-title">
            Something went wrong
          </h2>
          <p className="error-boundary__message" data-testid="error-message">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <button
            type="button"
            className="error-boundary__retry-button"
            onClick={this.handleRetry}
            data-testid="retry-button"
            aria-label="Retry loading component"
          >
            <RefreshCw className="error-boundary__retry-icon" aria-hidden="true" />
            <span className="error-boundary__retry-text">Retry</span>
          </button>
        </div>
      </div>
    );
  }
}
