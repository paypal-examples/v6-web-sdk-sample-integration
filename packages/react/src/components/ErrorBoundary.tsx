import React, { Component, ReactNode } from 'react';
import { PayPalSdkError } from '@paypal-v6/types';

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  /** Children components */
  children: ReactNode;
  
  /** Fallback component to render on error */
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /** Whether to log errors to console */
  logErrors?: boolean;
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for catching React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, logErrors = true } = this.props;

    if (logErrors) {
      console.error('PayPal SDK Error Boundary caught:', error, errorInfo);
    }

    if (onError) {
      onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback(error, this.resetError);
      }

      // Default fallback UI
      return (
        <div style={defaultErrorStyles.container}>
          <div style={defaultErrorStyles.content}>
            <h2 style={defaultErrorStyles.title}>Payment Error</h2>
            <p style={defaultErrorStyles.message}>
              {error instanceof PayPalSdkError
                ? error.message
                : 'An unexpected error occurred while processing your payment.'}
            </p>
            {error instanceof PayPalSdkError && error.debugId && (
              <p style={defaultErrorStyles.debugId}>
                Debug ID: {error.debugId}
              </p>
            )}
            <button
              onClick={this.resetError}
              style={defaultErrorStyles.button}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Default error styles
 */
const defaultErrorStyles = {
  container: {
    padding: '20px',
    textAlign: 'center' as const,
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6'
  },
  content: {
    maxWidth: '500px',
    margin: '0 auto'
  },
  title: {
    color: '#dc3545',
    fontSize: '24px',
    marginBottom: '16px'
  },
  message: {
    color: '#495057',
    fontSize: '16px',
    marginBottom: '12px'
  },
  debugId: {
    color: '#6c757d',
    fontSize: '14px',
    fontFamily: 'monospace',
    marginBottom: '20px'
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};