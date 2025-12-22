// src/types/paypal.d.ts

import type {
  CreateInstanceOptions,
  SdkInstance,
} from "@paypal/react-paypal-js/sdk-v6";

declare global {
  interface Window {
    paypal: {
      createInstance: (
        createInstanceOptions: CreateInstanceOptions,
      ) => Promise<SdkInstance>;
    };
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": ButtonProps;
      "venmo-button": ButtonProps;
      "paypal-credit-button": PayPalCreditButtonProps;
      "paypal-pay-later-button": PayLaterButtonProps;
      "paypal-basic-card-button": PayPalBasicCardButtonProps;
      "paypal-basic-card-container": React.HTMLAttributes<HTMLElement>;
      "paypal-message": PayPalMessagesElement;
    }
  }
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
}

interface PayLaterButtonProps extends React.HTMLAttributes<HTMLElement> {
  countryCode: string;
  productCode: string;
}

interface PayPalBasicCardButtonProps extends React.HTMLAttributes<HTMLElement> {
  buyerCountry: string;
  ref?: React.Ref<HTMLElement>;
}

interface PayPalCreditButtonProps extends React.HTMLAttributes<HTMLElement> {
  countryCode?: string;
}

export interface PayPalMessagesElement extends React.HTMLAttributes<HTMLElement> {
  amount?: string;
  "auto-bootstrap"?: boolean;
  "buyer-country"?: string;
  "currency-code"?: string;
  "logo-position"?: "INLINE" | "LEFT" | "RIGHT" | "TOP";
  "logo-type"?: "MONOGRAM" | "WORDMARK";
  "offer-types"?: string; // UserOfferTypes
  "presentation-mode"?: "AUTO" | "MODAL" | "POPUP" | "REDIRECT";
  ref?: React.Ref<PayPalMessagesElement>;
  "text-color"?: "BLACK" | "MONOCHROME" | "WHITE";

  // Event handlers for custom events
  onPaypalMessageClick?: (event: CustomEvent<{
    config: {
      amount?: string;
      buyerCountry?: string;
      clickUrl?: string;
      offerType?: string;
    }
  }>) => void;

  onPaypalMessageAttributeChange?: (event: CustomEvent<{
    changedProperties: string[];
    config: {
      amount?: string;
      buyerCountry?: string;
      currencyCode?: string;
      logoPosition?: string;
      logoType?: string;
      offerTypes?: string;
      textColor?: string;
    }
  }>) => void;

  setContent?: (content: Record<string, unknown>) => void
}
