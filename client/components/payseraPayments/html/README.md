# Paysera One-Time Payment Integration

This example demonstrates how to implement Paysera one-time payments using the PayPal v6 Web SDK.

## Overview

Paysera is an alternative payment method popular in the Baltic region that allows customers to pay using their Paysera account. This integration shows:

- How to initialize the PayPal SDK with Paysera components
- How to create and render Paysera payment fields (full name and email)
- How to handle the payment flow with popup presentation
- How to create orders with the required processing instruction

## Prerequisites

1. PayPal sandbox credentials (Client ID and Secret)
2. Merchant account enabled for Paysera payments
3. Test buyer country set to Lithuania (LT)
4. Currency set to EUR (Euro)

## Key Features

- **Full Name and Email Fields**: Paysera requires customer full name and email fields
- **Popup Flow**: Payment confirmation happens in a popup window
- **Eligibility Check**: Verifies Paysera is available before rendering
- **Processing Instruction**: Uses `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` for APM-specific order completion

## File Structure

```
payseraPayments/html/
├── README.md           # This file
├── index.html          # Payment page UI
└── src/
    └── app.js          # Payment logic
```

## How It Works

1. **SDK Initialization**: Loads PayPal SDK with `paysera-payments` component
2. **Eligibility Check**: Checks if Paysera is available for the currency (EUR)
3. **Field Rendering**: Creates and renders the full name and email fields
4. **Order Creation**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
5. **Payment Processing**: Validates fields and launches popup for payment confirmation
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
  components: ["paysera-payments"],
  testBuyerCountry: "LT"
});
```

## Testing

1. Ensure your `.env` file has valid credentials:
   ```
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   ```

2. Navigate to the Paysera payment page
3. The full name and email fields should appear if Paysera is eligible
4. Enter test data (e.g., "John Doe" and "john.doe@example.com")
5. Click the Paysera button to initiate payment
6. Complete the payment in the popup window
7. View the order details after completion

## Troubleshooting

### "Paysera is not eligible for the selected currency"
- Ensure you're using EUR as the currency
- Verify your merchant account is enabled for Paysera

### "validation failed"
- Make sure both the full name and email fields are filled out correctly
- Check browser console for validation error details

### SDK initialization errors
- Verify your PayPal credentials are correct in `.env`
- Ensure your merchant account has Paysera enabled
- Check that you're using the correct client ID for the environment

### Order creation errors
- Verify the processing instruction is included: `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`
- Check server logs for API response details
- Ensure EUR currency is being used

## Important Notes

- Paysera requires `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
- The payment method is only available for EUR currency
- Test buyer country is typically set to "LT" (Lithuania) for testing
- Both full name and email fields are required for Paysera payments
- Payment confirmation happens in a popup window
- Paysera is particularly popular in Baltic countries (Lithuania, Latvia, Estonia)

## References

- [PayPal v6 Web SDK Documentation](https://developer.paypal.com/)
- [Alternative Payment Methods Guide](https://developer.paypal.com/docs/checkout/apm/)
