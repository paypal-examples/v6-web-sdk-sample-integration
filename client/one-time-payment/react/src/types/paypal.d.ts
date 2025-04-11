// src/types/paypal.d.ts
declare global {
  interface Window {
    paypal: {
      createInstance: (createInstanceOptions) => Promise<SdkInstance>;
    };
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": ButtonProps;
      "venmo-button": ButtonProps;
    }
  }
}

export interface EligiblePaymentMethods {
  isEligible: (paymentMethod: string) => boolean;
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
}

export type PaymentSessionOptions = {
  onApprove?: (data: OnApproveData) => Promise<void> | void;
  onCancel?: (data?: { orderId: string }) => void;
  onError?: (data: Error) => void;
};

type OnApproveData = {
  orderId: string;
  payerId: string;
  billingToken?: string;
};

export type SdkInstance = {
  // "paypal-payments" component
  createPayPalOneTimePaymentSession: (
    paymentSessionOptions: PaymentSessionOptions,
  ) => SessionOutput;
  // "venmo-payments" component
  createVenmoOneTimePaymentSession: (
    paymentSessionOptions: PaymentSessionOptions,
  ) => SessionOutput;
  findEligibleMethods: (options) => Promise<EligiblePaymentMethods>;
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
  // note that Venmo only supports "auto"
  // we plan to update Venmo to support "popup" and "modal"
  presentationMode?: "auto" | "popup" | "modal" | "payment-handler";
  fullPageOverlay?: {
    enabled?: boolean;
  };
};
