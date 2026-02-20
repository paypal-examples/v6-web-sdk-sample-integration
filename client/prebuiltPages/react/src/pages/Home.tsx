import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "30px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#4a5568",
                  }}
                >
                  Demo
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#4a5568",
                  }}
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td
                  style={{
                    padding: "16px",
                  }}
                >
                  <Link
                    to="/one-time-payment"
                    style={{
                      color: "#0070ba",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    One-Time Payment
                  </Link>
                </td>
                <td
                  style={{
                    padding: "16px",
                    color: "#4a5568",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  Standard e-commerce checkout with PayPal and Venmo buttons.
                  Demonstrates a complete shopping flow from product selection
                  to payment.
                </td>
              </tr>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td
                  style={{
                    padding: "16px",
                  }}
                >
                  <Link
                    to="/save-payment"
                    style={{
                      color: "#0070ba",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Save Payment Method
                  </Link>
                </td>
                <td
                  style={{
                    padding: "16px",
                    color: "#4a5568",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  Vault payment methods for future use. Shows how to securely
                  save customer payment information for recurring purchases.
                </td>
              </tr>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td
                  style={{
                    padding: "16px",
                  }}
                >
                  <Link
                    to="/subscription"
                    style={{
                      color: "#0070ba",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Subscription
                  </Link>
                </td>
                <td
                  style={{
                    padding: "16px",
                    color: "#4a5568",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  Recurring payment setup with subscription management. Perfect
                  for membership sites, SaaS products, and subscription boxes.
                </td>
              </tr>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td
                  style={{
                    padding: "16px",
                  }}
                >
                  <Link
                    to="/paypal-messages"
                    style={{
                      color: "#0070ba",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    PayPal Messages
                  </Link>
                </td>
                <td
                  style={{
                    padding: "16px",
                    color: "#4a5568",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  PayPal Pay Later messaging demos showing auto-bootstrap,
                  manual content fetching, and Learn More presentation modes.
                </td>
              </tr>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td
                  style={{
                    padding: "16px",
                  }}
                >
                  <Link
                    to="/error-boundary-test"
                    style={{
                      color: "#0070ba",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Error Boundary Demo
                  </Link>
                </td>
                <td
                  style={{
                    padding: "16px",
                    color: "#4a5568",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  Demonstrates React error boundaries for graceful error
                  handling. Shows how errors are caught and displayed without
                  crashing the entire application.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
