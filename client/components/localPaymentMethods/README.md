# Local Payment Methods (APM) Sample Integrations

This folder contains sample integrations for PayPal's local / alternative payment
methods (APMs) built with the v6 Web SDK. Every sample follows the same structure
and integration flow, so all shared documentation — setup, architecture, the
end-to-end flow, and troubleshooting — lives in this single guide. The table below
lists every method together with the values that are unique to it (currency, buyer
country, SDK component, eligibility key, and session method).

## Supported payment methods

Each method links to its runnable sample page. The **buyer country** and
**currency** are the values used for sandbox testing; the **SDK component**,
**eligibility key**, and **session method** are what each sample passes to the
v6 Web SDK.

| Payment method                                                      | Currency | Buyer country (sandbox) | SDK component                | Eligibility key     | Session method                                |
| ------------------------------------------------------------------- | -------- | ----------------------- | ---------------------------- | ------------------- | --------------------------------------------- |
| [Afterpay](./afterpayPayments/html/src/index.html)                  | `AUD`    | Australia (`AU`)        | `afterpay-payments`          | `afterpay`          | `createAfterpayOneTimePaymentSession`         |
| [Alfamart](./alfamartPayments/html/src/index.html)                  | `IDR`    | Indonesia (`ID`)        | `alfamart-payments`          | `alfamart`          | `createAlfamartOneTimePaymentSession`         |
| [Alipay](./alipayPayments/html/src/index.html)                      | `USD`    | China (`CN`)            | `alipay-payments`            | `alipay`            | `createAlipayOneTimePaymentSession`           |
| [Bancontact](./bancontactPayments/html/src/index.html)              | `EUR`    | Belgium (`BE`)          | `bancontact-payments`        | `bancontact`        | `createBancontactOneTimePaymentSession`       |
| [Bizum](./bizumPayments/html/src/index.html)                        | `EUR`    | Spain (`ES`)            | `bizum-payments`             | `bizum`             | `createBizumOneTimePaymentSession`            |
| [BLIK](./blikPayments/html/src/index.html)                          | `PLN`    | Poland (`PL`)           | `blik-payments`              | `blik`              | `createBlikOneTimePaymentSession`             |
| [BLIK Pay Later](./blikPayLaterPayments/html/src/index.html)        | `PLN`    | Poland (`PL`)           | `blikpaylater-payments`      | `blik_pay_later`    | `createBlikPayLaterOneTimePaymentSession`     |
| [Boleto Bancario](./boletobancarioPayments/html/src/index.html)     | `BRL`    | Brazil (`BR`)           | `boletobancario-payments`    | `boletobancario`    | `createBoletobancarioOneTimePaymentSession`   |
| [DOKU](./dokuPayments/html/src/index.html)                          | `IDR`    | Indonesia (`ID`)        | `doku-payments`              | `doku`              | `createDOKUOneTimePaymentSession`             |
| [Dragonpay](./dragonpayPayments/html/src/index.html)                | `PHP`    | Philippines (`PH`)      | `dragonpay-payments`         | `dragonpay`         | `createDragonpayOneTimePaymentSession`        |
| [EPS](./epsPayments/html/src/index.html)                            | `EUR`    | Austria (`AT`)          | `eps-payments`               | `eps`               | `createEpsOneTimePaymentSession`              |
| [Estonia Banks](./estoniaBanksPayments/html/src/index.html)         | `EUR`    | Estonia (`EE`)          | `estoniabank-payments`       | `estonia_banks`     | `createEstoniaOneTimePaymentSession`          |
| [FIUU Cash](./fiuuPayments/html/src/index.html)                     | `MYR`    | Malaysia (`MY`)         | `fiuu-cash-payments`         | `fiuu_cash`         | `createFIUUOneTimePaymentSession`             |
| [Floa](./floaPayments/html/src/index.html)                          | `EUR`    | France (`FR`)           | `floa-payments`              | `floa_pay`          | `createFloaOneTimePaymentSession`             |
| [FPX](./fpxPayments/html/src/index.html)                            | `MYR`    | Malaysia (`MY`)         | `fpx-payments`               | `fpx`               | `createFpxOneTimePaymentSession`              |
| [GoPay](./gopayPayments/html/src/index.html)                        | `IDR`    | Indonesia (`ID`)        | `gopay-payments`             | `gopay`             | `createGopayOneTimePaymentSession`            |
| [iDEAL](./idealPayments/html/src/index.html)                        | `EUR`    | Netherlands (`NL`)      | `ideal-payments`             | `ideal`             | `createIdealOneTimePaymentSession`            |
| [Indomaret](./indomaretPayments/html/src/index.html)                | `IDR`    | Indonesia (`ID`)        | `indomaret-payments`         | `indomaret`         | `createIndomaretOneTimePaymentSession`        |
| [Indonesia Banks](./indonesiaBanksPayments/html/src/index.html)     | `IDR`    | Indonesia (`ID`)        | `indonesiabanks-payments`    | `indonesia_banks`   | `createIndonesiaBanksOneTimePaymentSession`   |
| [Jeniuspay](./jeniuspayPayments/html/src/index.html)                | `IDR`    | Indonesia (`ID`)        | `jeniuspay-payments`         | `jenius_pay`        | `createJeniuspayOneTimePaymentSession`        |
| [Klarna](./klarnaPayments/html/src/index.html)                      | `GBP`    | United Kingdom (`GB`)   | `klarna-payments`            | `klarna`            | `createKlarnaOneTimePaymentSession`           |
| [Kredivo](./kredivoPayments/html/src/index.html)                    | `IDR`    | Indonesia (`ID`)        | `kredivo-payments`           | `kredivo`           | `createKredivoOneTimePaymentSession`          |
| [Latvia Banks](./latviaBanksPayments/html/src/index.html)           | `EUR`    | Latvia (`LV`)           | `latviabanks-payments`       | `latvia_banks`      | `createLatviaBanksOneTimePaymentSession`      |
| [LinkAja](./linkajaPayments/html/src/index.html)                    | `IDR`    | Indonesia (`ID`)        | `linkaja-payments`           | `linkaja`           | `createLinkajaOneTimePaymentSession`          |
| [Lithuania Banks](./lithuaniaBanksPayments/html/src/index.html)     | `EUR`    | Lithuania (`LT`)        | `lithuaniabanks-payments`    | `lithuania_banks`   | `createLithuaniaBanksOneTimePaymentSession`   |
| [MBWay](./mbwayPayments/html/src/index.html)                        | `EUR`    | Portugal (`PT`)         | `mbway-payments`             | `mbway`             | `createMbWayOneTimePaymentSession`            |
| [Multibanco](./multibancoPayments/html/src/index.html)              | `EUR`    | Portugal (`PT`)         | `multibanco-payments`        | `multibanco`        | `createMultibancoOneTimePaymentSession`       |
| [MyBank](./mybankPayments/html/src/index.html)                      | `EUR`    | Italy (`IT`)            | `mybank-payments`            | `mybank`            | `createMyBankOneTimePaymentSession`           |
| [OVO](./ovoPayments/html/src/index.html)                            | `IDR`    | Indonesia (`ID`)        | `ovo-payments`               | `ovo`               | `createOvoOneTimePaymentSession`              |
| [OxxoPay](./oxxopayPayments/html/src/index.html)                    | `MXN`    | Mexico (`MX`)           | `oxxopay-payments`           | `oxxo_pay`          | `createOxxopayOneTimePaymentSession`          |
| [P24 (Przelewy24)](./p24Payments/html/src/index.html)               | `PLN`    | Poland (`PL`)           | `p24-payments`               | `p24`               | `createP24OneTimePaymentSession`              |
| [Paysafecard](./paysafecardPayments/html/src/index.html)            | `EUR`    | Germany (`DE`)          | `paysafecard-payments`       | `paysafecard`       | `createPaysafecardOneTimePaymentSession`      |
| [Paysera](./payseraPayments/html/src/index.html)                    | `EUR`    | Lithuania (`LT`)        | `paysera-payments`           | `paysera`           | `createPayseraOneTimePaymentSession`          |
| [PayU](./payuPayments/html/src/index.html)                          | `PLN`    | Poland (`PL`)           | `payu-payments`              | `payu`              | `createPayuOneTimePaymentSession`             |
| [Pix International](./pixInternationalPayments/html/src/index.html) | `BRL`    | Brazil (`BR`)           | `pix-international-payments` | `pix_international` | `createPixInternationalOneTimePaymentSession` |
| [Scalapay](./scalapayPayments/html/src/index.html)                  | `EUR`    | France (`FR`)           | `scalapay-payments`          | `scalapay`          | `createScalapayOneTimePaymentSession`         |
| [SEPA](./sepaPayments/html/src/index.html)                          | `EUR`    | Germany (`DE`)          | `sepa-payments`              | _n/a_               | `createSepaOneTimePaymentSession`             |
| [Skrill](./skrillPayments/html/src/index.html)                      | `EUR`    | Germany (`DE`)          | `skrill-payments`            | `skrill`            | `createSkrillOneTimePaymentSession`           |
| [Swish](./swishPayments/html/src/index.html)                        | `SEK`    | Sweden (`SE`)           | `swish-payments`             | `swish`             | `createSwishOneTimePaymentSession`            |
| [Thailand Banks](./thailandBanksPayments/html/src/index.html)       | `THB`    | Thailand (`TH`)         | `thailand-banks-payments`    | `thailand_banks`    | `createThailandBanksOneTimePaymentSession`    |
| [Trustly](./trustlyPayments/html/src/index.html)                    | `SEK`    | Sweden (`SE`)           | `trustly-payments`           | `trustly`           | `createTrustlyOneTimePaymentSession`          |
| [Twint](./twintPayments/html/src/index.html)                        | `CHF`    | Switzerland (`CH`)      | `twint-payments`             | `twint`             | `createTwintOneTimePaymentSession`            |
| [Verkkopankki](./verkkopankkiPayments/html/src/index.html)          | `EUR`    | Finland (`FI`)          | `verkkopankki-payments`      | `verkkopankki`      | `createVerkkopankkiOneTimePaymentSession`     |
| [WechatPay](./wechatpayPayments/html/src/index.html)                | `CNY`    | China (`CN`)            | `wechatpay-payments`         | `wechatpay`         | `createWechatpayOneTimePaymentSession`        |
| [Wero](./weroPayments/html/src/index.html)                          | `EUR`    | Germany (`DE`)          | `wero-payments`              | `wero`              | `createWeroOneTimePaymentSession`             |
| [Zip](./zipPayments/html/src/index.html)                            | `AUD`    | Australia (`AU`)        | `zip-payments`               | `zip`               | `createZipOneTimePaymentSession`              |

