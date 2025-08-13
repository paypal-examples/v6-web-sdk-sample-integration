import {
  RetryConfig,
  PayPalSdkError,
  ErrorCode,
  LoggerConfig
} from '@paypal-v6/types';

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  shouldRetry: (error: PayPalSdkError, attemptNumber: number) => {
    // Don't retry certain errors
    const nonRetryableErrors = [
      ErrorCode.INVALID_CLIENT_TOKEN,
      ErrorCode.INVALID_CONFIGURATION,
      ErrorCode.PAYMENT_CANCELLED,
      ErrorCode.BROWSER_NOT_SUPPORTED,
      ErrorCode.DEVICE_NOT_SUPPORTED
    ];
    
    if (nonRetryableErrors.includes(error.code)) {
      return false;
    }
    
    // Retry network and timeout errors
    const retryableErrors = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.SERVER_ERROR
    ];
    
    return retryableErrors.includes(error.code) && attemptNumber < 3;
  }
};

/**
 * Retry helper function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const options = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: PayPalSdkError | null = null;
  let delay = options.initialDelay;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof PayPalSdkError 
        ? error 
        : new PayPalSdkError(
            ErrorCode.UNKNOWN_ERROR,
            'Unknown error during retry',
            { originalError: error as Error }
          );
      
      // Check if we should retry
      if (attempt < options.maxAttempts && options.shouldRetry(lastError, attempt)) {
        // Wait before retrying
        await sleep(Math.min(delay, options.maxDelay));
        
        // Increase delay for next attempt
        delay *= options.backoffMultiplier;
      } else {
        // Don't retry, throw the error
        break;
      }
    }
  }
  
  throw lastError || new PayPalSdkError(
    ErrorCode.UNKNOWN_ERROR,
    'Retry failed with unknown error'
  );
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce helper
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle helper
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Logger implementation
 */
export class Logger {
  private config: LoggerConfig;
  
  constructor(config: LoggerConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      level: config.level ?? 'info',
      includeTimestamp: config.includeTimestamp ?? true,
      includeStackTrace: config.includeStackTrace ?? false,
      logger: config.logger ?? console
    };
  }
  
  /**
   * Check if log level is enabled
   */
  private isLevelEnabled(level: string): boolean {
    if (!this.config.enabled) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level!);
    const targetLevelIndex = levels.indexOf(level);
    
    return targetLevelIndex >= currentLevelIndex;
  }
  
  /**
   * Format log message
   */
  private formatMessage(level: string, message: string): string {
    let formatted = '';
    
    if (this.config.includeTimestamp) {
      formatted += `[${new Date().toISOString()}] `;
    }
    
    formatted += `[${level.toUpperCase()}] ${message}`;
    
    return formatted;
  }
  
  /**
   * Debug log
   */
  debug(message: string, ...args: any[]): void {
    if (this.isLevelEnabled('debug')) {
      this.config.logger!.debug(this.formatMessage('debug', message), ...args);
    }
  }
  
  /**
   * Info log
   */
  info(message: string, ...args: any[]): void {
    if (this.isLevelEnabled('info')) {
      this.config.logger!.info(this.formatMessage('info', message), ...args);
    }
  }
  
  /**
   * Warning log
   */
  warn(message: string, ...args: any[]): void {
    if (this.isLevelEnabled('warn')) {
      this.config.logger!.warn(this.formatMessage('warn', message), ...args);
    }
  }
  
  /**
   * Error log
   */
  error(message: string, error?: Error | PayPalSdkError, ...args: any[]): void {
    if (this.isLevelEnabled('error')) {
      const formatted = this.formatMessage('error', message);
      
      if (error && this.config.includeStackTrace && error.stack) {
        this.config.logger!.error(formatted, error.stack, ...args);
      } else if (error) {
        this.config.logger!.error(formatted, error.message, ...args);
      } else {
        this.config.logger!.error(formatted, ...args);
      }
    }
  }
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate currency code
 */
export function isValidCurrencyCode(code: string): boolean {
  // Common currency codes
  const validCodes = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'CHF',
    'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY',
    'RUB', 'INR', 'BRL', 'ZAR', 'DKK', 'PLN', 'THB', 'IDR',
    'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR'
  ];
  
  return validCodes.includes(code.toUpperCase());
}

/**
 * Validate amount
 */
export function isValidAmount(amount: string | number): boolean {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0 && isFinite(numAmount);
}

/**
 * Format amount for PayPal
 */
export function formatAmount(amount: number | string, decimals: number = 2): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount.toFixed(decimals);
}

/**
 * Parse PayPal error response
 */
export function parsePayPalError(error: any): PayPalSdkError {
  // Check if it's already a PayPalSdkError
  if (error instanceof PayPalSdkError) {
    return error;
  }
  
  // Try to parse PayPal API error format
  if (error?.name === 'INVALID_REQUEST' || error?.name === 'VALIDATION_ERROR') {
    return new PayPalSdkError(
      ErrorCode.INVALID_CONFIGURATION,
      error.message || 'Invalid request',
      {
        debugId: error.debug_id,
        details: error.details
      }
    );
  }
  
  if (error?.name === 'AUTHENTICATION_FAILURE') {
    return new PayPalSdkError(
      ErrorCode.INVALID_CLIENT_TOKEN,
      error.message || 'Authentication failed',
      {
        debugId: error.debug_id
      }
    );
  }
  
  if (error?.name === 'NOT_AUTHORIZED') {
    return new PayPalSdkError(
      ErrorCode.PAYMENT_NOT_APPROVED,
      error.message || 'Not authorized',
      {
        debugId: error.debug_id
      }
    );
  }
  
  // Network errors
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
    return new PayPalSdkError(
      ErrorCode.NETWORK_ERROR,
      'Network connection failed',
      {
        originalError: error
      }
    );
  }
  
  if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNABORTED') {
    return new PayPalSdkError(
      ErrorCode.TIMEOUT_ERROR,
      'Request timed out',
      {
        originalError: error
      }
    );
  }
  
  // Default to unknown error
  return new PayPalSdkError(
    ErrorCode.UNKNOWN_ERROR,
    error?.message || 'An unknown error occurred',
    {
      originalError: error
    }
  );
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as Record<string, any>, source[key] as Record<string, any>);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Generate unique ID
 */
export function generateUniqueId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Check if browser supports PayPal SDK
 */
export function isBrowserSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for required browser features
  const hasPromise = typeof Promise !== 'undefined';
  const hasFetch = typeof fetch !== 'undefined';
  const hasJSON = typeof JSON !== 'undefined';
  
  // Check for minimum browser versions (very basic check)
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Internet Explorer is not supported
  if (userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) {
    return false;
  }
  
  return hasPromise && hasFetch && hasJSON;
}

/**
 * Get device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') {
    return 'desktop';
  }
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Check for mobile devices
  if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  }
  
  // Check for tablets
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  
  return 'desktop';
}