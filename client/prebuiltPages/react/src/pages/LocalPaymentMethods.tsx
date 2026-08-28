import { Link } from "react-router-dom";
import { LPM_DEMO_ENTRIES } from "../constants/lpm";

/**
 * Landing page listing every supported Local Payment Method (LPM), mirroring the
 * reference table in `client/components/localPaymentMethods/README.md`. Each row
 * links to the reusable `LPMOneTimePaymentCheckout` page for that method.
 */
export default function LocalPaymentMethods() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: 8,
            padding: 30,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Local Payment Methods</h1>
          <p style={{ color: "#4a5568" }}>
            {LPM_DEMO_ENTRIES.length} region-specific payment methods via the
            PayPal v6 SDK React wrapper. Each demo loads only its own SDK
            component and uses the method's sandbox currency and buyer country.
            Select one to try the one-time-payment flow.
          </p>

          <p
            style={{
              background: "#ebf8ff",
              border: "1px solid #bee3f8",
              borderRadius: 6,
              padding: "12px 16px",
              color: "#2c5282",
            }}
          >
            <strong>Advanced pattern:</strong>{" "}
            <Link
              to="/local-payment-methods/ideal-hook"
              style={{ color: "#0070ba" }}
            >
              iDEAL — hook + standalone button
            </Link>{" "}
            demonstrates <code>useIdealOneTimePaymentSession</code> with a
            separately placed <code>IdealPaymentButton</code>.
          </p>

          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
          >
            <thead>
              <tr
                style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    color: "#4a5568",
                    fontSize: 14,
                  }}
                >
                  Payment method
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    color: "#4a5568",
                    fontSize: 14,
                  }}
                >
                  Currency
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    color: "#4a5568",
                    fontSize: 14,
                  }}
                >
                  Buyer country
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    color: "#4a5568",
                    fontSize: 14,
                  }}
                >
                  React component
                </th>
              </tr>
            </thead>
            <tbody>
              {LPM_DEMO_ENTRIES.map((entry) => (
                <tr
                  key={entry.lpm}
                  style={{ borderBottom: "1px solid #e2e8f0" }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <Link
                      to={`/local-payment-methods/${entry.lpm}`}
                      style={{
                        color: "#0070ba",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      {entry.displayName}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#4a5568" }}>
                    {entry.currency}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#4a5568" }}>
                    {entry.testBuyerCountry}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#4a5568" }}>
                    <code>
                      {entry.lpm.charAt(0).toUpperCase() + entry.lpm.slice(1)}
                      OneTimePaymentButton
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
