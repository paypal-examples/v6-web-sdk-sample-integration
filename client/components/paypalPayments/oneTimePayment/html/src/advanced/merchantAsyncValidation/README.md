# Merchant Async Validation Example

This example demonstrates how to perform asynchronous validation while maintaining proper user transient activation for popup windows in the PayPal v6 SDK.

## What is User Transient Activation?

User transient activation is a browser security feature that tracks whether a user action (like a click, tap, or key press) recently occurred. This mechanism prevents websites from opening popup windows or performing certain actions without explicit user interaction.

### Key Points about User Transient Activation:

1. **Time Sensitivity**: User transient activation typically expires after a few seconds of the initial user interaction, though this varies between browsers:
   - Chrome: ~5 seconds
   - Safari: ~1 seconds
2. **Action Required**: Only certain user interactions (clicks, taps, key presses) create transient activation
3. **Security Feature**: This prevents malicious websites from opening unwanted popups or performing actions without user consent

## Why This Matters for the v6 PayPal SDK

When a user clicks a button such as the PayPal button, the browser grants transient activation. However, if you perform lengthy validation or API calls before calling `.start()`, the activation may expire, causing the native browser popup to be blocked.

While the `auto` presentation mode is designed to automatically fallback from `popup` to `modal` when popups are blocked or unavailable, relying on this fallback isn't ideal. The modal presentation provides a less seamless user experience compared to popups. To ensure the best user experience, it's recommended to implement your integration in a way that preserves user activation and favors the popup presentation mode whenever possible.

### The Problem:

```javascript
// ❌ This approach may fail due to expired user activation
paypalButton.addEventListener("click", async () => {
  // Long validation process (3+ seconds)
  await performLengthyValidation();

  // By now, user activation may have expired
  await paypalPaymentSession.start(); // Popup may be blocked!
});
```

### The Solution:

```javascript
// ✅ This approach preserves user activation
paypalButton.addEventListener("click", async () => {
  // Start the payment session immediately with a promise
  await paypalPaymentSession.start(
    { presentationMode: "auto" },
    validateAndCreateOrder(), // Pass validation and order creation as a promise
  );
});
```

## How This Example Works

1. **Immediate Popup Opening**: When the user clicks the PayPal button, the SDK immediately opens a popup window (or modal) using the fresh user activation
2. **Loading Screen**: While the popup is open on an `about:blank` page, a loading screen is displayed to the user. Merchants can optionally improve this loading experience by passing in a `loadingScreen` start option with a label code to display some text while the validation/creation promise resolves.
3. **Background Processing**: The validation / order creation promise runs in the background while the popup remains open
4. **Promise Resolution**: Once validation / order creation completes, the SDK redirects the popup to PayPal's checkout flow

## Testing the Example

This example includes controls to simulate different validation scenarios:

- **Validation Delay**: Set how long the validation takes
- **Validation Result**: Choose whether validation should pass or fail

## Implementation Details

The key pattern demonstrated here is:

```javascript
async function validateAndCreateOrder() {
  // Run validation and order creation concurrently
  const [validationResult, createOrderResult] = await Promise.all([
    runAsyncValidation(), // Your custom validation logic
    createOrder(), // PayPal order creation
  ]);

  return createOrderResult;
}

// Pass the promise to .start() instead of awaiting it first
await paypalPaymentSession.start(
  {
    presentationMode: "auto",
    loadingScreen: { label: "connecting" },
  },
  validateAndCreateOrder(), // Promise, not awaited result
);
```

This pattern ensures:

- ✅ Popup opens immediately with user activation
- ✅ Loading state / text is shown to the user
- ✅ Validation runs asynchronously
- ✅ User experience remains smooth
- ✅ Browser popup blockers are avoided
