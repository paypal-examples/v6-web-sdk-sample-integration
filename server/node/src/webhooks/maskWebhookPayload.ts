// Masks personal values a developer may have typed at checkout (often their
// own) before the webhook inbox stores a payload. Each masked value keeps a
// short hint, matching the other PayPal samples.

type Masker = (value: string) => string;

const keep: Masker = (value) => value;

const stars: Masker = () => "***";

const firstLetter: Masker = (value) =>
  value.trim() ? `${value.trim().charAt(0)}***` : value;

const firstTwo: Masker = (value) =>
  value.length > 2 ? `${value.slice(0, 2)}***` : "***";

const lastTwo: Masker = (value) =>
  value.length > 2
    ? `${"*".repeat(value.length - 2)}${value.slice(-2)}`
    : "***";

// keeps the first character and the domain, "j***@gmail.com"
const maskEmail: Masker = (value) => {
  const at = value.lastIndexOf("@");
  return at > 0 ? `${value.charAt(0)}***${value.slice(at)}` : "***";
};

// personal values, by key name
const MASKED_KEYS = new Map<string, Masker>([
  ["email_address", maskEmail],
  ["email", maskEmail],
  ["given_name", firstLetter],
  ["surname", firstLetter],
  ["full_name", firstLetter],
  ["national_number", lastTwo],
  ["postal_code", firstTwo],
  ["address_line_1", stars],
  ["address_line_2", stars],
  ["address_line_3", stars],
  ["birth_date", stars],
  ["tax_id", stars],
]);

// keys too generic to mask everywhere, by "parent.key"
const MASKED_NESTED_KEYS = new Map<string, Masker>([
  ["card.name", firstLetter],
  ["buyer.name", firstLetter],
  ["messages.content", stars],
  // account holder names on payment_source
  ["apple_pay.name", firstLetter],
  ["bancontact.name", firstLetter],
  ["blik.name", firstLetter],
  ["eps.name", firstLetter],
  ["giropay.name", firstLetter],
  ["google_pay.name", firstLetter],
  ["ideal.name", firstLetter],
  ["mybank.name", firstLetter],
  ["p24.name", firstLetter],
  ["sofort.name", firstLetter],
  ["trustly.name", firstLetter],
  ["venmo.user_name", firstLetter],
  // the merchant's own sandbox business account, not a personal value
  ["payee.email_address", keep],
]);

function maskValue(value: unknown, key = "", parentKey = ""): unknown {
  if (Array.isArray(value)) {
    // items take the array's key, so "messages.content" matches in "messages"
    return value.map((item) => maskValue(item, key, parentKey));
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        maskValue(childValue, childKey, key),
      ]),
    );
  }

  if (typeof value !== "string") {
    return value;
  }

  const mask =
    MASKED_NESTED_KEYS.get(`${parentKey}.${key}`) ?? MASKED_KEYS.get(key);
  return mask ? mask(value) : value;
}

export function maskWebhookPayload(payload: object): Record<string, unknown> {
  return maskValue(payload) as Record<string, unknown>;
}
