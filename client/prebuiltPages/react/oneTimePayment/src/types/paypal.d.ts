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
      "paypal-pay-later-button": PayLaterButtonProps;
      "venmo-button": ButtonProps;
    }
  }
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
}

interface PayLaterButtonElementProps extends ButtonProps {
  countryCode: string;
  productCode: string;
}

export type PaymentSessionOptions = {
  onApprove?: (data: OnApproveData) => Promise<void>;
  onCancel?: (data?: { orderId: string }) => void;
  onError?: (data: Error) => void;
};

type OnApproveData = {
  orderId: string;
  payerId: string;
};

export type SdkInstance = {
  createPayLaterOneTimePaymentSession: (
    paymentSessionOptions: PaymentSessionOptions,
  ) => SessionOutput;
  // "paypal-payments" component
  createPayPalOneTimePaymentSession: (
    paymentSessionOptions: PaymentSessionOptions,
  ) => SessionOutput;
  // "venmo-payments" component
  createVenmoOneTimePaymentSession: (
    paymentSessionOptions: PaymentSessionOptions,
  ) => SessionOutput;
  findEligibleMethods: (
    findEligibleMethodsOptions: FindEligibleMethodsOptions,
  ) => Promise<EligiblePaymentMethods>;
};

type FindEligibleMethodsOptions = {
  currencyCode?: string;
};

type SessionOutput = {
  start: (
    options: StartSessionInput,
    orderIdPromise: Promise<{ orderId: string }>,
  ) => Promise<void>;
  destroy: () => void;
  cancel: () => void;
};

type StartSessionInput = {
  presentationMode?: "auto" | "popup" | "modal" | "payment-handler";
  fullPageOverlay?: {
    enabled?: boolean;
  };
};
