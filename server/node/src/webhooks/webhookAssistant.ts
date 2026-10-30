import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";

import { isWebhookDevelopmentModeEnabled } from "./verifyPayPalWebhook";

// like server.ts; `paypal init` projects set a relative "./client"
const CLIENT_DIRECTORY = path.resolve(
  process.env.CLIENT_STATIC_DIRECTORY ||
    // eslint-disable-next-line unicorn/prefer-module
    path.join(__dirname, "../../../../client"),
);

const WEBHOOK_ASSISTANT_TAGS = `<script type="module" src="/client/shared/webhook-assistant.js"></script>
<paypal-webhook-assistant endpoint="/paypal-api/webhooks/events"></paypal-webhook-assistant>
`;

// In dev mode, adds the webhook inbox to every sample page, so the pages
// themselves don't change. Mounted at /client, ahead of express.static, which
// serves everything else as before.
export async function webhookAssistantPageHandler(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (request.method !== "GET" || !isWebhookDevelopmentModeEnabled()) {
    next();
    return;
  }

  const html = await readPage(request.path);
  const bodyEnd = html?.lastIndexOf("</body>") ?? -1;
  if (html === undefined || bodyEnd === -1) {
    next();
    return;
  }

  response
    .type("html")
    .send(
      html.slice(0, bodyEnd) + WEBHOOK_ASSISTANT_TAGS + html.slice(bodyEnd),
    );
}

async function readPage(requestPath: string): Promise<string | undefined> {
  // express.static serves index.html for a folder path
  const pagePath = requestPath.endsWith("/")
    ? `${requestPath}index.html`
    : requestPath;
  // express.static ignores dotfiles; this also rules out ".."
  if (
    !pagePath.endsWith(".html") ||
    pagePath.split("/").some((segment) => segment.startsWith("."))
  ) {
    return undefined;
  }

  const pageFile = path.join(CLIENT_DIRECTORY, pagePath);
  // never read outside the client directory
  if (!pageFile.startsWith(CLIENT_DIRECTORY + path.sep)) {
    return undefined;
  }

  try {
    return await readFile(pageFile, "utf8");
  } catch {
    return undefined;
  }
}
