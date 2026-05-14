import {
  PayPalCardCvvField,
  PayPalCardExpiryField,
  PayPalCardNumberField,
  usePayPalCardFields,
  usePayPalCardFieldsOneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import type { MerchantStyleObject } from "@paypal/react-paypal-js/sdk-v6";
import { useEffect, useState } from "react";
import { captureOrder, createOrder } from "../../../utils";
import { ModalType, ProductItem } from "../../../types";
import type { FieldsState } from "../../../paymentFlowCheckoutPages/CardFieldsOneTimePaymentCheckout";

type CardFieldName = "number" | "cvv" | "expiry";

const FIELD_LABELS: Record<CardFieldName, string> = {
  number: "Card number",
  cvv: "CVV",
  expiry: "Expiry",
};

const invalidFieldStyle: MerchantStyleObject = {
  "input.invalid": {
    color: "#d32f2f",
  },
};

interface PayPalCardFieldsOneTimePaymentProps {
  setModalState: (state: ModalType) => void;
  fieldsState: FieldsState;
}

const PayPalCardFieldsOneTimePayment = ({
  setModalState,
  fieldsState,
}: PayPalCardFieldsOneTimePaymentProps) => {
  const { error: cardFieldsError } = usePayPalCardFields();
  const {
    error: submitError,
    submit,
    submitResponse,
  } = usePayPalCardFieldsOneTimePaymentSession();
  // Tracks whether the buyer has attempted to submit, so errors only appear
  // after the first Pay click rather than on initial render.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const getFieldError = (fieldName: CardFieldName): string | null => {
    if (!hasSubmitted) return null;
    const field = fieldsState[fieldName];
    if (field.isEmpty) return `${FIELD_LABELS[fieldName]} is required`;
    if (!field.isValid) return `${FIELD_LABELS[fieldName]} is invalid`;
    return null;
  };

  const isFormValid =
    fieldsState.number.isValid &&
    fieldsState.cvv.isValid &&
    fieldsState.expiry.isValid;

  const handleCreateOrder = async () => {
    const savedCart = sessionStorage.getItem("cart");
    const products: ProductItem[] = savedCart ? JSON.parse(savedCart) : [];

    const cart = products.map((product) => ({
      sku: product.sku,
      quantity: product.quantity,
    }));

    return await createOrder(cart);
  };

  useEffect(() => {
    if (!submitResponse) {
      return;
    }

    const { orderId, message } = submitResponse.data;

    switch (submitResponse.state) {
      case "succeeded":
        console.log(`One time payment succeeded: orderId: ${orderId}`);
        captureOrder({ orderId }).then((captureResult) => {
          console.log("Payment capture result:", captureResult);

          sessionStorage.removeItem("cart");
          setModalState("success");
        });
        break;
      case "failed":
        console.error(
          `One time payment failed: orderId: ${orderId}, message:  ${message}`,
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
    console.log(
      "[PayPal Card Fields] submit clicked - field state:",
      fieldsState,
    );
    setHasSubmitted(true);
    // Client-side gate: prevents the server round-trip for fields that are
    // clearly empty or invalid based on SDK event state. This is a UX
    // optimization — if submit() is called with invalid fields, the SDK will
    // also return state: "failed" with a message, which is handled below in
    // the submitResponse effect. Both layers catch invalid input; this one
    // just avoids the unnecessary network call.
    if (!isFormValid) {
      console.log("[PayPal Card Fields] form invalid, blocked submission");
      return;
    }
    console.log("[PayPal Card Fields] form valid, creating order...");
    const { orderId } = await handleCreateOrder();
    await submit(orderId);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="card-field-wrapper">
          <PayPalCardNumberField
            containerStyles={{ height: "3rem" }}
            placeholder="Enter card number"
            style={invalidFieldStyle}
          />
          {getFieldError("number") && (
            <span className="card-field-error">{getFieldError("number")}</span>
          )}
        </div>
        <div className="card-field-wrapper">
          <PayPalCardExpiryField
            containerStyles={{ height: "3rem" }}
            placeholder="MM/YY"
            style={invalidFieldStyle}
          />
          {getFieldError("expiry") && (
            <span className="card-field-error">{getFieldError("expiry")}</span>
          )}
        </div>
        <div className="card-field-wrapper">
          <PayPalCardCvvField
            containerStyles={{ height: "3rem" }}
            placeholder="Enter CVV"
            style={invalidFieldStyle}
          />
          {getFieldError("cvv") && (
            <span className="card-field-error">{getFieldError("cvv")}</span>
          )}
        </div>
      </div>
      {!cardFieldsError && (
        <button className="card-fields-pay-button" onClick={handleSubmit}>
          Pay
        </button>
      )}
    </div>
  );
};

export default PayPalCardFieldsOneTimePayment;
