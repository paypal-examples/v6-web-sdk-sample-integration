import {
  PayPalMessages,
  ManualMessagingComponent,
  PayPalMessagesLearnMore,
} from "./PayPalMessages";

export default function PayPalMessagesDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "30px" }}>PayPal Messages Demo</h1>

        {/* Auto-Bootstrap Example */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2>Auto-Bootstrap Message</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Uses the <code>auto-bootstrap</code> attribute to automatically
            fetch and display Pay Later messaging.
          </p>
          <PayPalMessages amount="100.00" />
        </section>

        {/* Manual Fetch Example */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2>Manual Content Fetch</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Manually fetches message content using{" "}
            <code>handleFetchContent()</code> and applies it to the web
            component via <code>setContent()</code>.
          </p>
          <ManualMessagingComponent amount="100.00" />
        </section>

        {/* Learn More Example */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "30px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <PayPalMessagesLearnMore initialAmount="100.00" />
        </section>
      </div>
    </div>
  );
}
