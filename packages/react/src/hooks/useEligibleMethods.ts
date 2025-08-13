import { useEffect, useState, useCallback } from 'react';
import { usePayPalSDK } from '../context/PayPalSDKContext';
import {
  EligiblePaymentMethods,
  FindEligibleMethodsOptions,
  PaymentMethod
} from '@paypal-v6/types';

/**
 * Eligible methods hook return type
 */
export interface UseEligibleMethodsReturn {
  /** Eligible payment methods */
  eligibleMethods: EligiblePaymentMethods | null;
  
  /** Check if a specific method is eligible */
  isEligible: (method: PaymentMethod | string) => boolean;
  
  /** Get all eligible methods */
  allEligibleMethods: string[];
  
  /** Refresh eligible methods */
  refresh: (options?: FindEligibleMethodsOptions) => Promise<void>;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error if any */
  error: Error | null;
}

/**
 * Hook for managing eligible payment methods
 */
export function useEligibleMethods(
  options?: FindEligibleMethodsOptions
): UseEligibleMethodsReturn {
  const { sdk, isReady, eligibleMethods: contextMethods } = usePayPalSDK();
  const [eligibleMethods, setEligibleMethods] = useState<EligiblePaymentMethods | null>(contextMethods);
  const [allEligibleMethods, setAllEligibleMethods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Check if a method is eligible
   */
  const isEligible = useCallback((method: PaymentMethod | string): boolean => {
    if (!eligibleMethods) {
      return false;
    }
    return eligibleMethods.isEligible(method);
  }, [eligibleMethods]);

  /**
   * Refresh eligible methods
   */
  const refresh = useCallback(async (refreshOptions?: FindEligibleMethodsOptions) => {
    if (!sdk || !isReady) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const methods = await sdk.findEligibleMethods(refreshOptions || options);
      if (methods) {
        setEligibleMethods(methods);
        setAllEligibleMethods(methods.getAllEligible());
      }
    } catch (err) {
      setError(err as Error);
      console.error('Failed to find eligible methods:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, isReady, options]);

  /**
   * Initial load and updates
   */
  useEffect(() => {
    if (contextMethods) {
      setEligibleMethods(contextMethods);
      setAllEligibleMethods(contextMethods.getAllEligible());
    } else if (isReady && !eligibleMethods && !isLoading) {
      refresh();
    }
  }, [contextMethods, isReady, eligibleMethods, isLoading, refresh]);

  return {
    eligibleMethods,
    isEligible,
    allEligibleMethods,
    refresh,
    isLoading,
    error
  };
}