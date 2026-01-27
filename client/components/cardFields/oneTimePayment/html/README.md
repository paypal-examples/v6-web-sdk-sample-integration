# One-Time Payments HTML Sample Integration

This HTML sample integration uses HTML, JavaScript, and CSS. It does not require a build process to transpile the source code. It's just static files that can be served up by any web server. The logic for completing the transaction after the `cardFieldsInstance.submit()` will still need to be implemented by the merchant.

This static example is hosted by the [server application](../../../../../server/node/README.md).

### Sample Integrations

| Sample Integration                          | Description                                                                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [Recommended](src/recommended/index.html)   | Start with this recommended sample integration. It will render the Card Field, CVV, and Expiry fields necessary for a card transaction. |
| [3DS](src/advanced/threeDSecure/index.html) | This advanced integration demonstrates how a merchant would implement ThreeDSecure.                                                     |
