# PayPal v6 Web SDK JavaScript Packages

## Overview

This document describes the JavaScript SDK packages created for PayPal's v6 Web SDK. These packages provide a modern, TypeScript-first wrapper around PayPal's payment SDK, making it easier to integrate PayPal payments into JavaScript applications.

## Architecture

The SDK is organized as a monorepo using npm workspaces, with the following package structure:

```
packages/
├── types/          # Shared TypeScript definitions
├── core/           # Core SDK wrapper and utilities
├── react/          # React hooks and components
└── vue/            # Vue composables (structure ready)
```

## Packages Created

### 1. @paypal-v6/types

**Purpose**: Provides comprehensive TypeScript type definitions for the entire SDK ecosystem.

**Key Features**:
- Complete type definitions for all PayPal payment methods
- Interfaces for SDK initialization and configuration
- Order creation and capture types
- Payment session callbacks and events
- Error codes and custom error classes
- Component configurations for buttons and messages

**Main Type Categories**:
- `sdk.ts` - Core SDK interfaces (SdkInstance, CreateInstanceOptions, EligiblePaymentMethods)
- `payment-methods.ts` - Payment method enums and configurations (PayPal, Venmo, Google Pay, Apple Pay, etc.)
- `orders.ts` - Order types (CreateOrderRequest, Order, CaptureOrderResponse, Amount, PurchaseUnit)
- `callbacks.ts` - Event handlers (OnApproveData, OnCancelData, OnErrorData, PaymentSessionOptions)
- `components.ts` - UI component types (ButtonStyle, MessagesConfig, FastlaneConfig)
- `errors.ts` - Error handling (PayPalSdkError, ErrorCode, RetryConfig)
- `config.ts` - SDK configuration (SdkConfig, Environment, LoggerConfig)

### 2. @paypal-v6/core

**Purpose**: Core SDK wrapper that handles script loading, initialization, and payment session management.

**Key Components**:

#### SDK Loader (`loader.ts`)
- Dynamically injects PayPal SDK script into the page
- Configurable URL builder for different environments (sandbox/production)
- Singleton pattern to prevent multiple script loads
- Promise-based loading with timeout support
- CSP nonce support for security

#### SDK Class (`sdk.ts`)
- Main SDK wrapper with singleton pattern
- Handles SDK initialization with client tokens
- Manages payment sessions lifecycle
- Provides methods for creating payment sessions for each payment method
- Built-in browser compatibility checking
- Event-driven architecture for SDK lifecycle

#### Session Manager (`sessions.ts`)
- Wrapper classes for payment sessions
- Specialized handlers for Google Pay and Apple Pay
- Session lifecycle management (create, start, cancel, destroy)
- Event emission for payment lifecycle events

#### Event Emitter (`events.ts`)
- Custom event system for SDK events
- Support for one-time listeners
- Event types: ready, loaded, error, payment_approved, payment_cancelled, session_started, session_ended

#### Utilities (`utils.ts`)
- Retry logic with exponential backoff
- Logger implementation with configurable levels
- Validation helpers (email, currency, amount)
- Browser and device detection
- Deep merge for configuration objects
- PayPal error parsing

**Key Features**:
- Automatic script loading and initialization
- Promise-based API
- Comprehensive error handling with retry logic
- TypeScript-safe method signatures
- Event-driven architecture
- Session lifecycle management

### 3. @paypal-v6/react

**Purpose**: React-specific SDK implementation with hooks and components.

**Components Created**:

#### Context & Provider (`PayPalSDKContext.tsx`)
- `PayPalSDKProvider` - Wraps application with SDK context
- Manages SDK initialization and state
- Provides loading and error states
- Supports deferred loading
- Automatic eligible payment methods detection

