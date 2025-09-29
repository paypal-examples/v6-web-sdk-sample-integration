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
    }
  }
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  type: string;
}
