# Testing Apple Pay Locally

At a high level, testing Apple Pay locally requires:

- An iCloud sandbox account with test cards (see [iCloud setup instructions](https://paypal.atlassian.net/wiki/spaces/altpay/pages/812520415/Instructions+To+Setup+Apple+Pay+Testing+In+QA+Sandbox))
- Setting up local domain/redirects to emulate the deployed environment

Since the deployed server at `v6-web-sdk-sample-integration-server.fly.dev` already has the Apple Pay merchant domain registered with PayPal, we reuse that domain locally by redirecting it to `127.0.0.1` via the hosts file and terminating HTTPS with nginx.

## Adding `v6-web-sdk-sample-integration-server.fly.dev`

Add the following line to your `/etc/hosts` file:

```bash
127.0.0.1       v6-web-sdk-sample-integration-server.fly.dev
```

Note: Modifying this file requires admin privileges, so you will need to do something like `sudo vi /etc/hosts`.

Flush DNS cache:

```bash
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

## Setting up SSL certificates

Install `mkcert` and generate a certificate covering the fly.dev domain:

```bash
brew install mkcert
mkcert -install
cd client/prebuiltPages/react
mkcert -cert-file localhost+1.pem -key-file localhost+1-key.pem \
  localhost 127.0.0.1 v6-web-sdk-sample-integration-server.fly.dev
```

Safari requires the CA to be explicitly trusted: open `$(mkcert -CAROOT)/rootCA.pem` in Keychain Access → Trust → Always Trust. Restart Safari.

## Setting up nginx

We use nginx as an HTTPS reverse proxy from `:443` → Vite dev server on `:3000`.

1. Install nginx:

```bash
sudo brew install nginx
```

2. Set your nginx config file (typically at `/opt/homebrew/etc/nginx/nginx.conf`) to the below. Make sure to update `{PATH_TO_REPO}`!

```
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    server {
    	listen 443 ssl;
    	server_name v6-web-sdk-sample-integration-server.fly.dev;

    	ssl_certificate {PATH_TO_REPO}/client/prebuiltPages/react/localhost+1.pem;
    	ssl_certificate_key {PATH_TO_REPO}/client/prebuiltPages/react/localhost+1-key.pem;

    	location /.well-known/ {
        	alias {PATH_TO_REPO}/.well-known/;
    	}

    	location / {
        	proxy_pass http://[::1]:3000;
        	proxy_set_header Host $host;
        	proxy_set_header X-Forwarded-Proto $scheme;
        	proxy_http_version 1.1;
        	proxy_set_header Upgrade $http_upgrade;
        	proxy_set_header Connection "upgrade";
    	}
    }

    include servers/*;
}
```

Note: `proxy_pass` uses `[::1]` (IPv6 loopback) because Vite defaults to listening on IPv6 only.

3. Start/reload nginx:

```bash
sudo nginx -t && sudo nginx   # or: sudo nginx -s reload
```

## Configure Vite proxy

The Vite dev server needs to proxy `/paypal-api` calls to the real fly.dev server (since the hosts file redirects the domain to localhost). In `client/prebuiltPages/react/vite.config.ts`, add `allowedHosts` and proxy to the server's actual IP:

```ts
server: {
  port: 3000,
  allowedHosts: ["v6-web-sdk-sample-integration-server.fly.dev"],
  proxy: {
    "/paypal-api": {
      target: "https://66.241.125.234",  // resolved IP of v6-web-sdk-sample-integration-server.fly.dev
      changeOrigin: true,
      secure: false,
      headers: { Host: "v6-web-sdk-sample-integration-server.fly.dev" },
    },
  },
},
```

## Code changes

Add `"applepay-payments"` to the `PayPalProvider` components list in `App.tsx`, and add the Apple Pay routes. Add the `apple-pay-button` CSS to `index.html` for Safari rendering (see existing checkout pages for reference).

## Run and test

```bash
cd client/prebuiltPages/react && npm install && npm start
```

Open Safari and navigate to `https://v6-web-sdk-sample-integration-server.fly.dev/#/one-time-payment/apple-pay`

## Cleanup

When done testing, remove the hosts file entry and stop nginx:

```bash
sudo sed -i '' '/v6-web-sdk-sample-integration-server.fly.dev/d' /etc/hosts
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
sudo nginx -s stop
```
