// src/types/paypal.d.ts
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.HTMLAttributes<HTMLElement> & {
        type?: string;
      };
      "venmo-button": React.HTMLAttributes<HTMLElement> & {
        type?: string;
      };
      "paypal-pay-later-button": React.HTMLAttributes<HTMLElement> & {
        countryCode?: string;
        productCode?: string;
        type?: string;
      };
      "paypal-basic-card-button": React.HTMLAttributes<HTMLElement> & {
        type?: string;
      };
      "paypal-basic-card-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export type PaymentSessionOptions = {
  onApprove?: (data: OnApproveData) => Promise<void>;
  onCancel?: (data?: { orderId: string }) => void;
  onError?: (data: Error) => void;
};

export type OnApproveData = {
  orderId: string;
  payerId: string;
};

