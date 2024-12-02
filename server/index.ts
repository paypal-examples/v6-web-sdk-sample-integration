import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";

/* ######################################################################
 * Set up PayPal controllers
 * ###################################################################### */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing API credentials");
}

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
});

const ordersController = new OrdersController(client);
const oAuthAuthorizationController = new OAuthAuthorizationController(client);

/* ######################################################################
 * Token generation helpers
 * ###################################################################### */

async function getClientToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" }
  );

  return result.accessToken;
}

/* ######################################################################
 * Process transactions
 * ###################################################################### */

const createOrder = async () => {
  const { body, ...httpResponse } = await ordersController.ordersCreate({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: "100.00",
          },
        },
      ],
    },
    prefer: "return=minimal",
  });

  return {
    jsonResponse: JSON.parse(String(body)),
    httpStatusCode: httpResponse.statusCode,
  };
};

const captureOrder = async (orderID: string) => {
  const { body, ...httpResponse } = await ordersController.ordersCapture({
    id: orderID,
    prefer: "return=minimal",
  });

  return {
    jsonResponse: JSON.parse(String(body)),
    httpStatusCode: httpResponse.statusCode,
  };
};

/* ######################################################################
 * Run the server
 * ###################################################################### */

const app = express();

app.set("view engine", "ejs");
app.set("views", "./client/views");

app.use(cors());
app.use(express.json());

app.get("/payment-handler", async (req: Request, res: Response) => {
  const clientToken = await getClientToken();
  res.render("payment-handler.ejs", {
    clientToken,
  });
});

app.post("/order", async (req: Request, res: Response) => {
  try {
    const { jsonResponse, httpStatusCode } = await createOrder();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

app.post("/order/:orderID/capture", async (req: Request, res: Response) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});

const port = process.env.PORT ?? 8080;

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
