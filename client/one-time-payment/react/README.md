# One-Time Payments React Sample Integration

This React sample integration uses Vite to spin up an application with a React-Typescript template. Vite is used for the local web server and provides the following functionality:

1. Runs the Vite development server on port 3000 where the React App is accessible.
2. Proxies requests that start with /paypal-api to the backend server running on port 8080.

## How to Run Locally

Run the React UI application and the Node.js backend API server concurrently.

```bash
v6-web-sdk-sample-integration/server/node
npm install
npm run start

v6-web-sdk-sample-integration/client/one-time-payment/react
npm install
npm run dev
```

This sample integration requires two servers to be running, the React application, and the backend API server. The React application will run on port 3000, and the backend API server will run on port 8080. The backend API server handles sensitive interactions with the PayPal API, such as generating client tokens and capturing orders. The React application will use a proxy to securely interact with the backend API.

### Sample Integrations

Currently there is only one example integration, One-Time Payment with PayPal or Venmo.  There are several key aspects to the integration:
  1. The Core Script is placed directly into the index.html file (see client/one-time-payment/react/index.html) that renders the application, rather than injected.
  2. Leveraging the React Context API with the PayPalSDKProvider relevant SDK data is available throughout the application.  Via this strategy one can initialize the SDK, query for eligibility (based on the payment method, in this case 'paypal' and 'venmo'), and create One-Time Payment Sessions that are used by the buttons themselves all in one place.
  3. React component wrappers around the `paypal-button` and `venmo-button`, where the `onClick` handler is implemented. The `session.start` method should be called within the `onClickHandler` to initialize checkout.


### Extras

There are 2 extra aspects included that are worth highlighting as well.  Graceful error handling is accomplished using [react-error-boundary](https://github.com/bvaughn/react-error-boundary), a helpful library that has more functionality than is demonstrated here.

Also there is a very basic example of post-onApprove redirection; oftentimes when integrating with the PayPal Web SDK a merchant will want to redirect to a new page after a successful purchase.  Including redirect logic in the onApprove function body will successfully redirect within the application.  Leveraging a helper like `react-router-dom` would make this process cleaner.