import React, { useEffect, useRef } from 'react';
import { usePayPalSDK } from '../context/PayPalSDKContext';
import { MessagesConfig } from '@paypal-v6/types';

/**
 * PayPal Messages props
 */
export interface PayPalMessagesProps extends MessagesConfig {
  /** Custom class name */
  className?: string;
  
  /** Container style */
  containerStyle?: React.CSSProperties;
}

/**
 * PayPal Messages component
 */
export function PayPalMessages({
  amount,
  currency,
  style,
  placement = 'payment',
  offer,
  buyerCountry,
  ignoreCache,
  onClick,
  onApply,
  onRender,
  className,
  containerStyle
}: PayPalMessagesProps) {
  const { isReady } = usePayPalSDK();
  const messagesRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isReady || !messagesRef.current) {
      return;
    }

    const messages = messagesRef.current as any;

    // Set properties
    if (amount !== undefined) messages.amount = amount;
    if (currency) messages.currency = currency;
    if (placement) messages.placement = placement;
    if (offer) messages.offer = offer;
    if (buyerCountry) messages.buyerCountry = buyerCountry;
    if (ignoreCache !== undefined) messages.ignoreCache = ignoreCache;

    // Set style
    if (style) {
      if (style.layout) messages.layout = style.layout;
      if (style.logo) {
        messages.logoType = style.logo.type;
        messages.logoPosition = style.logo.position;
      }
      if (style.text) {
        messages.textColor = style.text.color;
        messages.textSize = style.text.size;
        messages.textAlign = style.text.align;
      }
      if (style.color) messages.color = style.color;
      if (style.ratio) messages.ratio = style.ratio;
    }

    // Set event handlers
    if (onClick) {
      messages.addEventListener('click', onClick);
    }
    if (onApply) {
      messages.addEventListener('apply', onApply);
    }
    if (onRender) {
      messages.addEventListener('render', onRender);
    }

    // Cleanup
    return () => {
      if (onClick) {
        messages.removeEventListener('click', onClick);
      }
      if (onApply) {
        messages.removeEventListener('apply', onApply);
      }
      if (onRender) {
        messages.removeEventListener('render', onRender);
      }
    };
  }, [
    isReady,
    amount,
    currency,
    style,
    placement,
    offer,
    buyerCountry,
    ignoreCache,
    onClick,
    onApply,
    onRender
  ]);

  if (!isReady) {
    return null;
  }

  return (
    <div className={className} style={containerStyle}>
      <paypal-messages ref={messagesRef} />
    </div>
  );
}