import { useEffect, useState, useCallback } from 'react';
import { usePayPalSDK } from '../context/PayPalSDKContext';
import {
  ApplePaySession,
  ApplePayConfig,
  PaymentSessionOptions,
  PayPalSdkError,
  ErrorCode
} from '@paypal-v6/types';

/**
 * Apple Pay hook return type
 */
export interface UseApplePayReturn {
  /** Apple Pay session */
  session: ApplePaySession | null;
  
  /** Apple Pay configuration */
  config: ApplePayConfig | null;
  
  /** Whether Apple Pay is eligible */
  isEligible: boolean;
  
  /** Whether Apple Pay is supported in browser */
  isSupported: boolean;
  
  /** Create a new Apple Pay session */
  createSession: (options?: PaymentSessionOptions) => ApplePaySession;
  
  /** Get Apple Pay configuration */
  getConfig: () => Promise<ApplePayConfig | null>;
  
  /** Validate merchant */
  validateMerchant: (validationURL: string) => Promise<any>;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error if any */
  error: Error | null;
}

/**
 * Hook for Apple Pay integration
 */
export function useApplePay(): UseApplePayReturn {
  const { sdk, isReady, eligibleMethods } = usePayPalSDK();
  const [session, setSession] = useState<ApplePaySession | null>(null);
  const [config, setConfig] = useState<ApplePayConfig | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Check Apple Pay support
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ApplePaySession) {
      // Check if Apple Pay is available
      const applePayAvailable = (window as any).ApplePaySession.canMakePayments();
      setIsSupported(applePayAvailable);
    }
  }, []);

  /**
   * Check eligibility
   */
  useEffect(() => {
    if (eligibleMethods) {
      setIsEligible(eligibleMethods.isEligible('applepay'));
    }
  }, [eligibleMethods]);

  /**
   * Create Apple Pay session
   */
  const createSession = useCallback((options: PaymentSessionOptions = {}): ApplePaySession => {
    if (!sdk || !isReady) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'PayPal SDK is not ready'
      );
    }

    if (!isEligible) {
      throw new PayPalSdkError(
        ErrorCode.INVALID_PAYMENT_METHOD,
        'Apple Pay is not eligible for this merchant'
      );
    }

    if (!isSupported) {
      throw new PayPalSdkError(
        ErrorCode.DEVICE_NOT_SUPPORTED,
        'Apple Pay is not supported on this device'
      );
    }

    try {
      const applePaySession = sdk.createApplePaySession(options);
      setSession(applePaySession);
      return applePaySession;
    } catch (err) {
      const sdkError = err instanceof PayPalSdkError
        ? err
        : new PayPalSdkError(
            ErrorCode.SESSION_NOT_FOUND,
            'Failed to create Apple Pay session',
            { originalError: err as Error }
          );
      setError(sdkError);
      throw sdkError;
    }
  }, [sdk, isReady, isEligible, isSupported]);

  /**
   * Get Apple Pay configuration
   */
  const getConfig = useCallback(async (): Promise<ApplePayConfig | null> => {
    if (!session) {
      const newSession = createSession();
      if (!newSession) {
        return null;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const applePayConfig = await (session || createSession()).getApplePayConfig();
      setConfig(applePayConfig);
      return applePayConfig;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to get Apple Pay config:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, createSession]);

  /**
   * Validate merchant
   */
  const validateMerchant = useCallback(async (validationURL: string): Promise<any> => {
    if (!session) {
      throw new PayPalSdkError(
        ErrorCode.SESSION_NOT_FOUND,
        'Apple Pay session not initialized'
      );
    }

    try {
      return await session.validateMerchant(validationURL);
    } catch (err) {
      const sdkError = err instanceof PayPalSdkError
        ? err
        : new PayPalSdkError(
            ErrorCode.PAYMENT_FAILED,
            'Failed to validate merchant',
            { originalError: err as Error }
          );
      throw sdkError;
    }
  }, [session]);

  /**
   * Initialize Apple Pay session and config
   */
  useEffect(() => {
    if (isReady && isEligible && isSupported && !session) {
      try {
        const applePaySession = createSession();
        applePaySession.getApplePayConfig().then(setConfig).catch(setError);
      } catch (err) {
        // Session creation might fail if components not loaded
        console.debug('Apple Pay session creation deferred:', err);
      }
    }
  }, [isReady, isEligible, isSupported, session, createSession]);

  return {
    session,
    config,
    isEligible,
    isSupported,
    createSession,
    getConfig,
    validateMerchant,
    isLoading,
    error
  };
}