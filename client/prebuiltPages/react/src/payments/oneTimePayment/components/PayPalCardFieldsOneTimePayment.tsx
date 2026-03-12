import {
  PayPalCardCvvField,
  PayPalCardExpiryField,
  PayPalCardNumberField,
  usePayPalCardFields,
  usePayPalCardFieldsOneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import { useEffect } from "react";
import { captureOrder, createOrder } from "../../../utils";
import { ModalType, ProductItem } from "../../../types";

interface PayPalCardFieldsOneTimePaymentProps {
  setModalState: (state: ModalType) => void;
}

const PayPalCardFieldsOneTimePayment = ({
  setModalState,
}: PayPalCardFieldsOneTimePaymentProps) => {
  const { error: cardFieldsError } = usePayPalCardFields();
  const {
    error: submitError,
    submit,
    submitResponse,
  } = usePayPalCardFieldsOneTimePaymentSession();

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
    const { orderId } = await handleCreateOrder();
    await submit(orderId);
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
          Pay
        </button>
      )}
    </div>
  );
};

export default PayPalCardFieldsOneTimePayment;
