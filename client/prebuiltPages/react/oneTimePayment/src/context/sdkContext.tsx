import React, { useState, useEffect, createContext } from "react";
import { useErrorBoundary } from "react-error-boundary";

import type {
  Component,
  CreateInstanceOptions,
  EligiblePaymentMethods,
  PageType,
  SdkInstance,
} from "../types/paypal";

/**
 * Initializes the PayPal SDK instance and fetches eligible payment methods.
 *
 * @param {CreateInstanceOptions} options - Options for creating the PayPal SDK instance.
 * @returns {Promise<{ sdkInstance: SdkInstance; eligiblePaymentMethods: EligiblePaymentMethods }>} 
 * An object containing the SDK instance and eligible payment methods.
 */
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

/**
 * Context properties for PayPal SDK.
 */
interface PayPalSDKContextProps {
  /** Eligible payment methods returned by the SDK. */
  eligiblePaymentMethods: EligiblePaymentMethods | null;
  /** The PayPal SDK instance. */
  sdkInstance: SdkInstance | null;
}

/** Initial context values for PayPalSDKContext. */
const initialContext: PayPalSDKContextProps = {
  eligiblePaymentMethods: null,
  sdkInstance: null,
};

/**
 * Props for the PayPalSDKProvider component.
 */
interface PayPalSDKProviderProps {
  /** List of PayPal SDK components to load. */
  components: Component[];
  /** React children nodes. */
  children: React.ReactNode;
  /** The page type for the SDK instance. */
  pageType: PageType;
  /** Optional client token for SDK initialization. */
  clientToken?: string;
}

/**
 * React context for sharing PayPal SDK instance and eligible payment methods.
 */
export const PayPalSDKContext =
  createContext<PayPalSDKContextProps>(initialContext);

/**
 * PayPalSDKProvider component initializes the PayPal SDK and provides
 * the SDK instance and eligible payment methods to its children via context.
 *
 * @param {PayPalSDKProviderProps} props - The provider props.
 * @returns {JSX.Element} The context provider with SDK values.
 */
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
  });

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
