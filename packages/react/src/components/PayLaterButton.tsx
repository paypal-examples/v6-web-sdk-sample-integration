import React from 'react';
import { PayPalButtonProps } from './PayPalButton';

/**
 * Pay Later button component
 */
export function PayLaterButton(props: PayPalButtonProps) {
  return (
    <paypal-pay-later-button
      {...props}
      data-payment-method="paylater"
    />
  );
}