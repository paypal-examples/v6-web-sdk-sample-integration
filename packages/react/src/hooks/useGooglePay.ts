import { useEffect, useState, useCallback } from 'react';
import { usePayPalSDK } from '../context/PayPalSDKContext';
import {
  GooglePaySession,
  GooglePayConfig,
  PayPalSdkError,
  ErrorCode
} from '@paypal-v6/types';

/**
 * Google Pay hook return type
 */
export interface UseGooglePayReturn {
  /** Google Pay session */
  session: GooglePaySession | null;
  
  /** Google Pay configuration */
  config: GooglePayConfig | null;
  
  /** Whether Google Pay is eligible */
  isEligible: boolean;
  
  /** Whether Google Pay is supported in browser */
  isSupported: boolean;
  
  /** Create a new Google Pay session */
  createSession: () => GooglePaySession;
  
  /** Get Google Pay configuration */
  getConfig: () => Promise<GooglePayConfig | null>;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error if any */
  error: Error | null;
}

/**
 * Hook for Google Pay integration
 */
export function useGooglePay(): UseGooglePayReturn {
  const { sdk, isReady, eligibleMethods } = usePayPalSDK();
  const [session, setSession] = useState<GooglePaySession | null>(null);
  const [config, setConfig] = useState<GooglePayConfig | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Check Google Pay support
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.payments?.api) {
      setIsSupported(true);
    }
  }, []);

  /**
   * Check eligibility
   */
  useEffect(() => {
    if (eligibleMethods) {
      setIsEligible(eligibleMethods.isEligible('googlepay'));
    }
  }, [eligibleMethods]);

  /**
   * Create Google Pay session
   */
  const createSession = useCallback((): GooglePaySession => {
    if (!sdk || !isReady) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'PayPal SDK is not ready'
      );
    }

    if (!isEligible) {
      throw new PayPalSdkError(
        ErrorCode.INVALID_PAYMENT_METHOD,
        'Google Pay is not eligible for this merchant'
      );
    }

    try {
      const googlePaySession = sdk.createGooglePaySession();
      setSession(googlePaySession);
      return googlePaySession;
    } catch (err) {
      const sdkError = err instanceof PayPalSdkError
        ? err
        : new PayPalSdkError(
            ErrorCode.SESSION_NOT_FOUND,
            'Failed to create Google Pay session',
            { originalError: err as Error }
          );
      setError(sdkError);
      throw sdkError;
    }
  }, [sdk, isReady, isEligible]);

  /**
   * Get Google Pay configuration
   */
  const getConfig = useCallback(async (): Promise<GooglePayConfig | null> => {
    if (!session) {
      const newSession = createSession();
      if (!newSession) {
        return null;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const googlePayConfig = await (session || createSession()).getGooglePayConfig();
      setConfig(googlePayConfig);
      return googlePayConfig;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to get Google Pay config:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, createSession]);

  /**
   * Initialize Google Pay session and config
   */
  useEffect(() => {
    if (isReady && isEligible && isSupported && !session) {
      try {
        const googlePaySession = createSession();
        googlePaySession.getGooglePayConfig().then(setConfig).catch(setError);
      } catch (err) {
        // Session creation might fail if components not loaded
        console.debug('Google Pay session creation deferred:', err);
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
    isLoading,
    error
  };
}