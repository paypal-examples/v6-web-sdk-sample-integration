import React, { useState, useEffect, createContext } from "react";
import { initSdkInstance } from "../components/utils";

interface PayPalSDKContextProps {
  isReady: boolean;
  paymentMethodEligibility: PaymentMethodEligibility;
  sdkError: any;
  sdkInstance: any;
}
interface PaymentMethodEligibility {
  isPayPalEligible: boolean;
  isVenmoEligible: boolean;
}

const initialContext: PayPalSDKContextProps = {
  isReady: false,
  paymentMethodEligibility: {
    isPayPalEligible: false,
    isVenmoEligible: false,
  },
  sdkError: null,
  sdkInstance: null
};

export const PayPalSDKContext =
  createContext<PayPalSDKContextProps>(initialContext);

export const PayPalSDKProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSDKReady, setIsSDKReady] = useState<boolean>(false);
  const [sdkInstance, setSdkInstance] = useState<unknown>(null);
  const [paymentMethodEligibility, setPaymentMethodEligibility] = useState<PaymentMethodEligibility>({
    isPayPalEligible: false,
    isVenmoEligible: false,
  });
  const [sdkError, setSdkError] = useState<any>(null);

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!window.paypal) {
          const script = document.createElement("script");
          script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = async () => {
            const { sdkInstance, isPayPalEligible, isVenmoEligible } =
              await initSdkInstance();
            setSdkInstance(sdkInstance);
            setPaymentMethodEligibility({
              ...paymentMethodEligibility,
              isPayPalEligible,
              isVenmoEligible,
            })
          };
          script.onerror = (e) => {
            setSdkError(e);
          };
          document.body.appendChild(script);
        } else {
          const { sdkInstance, isPayPalEligible, isVenmoEligible } =
            await initSdkInstance();
          setSdkInstance(sdkInstance);
          setPaymentMethodEligibility({
            ...paymentMethodEligibility,
            isPayPalEligible,
            isVenmoEligible,
          })
        }
        setIsSDKReady(true);
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
        setSdkError(e);
      }
    };

    loadPayPalSDK();
  }, []);

  useEffect(() => {
    if (sdkError) {
      throw new Error(`SDK error: ${sdkError}`);
    }
  }, [sdkError]);

  return (
    <PayPalSDKContext.Provider value={{ isReady: isSDKReady, sdkError, sdkInstance, paymentMethodEligibility }}>
      {/* Can I add the error handling here? */}
      {children}
    </PayPalSDKContext.Provider>
  );
};
