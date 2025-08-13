/**
 * PayPal SDK error codes
 */
export enum ErrorCode {
  // Initialization errors
  SDK_LOAD_FAILED = 'SDK_LOAD_FAILED',
  SDK_ALREADY_LOADED = 'SDK_ALREADY_LOADED',
  INVALID_CLIENT_TOKEN = 'INVALID_CLIENT_TOKEN',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  COMPONENT_NOT_LOADED = 'COMPONENT_NOT_LOADED',
  
  // Payment errors
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_NOT_APPROVED = 'PAYMENT_NOT_APPROVED',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_ALREADY_CAPTURED = 'ORDER_ALREADY_CAPTURED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Validation errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_CURRENCY = 'INVALID_CURRENCY',
  INVALID_COUNTRY = 'INVALID_COUNTRY',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  
  // Session errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_ALREADY_ACTIVE = 'SESSION_ALREADY_ACTIVE',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  
  // Browser/device errors
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  POPUP_BLOCKED = 'POPUP_BLOCKED',
  DEVICE_NOT_SUPPORTED = 'DEVICE_NOT_SUPPORTED',
  
  // Unknown error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * PayPal SDK error class
 */
export class PayPalSdkError extends Error {
  /** Error code */
  code: ErrorCode;
  
  /** Debug ID for PayPal support */
  debugId?: string;
  
  /** Additional error details */
  details?: any;
  
  /** Order ID if applicable */
  orderId?: string;
  
  /** Original error if wrapped */
  originalError?: Error;
  
  /** Timestamp when error occurred */
  timestamp: number;
  
  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      debugId?: string;
      details?: any;
      orderId?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'PayPalSdkError';
    this.code = code;
    this.debugId = options?.debugId;
    this.details = options?.details;
    this.orderId = options?.orderId;
    this.originalError = options?.originalError;
    this.timestamp = Date.now();
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PayPalSdkError);
    }
  }
  
  /**
   * Convert error to JSON
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      debugId: this.debugId,
      details: this.details,
      orderId: this.orderId,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Error handler function type
 */
export type ErrorHandler = (error: PayPalSdkError) => void;

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  
  /** Initial delay in milliseconds */
  initialDelay?: number;
  
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  
  /** Backoff multiplier */
  backoffMultiplier?: number;
  
  /** Retry condition function */
  shouldRetry?: (error: PayPalSdkError, attemptNumber: number) => boolean;
}

/**
 * Error recovery strategies
 */
export enum ErrorRecoveryStrategy {
  /** Retry the operation */
  RETRY = 'RETRY',
  
  /** Fall back to alternative payment method */
  FALLBACK = 'FALLBACK',
  
  /** Show error message to user */
  SHOW_ERROR = 'SHOW_ERROR',
  
  /** Reload the page */
  RELOAD = 'RELOAD',
  
  /** Do nothing */
  IGNORE = 'IGNORE'
}

/**
 * Error recovery configuration
 */
export interface ErrorRecoveryConfig {
  /** Strategy to use for recovery */
  strategy: ErrorRecoveryStrategy;
  
  /** Retry configuration if using RETRY strategy */
  retryConfig?: RetryConfig;
  
  /** Fallback payment method if using FALLBACK strategy */
  fallbackMethod?: string;
  
  /** Custom recovery handler */
  customHandler?: (error: PayPalSdkError) => void | Promise<void>;
}