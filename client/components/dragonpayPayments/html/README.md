# Dragonpay One-Time Payment Integration

This example demonstrates how to implement Dragonpay one-time payments using the PayPal v6 Web SDK.

## Overview

Dragonpay is a popular payment method in the Philippines that allows customers to pay using various banks and payment channels. This integration shows:

- How to initialize the PayPal SDK with Dragonpay components
- How to create and render Dragonpay payment fields (full name and email)
- How to collect phone number information
- How to handle the payment flow with popup presentation
- How to create orders with the required processing instruction

## Prerequisites

1. PayPal sandbox credentials (Client ID and Secret)
2. Merchant account enabled for Dragonpay payments
3. Test buyer country set to Philippines (PH)
4. Currency set to PHP (Philippine Peso)

## Key Features

- **Full Name and Email Fields**: Dragonpay requires customer full name and email fields
- **Phone Number**: Requires phone country code and national number
- **Popup Flow**: Payment confirmation happens in a popup window
- **Eligibility Check**: Verifies Dragonpay is available before rendering
- **Processing Instruction**: Uses `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` for APM-specific order completion

## File Structure

```
dragonpayPayments/html/
├── README.md           # This file
├── index.html          # Payment page UI
└── src/
    └── app.js          # Payment logic
```

## How It Works

1. **SDK Initialization**: Loads PayPal SDK with `dragonpay-payments` component
2. **Eligibility Check**: Checks if Dragonpay is available for the currency (PHP)
3. **Field Rendering**: Creates and renders the full name and email fields
4. **Phone Collection**: Displays fields for phone country code and national number
5. **Order Creation**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. **Payment Processing**: Validates all fields and launches popup for payment confirmation
7. **Order Completion**: Fetches and displays final order details after approval

## Configuration

### Server-Side

The order creation endpoint (`/paypal-api/checkout/orders/create-order-for-one-time-payment`) must:
- Support PHP currency
- Include `processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` in the request body
- Return an order ID

### Client-Side

```javascript
const sdkInstance = await window.paypal.createInstance({
  clientId: "your-client-id",
  components: ["dragonpay-payments"],
  testBuyerCountry: "PH"
});
```

## Testing

1. Ensure your `.env` file has valid credentials:
   ```
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   ```

2. Navigate to the Dragonpay payment page
3. The full name and email fields should appear if Dragonpay is eligible
4. Fill in the phone number fields:
   - **Phone Country Code**: 63 (Philippines)
   - **Phone National Number**: Your phone number
5. Enter test data (e.g., "John Doe" and "john.doe@example.com")
6. Click the Dragonpay button to initiate payment
7. Complete the payment in the popup window
8. View the order details after completion

## Troubleshooting

### "Dragonpay is not eligible for the selected currency"
- Ensure you're using PHP as the currency
- Verify your merchant account is enabled for Dragonpay

### "validation failed"
- Make sure all required fields are filled out correctly:
  - Full name and email (SDK fields)
  - Phone country code (e.g., 63)
  - Phone national number
- Check browser console for validation error details

### SDK initialization errors
- Verify your PayPal credentials are correct in `.env`
- Ensure your merchant account has Dragonpay enabled
- Check that you're using the correct client ID for the environment

### Order creation errors
- Verify the processing instruction is included: `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`
- Check server logs for API response details
- Ensure PHP currency is being used

## Important Notes

- Dragonpay requires `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
- The payment method is only available for PHP currency
- Test buyer country must be set to "PH" (Philippines) for testing
- Full name, email, and phone number are required for Dragonpay payments
- Phone country code for Philippines is typically "63"
- Payment confirmation happens in a popup window
- Dragonpay is a popular payment aggregator in the Philippines

## References

- [PayPal v6 Web SDK Documentation](https://developer.paypal.com/)
- [Alternative Payment Methods Guide](https://developer.paypal.com/docs/checkout/apm/)
