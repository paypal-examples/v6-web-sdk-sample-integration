import React, { useState, useEffect, createContext } from "react";
import { EligiblePaymentMethods, SdkInstance } from "../types/paypal";

interface PayPalSDKContextProps {
  isReady: boolean;
  eligiblePaymentMethods: EligiblePaymentMethods | null;
  sdkInstance: SdkInstance | null;
}

const initialContext: PayPalSDKContextProps = {
  isReady: false,
  eligiblePaymentMethods: null,
  sdkInstance: null,
};

interface PayPalSDKProviderProps {
  components: string[],
  children: React.ReactNode,
  pageType: string,
  clientToken?: string,
}

export const PayPalSDKContext =
  createContext<PayPalSDKContextProps>(initialContext);

export const PayPalSDKProvider: React.FC<PayPalSDKProviderProps> = ({
  clientToken,
  components,
  children,
  pageType
}) => {
  const [isSDKReady, setIsSDKReady] = useState<boolean>(false);
  const [sdkInstance, setSdkInstance] = useState<SdkInstance | null>(null);
  const [eligiblePaymentMethods, setEligiblePaymentMethods] = useState<EligiblePaymentMethods | null>(null);

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
        const { sdkInstance, eligiblePaymentMethods } = await initSdkInstance();
        setSdkInstance(sdkInstance);
        setEligiblePaymentMethods(eligiblePaymentMethods);
        setIsSDKReady(true);
      }
    };

    loadPayPalSDK();
  }, [clientToken]);

  return (
    <PayPalSDKContext.Provider
      value={{
        isReady: isSDKReady,
        sdkInstance,
        eligiblePaymentMethods,
      }}
    >
      {children}
    </PayPalSDKContext.Provider>
  );
};
