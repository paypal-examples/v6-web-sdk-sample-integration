import {
  useEffect,
  useMemo,
  useState,
  createElement,
  type ComponentType,
  type ComponentProps,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as LPMExports from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

import CodeDrawer from "../components/CodeDrawer";
import {
  getBrowserSafeClientId,
  createLpmOrder,
  getOrder,
  fetchEligibleMethods,
} from "../utils";
import { getLPMDemoEntry, type LPMDemoEntry } from "../constants/lpm";
import {
  buildSampleSessionExtras,
  SAMPLE_FIELD_VALUES,
} from "../constants/lpmSamples";
import { generateAllInOneCode, generateHookCode } from "../constants/lpmCode";

const { PayPalProvider, usePayPal, INSTANCE_LOADING_STATE } = LPMExports;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Rich result passed from the inner checkout content up to the page. */
type LPMResult =
  | { type: "success"; orderId: string; status: string; amount?: string }
  | { type: "cancel" }
  | { type: "error"; message?: string }
  | null;

/**
 * Props accepted by every generated `<Xxx>OneTimePaymentButton`.
 *
 * The index signature (`[key: string]: unknown`) is intentional — it allows
 * spreading LPMSessionExtras (phone, billingAddress, taxInfo, dateOfBirth,
 * numberOfInstallments) as direct props. The hook reads these from
 * `proxyCallbacks` and adds them to `startOptions` (first arg to
 * `session.start()`), providing a second channel alongside the `createOrder`
 * Promise. Both channels are needed because FLOA's `dateOfBirth` /
 * `numberOfInstallments` are NOT in `LPMOneTimePaymentSessionPromise`.
 */
interface LPMButtonProps {
  presentationMode?: "auto" | "popup";
  type?: string;
  disabled?: boolean;
  fieldValues?: Record<string, string>;
  createOrder: () => Promise<{ orderId: string } & Record<string, unknown>>;
  onApprove: (data: { orderId: string }) => Promise<void> | void;
  onCancel?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  // Allow session-field extras (phone, billingAddress, taxInfo, dateOfBirth,
  // numberOfInstallments) to be spread directly onto the button as props.
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascal(lpm: string): string {
  return lpm.charAt(0).toUpperCase() + lpm.slice(1);
}

function getLPMButton(lpm: string): ComponentType<LPMButtonProps> | undefined {
  const name = `${toPascal(lpm)}OneTimePaymentButton`;
  return (LPMExports as Record<string, unknown>)[name] as
    | ComponentType<LPMButtonProps>
    | undefined;
}

// ─── Inline result banner ─────────────────────────────────────────────────────

const RESULT_STYLES: Record<
  "success" | "cancel" | "error",
  { bg: string; border: string; icon: string; heading: string }
> = {
  success: {
    bg: "#f0fff4",
    border: "#9ae6b4",
    icon: "✅",
    heading: "Payment Successful!",
  },
  cancel: {
    bg: "#fffbeb",
    border: "#f6d860",
    icon: "⚠️",
    heading: "Payment Cancelled",
  },
  error: {
    bg: "#fff5f5",
    border: "#fc8181",
    icon: "❌",
    heading: "Payment Error",
  },
};

function ResultBanner({
  result,
  lpmName,
  onRetry,
}: {
  result: Exclude<LPMResult, null>;
  lpmName: string;
  onRetry: () => void;
}) {
  const s = RESULT_STYLES[result.type];
  return (
    <div
      style={{
        marginTop: 24,
        padding: "20px 24px",
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        fontFamily: "inherit",
      }}
      role="status"
      aria-live="polite"
    >
      <p style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 600 }}>
        {s.icon} {s.heading}
      </p>

      {result.type === "success" && (
        <>
          <p style={{ margin: "4px 0", color: "#276749" }}>
            Thank you for your <strong>{lpmName}</strong> purchase!
          </p>
          <table
            style={{
              marginTop: 12,
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "3px 16px 3px 0", color: "#4a5568" }}>
                  Order ID
                </td>
                <td>
                  <code style={{ fontSize: "0.88rem" }}>{result.orderId}</code>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 16px 3px 0", color: "#4a5568" }}>
                  Status
                </td>
                <td style={{ fontWeight: 600, color: "#276749" }}>
                  {result.status}
                </td>
              </tr>
              {result.amount && (
                <tr>
                  <td style={{ padding: "3px 16px 3px 0", color: "#4a5568" }}>
                    Amount
                  </td>
                  <td>{result.amount}</td>
                </tr>
              )}
            </tbody>
          </table>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: "0.85rem",
              color: "#4a5568",
            }}
          >
            Full order details logged to browser console.
          </p>
        </>
      )}

      {result.type === "cancel" && (
        <p style={{ margin: "4px 0 12px", color: "#92400e" }}>
          Your {lpmName} payment was cancelled. You can try again below.
        </p>
      )}

      {result.type === "error" && (
        <p style={{ margin: "4px 0 12px", color: "#9b2c2c" }}>
          {result.message ||
            `An error occurred during the ${lpmName} payment. Please try again.`}
        </p>
      )}

      {result.type !== "success" && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 4,
            cursor: "pointer",
            background: "transparent",
            color: "#0070ba",
            border: "2px solid #0070ba",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Inner checkout content (runs inside PayPalProvider) ─────────────────────

function LPMCheckoutContent({
  entry,
  sessionExtras,
  onResult,
}: {
  entry: LPMDemoEntry;
  /** Pre-built session-field values (phone, billingAddress, taxInfo, …) */
  sessionExtras: ReturnType<typeof buildSampleSessionExtras>;
  onResult: (result: LPMResult) => void;
}) {
  const { loadingStatus } = usePayPal();
  const ButtonComponent = useMemo(() => getLPMButton(entry.lpm), [entry.lpm]);
  const isLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  if (!ButtonComponent) {
    return (
      <div style={{ color: "#c53030" }}>
        No button component found for "{entry.displayName}".
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        Loading payment method…
      </div>
    );
  }

  const handleCreateOrder = async () => {
    const { orderId } = await createLpmOrder({ currencyCode: entry.currency });
    // Session extras are included in the Promise (channel 1 — used by the SDK
    // for phone / billingAddress / taxInfo / expiryDate) AND as direct props
    // (channel 2 — the hook's proxyCallbacks path, required for FLOA's
    // dateOfBirth / numberOfInstallments which aren't in LPMOneTimePaymentSessionPromise).
    return { orderId, ...sessionExtras };
  };

  const handleApprove = async (data: { orderId: string }) => {
    // ORDER_COMPLETE_ON_PAYMENT_APPROVAL: order is auto-captured at approval.
    // GET the order to show details; still mark success even if the fetch fails.
    try {
      const order = await getOrder({ orderId: data.orderId });
      console.log(`[LPMCheckout] ${entry.displayName} order details:`, order);
      const amount: string | undefined =
        order?.purchaseUnits?.[0]?.payments?.captures?.[0]?.amount?.value ??
        order?.purchaseUnits?.[0]?.amount?.value;
      onResult({
        type: "success",
        orderId: data.orderId,
        status: order?.status ?? "COMPLETED",
        amount,
      });
    } catch {
      // onApprove was called → payment was approved; show success even if GET fails.
      onResult({ type: "success", orderId: data.orderId, status: "COMPLETED" });
    }
  };

  return createElement(ButtonComponent, {
    presentationMode: "popup",
    type: "pay",
    fieldValues: SAMPLE_FIELD_VALUES,
    // Channel 2: pass session extras as direct props so the hook's proxyCallbacks
    // path also sees them (required for FLOA's dateOfBirth / numberOfInstallments).
    ...sessionExtras,
    createOrder: handleCreateOrder,
    onApprove: handleApprove,
    onCancel: () => onResult({ type: "cancel" }),
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      console.error(`[LPMCheckout] ${entry.displayName} payment error:`, error);
      onResult({ type: "error", message });
    },
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Reusable checkout page for any Local Payment Method (LPM).
 *
 * Reads the `:lpm` route param, mounts a dedicated `PayPalProvider` from the
 * LPM subpath (separate React context/bundle — must NOT reuse the app-wide
 * provider), and renders the method's all-in-one payment button. On completion
 * shows a persistent inline result banner (success / cancel / error) instead of
 * a dismissible modal, mirroring the legacy vanilla-JS demo behaviour.
 */
const LPMOneTimePaymentCheckout = () => {
  const { lpm = "" } = useParams();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<LPMResult>(null);
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
  // Eligible methods response from the server — mirrors the legacy JS eligibility check.
  // null = not yet fetched, undefined = ineligible or fetch failed, object = eligible.
  const [eligibleMethodsResponse, setEligibleMethodsResponse] = useState<
    Record<string, unknown> | null | undefined
  >(null);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  const entry = getLPMDemoEntry(lpm);

  useEffect(() => {
    getBrowserSafeClientId().then(setClientId).catch(console.error);
  }, []);

  // Eligibility check — mirrors legacy `sdkInstance.findEligibleMethods({ currencyCode })`.
  // We call our server endpoint which proxies the PayPal v2/payments/find-eligible-methods API.
  useEffect(() => {
    if (!entry) return;

    let cancelled = false;

    const checkEligibility = async () => {
      try {
        const data = await fetchEligibleMethods({
          currencyCode: entry.currency,
          buyerCountryCode: entry.testBuyerCountry,
        });
        if (cancelled) return;
        // Check if this specific LPM is present in the eligible_methods response
        const key = entry.eligibilityKey;
        const isEligible =
          !key ||
          (data?.eligible_methods &&
            Object.prototype.hasOwnProperty.call(data.eligible_methods, key));
        if (isEligible) {
          setEligibleMethodsResponse(data);
        } else {
          setEligibleMethodsResponse(undefined);
          setEligibilityError(
            `${entry.displayName} is not eligible for currency ${entry.currency} / country ${entry.testBuyerCountry}.`,
          );
          console.warn("[LPM eligibility] ineligible:", key, data);
        }
      } catch (err) {
        // Non-blocking: log but still allow the SDK to render the button.
        if (!cancelled) {
          console.warn("[LPM eligibility] fetch failed:", err);
          setEligibleMethodsResponse(undefined);
        }
      }
    };

    checkEligibility();
    return () => {
      cancelled = true;
    };
  }, [entry]);

  // Dev-only test hook: allows Playwright (or other test runners) to simulate
  // the payment result without going through the full PayPal sandbox flow.
  // Only exposed in development mode — has no effect in production builds.
  useEffect(() => {
    if (!import.meta.env.PROD) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__lpmSetResult = setResult;
      return () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__lpmSetResult;
      };
    }
  }, [setResult]);

  if (!entry) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Unknown payment method</h1>
        <p>
          "{lpm}" is not a supported Local Payment Method.{" "}
          <button onClick={() => navigate("/local-payment-methods")}>
            Back to list
          </button>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      <CodeDrawer
        isOpen={codeDrawerOpen}
        onClose={() => setCodeDrawerOpen(false)}
        title={entry.displayName}
        allInOneCode={generateAllInOneCode(entry)}
        hookCode={generateHookCode(entry)}
      />

      {/* Top toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => navigate("/local-payment-methods")}
          style={{
            cursor: "pointer",
            background: "transparent",
            color: "#0070ba",
            border: "2px solid #0070ba",
            borderRadius: 6,
            padding: "8px 16px",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          ← All Local Payment Methods
        </button>
        <button
          onClick={() => setCodeDrawerOpen(true)}
          style={{
            cursor: "pointer",
            background: "#0070ba",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {"</>  Show Code"}
        </button>
      </div>

      <h1>{entry.displayName}</h1>

      {/* Meta table */}
      <table style={{ margin: "16px 0", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "4px 16px 4px 0", color: "#666" }}>
              Currency
            </td>
            <td style={{ padding: "4px 0" }}>{entry.currency}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px 16px 4px 0", color: "#666" }}>
              Buyer country (sandbox)
            </td>
            <td style={{ padding: "4px 0" }}>{entry.testBuyerCountry}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px 16px 4px 0", color: "#666" }}>
              React component
            </td>
            <td style={{ padding: "4px 0" }}>
              <code>
                {entry.lpm.charAt(0).toUpperCase() + entry.lpm.slice(1)}
                OneTimePaymentButton
              </code>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Session fields — shown for LPMs that require merchant-supplied data
          (phone, billing address, tax info, date of birth, installments).
          In a real integration the merchant collects these from the buyer.
          The demo pre-fills them with sandbox-safe sample values. */}
      {entry.sessionFields.length > 0 && (
        <div
          data-testid="session-fields-section"
          style={{
            margin: "8px 0 16px",
            padding: "12px 16px",
            background: "#f0f8ff",
            border: "1px solid #bee3f8",
            borderRadius: 6,
            fontSize: "0.88em",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "#2b6cb0",
              marginBottom: 8,
            }}
          >
            📋 Session Fields (sample values)
          </div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {entry.sessionFields.map((field) => {
                const extras = buildSampleSessionExtras(entry) as Record<
                  string,
                  unknown
                >;
                const value = extras[field];
                return (
                  <tr key={field}>
                    <td
                      style={{
                        padding: "2px 12px 2px 0",
                        color: "#4a5568",
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                        verticalAlign: "top",
                      }}
                    >
                      {field}
                    </td>
                    <td
                      style={{
                        padding: "2px 0",
                        color: "#2d3748",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {JSON.stringify(value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ margin: "8px 0 0", color: "#4a5568", fontSize: "0.95em" }}>
            These sample values are passed via <code>createOrder</code> (
            <code>LPMOneTimePaymentSessionPromise</code>) and as button props (
            <code>proxyCallbacks</code>). In a real integration, collect these
            from the buyer before payment.
          </p>
        </div>
      )}

      <p style={{ color: "#666", fontSize: "0.9em" }}>
        The full-name{entry.fields.includes("email") ? " and email" : ""} field
        {entry.fields.length > 1 ? "s are" : " is"} rendered by the SDK below.
        Ensure your sandbox account accepts {entry.currency}.
      </p>

      {/* Payment button — hidden after a successful payment */}
      {result?.type !== "success" && (
        <div style={{ marginTop: 24 }}>
          {/* Eligibility loading */}
          {eligibleMethodsResponse === null && !eligibilityError && (
            <div
              data-testid="eligibility-loading"
              style={{ padding: "1rem", color: "#666", fontSize: "0.9em" }}
            >
              Checking eligibility…
            </div>
          )}

          {/* Ineligible */}
          {eligibilityError && (
            <div
              data-testid="eligibility-ineligible"
              style={{
                padding: "12px 16px",
                background: "#fff5f5",
                border: "1px solid #fc8181",
                borderRadius: 6,
                color: "#9b2c2c",
                fontSize: "0.9em",
              }}
            >
              ⚠️ {eligibilityError}
            </div>
          )}

          {/* Eligible — render payment button */}
          {eligibleMethodsResponse !== null && !eligibilityError && clientId && (
            <PayPalProvider
              key={entry.lpm}
              clientId={clientId}
              environment="sandbox"
              components={
                [entry.component] as ComponentProps<
                  typeof PayPalProvider
                >["components"]
              }
              pageType="checkout"
              testBuyerCountry={entry.testBuyerCountry}
              eligibleMethodsResponse={
                eligibleMethodsResponse as Parameters<
                  typeof PayPalProvider
                >[0]["eligibleMethodsResponse"]
              }
            >
              <LPMCheckoutContent
                entry={entry}
                sessionExtras={buildSampleSessionExtras(entry)}
                onResult={setResult}
              />
            </PayPalProvider>
          )}

          {/* clientId still loading */}
          {eligibleMethodsResponse !== null && !eligibilityError && !clientId && (
            <div style={{ padding: "1rem", textAlign: "center" }}>Loading…</div>
          )}
        </div>
      )}

      {/* Inline result banner — mirrors the legacy alert-component behaviour */}
      {result && (
        <ResultBanner
          result={result}
          lpmName={entry.displayName}
          onRetry={() => setResult(null)}
        />
      )}
    </div>
  );
};

export default LPMOneTimePaymentCheckout;
