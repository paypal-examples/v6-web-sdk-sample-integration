# Fastlane HTML Sample Integration

This sample demonstrates how to integrate PayPal Fastlane using plain HTML, JavaScript, and CSS. No build process is required—just static files that can be served by any web server. [Vite](https://vite.dev/) is used locally to serve the files and proxy API requests.

## How to Run Locally

```bash
npm install
npm start
```

- The Fastlane demo will be available at [http://localhost:3000](http://localhost:3000).
- The backend API server (see instructions in `/server/node/README.md`) must also be running on [http://localhost:8080](http://localhost:8080).

## Features

- **Email Lookup:** Enter an email to check if the user is a Fastlane member.
- **Member Experience:** Authenticated members can select shipping addresses and pay with saved cards.
- **Guest Experience:** Guests can enter card details and shipping info.
- **Order Creation:** Submits a PayPal order using the Fastlane payment token.
- **Card Testing Info:** Provides a link to PayPal's sandbox card testing documentation.

## File Structure

- [`src/index.html`](src/index.html): Main HTML page for the Fastlane demo.
- [`src/fastlaneSdkComponent.js`](src/fastlaneSdkComponent.js): Loads the PayPal SDK and initializes Fastlane.
- [`src/fastlane.js`](src/fastlane.js): Handles Fastlane logic, UI updates, and order creation.
- [`src/fastlane.css`](src/fastlane.css): Basic styles for the demo.

## How It Works

1. The page loads the PayPal v6 Web SDK with the Fastlane component.
2. The user enters their email and submits the form.
3. The app checks if the user is a Fastlane member:
   - **Member:** Authenticates and displays saved shipping/payment info.
   - **Guest:** Prompts for card entry.
4. On order submission, a payment token is generated and sent to the backend to create a PayPal order.

## API Endpoints Used

- `GET /paypal-api/auth/browser-safe-client-token`
- `POST /paypal-api/checkout/orders/create`

> **Note:** The backend API server must be running and configured with your PayPal sandbox credentials (please see the `.env.sample` at the root folder).

## Resources

- [PayPal Fastlane Documentation](https://developer.paypal.com/docs/fastlane/)
- [PayPal Card Testing](https://developer.paypal.com/tools/sandbox/card-testing/)
