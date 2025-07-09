import { useEffect, useState } from "react";
import {
  PaymentSessionOptions,
  SdkInstance,
  SessionOutput,
} from "../types/paypal";

export type UseCreatePayPalOneTimePaymentSessionOptions =
  PaymentSessionOptions & {
    sdkInstance: SdkInstance | null;
  };

export const useCreatePayPalOneTimePaymentSession = ({
  sdkInstance,
  onApprove,
  onCancel,
  onError,
}: UseCreatePayPalOneTimePaymentSessionOptions) => {
  const [session, setSession] = useState<SessionOutput | null>(null);

  useEffect(() => {
    if (!sdkInstance) {
      setSession(null);
      // throw some type of error here
      return;
    }

    // Cleanup previous session if it exists
    if (session) {
      session.destroy();
    }

    // Create new session
    const newSession = sdkInstance.createPayPalOneTimePaymentSession({
      onApprove,
      onCancel,
      onError,
    });

    setSession(newSession);

    // Cleanup on unmount or dependency change
    return () => {
      if (session) {
        session.destroy();
      }
    };
  }, [sdkInstance, onApprove, onCancel, onError]);

  return session;
};
