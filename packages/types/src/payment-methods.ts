/**
 * Supported payment methods
 */
export enum PaymentMethod {
  PAYPAL = 'paypal',
  VENMO = 'venmo',
  PAYLATER = 'paylater',
  CREDIT = 'credit',
  GOOGLE_PAY = 'googlepay',
  APPLE_PAY = 'applepay',
  CARD = 'card',
  IDEAL = 'ideal',
  SEPA = 'sepa',
  BANCONTACT = 'bancontact',
  GIROPAY = 'giropay',
  SOFORT = 'sofort',
  EPS = 'eps',
  MYBANK = 'mybank',
  P24 = 'p24',
  BLIK = 'blik'
}

/**
 * Presentation modes for payment UI
 */
export enum PresentationMode {
  AUTO = 'auto',
  POPUP = 'popup',
  MODAL = 'modal',
  PAYMENT_HANDLER = 'payment-handler',
  REDIRECT = 'redirect',
  INLINE = 'inline'
}

/**
 * Google Pay configuration
 */
export interface GooglePayConfig {
  /** API version for Google Pay */
  apiVersion: number;
  
  /** API version minor */
  apiVersionMinor: number;
  
  /** Allowed payment methods for Google Pay */
  allowedPaymentMethods: GooglePayPaymentMethod[];
  
  /** Merchant information */
  merchantInfo: GooglePayMerchantInfo;
  
  /** Country code */
  countryCode: string;
  
  /** Environment (TEST or PRODUCTION) */
  environment?: 'TEST' | 'PRODUCTION';
}

/**
 * Google Pay payment method configuration
 */
export interface GooglePayPaymentMethod {
  /** Type of payment method */
  type: 'CARD';
  
  /** Parameters for the payment method */
  parameters: {
    allowedAuthMethods: string[];
    allowedCardNetworks: string[];
    billingAddressRequired?: boolean;
    billingAddressParameters?: {
      format?: 'MIN' | 'FULL';
      phoneNumberRequired?: boolean;
    };
  };
  
  /** Tokenization specification */
  tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY';
    parameters: {
      gateway: string;
      gatewayMerchantId: string;
    };
  };
}

/**
 * Google Pay merchant information
 */
export interface GooglePayMerchantInfo {
  /** Merchant ID */
  merchantId?: string;
  
  /** Merchant name */
  merchantName: string;
}

/**
 * Google Pay transaction info
 */
export interface GooglePayTransactionInfo {
  /** Currency code */
  currencyCode: string;
  
  /** Country code */
  countryCode: string;
  
  /** Total price status */
  totalPriceStatus: 'FINAL' | 'ESTIMATED';
  
  /** Total price */
  totalPrice: string;
  
  /** Total price label */
  totalPriceLabel?: string;
  
  /** Display items */
  displayItems?: Array<{
    label: string;
    type: 'LINE_ITEM' | 'SUBTOTAL' | 'TAX' | 'DISCOUNT';
    price: string;
  }>;
  
  /** Checkout option */
  checkoutOption?: 'DEFAULT' | 'COMPLETE_IMMEDIATE_PURCHASE';
}

/**
 * Apple Pay configuration
 */
export interface ApplePayConfig {
  /** Country code */
  countryCode: string;
  
  /** Currency code */
  currencyCode: string;
  
  /** Merchant capabilities */
  merchantCapabilities: string[];
  
  /** Supported networks */
  supportedNetworks: string[];
  
  /** Apple Pay version */
  version: number;
}

/**
 * Card details for saved payment methods
 */
export interface CardDetails {
  /** Last 4 digits of card number */
  lastDigits: string;
  
  /** Card brand (VISA, MASTERCARD, etc.) */
  brand: string;
  
  /** Card type (CREDIT, DEBIT) */
  type?: 'CREDIT' | 'DEBIT';
  
  /** Expiry month (MM) */
  expiryMonth?: string;
  
  /** Expiry year (YYYY) */
  expiryYear?: string;
}

/**
 * Saved payment method
 */
export interface SavedPaymentMethod {
  /** Unique identifier for the payment method */
  id: string;
  
  /** Type of payment method */
  type: PaymentMethod;
  
  /** Card details if applicable */
  cardDetails?: CardDetails;
  
  /** Email associated with PayPal/Venmo */
  email?: string;
  
  /** Whether this is the default payment method */
  isDefault?: boolean;
}