#### Payment Button Components
- `PayPalButton.tsx` - PayPal payment button with full customization
- `VenmoButton.tsx` - Venmo payment button
- `PayLaterButton.tsx` - Pay Later button
- `PayPalCreditButton.tsx` - PayPal Credit button
- `GooglePayButton.tsx` - Google Pay integration with native button
- `ApplePayButton.tsx` - Apple Pay integration with native button
- `PayPalMessages.tsx` - Pay Later messaging component

#### Custom Hooks
- `usePayPalSDK()` - Access SDK instance and state
- `usePaymentSession()` - Manage payment sessions for any payment method
- `usePayPalSession()` - Specialized hook for PayPal payments
- `useEligibleMethods()` - Check payment method eligibility
- `useGooglePay()` - Google Pay specific integration
- `useApplePay()` - Apple Pay specific integration

#### Utility Components
- `PaymentMethodSelector.tsx` - Renders multiple payment buttons with eligibility checking
- `PaymentModal.tsx` - Modal component for payment flows
- `ErrorBoundary.tsx` - React error boundary for catching payment errors

**Key Features**:
- Full React hooks integration
- Server-side rendering (SSR) compatible
- Automatic cleanup on unmount
- TypeScript support with proper typing
- Error boundaries for robust error handling
- Flexible payment method selection

### 4. @paypal-v6/vue (Structure Ready)

**Purpose**: Vue 3 composables and components for PayPal integration.

**Status**: Package structure and configuration are ready. Implementation follows the same patterns as the React package but uses Vue 3 Composition API.

## Implementation Highlights

### 1. Modern JavaScript Patterns
- ES6+ modules with tree-shaking support
- Promise-based APIs throughout
- Async/await for cleaner asynchronous code
- Event-driven architecture

### 2. TypeScript First
- Complete type coverage
- Strict type checking enabled
- Type inference for better developer experience
- Discriminated unions for payment methods

### 3. Error Handling
- Custom error class (`PayPalSdkError`) with error codes
- Retry logic with exponential backoff
- Comprehensive error recovery strategies
- Debug IDs for PayPal support

### 4. Developer Experience
- IntelliSense support in IDEs
- Clear API documentation through types
- Consistent naming conventions
- Modular architecture for tree-shaking

### 5. Security Features
- CSP nonce support
- Browser compatibility checking
- Secure token handling
- No sensitive data in client code

## Build Configuration

### Tooling
- **TypeScript** - Type safety and modern JavaScript
- **tsup** - Fast bundler with zero config
- **npm workspaces** - Monorepo management
- **Prettier** - Code formatting

### Build Output
Each package produces:
- CommonJS build (`dist/index.js`)
- ESM build (`dist/index.esm.js`)
- TypeScript declarations (`dist/index.d.ts`)
- Source maps for debugging

## Usage Examples

### Basic React Integration

```tsx
import { PayPalSDKProvider, PayPalButton } from '@paypal-v6/react';

function App() {
  return (
    <PayPalSDKProvider 
      config={{
        clientToken: 'your-client-token',
        environment: 'sandbox',
        components: ['paypal-payments', 'venmo-payments']
      }}
    >
      <CheckoutPage />
    </PayPalSDKProvider>
  );
}

function CheckoutPage() {
  const createOrder = async () => {
    const response = await fetch('/api/orders', { method: 'POST' });
    const { id } = await response.json();
    return { orderId: id };
  };

  return (
    <PayPalButton
      createOrder={createOrder}
      sessionOptions={{
        onApprove: async (data) => {
          console.log('Payment approved:', data.orderId);
        },
        onError: (error) => {
          console.error('Payment failed:', error);
        }
      }}
    />
  );
}
```

### Core SDK Direct Usage

```javascript
import { PayPalSDK } from '@paypal-v6/core';

// Initialize SDK
const sdk = PayPalSDK.getInstance({
  clientToken: 'your-client-token',
  environment: 'sandbox',
  components: ['paypal-payments']
});

// Wait for SDK to be ready
await sdk.initialize();

// Check eligible payment methods
const eligibleMethods = await sdk.findEligibleMethods({
  currencyCode: 'USD'
});

if (eligibleMethods.isEligible('paypal')) {
  // Create PayPal session
  const session = sdk.createPayPalSession({
    onApprove: async (data) => {
      console.log('Payment approved:', data.orderId);
    }
  });
  
  // Start payment
  await session.start(
    { presentationMode: 'auto' },
    createOrder()
  );
}
```

