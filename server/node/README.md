# Node.js Express Server

Node.js [Express](https://expressjs.com/) server for running the PayPal Web SDK samples integrations. It proides the following functionality:

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

### `GET /paypal-api/auth/browser-safe-client-token`

**Description:**  
Generates and returns a browser-safe client token for initializing the PayPal JavaScript SDK on the client side.

**Responses:**

- `200 OK`  
  Returns a JSON object with the client token.

  ```json
  {
    "accessToken": "abc123...",
    "expiresIn": "900" // TTL in seconds,
    // additional metadata
  }
  ```

  For more details, visit PayPal's [Developer Documentation](https://developer.paypal.com/api/rest/authentication/) site

---

### `POST /paypal-api/checkout/orders/create-with-sample-data`

**Description:**  
Creates a new PayPal order with sample data. This simulates the beginning of a checkout session.

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

  For more information on the Create endpoint, visit PayPal's [Developer Documentation](https://developer.paypal.com/docs/api/orders/v2/#orders_create) site.

---

### `POST /paypal-api/checkout/orders/{orderId}/capture`

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

  For more information on the Capture endpoint, visit PayPal's [Developer Documentation](https://developer.paypal.com/docs/api/orders/v2/#orders_capture) site.

---

### `POST /paypal-api/subscription`

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

  For more information on the Subscriptions API, visit PayPal's [Developer Documentation](https://developer.paypal.com/docs/api/subscriptions/v1/) site.

---

### `POST /paypal-api/vault/setup-token/create`

**Description:**  
Creates a vault setup token for saving a payment method without an immediate purchase. This is used for vaulting scenarios where customers want to save their payment information for future use.

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

  For more information on the Vault Setup Tokens API, visit PayPal's [Developer Documentation](https://developer.paypal.com/docs/api/payment-tokens/v3/) site.

---

### `POST /paypal-api/vault/payment-token/create`

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

  For more information on the Payment Tokens API, visit PayPal's [Developer Documentation](https://developer.paypal.com/docs/api/payment-tokens/v3/) site.
