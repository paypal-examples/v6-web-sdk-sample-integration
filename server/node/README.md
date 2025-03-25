# Node.js Express Server

Node.js [Express](https://expressjs.com/) server that provides several endpoints that wrap the [PayPal Sever SDK](https://developer.paypal.com/community/blog/paypal-server-side-sdk/).

Start the server by running:

```bash
npm start
```

---

### `GET /paypal-api/auth/browser-safe-client-token`

**Description:**  
Generates and returns a browser-safe client token for initializing the PayPal JavaScript SDK on the client side.

**Responses:**

- `200 OK`  
  Returns a JSON object with the client token.

  ```json
  {
    "client_token": "abc123..."
  }
  ```


---

### `POST /paypal-api/checkout/orders/create`

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
  }
  ```

