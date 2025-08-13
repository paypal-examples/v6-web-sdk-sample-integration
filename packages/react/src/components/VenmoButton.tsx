import React from 'react';
import { usePaymentSession } from '../hooks/usePaymentSession';
import { PaymentMethod } from '@paypal-v6/types';
import { PayPalButtonProps } from './PayPalButton';

/**
 * Venmo button component
 */
export function VenmoButton(props: PayPalButtonProps) {
  const { createSession, isSessionActive } = usePaymentSession(PaymentMethod.VENMO);
  
  // Venmo has different default styling
  const venmoStyle = {
    ...props.style,
    color: props.style?.color || 'blue'
  };

  return (
    <venmo-button
      {...props}
      style={venmoStyle}
      data-payment-method="venmo"
    />
  );
}