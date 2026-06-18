# Multibanco One-Time Payment Integration

This example demonstrates how to integrate Multibanco payments using PayPal's v6 Web SDK. Multibanco is a popular mobile payment method in Portugal and other European countries that allows customers to authorize payments instantly through their banking app.

## Architecture Overview

This sample demonstrates a complete Multibanco integration flow:

1. Initialize PayPal Web SDK with the Multibanco component
2. Check eligibility for Multibanco payment method
3. Create Multibanco payment session with required payment fields
4. Validate customer name before initiating payment
5. Create a PayPal order with `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` processing instruction
6. Authorize the payment through Multibanco popup flow
7. Handle payment approval, cancellation, and errors

## Features

- Multibanco one-time payment integration
- Full name field validation via PayPal SDK payment fields
- Popup payment flow
- Eligibility checking for Multibanco
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

3. **Enable Multibanco Payment**
   - Visit [sandbox.paypal.com](https://www.sandbox.paypal.com)
   - Log in with your **Sandbox** merchant account credentials
   - Navigate to **Account Settings** by clicking the profile icon in the top right corner
   - Select **Payment methods** from the left sidebar
   - Find **Multibanco** in the payment methods and enable it
