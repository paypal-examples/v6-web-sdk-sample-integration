import { useCallback, useState, useRef } from 'react';
import { usePayPalSDK } from '../context/PayPalSDKContext';
import {
  PaymentMethod,
  PaymentSessionOptions,
  BasePaymentSession,
  PayPalSdkError,
  ErrorCode
} from '@paypal-v6/types';

/**
 * Payment session hook return type
 */
export interface UsePaymentSessionReturn {
  /** Create a new payment session */
  createSession: (options?: PaymentSessionOptions) => BasePaymentSession;
  
  /** Current session instance */
  session: BasePaymentSession | null;
  
  /** Whether a session is currently active */
  isSessionActive: boolean;
  
  /** Cancel the current session */
  cancelSession: () => void;
  
  /** Destroy the current session */
  destroySession: () => void;
  
  /** Session error if any */
  error: PayPalSdkError | null;
}

/**
 * Hook for managing payment sessions
 */
export function usePaymentSession(
  paymentMethod: PaymentMethod
): UsePaymentSessionReturn {
  const { sdk, isReady } = usePayPalSDK();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<PayPalSdkError | null>(null);
  const sessionRef = useRef<BasePaymentSession | null>(null);

  /**
   * Create a payment session
   */
  const createSession = useCallback((options: PaymentSessionOptions = {}) => {
    if (!sdk || !isReady) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'PayPal SDK is not ready'
      );
    }

    // Destroy existing session if any
    if (sessionRef.current) {
      sessionRef.current.destroy();
    }

    try {
      let session: BasePaymentSession;

      // Create session based on payment method
      switch (paymentMethod) {
        case PaymentMethod.PAYPAL:
          session = sdk.createPayPalSession(options);
          break;
        case PaymentMethod.VENMO:
          session = sdk.createVenmoSession(options);
          break;
        case PaymentMethod.PAYLATER:
          session = sdk.createPayLaterSession(options);
          break;
        case PaymentMethod.CREDIT:
          session = sdk.createCreditSession(options);
          break;
        default:
          throw new PayPalSdkError(
            ErrorCode.INVALID_PAYMENT_METHOD,
            `Unsupported payment method: ${paymentMethod}`
          );
      }

      sessionRef.current = session;
      setIsSessionActive(true);
      setError(null);

      // Listen for session end
      const events = sdk.getEvents();
      const handleSessionEnd = () => {
        setIsSessionActive(false);
      };
      events.once('session_ended', handleSessionEnd);

      return session;
    } catch (err) {
      const sdkError = err instanceof PayPalSdkError
        ? err
        : new PayPalSdkError(
            ErrorCode.SESSION_NOT_FOUND,
            'Failed to create payment session',
            { originalError: err as Error }
          );
      setError(sdkError);
      throw sdkError;
    }
  }, [sdk, isReady, paymentMethod]);

  /**
   * Cancel the current session
   */
  const cancelSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.cancel();
      setIsSessionActive(false);
    }
  }, []);

  /**
   * Destroy the current session
   */
  const destroySession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.destroy();
      sessionRef.current = null;
      setIsSessionActive(false);
    }
  }, []);

  return {
    createSession,
    session: sessionRef.current,
    isSessionActive,
    cancelSession,
    destroySession,
    error
  };
}