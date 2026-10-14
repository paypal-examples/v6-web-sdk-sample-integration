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

## Sample Integrations

| Sample Integration                          | Description                                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Recommended](src/recommended/index.html)   | Start with this recommended sample integration. It looks up the buyer by email, renders the Fastlane member or guest experience, and creates an order. |
| [3DS](src/advanced/threeDSecure/index.html) | This advanced integration runs 3D Secure on the Fastlane payment token before the order is created.                                                    |

## 3D Secure

The [3DS sample](src/advanced/threeDSecure/index.html) calls `sdkInstance.createFastlaneThreeDomainSecure()` after `getPaymentToken()`:

1. `isEligible()` checks whether the card can be authenticated for the order amount.
2. `show()` presents the challenge and resolves with `authenticationState`, `liabilityShift` and an enriched `nonce`.
3. If the buyer authenticated and liability may shift to the issuer, the enriched `nonce` replaces the original token as the order's `singleUseToken`.

This sample trusts the client-side result. In production, also confirm the 3DS outcome (`liability_shift`, `enrollment_status`) in the Orders API response before fulfilling the order.

To trigger 3DS in the sandbox, add Mastercard `5186459910794125` (any future expiry, CVV `123`) to your [Fastlane sandbox profile](https://fastlane.sandbox.paypal.com/) or enter it as a guest.

## File Structure

Each sample folder contains:

- `index.html`: Main HTML page for the demo.
- `fastlaneSdkComponent.js`: Loads the PayPal SDK and initializes Fastlane.
- `fastlane.js`: Handles Fastlane logic, UI updates, and order creation (plus 3DS in the advanced sample).
- `fastlane.css`: Basic styles for the demo.

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

- [PayPal Fastlane Documentation](https://developer.paypal.com/studio/checkout/fastlane)
- [PayPal Card Testing](https://developer.paypal.com/tools/sandbox/card-testing/)
