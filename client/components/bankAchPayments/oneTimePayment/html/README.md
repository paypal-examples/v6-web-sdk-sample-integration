# Bank ACH One-time Payment Sample Integration

This is a demo of how to integration Bank ACH One-time payment via PayPal Web SDK v6. Paypal SDK lets merchants provide Bank ACH as a payment method via plain HTML and javascript. 

## ️Architecture Overview

This sample demonstrates a complete Bank ACH integration flow: 

1. Initialize PayPal Web SDK with Bank ACH component with a sample order creation.
2. Opens popup for payer bank authentication and account selection when Bank ACH button is clicked.
3. `onApprove` callback passed to SDK initialization for capturing the order with the returned order ID. 

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

1. **Navigate to the Bank ACH One Time Payment demo directory:**

   ```bash
   cd client/components/bank/oneTimePayment/html
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

1. **Visit http://localhost:3000**
    - Enter your Merchant ID
    - Click the Bank Payment button
    - The bank login popup will be displayed

3. **Complete bank login and account selection**
    - Enter your credentials to get authenticated
    - Select the bank and account you would like to use for testing

4. **Verify Results**
    - Check the browser console logs for order capture details
    - Check Event Logs -> API Calls at [developer.paypal.com](https://developer.paypal.com)