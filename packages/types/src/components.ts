/**
 * SDK components that can be loaded
 */
export type Component = 
  | 'paypal-payments'
  | 'venmo-payments'
  | 'googlepay-payments'
  | 'applepay-payments'
  | 'card-payments'
  | 'ideal-payments'
  | 'sepa-payments'
  | 'bancontact-payments'
  | 'giropay-payments'
  | 'sofort-payments'
  | 'eps-payments'
  | 'mybank-payments'
  | 'p24-payments'
  | 'blik-payments'
  | 'fastlane'
  | 'messages';

/**
 * Page types for SDK initialization
 */
export type PageType =
  | 'cart'
  | 'checkout'
  | 'home'
  | 'mini-cart'
  | 'product-details'
  | 'product-listing'
  | 'search-results'
  | 'billing'
  | 'payment'
  | 'order-confirmation';

/**
 * Button style configuration
 */
export interface ButtonStyle {
  /** Button color */
  color?: 'gold' | 'blue' | 'black' | 'white' | 'silver';
  
  /** Button shape */
  shape?: 'rect' | 'pill';
  
  /** Button size */
  size?: 'small' | 'medium' | 'large' | 'responsive';
  
  /** Button label */
  label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment' | 'subscribe' | 'donate';
  
  /** Button layout */
  layout?: 'vertical' | 'horizontal';
  
  /** Button height (25-55) */
  height?: number;
  
  /** Show tagline */
  tagline?: boolean;
}

/**
 * PayPal button props for React/Vue components
 */
export interface PayPalButtonProps {
  /** Button type */
  type?: 'pay' | 'buynow' | 'checkout' | 'donate' | 'subscribe';
  
  /** Button style */
  style?: ButtonStyle;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Custom class name */
  className?: string;
  
  /** Custom ID */
  id?: string;
}

/**
 * Venmo button props
 */
export interface VenmoButtonProps extends PayPalButtonProps {
  /** Venmo specific style */
  style?: ButtonStyle & {
    color?: 'blue' | 'white' | 'black';
  };
}

/**
 * Messages component configuration
 */
export interface MessagesConfig {
  /** Amount for the message */
  amount?: number | string;
  
  /** Currency */
  currency?: string;
  
  /** Style configuration */
  style?: {
    layout?: 'text' | 'flex' | 'custom';
    logo?: {
      type?: 'primary' | 'alternative' | 'inline' | 'none';
      position?: 'left' | 'right' | 'top';
    };
    text?: {
      color?: 'black' | 'white' | 'monochrome' | 'grayscale';
      size?: number;
      align?: 'left' | 'center' | 'right';
    };
    color?: 'blue' | 'black' | 'white' | 'gray' | 'monochrome' | 'grayscale';
    ratio?: '1x1' | '1x4' | '8x1' | '20x1' | 'custom';
  };
  
  /** Placement on the page */
  placement?: 'home' | 'category' | 'product' | 'cart' | 'payment';
  
  /** Offer type */
  offer?: 'PAY_LATER_LONG_TERM' | 'PAY_LATER_SHORT_TERM' | 'PAY_LATER_PAY_IN_1';
  
  /** Buyer country */
  buyerCountry?: string;
  
  /** Ignore cache */
  ignoreCache?: boolean;
  
  /** On click handler */
  onClick?: () => void;
  
  /** On apply handler */
  onApply?: () => void;
  
  /** On render handler */
  onRender?: () => void;
}

/**
 * Fastlane component configuration
 */
export interface FastlaneConfig {
  /** Show card form */
  showCardForm?: boolean;
  
  /** Show saved cards */
  showSavedCards?: boolean;
  
  /** Style configuration */
  style?: {
    root?: Record<string, string>;
    input?: Record<string, string>;
    button?: Record<string, string>;
    label?: Record<string, string>;
    error?: Record<string, string>;
  };
  
  /** Locale */
  locale?: string;
  
  /** Placeholder text */
  placeholders?: {
    cardNumber?: string;
    expirationDate?: string;
    cvv?: string;
    postalCode?: string;
  };
}

/**
 * Custom element definitions for HTML
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'paypal-button': PayPalButtonProps & React.HTMLAttributes<HTMLElement>;
      'venmo-button': VenmoButtonProps & React.HTMLAttributes<HTMLElement>;
      'paypal-pay-later-button': PayPalButtonProps & React.HTMLAttributes<HTMLElement>;
      'paypal-credit-button': PayPalButtonProps & React.HTMLAttributes<HTMLElement>;
      'paypal-messages': MessagesConfig & React.HTMLAttributes<HTMLElement>;
    }
  }
}