## Installation

### Install Dependencies
```bash
# Install all dependencies for all packages
npm install

# Build all packages
npm run build

# Run tests (when implemented)
npm test
```

### Using the Packages

For development in this repository:
```bash
# The packages are linked via npm workspaces
# Any changes will be reflected immediately in development
npm run dev
```

For external projects (after publishing):
```bash
# Install core package
npm install @paypal-v6/core @paypal-v6/types

# For React projects
npm install @paypal-v6/react

# For Vue projects
npm install @paypal-v6/vue
```

## Package Features Comparison

| Feature | Core | React | Vue |
|---------|------|-------|-----|
| SDK Loading | ✅ | Via Core | Via Core |
| TypeScript | ✅ | ✅ | ✅ |
| Payment Sessions | ✅ | ✅ | Planned |
| Event Emitter | ✅ | Via Hooks | Planned |
| Error Handling | ✅ | ✅ | Planned |
| Button Components | ❌ | ✅ | Planned |
| Hooks/Composables | ❌ | ✅ | Planned |
| SSR Support | ✅ | ✅ | Planned |

## Development Workflow

1. **Make Changes**: Edit files in `packages/*/src`
2. **Build**: Run `npm run build` to compile all packages
3. **Test**: Run `npm test` to run tests (when implemented)
4. **Format**: Run `npm run format` to format code

## Architecture Decisions

### Why Monorepo?
- Shared dependencies and tooling
- Atomic commits across packages
- Easier refactoring and maintenance
- Single source of truth for types

### Why TypeScript?
- Type safety prevents runtime errors
- Better IDE support and IntelliSense
- Self-documenting code
- Easier refactoring

### Why Event-Driven?
- Decoupled architecture
- Flexible integration points
- Better debugging capabilities
- Framework-agnostic core

### Why Singleton Pattern for SDK?
- Prevents multiple SDK instances
- Ensures single script load
- Consistent state management
- Memory efficient

## Future Enhancements

### Planned Features
1. **Vue Implementation** - Complete Vue 3 composables
2. **Angular Package** - Support for Angular applications
3. **Testing Suite** - Comprehensive unit and integration tests
4. **Documentation Site** - Interactive documentation with examples
5. **More Payment Methods** - Support for additional payment methods
6. **Webhooks Support** - Server-side webhook handlers
7. **Validation Library** - Advanced order validation
8. **Debugging Tools** - Development mode with enhanced logging

### Potential Optimizations
- Code splitting for payment methods
- Lazy loading of components
- Performance monitoring hooks
- A/B testing utilities
- Analytics integration

## Contributing

### Package Structure
When adding new features, follow this structure:
- Types go in `packages/types/src`
- Core logic goes in `packages/core/src`
- React components go in `packages/react/src`
- Keep framework-specific code isolated

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Write self-documenting code

### Testing
- Unit test utilities and hooks
- Integration test payment flows
- E2E test complete checkout process
- Mock PayPal SDK for testing

## License

This SDK wrapper is provided as-is for integration with PayPal's v6 Web SDK. Ensure you comply with PayPal's terms of service and SDK license agreements.

## Support

For issues related to:
- **SDK Wrapper**: Create an issue in this repository
- **PayPal SDK**: Contact PayPal developer support
- **Integration Help**: Refer to PayPal's official documentation

## Conclusion

This SDK package system provides a modern, type-safe, and developer-friendly way to integrate PayPal's v6 Web SDK into JavaScript applications. The modular architecture allows developers to use only what they need, while the TypeScript definitions ensure a robust development experience.