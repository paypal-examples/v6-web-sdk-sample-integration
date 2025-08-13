import React from 'react';
import { PayPalButtonProps } from './PayPalButton';

/**
 * PayPal Credit button component
 */
export function PayPalCreditButton(props: PayPalButtonProps) {
  return (
    <paypal-credit-button
      {...props}
      data-payment-method="credit"
    />
  );
}