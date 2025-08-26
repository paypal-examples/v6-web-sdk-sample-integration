# PayPal Guest Payments HTML Sample Integration

This demo showcases how to integrate PayPal Guest Payments as a payment method using PayPayl's v6 Web SDK. This integration allows merchants to offer guest payments for their customers without logging in to PayPal.

## 🏗️ Architecture Overview

This sample demonstrates several possible integration patterns for Guest Payments:

1. `onload` - Automatically open the Guest Payment form under the checkout button on page load. An eligibility request is required to check if the form can be shown to the current buyer.
2. `recommended` - The buyer can open the Guest Payment form by clicking on the checkout button.
3. `shipping` - You can use callbacks with custom behavior to respond to buyer changing their shipping address or options. Using shipping callbacks will automatically put the buyer in a `popup` or `modal` presentation mode.

The general structure of a Guest Payment integration is as follows:

1. Initialize PayPal Web SDK with the `paypal-guest-payments` component.
2. Using the SDK instance, call eligibility to determine which presentation modes will be available to the buyer.
3. Start the guest checkout session either on page load, or when the buyer clicks the Guest Payment button.

## 📋 Prerequisites

Before running this demo, you'll need to set up a PayPal Developer account.

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
   - Enable **Features** -> **Accept payments** -> **Apple Pay** (be sure to click **Save Changes** below)
   - Note your **Client ID** and **Secret key** under **API credentials** for later configuration of the `.env` file

## 🚀 Running the Demo

### Server Setup

1. **Navigate to the server directory:**

   ```bash
   cd server/node
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:

   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   The server will run on `https://localhost:8080`

### Client Setup

1. **Navigate to the Guest Payments demo directory:**

   ```bash
   cd client/components/paypalGuestPayments/html
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The demo will be available at `http://localhost:3000`
