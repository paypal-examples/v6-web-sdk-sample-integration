# One-Time Payments Google Pay with 3D Secure Sample Integration

This Google Pay HTML sample integration builds on the [basic one-time payment example](../../README.md) and adds 3D Secure (Strong Customer Authentication) handling. It uses HTML, JavaScript, and CSS with no build step.

## Prerequisites

Before running this sample integration, ensure that Google Pay is enabled in your sandbox account. Follow the instructions in the [PayPal documentation to integrate Google Pay](https://developer.paypal.com/docs/checkout/apm/google-pay/#set-up-your-sandbox-account-to-accept-google-pay) to set up your sandbox account to accept Google Pay payments.

## Sample Integration

In addition to the basic one-time payment flow, this integration demonstrates how to:

1. Detect when 3D Secure is required — `googlePaySession.confirmOrder(...)` resolves with a `status` of `PAYER_ACTION_REQUIRED`.
2. Launch the 3D Secure flow with `googlePaySession.initiatePayerAction({ orderId })`, which opens the authentication modal and resolves once the payer completes it (or rejects if they cancel or it errors).
3. Fetch the order and read the authentication result at `paymentSource.googlePay.card.authenticationResult` (`liability_shift`, `enrollment_status`, `authentication_status`).
4. Capture the order.

For simplicity, this example **always captures** after 3D Secure and only logs the authentication result. A production integration may instead use the authentication result to decide whether to capture, following PayPal's [recommended action](https://developer.paypal.com/docs/checkout/advanced/customize/3d-secure/response-parameters/) table.

### Notes

- 3D Secure only runs when the order or the issuer/risk rules require it, so `PAYER_ACTION_REQUIRED` will not be returned on every transaction.
- Use a [3D Secure test card](https://developer.paypal.com/docs/checkout/advanced/customize/3d-secure/test/) to exercise the authentication flow.
