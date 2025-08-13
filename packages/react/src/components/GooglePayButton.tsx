import React, { useEffect, useState, useCallback } from 'react';
import { usePayPalSDK } from '../context/PayPalSDKContext';
import { useGooglePay } from '../hooks/useGooglePay';
import {
  GooglePayTransactionInfo,
  CreateOrderRequest,
  ErrorCode,
  PayPalSdkError
} from '@paypal-v6/types';

/**
 * Google Pay button props
 */
export interface GooglePayButtonProps {
  /** Amount for the transaction */
  amount: string;
  
  /** Currency code */
  currency?: string;
  
  /** Country code */
  countryCode?: string;
  
  /** Create order function */
  createOrder: (orderPayload: CreateOrderRequest) => Promise<{ id: string }>;
  
  /** Capture order function */
  captureOrder: (orderId: string) => Promise<any>;
  
  /** Transaction info builder */
  buildTransactionInfo?: (amount: string) => GooglePayTransactionInfo;
  
  /** Google Pay environment */
  environment?: 'TEST' | 'PRODUCTION';
  
  /** Button type */
  buttonType?: 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe';
  
  /** Button color */
  buttonColor?: 'default' | 'black' | 'white';
  
  /** Button locale */
  buttonLocale?: string;
  
  /** Button size mode */
  buttonSizeMode?: 'static' | 'fill';
  
  /** Callback on success */
  onSuccess?: (result: any) => void;
  
  /** Callback on error */
  onError?: (error: Error) => void;
  
  /** Callback on cancel */
  onCancel?: () => void;
  
  /** Custom class name */
  className?: string;
  
  /** Container ID for button */
  containerId?: string;
}

/**
 * Google Pay button component
 */
export function GooglePayButton({
  amount,
  currency = 'USD',
  countryCode = 'US',
  createOrder,
  captureOrder,
  buildTransactionInfo,
  environment = 'TEST',
  buttonType = 'pay',
  buttonColor = 'default',
  buttonLocale,
  buttonSizeMode = 'static',
  onSuccess,
  onError,
  onCancel,
  className,
  containerId = 'googlepay-button-container'
}: GooglePayButtonProps) {
  const { isReady } = usePayPalSDK();
  const { session, config, isEligible } = useGooglePay();
  const [paymentsClient, setPaymentsClient] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Build default transaction info
   */
  const getTransactionInfo = useCallback((): GooglePayTransactionInfo => {
    if (buildTransactionInfo) {
      return buildTransactionInfo(amount);
    }

    const totalAmount = parseFloat(amount);
    const subtotal = (totalAmount * 0.9).toFixed(2);
    const tax = (totalAmount * 0.1).toFixed(2);

    return {
      displayItems: [
        {
          label: 'Subtotal',
          type: 'SUBTOTAL',
          price: subtotal
        },
        {
          label: 'Tax',
          type: 'TAX',
          price: tax
        }
      ],
      countryCode,
      currencyCode: currency,
      totalPriceStatus: 'FINAL',
      totalPrice: amount,
      totalPriceLabel: 'Total'
    };
  }, [amount, currency, countryCode, buildTransactionInfo]);

  /**
   * Handle payment authorization
   */
  const onPaymentAuthorized = useCallback(async (paymentData: any) => {
    setIsProcessing(true);

    try {
      // Build order payload for PayPal
      const orderPayload: CreateOrderRequest = {
        intent: 'CAPTURE',
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount
            }
          }
        ],
        paymentSource: {
          googlePay: {
            attributes: {
              verification: {
                method: 'SCA_WHEN_REQUIRED'
              }
            }
          }
        }
      };

      // Create order
      const { id: orderId } = await createOrder(orderPayload);

      // Confirm order with Google Pay session
      if (session) {
        const { status } = await session.confirmOrder({
          orderId,
          paymentMethodData: paymentData.paymentMethodData
        });

        if (status !== 'PAYER_ACTION_REQUIRED') {
          // Capture the order
          const result = await captureOrder(orderId);
          
          if (onSuccess) {
            onSuccess(result);
          }
        }
      }

      return { transactionState: 'SUCCESS' };
      
    } catch (error) {
      console.error('Google Pay payment failed:', error);
      
      if (onError) {
        onError(error as Error);
      }
      
      return {
        transactionState: 'ERROR',
        error: {
          message: (error as Error).message
        }
      };
    } finally {
      setIsProcessing(false);
    }
  }, [amount, currency, createOrder, captureOrder, session, onSuccess, onError]);

  /**
   * Handle button click
   */
  const onGooglePayButtonClick = useCallback(async () => {
    if (!paymentsClient || !config || isProcessing) {
      return;
    }

    try {
      const paymentDataRequest = {
        apiVersion: config.apiVersion,
        apiVersionMinor: config.apiVersionMinor,
        allowedPaymentMethods: config.allowedPaymentMethods,
        merchantInfo: config.merchantInfo,
        transactionInfo: getTransactionInfo(),
        callbackIntents: ['PAYMENT_AUTHORIZATION']
      };

      await paymentsClient.loadPaymentData(paymentDataRequest);
      
    } catch (error) {
      if ((error as any).statusCode === 'CANCELED') {
        if (onCancel) {
          onCancel();
        }
      } else {
        console.error('Google Pay error:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    }
  }, [paymentsClient, config, isProcessing, getTransactionInfo, onCancel, onError]);

  /**
   * Initialize Google Pay
   */
  useEffect(() => {
    if (!isReady || !isEligible || !config || !window.google?.payments) {
      return;
    }

    const initializeGooglePay = async () => {
      try {
        // Create payments client
        const client = new google.payments.api.PaymentsClient({
          environment,
          paymentDataCallbacks: {
            onPaymentAuthorized
          }
        });

        // Check if ready to pay
        const isReadyToPay = await client.isReadyToPay({
          apiVersion: config.apiVersion,
          apiVersionMinor: config.apiVersionMinor,
          allowedPaymentMethods: config.allowedPaymentMethods
        });

        if (isReadyToPay.result) {
          setPaymentsClient(client);

          // Create button
          const container = document.getElementById(containerId);
          if (container) {
            // Clear existing button
            container.innerHTML = '';
            
            // Create new button
            const button = client.createButton({
              onClick: onGooglePayButtonClick,
              buttonType,
              buttonColor,
              buttonLocale,
              buttonSizeMode
            });
            
            container.appendChild(button);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Google Pay:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    };

    initializeGooglePay();
  }, [
    isReady,
    isEligible,
    config,
    environment,
    containerId,
    buttonType,
    buttonColor,
    buttonLocale,
    buttonSizeMode,
    onPaymentAuthorized,
    onGooglePayButtonClick,
    onError
  ]);

  if (!isEligible) {
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