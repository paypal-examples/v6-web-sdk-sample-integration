import { usePaymentSession } from './usePaymentSession';
import { PaymentMethod } from '@paypal-v6/types';

/**
 * Hook specifically for PayPal payment sessions
 */
export function usePayPalSession() {
  return usePaymentSession(PaymentMethod.PAYPAL);
}