# Node.js Express Server

Node.js [Express](https://expressjs.com/) server for running the PayPal Web SDK samples integrations. It proides the following functionality:

1. serves up API endpoints that wrap the [PayPal Sever SDK](https://developer.paypal.com/serversdk/typescript/getting-started/how-to-get-started) for authorization, order management, and more.
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
