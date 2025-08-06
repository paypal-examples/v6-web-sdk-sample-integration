# Alternative Payment Methods - Bancontact HTML Sample Integration

This demo showcases how to integrate Bancontact as an alternative payment method using PayPal's v5 SDK alongside PayPal payments using the v6 Web SDK. This hybrid approach allows merchants to offer both Bancontact and PayPal payment options to their customers.

## 🏗️ Architecture Overview

This sample demonstrates a dual SDK integration:

1. **v5 PayPal SDK**: Used specifically for Bancontact funding source
2. **v6 PayPal Web SDK**: Used for standard PayPal payments
3. **Unified Backend**: Both payment methods use the same order creation and capture endpoints

## 📋 Prerequisites

Before running this demo, you'll need:

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account**
   - Visit [developer.paypal.com](https://developer.paypal.com)
   - Sign up for a developer account or log in with existing credentials

2. **Create a PayPal Application**
   - Navigate to **Apps & Credentials** section
   - Click **Create App**
   - Name your app and select **Merchant** under **Type**
   - Choose the **Sandbox** account for testing
   - Enable **Alternative Payment Methods** if available
   - Note your **Client ID** and **Secret key** for environment configuration

### 2. Bancontact Configuration

Bancontact is primarily used in Belgium and requires EUR currency. Ensure your PayPal sandbox account is configured to accept EUR transactions.

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
   Create a `.env` file in the root directory with your PayPal credentials:

   ```env
   PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_paypal_sandbox_client_secret
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:8080`

### Client Setup

1. **Navigate to the Bancontact demo directory:**

   ```bash
   cd client/components/alternativePaymentMethods/bancontact/html
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

## 🧪 Testing the Integration

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Payment Options**: You'll see two payment buttons:
   - **PayPal Button** (v6 SDK): Standard PayPal payment
   - **Bancontact Button** (v5 SDK): Bancontact payment method

3. **Test PayPal Payment**:
   - Click the PayPal button
   - Complete the payment flow using sandbox credentials

4. **Test Bancontact Payment**:
   - Click the Bancontact button
   - Follow the Bancontact payment simulation

5. **Verify Results**:
   - Check browser console logs for payment confirmation
   - Verify order capture in your PayPal developer dashboard

## 🔧 Code Structure

### Key Files

- **[`src/index.html`](src/index.html)**: Main HTML page with both payment buttons
- **[`src/app.js`](src/app.js)**: Core integration logic including:
  - Dual SDK initialization
  - Payment session management
  - Order creation and capture
- **[`package.json`](package.json)**: Dependencies and build scripts
- **[`vite.config.js`](vite.config.js)**: Vite development server configuration

### Integration Flow

#### v6 PayPal Integration

1. **SDK Initialization**: Load v6 Web SDK and create PayPal instance
2. **Payment Session**: Create one-time payment session
3. **Button Click**: Start payment flow with auto presentation mode

#### v5 Bancontact Integration

1. **SDK Initialization**: Load v5 SDK with Bancontact funding enabled
2. **Eligibility Check**: Verify Bancontact availability
3. **Button Rendering**: Render Bancontact button if eligible

#### Shared Components

- **Order Creation**: Both flows use [`createOrder()`](src/app.js) function
- **Order Capture**: Both flows use [`captureOrder()`](src/app.js) function

## 🔧 Configuration Details

### v5 SDK Configuration

```html
<script
  async
  data-namespace="v5Paypal"
  onload="onV5PayPalWebSdkLoaded()"
  src="https://www.sandbox.paypal.com/sdk/js?client-id=test&components=buttons,funding-eligibility&enable-funding=bancontact&currency=EUR"
></script>
```

Key parameters:

- `data-namespace="v5Paypal"`: Prevents namespace conflicts with v6 SDK
- `enable-funding=bancontact`: Explicitly enables Bancontact funding
- `currency=EUR`: Required for Bancontact transactions

### v6 SDK Configuration

```html
<script
  async
  onload="onV6PayPalWebSdkLoaded()"
  src="https://www.sandbox.paypal.com/web-sdk/v6/core"
></script>
```

## 🌍 Currency and Region Support

- **Bancontact**: EUR currency, primarily Belgium
- **PayPal**: Multiple currencies supported
- **Testing**: Use EUR for Bancontact testing scenarios

## 🐛 Troubleshooting

### Common Issues

1. **Bancontact Button Not Appearing**
   - Verify `enable-funding=bancontact` is in the v5 SDK URL
   - Check that currency is set to EUR
   - Ensure your sandbox account supports Bancontact

2. **SDK Conflicts**
   - The `data-namespace="v5Paypal"` attribute prevents namespace conflicts with v6
   - Ensure both SDKs load successfully before initializing

3. **Order Creation Fails**
   - Verify backend server is running on port 8080
   - Check that environment variables are properly configured
   - Ensure API endpoints are accessible

### Debug Tips

- Check browser console for error messages
- Verify network requests in developer tools
- Test with different browsers and currency settings

## 🔒 Security Considerations

- **Client Tokens**: Use browser-safe client tokens for v6 frontend integration
- **Environment Variables**: Keep PayPal credentials secure and out of client code
- **HTTPS**: Use HTTPS in production environments
- **Validation**: Always validate payments on your backend

## 📚 API Endpoints Used

This demo uses the following backend endpoints:

- `GET /paypal-api/auth/browser-safe-client-token`: Get authentication token
- `POST /paypal-api/checkout/orders/create-with-sample-data`: Create PayPal order
- `POST /paypal-api/checkout/orders/{orderId}/capture`: Capture completed order

## 🔗 Resources

- [PayPal v6 Web SDK Documentation](https://developer.paypal.com)
- [PayPal v5 SDK Documentation](https://developer.paypal.com/sdk/js/)
- [Bancontact Payment Method Guide](https://developer.paypal.com/docs/checkout/apm/bancontact/)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](../../../../LICENSE) file for details.
