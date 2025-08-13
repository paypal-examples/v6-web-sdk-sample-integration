import type { PaymentSessionOptions, PaymentSession } from './callbacks';
import type { Component, PageType } from './components';
import type { GooglePayConfig } from './payment-methods';

/**
 * Options for creating a PayPal SDK instance
 */
export interface CreateInstanceOptions {
  /** Browser-safe client token obtained from the server */
  clientToken: string;
  
  /** Components to load with the SDK */
  components?: Component[];
  
  /** Type of page where SDK is being loaded */
  pageType?: PageType;
  
  /** Locale for the SDK (e.g., 'en_US') */
  locale?: string;
  
  /** Partner attribution ID */
  partnerAttributionId?: string;
  
  /** Client metadata ID for tracking */
  clientMetadataId?: string;
}

/**
 * Options for finding eligible payment methods
 */
export interface FindEligibleMethodsOptions {
  /** Currency code (e.g., 'USD') */
  currencyCode?: string;
  
  /** Country code (e.g., 'US') */
  countryCode?: string;
  
  /** Total amount for the transaction */
  amount?: string | number;
}

/**
 * Payment method details returned by eligibility check
 */
export interface PaymentMethodDetails {
  /** Product code for pay later options */
  productCode?: string;
  
  /** Country code where method is available */
  countryCode?: string;
  
  /** Display name of the payment method */
  displayName?: string;
  
  /** Whether the method is enabled */
  enabled: boolean;
}

/**
 * Eligible payment methods interface
 */
export interface EligiblePaymentMethods {
  /** Check if a payment method is eligible */
  isEligible(paymentMethod: string): boolean;
  
  /** Get details for a specific payment method */
  getDetails(paymentMethod: string): PaymentMethodDetails | null;
  
  /** Get all eligible payment methods */
  getAllEligible(): string[];
}

/**
 * Main PayPal SDK instance
 */
export interface SdkInstance {
  /** Create a one-time PayPal payment session */
  createPayPalOneTimePaymentSession(options: PaymentSessionOptions): PaymentSession;
  
  /** Create a one-time Venmo payment session */
  createVenmoOneTimePaymentSession(options: PaymentSessionOptions): PaymentSession;
  
  /** Create a one-time Pay Later payment session */
  createPayLaterOneTimePaymentSession(options: PaymentSessionOptions): PaymentSession;
  
  /** Create a one-time PayPal Credit payment session */
  createPayPalCreditOneTimePaymentSession(options: PaymentSessionOptions): PaymentSession;
  
  /** Create a one-time Google Pay payment session */
  createGooglePayOneTimePaymentSession(): GooglePaySession;
  
  /** Create a one-time Apple Pay payment session */
  createApplePayOneTimePaymentSession(options: PaymentSessionOptions): ApplePaySession;
  
  /** Create a saved payment method session */
  createSavedPaymentMethodSession(options: PaymentSessionOptions): PaymentSession;
  
  /** Find eligible payment methods */
  findEligibleMethods(options: FindEligibleMethodsOptions): Promise<EligiblePaymentMethods>;
  
  /** Destroy the SDK instance and clean up */
  destroy(): void;
}

/**
 * Google Pay specific session interface
 */
export interface GooglePaySession {
  /** Get Google Pay configuration */
  getGooglePayConfig(): Promise<GooglePayConfig>;
  
  /** Confirm an order with Google Pay */
  confirmOrder(options: {
    orderId: string;
    paymentMethodData: any;
  }): Promise<{ status: string }>;
}

/**
 * Apple Pay specific session interface
 */
export interface ApplePaySession extends PaymentSession {
  /** Get Apple Pay configuration */
  getApplePayConfig(): Promise<any>;
  
  /** Validate merchant session */
  validateMerchant(validationURL: string): Promise<any>;
}

/**
 * Global PayPal object attached to window
 */
export interface PayPalGlobal {
  /** Create a new SDK instance */
  createInstance(options: CreateInstanceOptions): Promise<SdkInstance>;
  
  /** SDK version */
  version?: string;
  
  /** Check if SDK is loaded */
  isLoaded?: boolean;
}

/**
 * Extend Window interface with PayPal
 */
declare global {
  interface Window {
    paypal: PayPalGlobal;
  }
}