# Upstream Messages HTML Sample Integration

This HTML sample integration uses HTML, JavaScript, and CSS. It does not require a build process to transpile the source code. It's just static files that can be served up by any web server. [Vite](https://vite.dev/) is used for the local web server to provide the following functionality:

1. Serve up the static HTML and JavaScript files.
2. Proxy the API server so both the client and server are running on port 3000.

## How to Run Locally

```bash
npm install
npm start
```

### Sample Integrations

| Sample Integration                        | Description                                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Recommended](src/recommended/index.html) | Start with this recommended sample integration. It only shows how a message can be auto bootstrapped |
| [Advanced](src/advanced/index.html)       | This is an advanced integration. It shows how a message can be configured via JavaScript             |
