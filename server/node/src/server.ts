import express, { Request, Response } from "express";
import cors from "cors";

import {
  getBrowserSafeClientToken,
  createOrder,
  captureOrder,
} from "./paypalServerSdk";

const app = express();

app.use(cors());
app.use(express.json());

/* ######################################################################
 * API Endpoints for the client-side JavaScript PayPal Integration code
 * ###################################################################### */

app.get("/paypal-api/auth/browser-safe-client-token", async (req: Request, res: Response) => {
  try {
    const { jsonResponse, httpStatusCode } = await getBrowserSafeClientToken();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create browser safe access token:", error);
    res
      .status(500)
      .json({ error: "Failed to create browser safe access token." });
  }
});

app.post("/paypal-api/checkout/orders/create", async (req: Request, res: Response) => {
  try {
    const { jsonResponse, httpStatusCode } = await createOrder();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

app.post("/paypal-api/checkout/orders/:orderId/capture", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderId);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});

const port = process.env.PORT ?? 8080;

app.listen(port, () => {
  console.log(`API server listening at https://localhost:${port}`);
});
