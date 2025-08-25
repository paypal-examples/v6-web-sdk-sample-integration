import { SdkInstance, CreateInstanceOptions } from "@paypal/paypal-js/sdk-v6";

declare global {
  interface Window {
    paypal: {
      createInstance: (
        createInstanceOptions: CreateInstanceOptions,
      ) => Promise<SdkInstance>;
    };
  }
}

export {};