import React, { useState, useEffect, createContext } from "react";
import { initSdkInstance } from "../components/utils";

interface PayPalSDKContextProps {
  isReady: boolean;
  sdkError: any;
}

const initialContext: PayPalSDKContextProps = {
  isReady: false,
  sdkError: null,
};

export const PayPalSDKContext = createContext<PayPalSDKContextProps>(initialContext);

export const PayPalSDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSDKReady, setIsSDKReady] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<any>(null);

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!window.paypal) {
          const script = document.createElement("script");
          script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = async () => {
            await initSdkInstance();
          };
          script.onerror = (e) => {
            setSdkError(e);
            throw new Error(`Failed to load Paypal SDK Script: ${e}`);
          }
          document.body.appendChild(script);
        } else {
          await initSdkInstance();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
        setSdkError(e);
        throw new Error(`Failed to load Paypal SDK Script: ${e}`);
      }
      setIsSDKReady(true);
    };

    loadPayPalSDK();
  }, []);

  useEffect(() => {
    if (sdkError) {
      throw new Error(`SDK error: ${sdkError}`);
    }
  }, [sdkError]);

  return (
    <PayPalSDKContext.Provider value={{ isReady: isSDKReady, sdkError }}>
      {/* Can I add the error handling here? */}
      {children}
    </PayPalSDKContext.Provider>
  );
};