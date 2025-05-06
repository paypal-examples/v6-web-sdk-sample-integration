import React, { useState, useEffect, createContext } from "react";
import { useErrorBoundary } from "react-error-boundary";

import type {
  Component,
  CreateInstanceOptions,
  EligiblePaymentMethods,
  PageType,
  SdkInstance,
} from "../types/paypal";

async function initSdkInstance({
  clientToken,
  components,
  pageType,
}: CreateInstanceOptions) {
  const sdkInstance = await window.paypal.createInstance({
    clientToken: clientToken!,
    components,
    pageType,
  });

  const eligiblePaymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: "USD",
  });

  return {
    sdkInstance,
    eligiblePaymentMethods,
  };
}

interface PayPalSDKContextProps {
  eligiblePaymentMethods: EligiblePaymentMethods | null;
  sdkInstance: SdkInstance | null;
}

const initialContext: PayPalSDKContextProps = {
  eligiblePaymentMethods: null,
  sdkInstance: null,
};

interface PayPalSDKProviderProps {
  components: Component[];
  children: React.ReactNode;
  pageType: PageType;
  clientToken?: string;
}

export const PayPalSDKContext =
  createContext<PayPalSDKContextProps>(initialContext);

export const PayPalSDKProvider: React.FC<PayPalSDKProviderProps> = ({
  clientToken,
  components,
  children,
  pageType,
}) => {
  const { showBoundary } = useErrorBoundary();
  const [sdkInstance, setSdkInstance] = useState<SdkInstance | null>(null);
  const [eligiblePaymentMethods, setEligiblePaymentMethods] =
    useState<EligiblePaymentMethods | null>(null);

  useEffect(() => {
    const loadPayPalSDK = async () => {
      if (!sdkInstance && clientToken) {
        try {
          const { sdkInstance, eligiblePaymentMethods } = await initSdkInstance(
            { clientToken, components, pageType },
          );
          setSdkInstance(sdkInstance);
          setEligiblePaymentMethods(eligiblePaymentMethods);
        } catch (error) {
          showBoundary(error);
        }
      }
    };

    loadPayPalSDK();
  }, [clientToken, pageType, components]);

  return (
    <PayPalSDKContext.Provider
      value={{
        sdkInstance,
        eligiblePaymentMethods,
      }}
    >
      {children}
    </PayPalSDKContext.Provider>
  );
};