> A method's button only renders when the SDK reports it as eligible for your
> merchant account. Make sure the method is enabled on your sandbox merchant and
> that the account accepts the listed currency, otherwise the page shows a
> "not eligible" message. (`SEPA` performs no eligibility check, shown as _n/a_.)

## Architecture Overview

Each sample demonstrates a complete one-time payment flow:

1. Initialize the PayPal Web SDK with the payment method's component
2. Check eligibility for the payment method
3. Create a payment session with the required payment fields
4. Validate the customer name before initiating payment
5. Create a PayPal order with the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through the method's popup flow
7. Handle payment approval, cancellation, and errors

## Features

- One-time payment integration for each local payment method
- Full name field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for the payment method
- Error handling and user feedback
- Method-specific currency support (see the table above)

## Prerequisites

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account**
   - Visit [developer.paypal.com](https://developer.paypal.com)
   - Sign up for a developer account or log in with existing credentials
   - Navigate to the **Apps & Credentials** section in your dashboard

2. **Create a PayPal Application** (or configure the default application)
   - Click **Create App**
   - Name your app
   - Select **Merchant** under **Type**
   - Choose the **Sandbox** account for testing
   - Click **Create App** at the bottom of the modal
   - Note your **Client ID** and **Secret key** under **API credentials** for configuring the `.env` file

3. **Enable the Payment Method**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Open **Account Settings** via the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find the payment method (see the table above) and enable it
   - Ensure your account is configured to accept the method's required currency

### 2. System Requirements

- Node.js version 20 or higher
- Server running on port 8080 (see the `server/node/` directory)

## Running the Demo

1. **Navigate to the server directory:**

   ```bash
   cd server/node
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the repository root using your sandbox credentials:

   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```

4. **Start the server:**

   ```bash
   npm start
   ```

   The server runs on `http://localhost:8080`.

5. Open [http://localhost:8080](http://localhost:8080) and pick a method from the
   **Local Payment Methods** list (or use the sample links in the table above).

## How It Works

### Client-Side Flow

The buyer country and currency are method-specific — see the table above.

1. **SDK Initialization**: Loads the PayPal Web SDK with the method's component using a client ID fetched from the server's `/paypal-api/auth/browser-safe-client-id` endpoint. `testBuyerCountry` is set to the method's sandbox test country.
2. **Eligibility Check**: Verifies the method is eligible for the merchant with the method's currency via `findEligibleMethods()` / `isEligible()`.
3. **Session Creation**: Creates the method's payment session (e.g. `createOxxopayOneTimePaymentSession`) with event callbacks for the payment lifecycle.
4. **Field Setup**: Mounts the required full name field provided by the SDK.
5. **Validation**: Validates the name field before initiating the payment flow.
6. **Order & Payment Flow**: Opens a popup window where the customer authorizes the payment. The order is created server-side via `/paypal-api/checkout/orders/create-order-for-one-time-payment` with the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction.
7. **Completion**: Fetches order details via `/paypal-api/checkout/orders/:orderId` (the order is auto-completed due to the processing instruction), or handles cancellation and error scenarios.

### Server-Side Requirements

The integration relies on these endpoints (provided by the API server):

- `GET /paypal-api/auth/browser-safe-client-id` — return the client ID
- `POST /paypal-api/checkout/orders/create-order-for-one-time-payment` — create an order with the method's currency and the `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
- `GET /paypal-api/checkout/orders/:orderId` — fetch order details after approval

### Special Order Configuration

Local payment methods create the order with:

- `processing_instruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` — the order is auto-completed on approval, so no separate capture call is needed
- the method's required currency code (see the table above)

## Troubleshooting

### Payment method not eligible

- Verify `testBuyerCountry` matches the value in the table above
- Check that `currencyCode` matches the method's required currency
- Ensure the payment method is enabled for the merchant in PayPal account settings
- Verify your PayPal account is configured to accept the method's currency

### Validation fails

- Ensure the full name field is properly mounted with JavaScript
- Check that the name field has valid input
- Ensure the field is visible in the DOM

### Payment popup doesn't open

- Check for popup blockers
- Verify order creation returns a valid orderId
- Ensure proper event handler setup
- Check the browser console for errors

### Order creation fails

- Verify the API server is running on port 8080
- Check server logs for errors
- Ensure `currencyCode` is set to the method's required currency

## Documentation

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
