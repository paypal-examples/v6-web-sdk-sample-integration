import express, { Request, Response } from "express";
import { join } from "path";
import cors from "cors";

import routes from "./routes/index";
import errorMiddleware from "./middleware/errorMiddleware";

const CLIENT_STATIC_DIRECTORY =
  process.env.CLIENT_STATIC_DIRECTORY || join(__dirname, "../../../client");

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use("/client", express.static(CLIENT_STATIC_DIRECTORY));

/* ######################################################################
 * Entry point for client examples containing HTML, JS, and CSS
 * ###################################################################### */

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/client/index.html");
});

app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const hostname = process.env.HOSTNAME ?? "localhost";

app.listen({ port, hostname }, async () => {
  console.log(`Node.js web server listening at: http://${hostname}:${port}`);
  await setupNgrokForHTTPS(port);
});

async function setupNgrokForHTTPS(port: number) {
  const { NGROK_AUTHTOKEN } = process.env;

  if (!NGROK_AUTHTOKEN) {
    return;
  }

  try {
    const ngrok = await import("@ngrok/ngrok");

    const listener = await ngrok.connect({
      addr: port,
      authtoken: NGROK_AUTHTOKEN,
    });

    console.log(`Ingress secure tunnel established at: ${listener.url()}`);
  } catch (error) {
    console.error("error connecting to ngrok: ", error);
  }
}
