import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PayPalProvider,
  useIdealOneTimePaymentSession,
  IdealPaymentButton,
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

import CodeDrawer from "../components/CodeDrawer";
import { getBrowserSafeClientId, createLpmOrder, getOrder } from "../utils";
import { getLPMDemoEntry } from "../constants/lpm";
import { generateAllInOneCode, generateHookCode } from "../constants/lpmCode";

const IDEAL_CURRENCY = "EUR";
const IDEAL_TEST_BUYER_COUNTRY = "NL";

// ─── Result type (same shape as LPMOneTimePaymentCheckout) ────────────────────

type LPMResult =
  | { type: "success"; orderId: string; status: string; amount?: string }
  | { type: "cancel" }
  | { type: "error"; message?: string }
  | null;

// ─── Inline result banner (shared pattern) ────────────────────────────────────

const RESULT_STYLES = {
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
  onRetry,
}: {
  result: Exclude<LPMResult, null>;
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
            Thank you for your <strong>iDEAL</strong> purchase!
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
          Your iDEAL payment was cancelled. You can try again below.
        </p>
      )}

      {result.type === "error" && (
        <p style={{ margin: "4px 0 12px", color: "#9b2c2c" }}>
          {result.message ||
            "An error occurred during the iDEAL payment. Please try again."}
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

// ─── Inner hook content ───────────────────────────────────────────────────────

/**
 * Demonstrates the advanced "hook + standalone button" LPM pattern.
 * Unlike the all-in-one button, `NameField` and `IdealPaymentButton` can be
 * placed anywhere in the layout.
 */
function IdealHookContent({
  onResult,
}: {
  onResult: (result: LPMResult) => void;
}) {
  const { NameField, handleClick, isPending, error } =
    useIdealOneTimePaymentSession({
      presentationMode: "popup",
      createOrder: async () => {
        const { orderId } = await createLpmOrder({
          currencyCode: IDEAL_CURRENCY,
        });
        return { orderId };
      },
      onApprove: async (data) => {
        // ORDER_COMPLETE_ON_PAYMENT_APPROVAL: auto-captured at approval.
        // GET to confirm; still mark success even if the fetch fails.
        try {
          const order = await getOrder({ orderId: data.orderId });
          console.log("[iDEAL hook] Order details:", order);
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
          onResult({
            type: "success",
            orderId: data.orderId,
            status: "COMPLETED",
          });
        }
      },
      onCancel: () => onResult({ type: "cancel" }),
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("[iDEAL hook] payment error:", err);
        onResult({ type: "error", message });
      },
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <NameField value="Jane Buyer" containerStyles={{ marginBottom: 8 }} />
      <IdealPaymentButton
        paymentSession={{ handleClick, isPending, error }}
        type="pay"
        disabled={isPending}
      />
      {error && <p style={{ color: "#c53030" }}>{error.message}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * iDEAL checkout demonstrating the advanced hook + standalone button pattern.
 * See `LPMOneTimePaymentCheckout` for the recommended all-in-one button flow.
 */
const IdealHookCheckout = () => {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<LPMResult>(null);
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);

  const idealEntry = getLPMDemoEntry("ideal")!;

  useEffect(() => {
    getBrowserSafeClientId().then(setClientId).catch(console.error);
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      <CodeDrawer
        isOpen={codeDrawerOpen}
        onClose={() => setCodeDrawerOpen(false)}
        title="iDEAL"
        allInOneCode={generateAllInOneCode(idealEntry)}
        hookCode={generateHookCode(idealEntry)}
      />

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

      <h1>iDEAL — Hook + Standalone Button</h1>
      <p style={{ color: "#666" }}>
        This advanced example uses <code>useIdealOneTimePaymentSession</code> to
        obtain the <code>NameField</code> and click handler, then renders the
        standalone <code>IdealPaymentButton</code> separately. The fields and
        button can be placed anywhere in your layout. Ensure your sandbox
        account accepts {IDEAL_CURRENCY}.
      </p>

      {/* Payment form — hidden once payment succeeds */}
      {result?.type !== "success" && (
        <div style={{ marginTop: 24 }}>
          {clientId ? (
            <PayPalProvider
              clientId={clientId}
              environment="sandbox"
              components={["ideal-payments"]}
              pageType="checkout"
              testBuyerCountry={IDEAL_TEST_BUYER_COUNTRY}
            >
              <IdealHookContent onResult={setResult} />
            </PayPalProvider>
          ) : (
            <div style={{ padding: "1rem", textAlign: "center" }}>Loading…</div>
          )}
        </div>
      )}

      {/* Inline result banner */}
      {result && (
        <ResultBanner result={result} onRetry={() => setResult(null)} />
      )}
    </div>
  );
};

export default IdealHookCheckout;
