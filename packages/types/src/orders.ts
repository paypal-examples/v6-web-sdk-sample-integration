/**
 * Order intent
 */
export enum OrderIntent {
  CAPTURE = 'CAPTURE',
  AUTHORIZE = 'AUTHORIZE'
}

/**
 * Order status
 */
export enum OrderStatus {
  CREATED = 'CREATED',
  SAVED = 'SAVED',
  APPROVED = 'APPROVED',
  VOIDED = 'VOIDED',
  COMPLETED = 'COMPLETED',
  PAYER_ACTION_REQUIRED = 'PAYER_ACTION_REQUIRED'
}

/**
 * Currency codes
 */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | string;

/**
 * Money amount
 */
export interface Amount {
  /** Currency code */
  currencyCode: CurrencyCode;
  
  /** Value as string to preserve precision */
  value: string;
  
  /** Breakdown of amount */
  breakdown?: AmountBreakdown;
}

/**
 * Amount breakdown
 */
export interface AmountBreakdown {
  /** Item total */
  itemTotal?: Money;
  
  /** Shipping cost */
  shipping?: Money;
  
  /** Tax amount */
  taxTotal?: Money;
  
  /** Handling fee */
  handling?: Money;
  
  /** Insurance cost */
  insurance?: Money;
  
  /** Shipping discount */
  shippingDiscount?: Money;
  
  /** Discount amount */
  discount?: Money;
}

/**
 * Simple money object
 */
export interface Money {
  /** Currency code */
  currencyCode: CurrencyCode;
  
  /** Value as string */
  value: string;
}

/**
 * Item in a purchase
 */
export interface Item {
  /** Item name */
  name: string;
  
  /** Item description */
  description?: string;
  
  /** SKU */
  sku?: string;
  
  /** Unit amount */
  unitAmount: Money;
  
  /** Quantity */
  quantity: string;
  
  /** Category */
  category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS' | 'DONATION';
  
  /** Tax amount */
  tax?: Money;
}

/**
 * Shipping address
 */
export interface ShippingAddress {
  /** Address line 1 */
  addressLine1?: string;
  
  /** Address line 2 */
  addressLine2?: string;
  
  /** Admin area 2 (city) */
  adminArea2?: string;
  
  /** Admin area 1 (state/province) */
  adminArea1?: string;
  
  /** Postal code */
  postalCode?: string;
  
  /** Country code */
  countryCode: string;
}

/**
 * Shipping option
 */
export interface ShippingOption {
  /** Unique ID for this option */
  id: string;
  
  /** Label for the option */
  label: string;
  
  /** Whether this is the selected option */
  selected: boolean;
  
  /** Shipping amount */
  amount: Money;
  
  /** Type of shipping */
  type?: 'SHIPPING' | 'PICKUP';
}

/**
 * Purchase unit
 */
export interface PurchaseUnit {
  /** Reference ID */
  referenceId?: string;
  
  /** Amount for this purchase unit */
  amount: Amount;
  
  /** Items in this purchase unit */
  items?: Item[];
  
  /** Shipping information */
  shipping?: {
    name?: {
      fullName?: string;
    };
    address?: ShippingAddress;
    options?: ShippingOption[];
  };
  
  /** Description */
  description?: string;
  
  /** Custom ID */
  customId?: string;
  
  /** Invoice ID */
  invoiceId?: string;
  
  /** Soft descriptor */
  softDescriptor?: string;
}

/**
 * Payer information
 */
export interface Payer {
  /** Payer ID */
  payerId?: string;
  
  /** Email address */
  email?: string;
  
  /** Name */
  name?: {
    givenName?: string;
    surname?: string;
  };
  
  /** Phone number */
  phone?: {
    phoneType?: 'FAX' | 'HOME' | 'MOBILE' | 'OTHER' | 'PAGER';
    phoneNumber?: {
      nationalNumber?: string;
    };
  };
  
  /** Birth date */
  birthDate?: string;
  
  /** Tax info */
  taxInfo?: {
    taxId?: string;
    taxIdType?: string;
  };
  
  /** Address */
  address?: ShippingAddress;
}

/**
 * Payment source
 */
export interface PaymentSource {
  /** PayPal payment */
  paypal?: {
    emailAddress?: string;
    accountId?: string;
    accountStatus?: string;
    name?: {
      givenName?: string;
      surname?: string;
    };
    phoneNumber?: {
      nationalNumber?: string;
    };
    address?: ShippingAddress;
    attributes?: {
      vault?: {
        storeInVault?: 'ON_SUCCESS';
        description?: string;
        usagePattern?: 'IMMEDIATE' | 'DEFERRED';
        usageType?: 'MERCHANT' | 'PLATFORM' | 'FIRST' | 'SUBSEQUENT';
        customerType?: 'CONSUMER' | 'BUSINESS';
        permitMultiplePaymentTokens?: boolean;
      };
    };
  };
  
