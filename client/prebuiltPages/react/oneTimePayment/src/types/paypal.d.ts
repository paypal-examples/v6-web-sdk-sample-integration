// src/types/paypal.d.ts
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
    }
  }
}

export type Component = "paypal-payments" | "venmo-payments" | "card-fields";
export type PageType =
  | "cart"
  | "checkout"
  | "mini-cart"
  | "product-details"
  | "product-listing"
  | "search-results";

type CreateInstanceOptions = {
  clientMetadataId?: string;
  clientToken: string;
  components?: Component[];
  locale?: string;
  pageType?: PageType;
  partnerAttributionId?: string;
};

export interface EligiblePaymentMethods {
  isEligible: (paymentMethod: string) => boolean;
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
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
  // "paypal-payments" component
  createPayPalOneTimePaymentSession: (
    paymentSessionOptions: PaymentSessionOptions,
  ) => SessionOutput;
  // "venmo-payments" component
  createVenmoOneTimePaymentSession: (
    paymentSessionOptions: PaymentSessionOptions,
  ) => SessionOutput;
  // "card-fields" component
  createCardFieldsOneTimePaymentSession: () => CardFieldsSessionOutput;
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

type CardFieldsSessionOutput = {
  createCardFieldsComponent: (config: {
    type: "number" | "expiry" | "cvv",
    placeholder: string,
  }) => HTMLElement;
};

type StartSessionInput = {
  presentationMode?: "auto" | "popup" | "modal" | "payment-handler";
  fullPageOverlay?: {
    enabled?: boolean;
  };
};
