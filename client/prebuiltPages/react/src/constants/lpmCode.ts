import type { LPMDemoEntry } from "./lpm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPascal(lpm: string): string {
  return lpm.charAt(0).toUpperCase() + lpm.slice(1);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Sample per-LPM field prefill values shown in the generated code.
const SAMPLE_FIELD_VALUES: Record<string, string> = {
  name: "John Doe",
  email: "john.doe@example.com",
};

/** Sample phone numbers keyed by buyer country. */
const SAMPLE_PHONE: Record<
  string,
  { countryCode: string; nationalNumber: string }
> = {
  ID: { countryCode: "62", nationalNumber: "81234567890" },
  BR: { countryCode: "55", nationalNumber: "11987654321" },
  PT: { countryCode: "351", nationalNumber: "912345678" },
  IT: { countryCode: "39", nationalNumber: "3123456789" },
};

/** Sample tax info keyed by buyer country. */
const SAMPLE_TAX: Record<string, { taxId: string; taxIdType: string }> = {
  BR: { taxId: "12345678909", taxIdType: "BR_CPF" },
  IT: { taxId: "RSSMRA80A01H501U", taxIdType: "IT_CF" },
  ID: { taxId: "1234567890123456", taxIdType: "ID_NIK" },
};

/**
 * Builds the session-field fragment to be RETURNED from `createOrder` in the
 * all-in-one button pattern (fields merged into the order promise object).
 */
function buildSessionFieldsReturn(entry: LPMDemoEntry): string {
  const lines: string[] = [];
  const country = entry.testBuyerCountry;

  for (const field of entry.sessionFields) {
    switch (field) {
      case "phone": {
        const p = SAMPLE_PHONE[country] ?? {
          countryCode: "1",
          nationalNumber: "5551234567",
        };
        lines.push(
          `        phone: { countryCode: "${p.countryCode}", nationalNumber: "${p.nationalNumber}" },`,
        );
        break;
      }
      case "billingAddress":
        lines.push(
          `        billingAddress: {`,
          `            addressLine1: "123 Main St",`,
          `            adminArea2: "Sample City",`,
          `            adminArea1: "Sample State",`,
          `            postalCode: "12345",`,
          `            countryCode: "${country}",`,
          `        },`,
        );
        break;
      case "taxInfo": {
        const t = SAMPLE_TAX[country] ?? {
          taxId: "12345678909",
          taxIdType: "BR_CPF",
        };
        lines.push(
          `        taxInfo: { taxId: "${t.taxId}", taxIdType: "${t.taxIdType}" },`,
        );
        break;
      }
      case "dateOfBirth":
        lines.push(`        dateOfBirth: "1990-01-01",`);
        break;
      case "numberOfInstallments":
        lines.push(`        numberOfInstallments: 3,`);
        break;
    }
  }
  return lines.length > 0 ? `\n${lines.join("\n")}` : "";
}

/**
 * Builds the session-field fragment to be passed as HOOK PROPS in the
 * hook + standalone button pattern.
 */
function buildSessionFieldsHookProps(entry: LPMDemoEntry): string {
  const lines: string[] = [];
  const country = entry.testBuyerCountry;

  for (const field of entry.sessionFields) {
    switch (field) {
      case "phone": {
        const p = SAMPLE_PHONE[country] ?? {
          countryCode: "1",
          nationalNumber: "5551234567",
        };
        lines.push(
          `        phone: { countryCode: "${p.countryCode}", nationalNumber: "${p.nationalNumber}" },`,
        );
        break;
      }
      case "billingAddress":
        lines.push(
          `        billingAddress: {`,
          `            addressLine1: "123 Main St",`,
          `            adminArea2: "Sample City",`,
          `            adminArea1: "Sample State",`,
          `            postalCode: "12345",`,
          `            countryCode: "${country}",`,
          `        },`,
        );
        break;
      case "taxInfo": {
        const t = SAMPLE_TAX[country] ?? {
          taxId: "12345678909",
          taxIdType: "BR_CPF",
        };
        lines.push(
          `        taxInfo: { taxId: "${t.taxId}", taxIdType: "${t.taxIdType}" },`,
        );
        break;
      }
      case "dateOfBirth":
        lines.push(`        dateOfBirth: "1990-01-01",`);
        break;
      case "numberOfInstallments":
        lines.push(`        numberOfInstallments: 3,`);
        break;
    }
  }
  return lines.length > 0 ? `\n${lines.join("\n")}` : "";
}

/** Builds the `fieldValues={{ ... }}` prop string for the button component. */
function buildFieldValuesProp(fields: readonly string[]): string {
  const entries = fields
    .filter((f) => SAMPLE_FIELD_VALUES[f])
    .map((f) => `${f}: "${SAMPLE_FIELD_VALUES[f]}"`);
  return entries.length > 0
    ? `\n                fieldValues={{ ${entries.join(", ")} }}`
    : "";
}

// ---------------------------------------------------------------------------
// Public generators
// ---------------------------------------------------------------------------