  /** Venmo payment */
  venmo?: {
    emailAddress?: string;
    accountId?: string;
    userName?: string;
    name?: {
      givenName?: string;
      surname?: string;
    };
    phoneNumber?: {
      nationalNumber?: string;
    };
    address?: ShippingAddress;
    attributes?: {
      vault?: {
        storeInVault?: 'ON_SUCCESS';
        description?: string;
        usagePattern?: 'IMMEDIATE' | 'DEFERRED';
        usageType?: 'MERCHANT' | 'PLATFORM' | 'FIRST' | 'SUBSEQUENT';
        customerType?: 'CONSUMER' | 'BUSINESS';
        permitMultiplePaymentTokens?: boolean;
      };
    };
  };
  
  /** Google Pay payment */
  googlePay?: {
    name?: string;
    emailAddress?: string;
    phoneNumber?: {
      countryCode?: string;
      nationalNumber?: string;
    };
    card?: {
      name?: string;
      lastDigits?: string;
      type?: 'CREDIT' | 'DEBIT' | 'UNKNOWN';
      brand?: string;
      billingAddress?: ShippingAddress;
    };
    attributes?: {
      verification?: {
        method?: 'SCA_WHEN_REQUIRED' | 'SCA_ALWAYS';
      };
    };
  };
  
  /** Apple Pay payment */
  applePay?: {
    id?: string;
    name?: string;
    emailAddress?: string;
    phoneNumber?: {
      countryCode?: string;
      nationalNumber?: string;
    };
    card?: {
      name?: string;
      lastDigits?: string;
      type?: 'CREDIT' | 'DEBIT' | 'UNKNOWN';
      brand?: string;
      billingAddress?: ShippingAddress;
    };
  };
  
  /** Card payment */
  card?: {
    id?: string;
    name?: string;
    number?: string;
    lastDigits?: string;
    expiry?: string;
    securityCode?: string;
    type?: 'CREDIT' | 'DEBIT' | 'UNKNOWN';
    brand?: string;
    billingAddress?: ShippingAddress;
    attributes?: {
      vault?: {
        storeInVault?: 'ON_SUCCESS';
      };
      verification?: {
        method?: 'SCA_WHEN_REQUIRED' | 'SCA_ALWAYS' | 'AVS_AND_CVV' | 'CVV' | 'AVS';
      };
    };
  };
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
  /** Order intent */
  intent: OrderIntent;
  
  /** Purchase units */
  purchaseUnits: PurchaseUnit[];
  
  /** Payment source */
  paymentSource?: PaymentSource;
  
  /** Payer information */
  payer?: Payer;
  
  /** Application context */
  applicationContext?: ApplicationContext;
}

/**
 * Application context
 */
export interface ApplicationContext {
  /** Brand name */
  brandName?: string;
  
  /** Locale */
  locale?: string;
  
  /** Landing page */
  landingPage?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
  
  /** Shipping preference */
  shippingPreference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
  
  /** User action */
  userAction?: 'CONTINUE' | 'PAY_NOW';
  
  /** Payment method preference */
  paymentMethodPreference?: 'IMMEDIATE_PAYMENT_REQUIRED' | 'UNRESTRICTED';
  
  /** Return URL */
  returnUrl?: string;
  
  /** Cancel URL */
  cancelUrl?: string;
  
  /** Stored payment source */
  storedPaymentSource?: {
    paymentInitiator?: 'CUSTOMER' | 'MERCHANT';
    paymentType?: 'ONE_TIME' | 'RECURRING' | 'UNSCHEDULED';
    usage?: 'FIRST' | 'SUBSEQUENT' | 'DERIVED';
    previousTransactionReference?: string;
  };
}

/**
 * Order response
 */
export interface Order {
  /** Order ID */
  id: string;
  
  /** Order status */
  status: OrderStatus;
  
  /** Order intent */
  intent: OrderIntent;
  
  /** Purchase units */
  purchaseUnits: PurchaseUnit[];
  
  /** Payer information */
  payer?: Payer;
  
  /** Payment source */
  paymentSource?: PaymentSource;
  
  /** Create time */
  createTime?: string;
  
  /** Update time */
  updateTime?: string;
  
  /** Links */
  links?: Array<{
    href: string;
    rel: string;
    method?: string;
  }>;
}

/**
 * Capture order response
 */
export interface CaptureOrderResponse extends Order {
  /** Purchase units with capture details */
  purchaseUnits: Array<PurchaseUnit & {
    payments?: {
      captures?: Array<{
        id: string;
        status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
        amount: Money;
        finalCapture?: boolean;
        sellerProtection?: {
          status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
          disputeCategories?: string[];
        };
        sellerReceivableBreakdown?: {
          grossAmount: Money;
          paypalFee?: Money;
          netAmount: Money;
        };
        createTime?: string;
        updateTime?: string;
      }>;
    };
  }>;
}