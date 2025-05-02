import express, { Request, Response } from "express";
import cors from "cors";

import {
  getBrowserSafeClientToken,
  createOrderWithSampleData,
  captureOrder,
  createSetupToken,
} from "./paypalServerSdk";

const app = express();

app.use(cors());
app.use(express.json());

// @ts-ignore - BigInt.prototype.toJSON() exists.
// The paypal-server-sdk casts numbers to BigInt values (ex: { expiresIn: 900n }).
// BitInt values must be cast to numbers to work with JSON.stringify() which is used by Express.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/BigInt_not_serializable
BigInt.prototype.toJSON = function () {
  return Number(this);
};

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
      const { orderId } = req.params;
      const { jsonResponse, httpStatusCode } = await captureOrder(orderId);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  },
);

app.post(
  "/paypal-api/checkout/setup-token/create",
  async (_req: Request, res: Response) => {
    try {
      const { jsonResponse, httpStatusCode } = await createSetupToken();
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create setup token:", error);
      res.status(500).json({ error: "Failed to create setup token." });
    }
  },
);

const port = process.env.PORT ?? 8080;

app.listen(port, () => {
  console.log(`API server listening at https://localhost:${port}`);
});