/**
 * Generates the **all-in-one button** integration sample for the given LPM.
 *
 * Uses `ORDER_COMPLETE_ON_PAYMENT_APPROVAL` (recommended for LPMs) — PayPal
 * auto-captures at approval, so `onApprove` fetches the order via GET rather
 * than calling POST /capture.
 */
export function generateAllInOneCode(entry: LPMDemoEntry): string {
  const pascal = toPascal(entry.lpm);
  const ButtonName = `${pascal}OneTimePaymentButton`;
  const sessionFieldsReturn = buildSessionFieldsReturn(entry);
  const fieldValuesProp = buildFieldValuesProp(entry.fields);
  const hasSessionFields = entry.sessionFields.length > 0;

  return `// Recommended: all-in-one button
// The ${entry.displayName} button renders its required fields (${
    entry.fields.length > 0 ? entry.fields.join(", ") : "none"
  }) internally.
// ORDER_COMPLETE_ON_PAYMENT_APPROVAL means PayPal auto-captures at approval,
// so onApprove fetches the completed order rather than calling capture.
import {
    PayPalProvider,
    ${ButtonName},
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

async function createOrder() {
    const response = await fetch(
        "/paypal-api/checkout/orders/create-order-for-one-time-payment",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                currencyCode: "${entry.currency}",
                processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
            }),
        },
    );
    const data = await response.json();
    // Return the orderId${hasSessionFields ? " and any required session fields" : ""}.
    return {
        orderId: data.id,${sessionFieldsReturn}
    };
}

async function onApprove(data) {
    // PayPal auto-captured the order — GET to confirm completion.
    const response = await fetch(\`/paypal-api/checkout/orders/\${data.orderId}\`);
    const order = await response.json();
    console.log("Payment completed:", order.status, order.id);
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            environment="sandbox"
            components={["${entry.component}"]}
            pageType="checkout"
            testBuyerCountry="${entry.testBuyerCountry}"
        >
            <${ButtonName}
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={(data) => console.log("Cancelled:", data)}
                onError={(error) => console.error("Error:", error)}${fieldValuesProp}
                presentationMode="popup"
                type="pay"
            />
        </PayPalProvider>
    );
}
`;
}

/**
 * Generates the **hook + standalone button** integration sample.
 *
 * Field components (NameField, EmailField, …) and the standalone button can be
 * placed anywhere in the layout — they are not restricted to a Provider subtree.
 */
export function generateHookCode(entry: LPMDemoEntry): string {
  const pascal = toPascal(entry.lpm);
  const HookName = `use${pascal}OneTimePaymentSession`;
  const ButtonName = `${pascal}PaymentButton`;
  const fieldDestructures = entry.fields
    .map((f) => `${capitalize(f)}Field`)
    .join(", ");
  const hasFields = entry.fields.length > 0;
  const sessionFieldsHookProps = buildSessionFieldsHookProps(entry);

  const fieldRenders = entry.fields
    .map((f) => {
      const valueProp = SAMPLE_FIELD_VALUES[f]
        ? ` value="${SAMPLE_FIELD_VALUES[f]}"`
        : "";
      return `            <${capitalize(f)}Field${valueProp} containerStyles={{ marginBottom: "8px" }} />`;
    })
    .join("\n");

  return `// Advanced: hook + standalone button
// Field components and the button can be placed anywhere in your layout —
// they are not restricted to a Provider subtree.
import {
    PayPalProvider,
    ${HookName},
    ${ButtonName},
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

async function createOrder() {
    const response = await fetch(
        "/paypal-api/checkout/orders/create-order-for-one-time-payment",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                currencyCode: "${entry.currency}",
                processingInstruction: "ORDER_COMPLETE_ON_PAYMENT_APPROVAL",
            }),
        },
    );
    const data = await response.json();
    return { orderId: data.id };
}

function Checkout() {
    const {${hasFields ? ` ${fieldDestructures},` : ""}
        handleClick, isPending, error,
    } = ${HookName}({
        createOrder,
        onApprove: async (data) => {
            // PayPal auto-captured the order — GET to confirm completion.
            const response = await fetch(\`/paypal-api/checkout/orders/\${data.orderId}\`);
            const order = await response.json();
            console.log("Payment completed:", order.status, order.id);
        },
        onCancel: (data) => console.log("Cancelled:", data),
        onError: (error) => console.error("Error:", error),
        presentationMode: "popup",${sessionFieldsHookProps}
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
${hasFields ? fieldRenders + "\n" : ""}            <${ButtonName}
                paymentSession={{ handleClick, isPending, error }}
                type="pay"
                disabled={isPending}
            />
            {error && <p style={{ color: "red" }}>{error.message}</p>}
        </div>
    );
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            environment="sandbox"
            components={["${entry.component}"]}
            pageType="checkout"
            testBuyerCountry="${entry.testBuyerCountry}"
        >
            <Checkout />
        </PayPalProvider>
    );
}
`;
}
