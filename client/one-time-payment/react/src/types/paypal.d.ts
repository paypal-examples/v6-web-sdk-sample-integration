// src/types/paypal.d.ts
declare global {
  interface Window {
      paypal: unknown;
  }
}

declare module 'react' {
  namespace JSX {
      interface IntrinsicElements {
          "paypal-button": ButtonProps,
          "venmo-button": ButtonProps
      }
  }
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
}

export type PaymentSessionOptions = {
  onApprove?: (data: OnApproveData) => Promise<void>;
  onCancel?: (data?: { orderId: string; }) => void;
  onError?: (data: Error) => void;
};

type OnApproveData = {
  orderId: string;
  payerId: string;
  billingToken?: string;
}

type CreateInstanceOutput = {
  // "paypal-payments" component
  createPayPalOneTimePaymentSession?: (paymentSessionOptions: PaymentSessionInput) => SessionOutput;
  // "venmo-payments" component
  createVenmoOneTimePaymentSession?: (paymentSessionOptions: PaymentSessionInput) => SessionOutput;
};

type SessionOutput = {
  start: (options: StartSessionInput, orderIdPromise: Promise<{ orderId: string }>) => Promise<void>
  destroy: () => void;
  cancel: () => void;
}

type StartSessionInput = {
  // note that Venmo only supports "auto"
  // we plan to update Venmo to support "popup" and "modal"
  presentationMode?: "auto" | "popup" | "modal" | "payment-handler";
  fullPageOverlay?: {
    enabled?: boolean;
  };
}