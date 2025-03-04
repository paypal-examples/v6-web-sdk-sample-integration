# `html-iframe` Example App

In this example, we serve a merchant page with an embedded iframe on a different domain. The iframe interacts
with a server using the PayPal Server SDK and uses `postMessage` to the merchant page. This demonstrates the v6 ability
to work entirely in an iframe.

To start this example:

1. Start a server in the `server/` directory. Note, the server needs to provide the following endpoints:
    1. `/paypal-api/auth/browser-safe-client-token`
    2. `/paypal-api/checkout/orders/create`
    3. `/paypal-api/checkout/orders/:orderId/capture`

2. Start the iframe server.

    ```
    npm run paypal-iframe
    ```

3. Start the merchant page server.

    ```
    npm run merchant-page
    ```

4. Navigate to `localhost:3001` to see the page.
