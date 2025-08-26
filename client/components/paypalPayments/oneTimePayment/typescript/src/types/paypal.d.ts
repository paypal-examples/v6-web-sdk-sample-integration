import type { PayPalV6Namespace, SdkInstance, CreateInstanceOptions } from "@paypal/paypal-js/sdk-v6";

declare global {
  interface Window {
    paypal: PayPalV6Namespace;
  }
}

export {};