import {
  PayPalCardCvvField,
  PayPalCardExpiryField,
  PayPalCardNumberField,
  usePayPalCardFields,
  usePayPalCardFieldsSavePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import { useEffect } from "react";
import { createCardVaultToken } from "../../../utils";
import { ModalType } from "../../../types";

interface PayPalCardFieldSavePaymentProps {
  setModalState: (state: ModalType) => void;
}

const PayPalCardFieldsSavePayment = ({
  setModalState,
}: PayPalCardFieldSavePaymentProps) => {
  const { error: cardFieldsError } = usePayPalCardFields();
  const {
    error: submitError,
    submit,
    submitResponse,
  } = usePayPalCardFieldsSavePaymentSession();

  useEffect(() => {
    if (!submitResponse) {
      return;
    }

    const { vaultSetupToken, message } = submitResponse.data;

    switch (submitResponse.state) {
      case "succeeded":
        console.log(
          `Save payment method succeeded: vaultSetupToken: ${vaultSetupToken}`,
        );
        setModalState("success");
        break;
      case "failed":
        console.error(
          `Save payment method failed: vaultSetupToken: ${vaultSetupToken}, message: ${message}`,
        );
        setModalState("error");
        break;
    }
  }, [submitResponse, setModalState]);

  useEffect(() => {
    if (cardFieldsError) {
      console.error("Error loading PayPal Card Fields", cardFieldsError);
    }
    if (submitError) {
      console.error("Error submitting PayPal Card Fields payment", submitError);
    }
  }, [cardFieldsError, submitError]);

  const handleSubmit = async () => {
    const { vaultSetupToken } = await createCardVaultToken();
    await submit(vaultSetupToken);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <PayPalCardNumberField
          containerStyles={{
            height: "3rem",
          }}
          placeholder="Enter card number"
        />
        <PayPalCardExpiryField
          containerStyles={{
            height: "3rem",
          }}
          placeholder="MM/YY"
        />
        <PayPalCardCvvField
          containerStyles={{
            height: "3rem",
          }}
          placeholder="Enter CVV"
        />
      </div>
      {!cardFieldsError && (
        <button className="card-fields-pay-button" onClick={handleSubmit}>
          Save Payment Method
        </button>
      )}
    </div>
  );
};

export default PayPalCardFieldsSavePayment;
