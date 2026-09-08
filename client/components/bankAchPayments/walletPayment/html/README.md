# Bank ACH Wallet Payments HTML Sample Integration

This sample integration uses HTML, JavaScript, and CSS. It does not require a build process to transpile the source code. It's just static files that can be served up by any web server.

This example accepts ACH direct debit payments with the PayPal-hosted `bank-ach-wallet-payments` element. Buyers can either link and verify a bank account through an Open Banking provider or pay with a bank account saved in their PayPal Wallet.

## How it works

1. The client fetches a browser-safe client token and creates a JavaScript SDK v6 instance with the `bank-ach-payments` component. A client token is required because the SDK looks up the buyer's saved bank account in their PayPal Wallet.
2. `findEligibleMethods()` confirms that ACH is available for the transaction.
3. `createBankAchWalletPaymentSession()` creates the wallet payment session, and `walletSession.connect()` connects the `bank-ach-wallet-payments` element to a lazy order-creation callback.
4. When the buyer accepts the ACH mandate, the SDK calls `onApprove()` with the order ID.
5. A single server endpoint (`/paypal-api/checkout/orders/:orderId/capture-ach-wallet`) retrieves the order details, stores the buyer's authorization (consent) record for NACHA compliance, and captures the payment.

## Testing

ACH direct debit is available only to US merchants and supports payments only in US dollars. See the [Accept ACH payments](https://developer.paypal.com/limited-release/accept-ach-payments) guide for sandbox test credentials for both the PayPal Wallet bank path and the Open Banking path.

This static example is hosted by the [server application](../../../../../server/node/README.md).
