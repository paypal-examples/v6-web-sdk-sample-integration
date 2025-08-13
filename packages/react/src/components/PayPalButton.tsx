import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePayPalSDK } from '../context/PayPalSDKContext';
import { usePaymentSession } from '../hooks/usePaymentSession';
import {
  PaymentSessionOptions,
  ButtonStyle,
  PaymentMethod,
  StartSessionOptions,
  OrderPromise
} from '@paypal-v6/types';

/**
 * PayPal button props
 */
export interface PayPalButtonProps {
  /** Create order function */
  createOrder: () => Promise<OrderPromise>;
  
  /** Payment session options */
  sessionOptions?: PaymentSessionOptions;
  
  /** Start session options */
  startOptions?: StartSessionOptions;
  
  /** Button style */
  style?: ButtonStyle;
  
  /** Button type */
  type?: 'pay' | 'buynow' | 'checkout' | 'donate' | 'subscribe';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Custom class name */
  className?: string;
  
  /** Button ID */
  id?: string;
  
  /** Click handler (called before payment) */
  onClick?: () => void | Promise<void>;
  
  /** Whether to show button immediately or wait for eligibility */
  forceShow?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
}

/**
 * PayPal button component
 */
export function PayPalButton({
  createOrder,
  sessionOptions = {},
  startOptions = { presentationMode: 'auto' },
  style,
  type = 'pay',
  disabled = false,
  className,
  id,
  onClick,
  forceShow = false,
  loading = false,
  loadingComponent
}: PayPalButtonProps) {
  const { isReady, eligibleMethods } = usePayPalSDK();
  const { createSession, isSessionActive } = usePaymentSession(PaymentMethod.PAYPAL);
  const [isEligible, setIsEligible] = useState<boolean>(forceShow);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const buttonRef = useRef<HTMLElement | null>(null);

  /**
   * Check eligibility
   */
  useEffect(() => {
    if (eligibleMethods && !forceShow) {
      setIsEligible(eligibleMethods.isEligible('paypal'));
    }
  }, [eligibleMethods, forceShow]);

  /**
   * Handle button click
   */
  const handleClick = useCallback(async () => {
    if (disabled || isProcessing || isSessionActive) {
      return;
    }

    try {
      setIsProcessing(true);

      // Call custom onClick if provided
      if (onClick) {
        await onClick();
      }

      // Create payment session
      const session = createSession(sessionOptions);
      
      // Start payment flow
      const orderPromise = createOrder();
      await session.start(startOptions, orderPromise);
      
    } catch (error) {
      console.error('PayPal payment failed:', error);
      
      // Call onError if provided in session options
      if (sessionOptions.onError) {
        sessionOptions.onError(error as Error);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    disabled,
    isProcessing,
    isSessionActive,
    onClick,
    createSession,
    sessionOptions,
    createOrder,
    startOptions
  ]);

  /**
   * Set up native button element
   */
  useEffect(() => {
    if (buttonRef.current && isReady && isEligible) {
      // Set button properties
      const button = buttonRef.current as any;
      
      if (style?.color) button.color = style.color;
      if (style?.shape) button.shape = style.shape;
      if (style?.size) button.size = style.size;
      if (style?.label) button.label = style.label;
      if (style?.height) button.height = style.height;
      if (type) button.type = type;
    }
  }, [isReady, isEligible, style, type]);

  // Don't render if not eligible (unless forced)
  if (!isEligible && !forceShow) {
    return null;
  }

  // Show loading state
  if (loading || !isReady) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className={className} style={{ textAlign: 'center', padding: '10px' }}>
        Loading PayPal...
      </div>
    );
  }

  return (
    <paypal-button
      ref={buttonRef}
      id={id}
      className={className}
      type={type}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      style={{
        opacity: disabled || isProcessing ? 0.6 : 1,
        cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
        ...((style as any)?.customStyle || {})
      }}
    />
  );
}