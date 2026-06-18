# Bizum One-Time Payment Integration

This example demonstrates how to integrate Bizum payments using PayPal's v6 Web SDK. Bizum is a popular mobile payment method in Spain that allows customers to authorize payments instantly from their banking app using their registered phone number.

## Architecture Overview

This sample demonstrates a complete Bizum integration flow:

1. Initialize PayPal Web SDK with the Bizum component
2. Check eligibility for Bizum payment method
3. Create Bizum payment session with required payment fields
4. Validate customer name and phone number before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Bizum popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Bizum one-time payment integration
- Full name field validation via PayPal SDK payment fields
- Phone number input (country code + national number) for Bizum authorization
- Popup payment flow
- Eligibility checking for Bizum
- Error handling and user feedback
- EUR (Euro) currency support

## Prerequisites

Before running this demo, you'll need to set up accounts and configure your development environment.

### 1. PayPal Developer Account Setup

1. **PayPal Developer Account**
   - Visit [developer.paypal.com](https://developer.paypal.com)
   - Sign up for a developer account or log in with existing credentials
   - Navigate to the **Apps & Credentials** section in your dashboard

2. **Create a PayPal Application** (or configure the default application)
   - Click **Create App**
   - Name your app
   - Select **Merchant** under **Type**
   - Choose the **Sandbox** account for testing
   - Click **Create App** at the bottom of the modal
   - Note your **Client ID** and **Secret key** under **API credentials** for later configuration of the `.env` file

3. **Enable Bizum Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
