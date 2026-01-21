import express, { Request, Response } from "express";
import cors from "cors";
import { join } from "path";
import ngrok from "@ngrok/ngrok";

import type { PaymentTokenResponse } from "@paypal/paypal-server-sdk";

import {
  getBrowserSafeClientToken,
  createOrder,
  createOrderWithSampleData,
  captureOrder,
  createPaymentToken,
  createSetupTokenWithSampleDataForPayPal,
} from "./paypalServerSdk";

const CLIENT_STATIC_DIRECTORY = join(__dirname, "../../../client");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/client", express.static(CLIENT_STATIC_DIRECTORY));

/* ######################################################################
 * Entry point for client examples containing HTML, JS, and CSS
 * ###################################################################### */

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/client/index.html");
});

/* ######################################################################
 * API Endpoints for the client-side JavaScript PayPal Integration code
 * ###################################################################### */

app.get(
  "/paypal-api/auth/browser-safe-client-token",
  async (_req: Request, res: Response) => {
    try {
      const { jsonResponse, httpStatusCode } =
        await getBrowserSafeClientToken();
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create browser safe access token:", error);
      res
        .status(500)
        .json({ error: "Failed to create browser safe access token." });
    }
  },
);

app.post(
  "/paypal-api/checkout/orders/create",
  async (req: Request, res: Response) => {
    try {
      const paypalRequestId = req.headers["paypal-request-id"]?.toString();
      const { jsonResponse, httpStatusCode } = await createOrder({
        orderRequestBody: req.body,
        paypalRequestId,
      });
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
  },
);

app.post(
  "/paypal-api/checkout/orders/create-with-sample-data",
  async (req: Request, res: Response) => {
    try {
      const { jsonResponse, httpStatusCode } =
        await createOrderWithSampleData();
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
  },
);

app.post(
  "/paypal-api/checkout/orders/:orderId/capture",
  async (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderId as string;
      const { jsonResponse, httpStatusCode } = await captureOrder(orderId);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  },
);

app.post(
  "/paypal-api/vault/setup-token/create",
  async (_req: Request, res: Response) => {
    try {
      const { jsonResponse, httpStatusCode } =
        await createSetupTokenWithSampleDataForPayPal();
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create setup token:", error);
      res.status(500).json({ error: "Failed to create setup token." });
    }
  },
);

app.post(
  "/paypal-api/vault/payment-token/create",
  async (req: Request, res: Response) => {
    try {
      const { jsonResponse, httpStatusCode } = await createPaymentToken(
        req.body.vaultSetupToken as string,
      );

      const paymentTokenResponse = jsonResponse as PaymentTokenResponse;

      if (paymentTokenResponse.id) {
        // This payment token id is a long-lived value for making
        // future payments when the buyer is not present.
        // PayPal recommends storing this value in your database
        // and NOT returning it back to the browser.
        await savePaymentTokenToDatabase(paymentTokenResponse);
        res.status(httpStatusCode).json({
          status: "SUCCESS",
          description:
            "Payment token saved to database for future transactions",
        });
      } else {
        res.status(httpStatusCode).json({
          status: "ERROR",
          description: "Failed to create payment token",
        });
      }
    } catch (error) {
      console.error("Failed to create payment token:", error);
      res.status(500).json({ error: "Failed to create payment token." });
    }
  },
);

async function savePaymentTokenToDatabase(
  paymentTokenResponse: PaymentTokenResponse,
) {
  // example function to teach saving the paymentToken to a database
  // to be used for future transactions
  return Promise.resolve();
}

async function setupNgrokForHTTPS(port: number) {
  const { NGROK_AUTHTOKEN } = process.env;

  if (!NGROK_AUTHTOKEN) {
    return;
  }

  try {
    const listener = await ngrok.connect({
      addr: port,
      authtoken: NGROK_AUTHTOKEN,
    });

    console.log(`Ingress secure tunnel established at: ${listener.url()}`);
  } catch (error) {
    console.error("error connecting to ngrok: ", error);
  }
}

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const hostname = process.env.HOSTNAME ?? "localhost";

app.listen({ port, hostname }, async () => {
  console.log(`Node.js web server listening at: http://${hostname}:${port}`);
  await setupNgrokForHTTPS(port);
});
