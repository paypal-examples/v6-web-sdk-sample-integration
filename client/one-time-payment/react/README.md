# One-Time Payments React Sample Integration

This React sample integration uses Vite to spin up an application with a React-Typescript template. Vite is used for the local web server and provides the following functionality:

1. Runs the Vite development server on port 3000 where the React App is accessible.
2. Proxies requests that start with /paypal-api to the backend server running on port 8080.

## How to Run Locally

Run the React UI application and the Node.js backend API server concurrently.

```bash
v6-web-sdk-sample-integration/server/node
npm install
npm start

v6-web-sdk-sample-integration/client/one-time-payment/react
npm install
npm start
```

This sample integration requires two servers to be running, the React application, and the backend API server. The React application will run on port 3000, and the backend API server will run on port 8080. The backend API server handles sensitive interactions with the PayPal API, such as generating client tokens and capturing orders. The React application will use a proxy to securely interact with the backend API.

### Sample Integrations

Currently there is only one example integration, One-Time Payment with PayPal or Venmo. There are several key aspects to the integration:

1. The Core SDK Script is placed directly into the [index.html file](index.html) that renders the application, rather than injected.
2. The `<PayPalSDKProvider>` component is created using the React Context API and provides relevant SDK data to child components. With this strategy one can initialize the SDK, query for eligibility (based on the payment method, in this case 'paypal' and 'venmo'), and create One-Time Payment Sessions that are used by the buttons themselves all in one place.
3. React component wrappers around the `paypal-button` and `venmo-button` web component buttons, where the `onClick` handler is implemented. The `session.start` method should be called within the `onClickHandler` to initialize checkout.

### Error Handling

Graceful error handling is accomplished using [react-error-boundary](https://github.com/bvaughn/react-error-boundary).
