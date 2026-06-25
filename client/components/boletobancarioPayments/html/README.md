# Boleto Bancario One-Time Payment Integration

This example demonstrates how to implement Boleto Bancario one-time payments using the PayPal v6 Web SDK.

## Overview

Boleto Bancario is a popular payment method in Brazil that allows customers to pay using bank slips. This integration shows:

- How to initialize the PayPal SDK with Boleto Bancario components
- How to create and render Boleto Bancario payment fields (full name and email)
- How to handle the payment flow with popup presentation
- How to create orders with the required processing instruction

## Prerequisites

1. PayPal sandbox credentials (Client ID and Secret)
2. Merchant account enabled for Boleto Bancario payments
3. Test buyer country set to Brazil (BR)
4. Currency set to BRL (Brazilian Real)

## Key Features

- **Full Name and Email Fields**: Boleto Bancario requires customer full name and email fields
- **Additional Information**: Requires billing address, tax information (CPF/CNPJ), and expiry date
- **Popup Flow**: Payment confirmation happens in a popup window
- **Eligibility Check**: Verifies Boleto Bancario is available before rendering
- **Processing Instruction**: Uses `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` for APM-specific order completion

## File Structure

```
boletobancarioPayments/html/
├── README.md           # This file
├── index.html          # Payment page UI
└── src/
    └── app.js          # Payment logic
```

## How It Works

1. **SDK Initialization**: Loads PayPal SDK with `boletobancario-payments` component
2. **Eligibility Check**: Checks if Boleto Bancario is available for the currency (BRL)
3. **Field Rendering**: Creates and renders the full name and email fields
4. **Additional Information**: Displays fields for billing address, tax info (CPF/CNPJ), and expiry date
5. **Order Creation**: Creates order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. **Payment Processing**: Validates all fields including billing data and launches popup for payment confirmation
7. **Order Completion**: Fetches and displays final order details after approval

## Configuration

### Server-Side

The order creation endpoint (`/paypal-api/checkout/orders/create-order-for-one-time-payment`) must:

- Support BRL currency
- Include `processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL"` in the request body
- Return an order ID

### Client-Side

```javascript
const sdkInstance = await window.paypal.createInstance({
  clientId: "your-client-id",
  components: ["boletobancario-payments"],
  testBuyerCountry: "BR",
});
```

## Testing

1. Ensure your `.env` file has valid credentials:

   ```
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   ```

2. Navigate to the Boleto Bancario payment page
3. Fill in the additional information fields:
   - **Expiry Date**: When the boleto expires
   - **Billing Address**: Complete address (line 1, line 2, admin areas, postal code, country)
   - **Tax Information**: Tax ID (CPF or CNPJ) and type
4. Enter test data (e.g., "John Doe" and "john.doe@example.com")
5. Click the Boleto Bancario button to initiate payment
6. Complete the payment in the popup window
7. Complete the payment in the popup window
8. View the order details after completion

## Troubleshooting

### "Boleto Bancario is not eligible for the selected currency"

- Ensure youall required fields are filled out correctly:
  - Full name and email (SDK fields)
  - Expiry date
  - Complete billing address (all lines, admin areas, postal code, country)
  - Tax ID and Tax ID Type (BR_CPF or BR_CNPJ)
- Verify your merchant account is enabled for Boleto Bancario

### "validation failed"

- Make sure both the full name and email fields are filled out correctly
- Check browser console for validation error details

### SDK initialization errors

- Verify your PayPal credentials are correct in `.env`
- Ensure your merchant account has Boleto Bancario enabled
- Check that you're using the correct client ID for the environment

### Order creation errors

- Verify the processing instruction is included: `ORDER_COMPLETE_ON_PAYMENT_APPROVAL`
- Check server logs for API response details
- Ensure BRL currency is being used

## Important Notes

- Additional information is required: billing address, tax info (CPF/CNPJ), and expiry date
- Tax ID Type must be either BR_CPF (for individuals) or BR_CNPJ (for companies)
- Boleto Bancario requires `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
- The payment method is only available for BRL currency
- Test buyer country must be set to "BR" (Brazil) for testing
- Both full name and email fields are required for Boleto Bancario payments
- Payment confirmation happens in a popup window
- Boleto Bancario is a popular payment method in Brazil for bank slip payments

## References

- [PayPal v6 Web SDK Documentation](https://developer.paypal.com/)
- [Alternative Payment Methods Guide](https://developer.paypal.com/docs/checkout/apm/)
