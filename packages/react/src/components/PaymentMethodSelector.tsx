import React, { useState, useCallback } from 'react';
import { useEligibleMethods } from '../hooks/useEligibleMethods';
import { PaymentMethod } from '@paypal-v6/types';
import { PayPalButton } from './PayPalButton';
import { VenmoButton } from './VenmoButton';
import { PayLaterButton } from './PayLaterButton';
import { PayPalCreditButton } from './PayPalCreditButton';
import { GooglePayButton } from './GooglePayButton';
import { ApplePayButton } from './ApplePayButton';

/**
 * Payment method selector props
 */
export interface PaymentMethodSelectorProps {
  /** Available payment methods to show */
  methods?: PaymentMethod[];
  
  /** Create order function */
  createOrder: () => Promise<{ orderId: string }>;
  
  /** Callback on payment success */
  onSuccess?: (data: any) => void;
  
  /** Callback on payment error */
  onError?: (error: Error) => void;
  
  /** Callback on payment cancel */
  onCancel?: () => void;
  
  /** Layout direction */
  layout?: 'vertical' | 'horizontal';
  
  /** Gap between buttons */
  gap?: number;
  
  /** Custom class name */
  className?: string;
  
  /** Show only eligible methods */
  showOnlyEligible?: boolean;
  
  /** Amount for Google Pay/Apple Pay */
  amount?: string;
  
  /** Currency code */
  currency?: string;
}

/**
 * Payment method selector component
 */
export function PaymentMethodSelector({
  methods = [
    PaymentMethod.PAYPAL,
    PaymentMethod.VENMO,
    PaymentMethod.PAYLATER,
    PaymentMethod.CREDIT,
    PaymentMethod.GOOGLE_PAY,
    PaymentMethod.APPLE_PAY
  ],
  createOrder,
  onSuccess,
  onError,
  onCancel,
  layout = 'vertical',
  gap = 12,
  className,
  showOnlyEligible = true,
  amount = '10.00',
  currency = 'USD'
}: PaymentMethodSelectorProps) {
  const { isEligible } = useEligibleMethods();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  /**
   * Check if method should be shown
   */
  const shouldShowMethod = useCallback((method: PaymentMethod): boolean => {
    if (!showOnlyEligible) {
      return true;
    }
    return isEligible(method);
  }, [showOnlyEligible, isEligible]);

  /**
   * Common session options
   */
  const sessionOptions = {
    onApprove: async (data: any) => {
      setSelectedMethod(null);
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onCancel: () => {
      setSelectedMethod(null);
      if (onCancel) {
        onCancel();
      }
    },
    onError: (error: Error) => {
      setSelectedMethod(null);
      if (onError) {
        onError(error);
      }
    }
  };

  /**
   * Container styles
   */
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    gap: `${gap}px`,
    flexWrap: layout === 'horizontal' ? 'wrap' : undefined
  };

  return (
    <div className={className} style={containerStyle}>
      {methods.includes(PaymentMethod.PAYPAL) && shouldShowMethod(PaymentMethod.PAYPAL) && (
        <PayPalButton
          createOrder={createOrder}
          sessionOptions={sessionOptions}
          onClick={() => setSelectedMethod(PaymentMethod.PAYPAL)}
          disabled={selectedMethod !== null && selectedMethod !== PaymentMethod.PAYPAL}
        />
      )}
      
      {methods.includes(PaymentMethod.VENMO) && shouldShowMethod(PaymentMethod.VENMO) && (
        <VenmoButton
          createOrder={createOrder}
          sessionOptions={sessionOptions}
          onClick={() => setSelectedMethod(PaymentMethod.VENMO)}
          disabled={selectedMethod !== null && selectedMethod !== PaymentMethod.VENMO}
        />
      )}
      
      {methods.includes(PaymentMethod.PAYLATER) && shouldShowMethod(PaymentMethod.PAYLATER) && (
        <PayLaterButton
          createOrder={createOrder}
          sessionOptions={sessionOptions}
          onClick={() => setSelectedMethod(PaymentMethod.PAYLATER)}
          disabled={selectedMethod !== null && selectedMethod !== PaymentMethod.PAYLATER}
        />
      )}
      
      {methods.includes(PaymentMethod.CREDIT) && shouldShowMethod(PaymentMethod.CREDIT) && (
        <PayPalCreditButton
          createOrder={createOrder}
          sessionOptions={sessionOptions}
          onClick={() => setSelectedMethod(PaymentMethod.CREDIT)}
          disabled={selectedMethod !== null && selectedMethod !== PaymentMethod.CREDIT}
        />
      )}
      
      {methods.includes(PaymentMethod.GOOGLE_PAY) && shouldShowMethod(PaymentMethod.GOOGLE_PAY) && (
        <GooglePayButton
          amount={amount}
          currency={currency}
          createOrder={async () => ({ id: (await createOrder()).orderId })}
          captureOrder={async (orderId) => ({ orderId })}
          onSuccess={onSuccess}
          onError={onError}
          onCancel={onCancel}
        />
      )}
      
      {methods.includes(PaymentMethod.APPLE_PAY) && shouldShowMethod(PaymentMethod.APPLE_PAY) && (
        <ApplePayButton
          amount={amount}
          currency={currency}
          createOrder={createOrder}
          sessionOptions={sessionOptions}
          disabled={selectedMethod !== null && selectedMethod !== PaymentMethod.APPLE_PAY}
        />
      )}
    </div>
  );
}