import React, { useEffect, useState, useCallback } from 'react';
import { usePayPalSDK } from '../context/PayPalSDKContext';
import { useApplePay } from '../hooks/useApplePay';
import {
  CreateOrderRequest,
  PaymentSessionOptions
} from '@paypal-v6/types';

/**
 * Apple Pay button props
 */
export interface ApplePayButtonProps {
  /** Amount for the transaction */
  amount: string;
  
  /** Currency code */
  currency?: string;
  
  /** Country code */
  countryCode?: string;
  
  /** Create order function */
  createOrder: () => Promise<{ orderId: string }>;
  
  /** Payment session options */
  sessionOptions?: PaymentSessionOptions;
  
  /** Apple Pay button style */
  buttonStyle?: 'black' | 'white' | 'white-outline';
  
  /** Button type */
  buttonType?: 'plain' | 'buy' | 'donate' | 'checkout' | 'book' | 'subscribe';
  
  /** Button locale */
  buttonLocale?: string;
  
  /** Custom class name */
  className?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Container ID */
  containerId?: string;
}

/**
 * Apple Pay button component
 */
export function ApplePayButton({
  amount,
  currency = 'USD',
  countryCode = 'US',
  createOrder,
  sessionOptions = {},
  buttonStyle = 'black',
  buttonType = 'buy',
  buttonLocale = 'en-US',
  className,
  disabled = false,
  containerId = 'applepay-button-container'
}: ApplePayButtonProps) {
  const { isReady } = usePayPalSDK();
  const { session, config, isEligible, isSupported } = useApplePay();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle Apple Pay click
   */
  const handleApplePayClick = useCallback(async () => {
    if (!session || isProcessing || disabled) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Start Apple Pay session
      const orderPromise = createOrder();
      await session.start(
        { presentationMode: 'modal' },
        orderPromise
      );
      
    } catch (error) {
      console.error('Apple Pay payment failed:', error);
      if (sessionOptions.onError) {
        sessionOptions.onError(error as Error);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [session, isProcessing, disabled, createOrder, sessionOptions]);

  /**
   * Set up Apple Pay button
   */
  useEffect(() => {
    if (!isReady || !isEligible || !isSupported) {
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create Apple Pay button
    const button = document.createElement('apple-pay-button');
    button.setAttribute('buttonstyle', buttonStyle);
    button.setAttribute('type', buttonType);
    button.setAttribute('locale', buttonLocale);
    
    // Apply styles
    (button as HTMLElement).style.width = '100%';
    (button as HTMLElement).style.height = '45px';
    
    if (disabled) {
      (button as HTMLElement).style.opacity = '0.6';
      (button as HTMLElement).style.pointerEvents = 'none';
    }

    // Add click handler
    button.addEventListener('click', handleApplePayClick);

    // Append to container
    container.appendChild(button);

    // Cleanup
    return () => {
      button.removeEventListener('click', handleApplePayClick);
    };
  }, [
    isReady,
    isEligible,
    isSupported,
    containerId,
    buttonStyle,
    buttonType,
    buttonLocale,
    disabled,
    handleApplePayClick
  ]);

  if (!isSupported || !isEligible) {
    return null;
  }

  return (
    <div 
      id={containerId}
      className={className}
      style={{ minHeight: '45px' }}
    />
  );
}