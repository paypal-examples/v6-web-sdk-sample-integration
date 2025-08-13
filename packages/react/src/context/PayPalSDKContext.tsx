import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { PayPalSDK } from '@paypal-v6/core';
import {
  SdkInitOptions,
  SdkState,
  EligiblePaymentMethods,
  ErrorCode,
  PayPalSdkError
} from '@paypal-v6/types';

/**
 * PayPal SDK context value
 */
interface PayPalSDKContextValue {
  /** SDK instance */
  sdk: PayPalSDK | null;
  
  /** Current SDK state */
  state: SdkState;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Ready state */
  isReady: boolean;
  
  /** Error if any */
  error: PayPalSdkError | null;
  
  /** Eligible payment methods */
  eligibleMethods: EligiblePaymentMethods | null;
  
  /** Initialize SDK manually */
  initialize: () => Promise<void>;
  
  /** Reset SDK */
  reset: () => Promise<void>;
  
  /** Find eligible payment methods */
  findEligibleMethods: (options?: any) => Promise<EligiblePaymentMethods | null>;
}

/**
 * PayPal SDK context
 */
const PayPalSDKContext = createContext<PayPalSDKContextValue | null>(null);

/**
 * PayPal SDK provider props
 */
export interface PayPalSDKProviderProps {
  /** SDK configuration */
  config: SdkInitOptions;
  
  /** Children components */
  children: React.ReactNode;
  
  /** Whether to defer SDK loading */
  deferLoading?: boolean;
  
  /** Loading component */
  loadingComponent?: React.ReactNode;
  
  /** Error component */
  errorComponent?: (error: PayPalSdkError) => React.ReactNode;
  
  /** Callback when SDK is ready */
  onReady?: () => void;
  
  /** Callback on error */
  onError?: (error: PayPalSdkError) => void;
}

/**
 * PayPal SDK provider component
 */
export function PayPalSDKProvider({
  config,
  children,
  deferLoading = false,
  loadingComponent,
  errorComponent,
  onReady,
  onError
}: PayPalSDKProviderProps) {
  const [sdk, setSdk] = useState<PayPalSDK | null>(null);
  const [state, setState] = useState<SdkState>(SdkState.NOT_INITIALIZED);
  const [error, setError] = useState<PayPalSdkError | null>(null);
  const [eligibleMethods, setEligibleMethods] = useState<EligiblePaymentMethods | null>(null);
  
  const sdkRef = useRef<PayPalSDK | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  /**
   * Initialize SDK
   */
  const initialize = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    // Check if already initialized
    if (sdkRef.current && state === SdkState.READY) {
      return Promise.resolve();
    }

    const initPromise = (async () => {
      try {
        setState(SdkState.LOADING);
        setError(null);

        // Create SDK instance with configuration
        const sdkInstance = PayPalSDK.getInstance({
          ...config,
          autoLoad: false // We'll control loading manually
        });

        // Set up event listeners
        const events = sdkInstance.getEvents();
        
        events.on('ready', () => {
          setState(SdkState.READY);
          if (onReady) {
            onReady();
          }
        });

        events.on('error', (event) => {
          const sdkError = event.payload as PayPalSdkError;
          setError(sdkError);
          setState(SdkState.ERROR);
          if (onError) {
            onError(sdkError);
          }
        });

        // Initialize the SDK
        await sdkInstance.initialize();
        
        sdkRef.current = sdkInstance;
        setSdk(sdkInstance);
        setState(sdkInstance.getState());

        // Find eligible methods if currency is configured
        if (config.currency) {
          try {
            const methods = await sdkInstance.findEligibleMethods({
              currencyCode: config.currency,
              countryCode: config.buyerCountry
            });
            setEligibleMethods(methods);
          } catch (err) {
            console.warn('Failed to find eligible payment methods:', err);
          }
        }

      } catch (err) {
        const sdkError = err instanceof PayPalSdkError 
          ? err 
          : new PayPalSdkError(
              ErrorCode.SDK_LOAD_FAILED,
              'Failed to initialize PayPal SDK',
              { originalError: err as Error }
            );
        
        setError(sdkError);
        setState(SdkState.ERROR);
        
        if (onError) {
          onError(sdkError);
        }
        
        throw sdkError;
      } finally {
        initPromiseRef.current = null;
      }
    })();

    initPromiseRef.current = initPromise;
    return initPromise;
  }, [config, onReady, onError]);

  /**
   * Reset SDK
   */
  const reset = useCallback(async () => {
    if (sdkRef.current) {
      sdkRef.current.destroy();
      sdkRef.current = null;
      setSdk(null);
    }
    
    setState(SdkState.NOT_INITIALIZED);
    setError(null);
    setEligibleMethods(null);
    
    await initialize();
  }, [initialize]);

  /**
   * Find eligible payment methods
   */
  const findEligibleMethods = useCallback(async (options?: any) => {
    if (!sdkRef.current) {
      console.warn('SDK not initialized');
      return null;
    }

    try {
      const methods = await sdkRef.current.findEligibleMethods(options);
      setEligibleMethods(methods);
      return methods;
    } catch (err) {
      console.error('Failed to find eligible payment methods:', err);
      return null;
    }
  }, []);

  /**
   * Initialize on mount unless deferred
   */
  useEffect(() => {
    if (!deferLoading) {
      initialize().catch(err => {
        console.error('Failed to initialize PayPal SDK:', err);
      });
    }

    // Cleanup on unmount
    return () => {
      if (sdkRef.current) {
        // Don't destroy the singleton, just clean up listeners
        const events = sdkRef.current.getEvents();
        events.removeAllListeners();
      }
    };
  }, []); // Only run once on mount

  /**
   * Context value
   */
  const contextValue: PayPalSDKContextValue = {
    sdk,
    state,
    isLoading: state === SdkState.LOADING,
    isReady: state === SdkState.READY,
    error,
    eligibleMethods,
    initialize,
    reset,
    findEligibleMethods
  };

  // Show loading component if configured
  if (state === SdkState.LOADING && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  // Show error component if configured
  if (state === SdkState.ERROR && error && errorComponent) {
    return <>{errorComponent(error)}</>;
  }

  return (
    <PayPalSDKContext.Provider value={contextValue}>
      {children}
    </PayPalSDKContext.Provider>
  );
}

/**
 * Hook to use PayPal SDK context
 */
export function usePayPalSDK(): PayPalSDKContextValue {
  const context = useContext(PayPalSDKContext);
  
  if (!context) {
    throw new Error('usePayPalSDK must be used within a PayPalSDKProvider');
  }
  
  return context;
}