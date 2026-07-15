# One-Time Payments HTML Sandboxed Iframe Redirect Sample Integration

This example is a variant of the [Custom Sandboxed Iframe](../sandboxedIframe/README.md) sample that uses the
`redirect` presentation mode. This demonstrates how to disable `autoRedirect` and have the merchant (parent) page perform the full-page navigation on the iframe's behalf via `postMessage`.

To start this example:

1. Start a server in the `server/` directory. Note, the server needs to provide the following endpoints:
   1. `GET /paypal-api/auth/browser-safe-client-id`
   2. `POST /paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-redirect-rest`
      (Note: This endpoint uses the Orders v2 API directly with `fetch`, without the PayPal Server SDK.)
   3. `POST /paypal-api/checkout/orders/:orderId/capture`

2. Start the merchant page and iframe servers (uses [`concurrently`](https://www.npmjs.com/package/concurrently)):

   ```
   npm start
   ```

3. Navigate to `localhost:3001` to see the page.
