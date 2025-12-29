# PayPal v6 Web SDK Sample Integration

This repository contains sample integrations for PayPal's v6 Web SDK. Learn how to:

- make one-time payments with different payment methods like PayPal and Venmo
- save payment methods for future transactions
- add Pay Later messaging

## Before You Code

1. **Setup a PayPal Account**

   To get started, you'll need a developer, personal, or business account.

   [Sign Up](https://www.paypal.com/signin/client?flow=provisionUser) or [Log In](https://www.paypal.com/signin?returnUri=https%253A%252F%252Fdeveloper.paypal.com%252Fdashboard&intent=developer)

   You'll then need to visit the [Developer Dashboard](https://developer.paypal.com/dashboard/) to obtain credentials and to make sandbox accounts.

2. **Create an Application**

   Once you've setup a PayPal account, [create a sandbox application](https://developer.paypal.com/dashboard/applications/sandbox/create) to obtain a **Client ID** and **Secret**.

## How to Run Locally

1. Clone the repository by running the following command in your terminal:
   ```bash
   git clone https://github.com/paypal-examples/v6-web-sdk-sample-integration.git
   ```
2. Create a `.env` file based on the `.env.sample` file at the root of this repository:
   ```bash
   cd v6-web-sdk-sample-integration
   cp .env.sample .env
   ```
3. Open the `.env` file in a text editor and add values for the `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET` environment variables.
4. To run the server, choose a server implementation from the `server` folder at the root of this repository and follow the instructions in that folder's README. For example, for Node.js run:
   ```bash
   cd server/node
   npm install
   npm start
   ```
5. After running the server, go to [http://localhost:8080](http://localhost:8080) to see the client examples.
