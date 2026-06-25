# Latvia Banks One-Time Payment Integration

This example demonstrates how to implement Latvia Banks one-time payments using the PayPal v6 Web SDK.

## Overview

Latvia Banks is an alternative payment method that allows customers in Latvia to pay using their bank account. This integration shows:

- How to initialize the PayPal SDK with Latvia Banks components
- How to create and render Latvia Banks payment fields (full name)
- How to handle the payment flow with popup presentation
- How to create orders with the required processing instruction

## Prerequisites

1. PayPal sandbox credentials (Client ID and Secret)
2. Merchant account enabled for Latvia Banks payments
3. Test buyer country set to Latvia (LV)
4. Currency set to EUR (Euro)

## Key Features

- **Full Name Field**: Latvia Banks requires a customer full name field
- **Popup Flow**: Payment confirmation happens in a popup window
- **Eligibility Check**: Verifies Latvia Banks is available before rendering
- **Processing Instruction**: Uses `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` for APM-specific order completion

## File Structure

```
latviaBanksPayments/html/
├── README.md           # This file
├── index.html          # Payment page UI
└── src/
    └── app.js          # Payment logic
```

## How It Works

1. **SDK Initialization**: Loads PayPal SDK with `latviabanks-payments` component
2. **Eligibility Check**: Checks if Latvia Banks is available for the currency (EUR)
3. **Field Rendering**: Creates and renders the full name field
4. **Order Creation**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
5. **Payment Processing**: Validates field and launches popup for payment confirmation
6. **Order Completion**: Fetches and displays final order details after approval

## Configuration

### Server-Side

The order creation endpoint (`/create-order-for-one-time-payment`) must:

- Support EUR currency
- Include `processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` in the request body
- Return an order ID

### Client-Side

```javascript
const sdkInstance = await window.paypal.createInstance({
  clientId: "your-client-id",
  components: ["latviabanks-payments"],
  testBuyerCountry: "LV",
});
```

## Testing

1. Ensure your `.env` file has valid credentials:

   ```
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   ```

2. Navigate to the Latvia Banks payment page
3. The full name field should appear if Latvia Banks is eligible
4. Enter a test name (e.g., "John Doe")
5. Click the Latvia Banks button to initiate payment
6. Complete the payment in the popup window
7. View the order details after completion

## Troubleshooting

### "Latvia Banks is not eligible for the selected currency"

- Ensure you're using EUR as the currency
- Verify your merchant account is enabled for Latvia Banks

### "validation failed"

- Make sure the full name field is filled out
- Check browser console for validation error details

### SDK initialization errors

- Verify your PayPal credentials are correct in `.env`
- Ensure your merchant account has Latvia Banks enabled
- Check that you're using the correct client ID for the environment

### Order creation errors

- Verify the processing instruction is included: `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`
- Check server logs for API response details
- Ensure EUR currency is being used

## Important Notes

- Latvia Banks requires `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
- The payment method is only available for EUR currency
- Test buyer country must be set to "LV" for testing
- The full name field is required for Latvia Banks payments
- Payment confirmation happens in a popup window

## References

- [PayPal v6 Web SDK Documentation](https://developer.paypal.com/)
- [Alternative Payment Methods Guide](https://developer.paypal.com/docs/checkout/apm/)
