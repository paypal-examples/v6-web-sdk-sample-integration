import type { PresentationMode } from './payment-methods';
import type { Order } from './orders';

/**
 * Data passed to onApprove callback
 */
export interface OnApproveData {
  /** Order ID */
  orderId: string;
  
  /** Payer ID */
  payerId?: string;
  
  /** Payment ID (for some payment methods) */
  paymentId?: string;
  
  /** Billing token (for saved payment methods) */
  billingToken?: string;
  
  /** Facilitator access token */
  facilitatorAccessToken?: string;
  
  /** Payment source */
  paymentSource?: string;
}

/**
 * Data passed to onCancel callback
 */
export interface OnCancelData {
  /** Order ID if available */
  orderId?: string;
}

/**
 * Data passed to onError callback
 */
export interface OnErrorData {
  /** Error message */
  message: string;
  
  /** Error code */
  code?: string;
  
  /** Debug ID for PayPal support */
  debugId?: string;
  
  /** Additional error details */
  details?: any[];
  
  /** Order ID if available */
  orderId?: string;
}

/**
 * Data passed to onShippingChange callback
 */
export interface OnShippingChangeData {
  /** Order ID */
  orderId: string;
  
  /** Selected shipping option */
  shippingOption?: {
    id: string;
    label: string;
    amount: {
      currencyCode: string;
      value: string;
    };
  };
  
  /** Shipping address */
  shippingAddress?: {
    city?: string;
    state?: string;
    countryCode: string;
    postalCode?: string;
  };
  
  /** Updated order details */
  orderDetails?: Partial<Order>;
}

/**
 * Return type for onShippingChange callback
 */
export interface OnShippingChangeReturn {
  /** Resolve the promise to continue */
  resolve?: () => void;
  
  /** Reject the promise with an error */
  reject?: (reason?: string) => void;
  
  /** Update the order with new details */
  patch?: () => Promise<void>;
}

/**
 * Data passed to onClick callback
 */
export interface OnClickData {
  /** Funding source clicked */
  fundingSource: string;
}

/**
 * Payment session options
 */
export interface PaymentSessionOptions {
  /** Called when the payment is approved */
  onApprove?: (data: OnApproveData) => void | Promise<void>;
  
  /** Called when the payment is cancelled */
  onCancel?: (data: OnCancelData) => void;
  
  /** Called when an error occurs */
  onError?: (error: Error | OnErrorData) => void;
  
  /** Called when shipping address or option changes */
  onShippingChange?: (data: OnShippingChangeData) => OnShippingChangeReturn | Promise<OnShippingChangeReturn>;
  
  /** Called when payment button is clicked */
  onClick?: (data: OnClickData) => void | Promise<void>;
  
  /** Called before payment initialization */
  onInit?: (data: any) => void | Promise<void>;
  
  /** Called when payment UI is closed */
  onClose?: () => void;
}

/**
 * Options for starting a payment session
 */
export interface StartSessionOptions {
  /** Presentation mode for the payment UI */
  presentationMode?: PresentationMode;
  
  /** Full page overlay configuration */
  fullPageOverlay?: {
    enabled?: boolean;
    backgroundColor?: string;
    opacity?: number;
  };
  
  /** Parent element for inline presentation */
  parentElement?: HTMLElement | string;
  
  /** Style configuration */
  style?: {
    height?: number;
    width?: number;
    borderRadius?: number;
  };
}

/**
 * Order promise passed to session start
 */
export interface OrderPromise {
  orderId: string;
}

/**
 * Payment session interface
 */
export interface PaymentSession {
  /** Start the payment session */
  start(
    options: StartSessionOptions,
    orderPromise: Promise<OrderPromise>
  ): Promise<void>;
  
  /** Cancel the current session */
  cancel(): void;
  
  /** Destroy the session and clean up */
  destroy(): void;
  
  /** Check if session is active */
  isActive(): boolean;
}

/**
 * Event types for SDK events
 */
export enum SdkEventType {
  READY = 'ready',
  LOADED = 'loaded',
  ERROR = 'error',
  PAYMENT_APPROVED = 'payment_approved',
  PAYMENT_CANCELLED = 'payment_cancelled',
  PAYMENT_ERROR = 'payment_error',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended'
}

/**
 * SDK event
 */
export interface SdkEvent {
  /** Event type */
  type: SdkEventType;
  
  /** Event payload */
  payload?: any;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Event listener function
 */
export type EventListener = (event: SdkEvent) => void;

/**
 * Event emitter interface
 */
export interface EventEmitter {
  /** Add event listener */
  on(event: SdkEventType, listener: EventListener): void;
  
  /** Remove event listener */
  off(event: SdkEventType, listener: EventListener): void;
  
  /** Add one-time event listener */
  once(event: SdkEventType, listener: EventListener): void;
  
  /** Emit an event */
  emit(event: SdkEventType, payload?: any): void;
  
  /** Remove all listeners for an event */
  removeAllListeners(event?: SdkEventType): void;
}