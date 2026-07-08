# One-Time Payments Google Pay with 3D Secure Sample Integration

This Google Pay HTML sample integration builds on the [basic one-time payment example](../../README.md) and adds 3D Secure (Strong Customer Authentication) handling. It uses HTML, JavaScript, and CSS with no build step.

## Prerequisites

Before running this sample integration, ensure that Google Pay is enabled in your sandbox account. Follow the instructions in the [PayPal documentation to integrate Google Pay](https://developer.paypal.com/docs/checkout/apm/google-pay/#set-up-your-sandbox-account-to-accept-google-pay) to set up your sandbox account to accept Google Pay payments.

## Sample Integration

In addition to the basic one-time payment flow, this integration demonstrates how to:

1. Force 3D Secure on the order so the flow can be exercised on every transaction — see [Forcing 3D Secure](#forcing-3d-secure) below.
2. Detect when 3D Secure is required — `googlePaySession.confirmOrder(...)` resolves with a `status` of `PAYER_ACTION_REQUIRED`.
3. Launch the 3D Secure flow with `googlePaySession.initiatePayerAction({ orderId })`, which opens the authentication modal and resolves once the payer completes it (or rejects if they cancel or it errors).
4. Fetch the order and read the authentication result at `paymentSource.googlePay.card.authenticationResult` (`liability_shift`, `enrollment_status`, `authentication_status`).
5. Capture the order.

For simplicity, this example **always captures** after 3D Secure and only logs the authentication result. A production integration may instead use the authentication result to decide whether to capture, following PayPal's [recommended action](https://developer.paypal.com/docs/checkout/advanced/customize/3d-secure/response-parameters/) table.

### Forcing 3D Secure

Like the [card 3D Secure example](../../../../cardFields/oneTimePayment/html/src/advanced/threeDSecure), this integration forces 3D Secure server-side so `PAYER_ACTION_REQUIRED` is returned on every transaction, making the flow easy to test. The order is created with `payment_source.google_pay.attributes.verification.method` set to `SCA_ALWAYS`.

This is done through a dedicated server endpoint (`create-order-for-googlepay-one-time-payment-with-3ds`). Unlike the card example, that endpoint issues a raw Orders v2 API call rather than using `@paypal/paypal-server-sdk`, because the SDK does not yet model the `google_pay` verification attribute and silently drops it. In production you would typically use `SCA_WHEN_REQUIRED` (the default) and let the issuer/risk rules decide when 3D Secure runs.

### Notes

- Use a [3D Secure test card](https://developer.paypal.com/docs/checkout/advanced/customize/3d-secure/test/) to exercise the authentication flow.
