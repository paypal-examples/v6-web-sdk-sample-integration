import { describe, expect, test } from "vitest";

import { maskWebhookPayload } from "./maskWebhookPayload";

describe("maskWebhookPayload", () => {
  test("masks personal values with a short hint and keeps IDs, amounts and every key", () => {
    const payload = {
      id: "WH-1",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "CAPTURE-1",
        amount: { currency_code: "USD", value: "100.00" },
        payer: {
          email_address: "buyer@example.com",
          name: { given_name: "Jane", surname: "Doe" },
          phone: { phone_number: { national_number: "4085551234" } },
          address: {
            address_line_1: "1 Main St",
            postal_code: "95131",
            country_code: "US",
          },
        },
        payment_source: { card: { name: "Jane Doe", last_digits: "1111" } },
      },
    };

    expect(maskWebhookPayload(payload)).toEqual({
      id: "WH-1",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "CAPTURE-1",
        amount: { currency_code: "USD", value: "100.00" },
        payer: {
          email_address: "b***@example.com",
          name: { given_name: "J***", surname: "D***" },
          phone: { phone_number: { national_number: "********34" } },
          address: {
            address_line_1: "***",
            postal_code: "95***",
            country_code: "US",
          },
        },
        payment_source: { card: { name: "J***", last_digits: "1111" } },
      },
    });
  });

  test("masks a generic key only where it holds a personal value", () => {
    const payload = {
      resource: {
        items: [{ name: "T-shirt" }],
        messages: [{ content: "Where is my order?" }],
      },
    };

    expect(maskWebhookPayload(payload)).toEqual({
      resource: {
        items: [{ name: "T-shirt" }],
        messages: [{ content: "***" }],
      },
    });
  });

  test("masks account holder names on every payment source", () => {
    const sources = [
      "apple_pay",
      "bancontact",
      "blik",
      "eps",
      "giropay",
      "google_pay",
      "ideal",
      "mybank",
      "p24",
      "sofort",
      "trustly",
    ];
    const payload = {
      payment_source: {
        ...Object.fromEntries(
          sources.map((source) => [source, { name: "Jane Doe" }]),
        ),
        venmo: { user_name: "janedoe" },
      },
    };

    expect(maskWebhookPayload(payload)).toEqual({
      payment_source: {
        ...Object.fromEntries(
          sources.map((source) => [source, { name: "J***" }]),
        ),
        venmo: { user_name: "j***" },
      },
    });
  });

  test("keeps the merchant's own payee email", () => {
    const payload = {
      resource: {
        purchase_units: [
          { payee: { email_address: "sb-biz@business.example.com" } },
        ],
      },
    };

    expect(maskWebhookPayload(payload)).toEqual(payload);
  });

  test("masks short values and an email without @ in full", () => {
    const payload = {
      payer: {
        email_address: "not-an-email",
        address: { postal_code: "95" },
        phone: { phone_number: { national_number: "12" } },
      },
    };

    expect(maskWebhookPayload(payload)).toEqual({
      payer: {
        email_address: "***",
        address: { postal_code: "***" },
        phone: { phone_number: { national_number: "***" } },
      },
    });
  });

  test("doesn't treat inherited object keys as masking rules", () => {
    const payload = { resource: { toString: "kept", constructor: "kept" } };

    expect(maskWebhookPayload(payload)).toEqual(payload);
  });

  test("doesn't change the payload it's given", () => {
    const payload = { resource: { payer: { email_address: "a@b.com" } } };

    maskWebhookPayload(payload);

    expect(payload.resource.payer.email_address).toBe("a@b.com");
  });
});
