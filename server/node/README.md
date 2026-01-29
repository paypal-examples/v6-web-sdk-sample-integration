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
    "expiresIn": "900" // TTL in seconds,
    // additional metadata
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

### Create Order

The first step in a PayPal Checkout session is to create an order. The order payload includes the amount, currency, intent, and many optional features like shipping and tax information. For more details, visit PayPal's [Orders API documentation](https://developer.paypal.com/docs/api/orders/v2/#orders_create).

#### `POST /paypal-api/checkout/orders/create-order-for-one-time-payment`

**Description:**
Creates a new order for a one-time payment using the USD currency.

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

The server provides variations of this endpoint to support different currencies:

- EUR - /paypal-api/checkout/orders/create-order-for-one-time-payment-with-currency-code-eur
- PLN - /paypal-api/checkout/orders/create-order-for-one-time-payment-with-currency-code-pln

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
