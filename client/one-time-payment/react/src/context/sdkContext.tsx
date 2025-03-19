import React, { useState, useEffect, createContext } from "react";
import { initSdkInstance, paymentSessionOptions } from "../components/utils";

interface PayPalSDKContextProps {
  isReady: boolean;
  paymentMethodEligibility: PaymentMethodEligibility;
  paypalSession: any;
  sdkError: any;
  sdkInstance: any;
  venmoSession: any;
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
  paypalSession: null,
  sdkError: null,
  sdkInstance: null,
  venmoSession: null
};

export const PayPalSDKContext =
  createContext<PayPalSDKContextProps>(initialContext);

export const PayPalSDKProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSDKReady, setIsSDKReady] = useState<boolean>(false);
  const [sdkInstance, setSdkInstance] = useState<unknown>(null);
  const [paypalSession, setPayPalSession] = useState<unknown>(null);
  const [venmoSession, setVenmoSession] = useState<unknown>(null);
  const [paymentMethodEligibility, setPaymentMethodEligibility] =
    useState<PaymentMethodEligibility>({
      isPayPalEligible: false,
      isVenmoEligible: false,
    });
  const [sdkError, setSdkError] = useState<any>(null);

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!window.paypal || !sdkInstance) {
          const { sdkInstance, isPayPalEligible, isVenmoEligible } =
            await initSdkInstance();
          setSdkInstance(sdkInstance);
          setPaymentMethodEligibility({
            ...paymentMethodEligibility,
            isPayPalEligible,
            isVenmoEligible,
          });
          setPayPalSession(
            sdkInstance.createPayPalOneTimePaymentSession(paymentSessionOptions)
          );
          setVenmoSession(sdkInstance.createVenmoOneTimePaymentSession(paymentSessionOptions))
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
    <PayPalSDKContext.Provider
      value={{
        isReady: isSDKReady,
        sdkError,
        sdkInstance,
        paymentMethodEligibility,
        paypalSession,
        venmoSession
      }}
    >
      {children}
    </PayPalSDKContext.Provider>
  );
};
