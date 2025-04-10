import React, { useState, useEffect, createContext } from "react";
import { EligiblePaymentMethods, SdkInstance } from "../types/paypal";
import { useErrorBoundary } from "react-error-boundary";

interface PayPalSDKContextProps {
  eligiblePaymentMethods: EligiblePaymentMethods | null;
  sdkInstance: SdkInstance | null;
}

const initialContext: PayPalSDKContextProps = {
  eligiblePaymentMethods: null,
  sdkInstance: null,
};

interface PayPalSDKProviderProps {
  components: string[];
  children: React.ReactNode;
  pageType: string;
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

  const initSdkInstance = async () => {
    const sdkInstance: SdkInstance = await window.paypal.createInstance({
      clientToken,
      components,
      pageType,
    });

    const eligiblePaymentMethods = await sdkInstance.findEligibleMethods({
      currency: "USD",
    });

    return {
      sdkInstance,
      eligiblePaymentMethods,
    };
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      if (!sdkInstance && clientToken) {
        try {
          const { sdkInstance, eligiblePaymentMethods } =
            await initSdkInstance();
          setSdkInstance(sdkInstance);
          setEligiblePaymentMethods(eligiblePaymentMethods);
        } catch (error) {
          showBoundary(error);
        }
      }
    };

    loadPayPalSDK();
  }, [clientToken]);

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
