import { PayPalCardFieldsProvider, PayPalCardCvvField, PayPalCardExpiryField, PayPalCardNumberField, usePayPalCardFields, usePayPalCardFieldsOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";
import type { UsePayPalCardFieldsOneTimePaymentSessionResult } from "@paypal/react-paypal-js/sdk-v6";
import { Fragment } from "react";

const CardFields = (): JSX.Element | null => {
    return (
        <Fragment>
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
        </ Fragment>
    );
};

const CardFieldsOneTimePaymentSessionExperience = ({
    createOrder,
}: {
    createOrder: () => Promise<{ orderId: string }>,
}): JSX.Element => {
    const { error: cardFieldsError } = usePayPalCardFields();
    const { error, submit, submitResponse }: UsePayPalCardFieldsOneTimePaymentSessionResult = usePayPalCardFieldsOneTimePaymentSession();

    const handleSubmit = async () => {
        const { orderId } = await createOrder();
        await submit(orderId);
    };

    return (
        <div
            style={{
            width: "100%",
            maxWidth: "80vw",
            }}
        >
            <CardFields />                     
            <button onClick={handleSubmit}>Submit</button>
            <p>{JSON.stringify(submitResponse)}</p>
            <p>{error?.message}</p>
            <p>{cardFieldsError?.message}</p>
        </div>
    );
};

const CardFieldsExperience = ({
    createOrder,
}: {
    createOrder: () => Promise<{ orderId: string }>,
}): JSX.Element => {
  return (       
    <div>
      <PayPalCardFieldsProvider>
            <CardFieldsOneTimePaymentSessionExperience
                createOrder={createOrder}
            />
        </PayPalCardFieldsProvider>
    </div>
  );
};

export default CardFieldsExperience;           