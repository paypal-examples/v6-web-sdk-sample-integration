# Node.js Express Server

Node.js [Express](https://expressjs.com/) server for running the PayPal Web SDK sample integrations. It provides the following functionality:

1. serves up API endpoints that wrap the [PayPal Server SDK](https://developer.paypal.com/serversdk/typescript/getting-started/how-to-get-started) for authorization, order management, subscriptions, vault, and more.
2. serves up the html examples from the client directory.

Quick start:

```bash
npm install
npm start
# go to http://localhost:8080
```

---

## API Endpoints

### Authentication and Authorization

The PayPal Web SDK running in your browser supports two different options for auth. The following API endpoints are provided for each use case:

1. Client Token - short-lived token that works with every PayPal Web SDK feature.
2. Client ID - static application user id that works with limited set of PayPal Web SDK features.

For more details, visit PayPal's [Authentication documentation](https://developer.paypal.com/api/rest/authentication/).

#### `GET /paypal-api/auth/browser-safe-client-token`

**Description:**
Generates and returns a browser-safe client token for initializing the PayPal Web SDK on the client-side.

**Responses:**

- `200 OK`  
  Returns a JSON object with the client token.

  ```json
  {
    "accessToken": "abc123...",
    "expiresIn": "900"
  }
  ```

#### `GET /paypal-api/auth/browser-safe-client-id`

**Description:**
Returns the static PayPal Client ID defined in the .env file for the client-side code to use. This way the .env file can be the single source of truth for the Client ID for all the code in this repository.

**Responses:**

- `200 OK`  
  Returns a JSON object with the client id.

  ```json
  {
    "clientId": "abc123..."
  }
  ```

---

### Product Catalog

The server maintains a product catalog that maps SKU identifiers to prices. This ensures that pricing cannot be manipulated by the client.

#### `GET /paypal-api/products`

**Description:**
Returns the product catalog with SKU and price mappings. The client uses this to display accurate pricing while the server maintains the pricing for order creation.

**Responses:**

- `200 OK`  
  Returns an array of products with SKU and price.

  ```json
  [
    {
      "sku": "1blwyeo8",
      "price": "100.00"
    },
    {
      "sku": "i5b1g92y",
      "price": "100.00"
    }
  ]
  ```

**Implementation:**
The product catalog is defined in `src/productCatalog.ts`:

```typescript
export interface Product {
  sku: string;
  price: string;
}

export const PRODUCT_CATALOG: Record<string, Product> = {
  "1blwyeo8": { sku: "1blwyeo8", price: "100.00" },
  i5b1g92y: { sku: "i5b1g92y", price: "100.00" },
  // ... more products
};
```

**Helper Functions:**

- `getProduct(sku: string)` - Get product by SKU
- `getAllProducts()` - Get all products as array

---

### Create Order

The first step in a PayPal Checkout session is to create an order. The order payload includes the amount, currency, intent, and many optional features like shipping and tax information. For more details, visit PayPal's [Orders API documentation](https://developer.paypal.com/docs/api/orders/v2/#orders_create).

#### `POST /paypal-api/checkout/orders/create-order-for-one-time-payment`

**Description:**
Creates a new order for a one-time payment using the USD currency with a fixed amount.

**Request Body:**

Optional request body for defining a custom cart array and currency code. The server calculates the total by looking up prices for each SKU in the product catalog.

```json
{
  "cart": [
    {
      "sku": "1blwyeo8",
      "quantity": 2
    },
    {
      "sku": "i5b1g92y",
      "quantity": 1
    }
  ],
  "currencyCode": "USD"
}
```

**Responses:**

- `201 Created`  
  Returns the new order's details.

  ```json
  {
    "id": "ORDER-ID",
    "status": "CREATED"
  }
  ```

#### `POST /paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-vault`

**Description:**
Creates a new order for a one-time payment with vaulting using the PayPal payment method and the USD currency.

**Request Body:**
No body required.

**Responses:**

- `201 Created`  
  Returns the new order's details.

  ```json
  {
    "id": "ORDER-ID",
    "status": "CREATED"
  }
  ```

#### `POST /paypal-api/checkout/orders/create-order-for-paypal-one-time-payment-with-redirect`

**Description:**
Creates a new order for a one-time payment using the PayPal payment method that sets the return and cancel urls to support full page redirect functionality.

**Request Body:**
No body required.

**Responses:**

- `201 Created`  
  Returns the new order's details.

  ```json
  {
    "id": "ORDER-ID",
    "status": "CREATED"
  }
  ```

---

### Capture Order

The final step in a PayPal Checkout session is to capture the order. For more details, visit PayPal's [Orders API documentation](https://developer.paypal.com/docs/api/orders/v2/#orders_capture).

#### `POST /paypal-api/checkout/orders/{orderId}/capture`

**Description:**
Captures an existing PayPal order and finalizes the payment.

**Path Parameters:**

- `orderId` (string): The ID of the order to be captured.

**Responses:**

- `200 OK`  
  Returns capture confirmation.

  ```json
  {
    "id": "ORDER-ID",
    "status": "COMPLETED"
    // additional order information
  }
  ```

---

### Vaulting

PayPal provides functionality to save a buyer's payment method to use in the future. For more details, visit PayPal's [Vault Payment Method Tokens API documentation](https://developer.paypal.com/docs/api/payment-tokens/v3/).

#### `POST /paypal-api/vault/create-setup-token-for-paypal-save-payment`

**Description:**
Creates the initial vault setup token for saving the PayPal payment method without an immediate purchase.

**Request Body:**  
No body required.

**Responses:**

- `201 Created`  
  Returns the setup token details.

  ```json
  {
    "id": "SETUP-TOKEN-ID",
    "status": "CREATED",
    "customer": {
      "id": "CUSTOMER-ID"
    }
  }
  ```

#### `POST /paypal-api/vault/create-setup-token-for-card-save-payment`

**Description:**
Creates the initial vault setup token for saving the Card payment method without an immediate purchase.

**Request Body:**  
No body required.

**Responses:**

- `201 Created`  
  Returns the setup token details.

  ```json
  {
    "id": "SETUP-TOKEN-ID",
    "status": "CREATED",
    "customer": {
      "id": "CUSTOMER-ID"
    }
  }
  ```

#### `POST /paypal-api/vault/payment-token/create`

**Description:**
Creates a long-lived payment token from a vault setup token. This payment token can be stored in your database and used for future transactions when the buyer is not present.

**Request Body:**

```json
{
  "vaultSetupToken": "SETUP-TOKEN-ID"
}
```

**Responses:**

- `200 OK`  
  Returns a success message indicating the payment token was saved.

  ```json
  {
    "status": "SUCCESS",
    "description": "Payment token saved to database for future transactions"
  }
  ```

---

### Create Subscription

PayPal provides functionality for recurring payments for subscription services. For more details, visit PayPal's [Subscriptions API documentation](https://developer.paypal.com/docs/api/subscriptions/v1/).

#### `POST /paypal-api/billing/create-subscription`

**Description:**
Creates a new PayPal subscription with billing plan. If the `PAYPAL_SUBSCRIPTION_PLAN_ID` environment variable is set, it uses that plan ID. Otherwise, it creates a complete subscription with sample data (product, plan, and subscription).

**Request Body:**  
No body required.

**Environment Variables (Optional):**

- `PAYPAL_SUBSCRIPTION_PLAN_ID` (string): Existing billing plan ID to use for subscription creation.

**Responses:**

- `201 Created`  
  Returns the new subscription's details.

  ```json
  {
    "id": "SUBSCRIPTION-ID",
    "status": "APPROVAL_PENDING",
    "links": [
      {
        "href": "https://www.paypal.com/...",
        "rel": "approve"
      }
    ]
  }
  ```

---

### Payment Eligibility

PayPal provides functionality to determine what payment methods and merchant and buyer are eligible for.

#### `POST /paypal-api/payments/find-eligible-methods`

**Description:**
Returns a list of payment methods that merchant's can leverage in their integration.

**Request Body:**  
Accepts serveral optional parameters like currency and customer country code. Check out the [Find Eligible Methods TypeScript types](./src/customApiEndpoints/findEligibleMethods.ts) to learn more.

**Responses:**

- `200 Created`  
  Returns the eligible payment methods.

  ```json
  {
    "eligible_methods": {
      "venmo": {
        "can_be_vaulted": true
      }
    },
    "supplementary_data": {
      "buyer_country_code": "US"
    }
  }
  ```

---

### Webhooks

PayPal sends webhook notifications to your server when events happen, like a completed payment capture. This endpoint verifies each notification's signature offline against PayPal's public certificate. For more details, visit PayPal's [Webhooks documentation](https://developer.paypal.com/api/rest/webhooks/).

To enable it, set `PAYPAL_WEBHOOK_ID` in the .env file to the webhook ID from your sandbox app. Until then, the endpoint stays off and returns `404 Not Found`.

To test locally with the PayPal CLI, start the server with `paypal dev -- npm start`. In this dev mode, the endpoint also accepts events sent by `paypal webhook trigger` and `paypal webhook listen`, and by PayPal's Webhooks Simulator. Dev mode is always off when `NODE_ENV=production`.

In dev mode, every sample page also shows a webhook inbox: a floating button with a new-event count, a toast for the latest event, and a panel listing recent events with their payloads (personal values masked). The pages don't include it themselves. The server adds these two tags before `</body>` when it serves a page in dev mode, so new pages get the inbox too:

```html
<script type="module" src="/paypal-api/webhooks/webhook-assistant.js"></script>
<paypal-webhook-assistant
  endpoint="/paypal-api/webhooks/events"
></paypal-webhook-assistant>
```

The inbox is `client/shared/webhook-assistant.js`, shared with the other PayPal samples, so don't edit it here. Outside dev mode, the server serves pages unchanged and the inbox routes return `404 Not Found`.

This handler is a starting point for development. Production code should also store processed event IDs durably (not in memory), rate-limit the endpoint, and handle failures in its own event processing.

#### `POST /paypal-api/webhooks/events`

**Description:**
Verifies the webhook signature, ignores duplicate event IDs, and responds quickly so PayPal doesn't retry the delivery. Rejects a request that isn't JSON with `415 Unsupported Media Type`, and one that fails verification (an invalid signature, or a transmission time more than 5 minutes off) with `401 Unauthorized`.

**Request Body:**
A webhook event sent by PayPal, along with its signature headers (`paypal-transmission-*` and `paypal-cert-url`).

```json
{
  "id": "WH-58D329510W468432D-8HN650336L201105X",
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "resource": {
    // event-specific details
  }
}
```

**Responses:**

- `200 OK`  
  Acknowledges a verified event, including a duplicate. PayPal only checks the status, so the response has no body.

#### `GET /paypal-api/webhooks/events`

**Description:**
Lists the last 25 verified webhook events, newest first, for the webhook inbox, with personal values masked. Events are kept in memory and cleared when the server restarts. Dev mode only; otherwise returns `404 Not Found`, even when `PAYPAL_WEBHOOK_ID` is set.

**Responses:**

- `200 OK`  
  `names` maps event types to the friendly names the inbox shows, and `now` is the server's time.

  ```json
  {
    "entries": [
      {
        "id": "WH-58D329510W468432D-8HN650336L201105X",
        "type": "PAYMENT.CAPTURE.COMPLETED",
        "receivedAt": "2026-10-20T04:05:06.789Z",
        "payload": {
          // the webhook event as received, with personal values masked
        }
      }
    ],
    "names": { "PAYMENT.CAPTURE.COMPLETED": "Payment captured" },
    "now": "2026-10-20T04:05:08.000Z"
  }
  ```

#### `DELETE /paypal-api/webhooks/events?through=:eventId`

**Description:**
The inbox's **Clear all**: removes the given event and every older one. Dev mode only.

**Responses:**

- `204 No Content`
- `400 Bad Request` when `through` is missing.
