# One-Time Payments HTML Sample Integration

This HTML sample integration uses HTML, JavaScript, and CSS. It does not require a build process to transpile the source code. It's just static files that can be served up by any web server. [Vite](https://vite.dev/) is used for the local web server to provide the following functionality:

1. Serve up the static HTML and JavaScript files.
2. Proxy the API server so both the client and server are running on port 3000.

## How to Run Locally

```bash
npm install
npm start
```

### Sample Integrations

| Sample Integration                        | Description                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Recommended](src/recommended/index.html) | Start with this recommended sample integration. It displays all buttons supported by the v6 SDK and includes eligibility logic. It uses the "auto" presentation mode which attempts to launch a popup window and then automatically falls back to the modal presentation mode when the browser does not support popups. |
