import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePayPalMessages } from "@paypal/react-paypal-js/sdk-v6";
import type {
  LearnMore,
  LearnMoreOptions,
  MessageContent,
<<<<<<< Updated upstream
} from "@paypal/react-paypal-js/sdk-v6";
import { PayPalMessagesElement } from "../types/paypal";
=======
  PayPalMessagesElement
} from "@paypal/react-paypal-js/sdk-v6";

>>>>>>> Stashed changes

interface PayPalMessagesProps {
  amount?: string;
}

/**
 *
 * Basic PayPal Messages component that leverages auto-bootstrap
 * to have the component automatically fetch and display content.
 */
export const PayPalMessages: React.FC<PayPalMessagesProps> = ({ amount }) => {
  const { error } = usePayPalMessages({});

  return error ? null : (
    <paypal-message
      auto-bootstrap={true}
      amount={amount}
      currency-code="USD"
      buyer-country="US"
      text-color="BLACK"
      logo-type="MONOGRAM"
      logo-position="LEFT"
      onPaypalMessageClick={(e) => {
        console.log("User clicked Learn More:", e.detail.config);
        // Open your own modal, track analytics, etc.
      }}
    ></paypal-message>
  );
};

export const ManualMessagingComponent: React.FC<PayPalMessagesProps> = ({
  amount,
}) => {
  const containerRef = useRef<PayPalMessagesElement | null>(null);
  const [messageContent, setMessageContent] = useState<MessageContent | null>(
    null,
  );

  const { handleFetchContent, isReady } = usePayPalMessages({
    buyerCountry: "US",
    currencyCode: "USD",
  });

  useEffect(() => {
    async function loadContent() {
      if (!isReady) {
        return;
      }

      await handleFetchContent({
        amount, // Calculated from cart
        logoPosition: "INLINE",
        logoType: "WORDMARK",
        textColor: "BLACK",
        onReady: (content) => {
          setMessageContent(content);
        },
      });
    }

    loadContent();
  }, [amount, isReady, handleFetchContent]);

  useEffect(() => {
    if (containerRef.current && messageContent) {
      const element = containerRef.current;
      if (element.setContent) {
        element.setContent(messageContent);
      }
    }
  }, [messageContent]);

  return <paypal-message ref={containerRef} />;
};

interface LearnMoreDemoProps {
  initialAmount?: string;
}

export const PayPalMessagesLearnMore: React.FC<LearnMoreDemoProps> = ({
  initialAmount = "50.00",
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  const [amount, setAmount] = useState(initialAmount);
  const [eventLog, setEventLog] = useState<string[]>([]);

  // Learn More instance state - stores the 4 instances
  const [learnMoreInstances, setLearnMoreInstances] = useState<{
  auto: LearnMore | undefined;
  modal: LearnMore | undefined;
  popup: LearnMore | undefined;
  redirect: LearnMore | undefined;
}>({
  auto: undefined,
  modal: undefined,
  popup: undefined,
  redirect: undefined,
});

  // Track isOpen state for each instance
  const [instanceStates, setInstanceStates] = useState<{
    auto: boolean;
    modal: boolean;
    popup: boolean;
    redirect: boolean;
  }>({
    auto: false,
    modal: false,
    popup: false,
    redirect: false,
  });

  // ============================================================================
  // HOOK - handleCreateLearnMore is the key method here
  // ============================================================================
  const { handleCreateLearnMore, error, isReady } = usePayPalMessages({
    buyerCountry: "US",
    currencyCode: "USD",
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Log events to console and state
  const logEvent = useCallback((eventName: string, detail?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const message = `[${timestamp}] ${eventName}${
      detail ? ": " + JSON.stringify(detail) : ""
    }`;
    console.log(message);
    setEventLog((prev) => [message, ...prev].slice(0, 15));
  }, []);

  // Helper to create a Learn More instance with callbacks
  const createLearnMoreInstance = useCallback(
    (mode: string) => {
      const options: LearnMoreOptions = {
        amount,
        presentationMode: mode as any,
        onShow: (data) => {
          logEvent(`${mode} onShow`, data);
          setInstanceStates((prev) => ({
            ...prev,
            [mode.toLowerCase()]: true,
          }));
        },
        onClose: (data) => {
          logEvent(`${mode} onClose`, data);
          setInstanceStates((prev) => ({
            ...prev,
            [mode.toLowerCase()]: false,
          }));
        },
        onApply: (data) => {
          logEvent(`${mode} onApply`, data);
        },
        onCalculate: (data) => {
          logEvent(`${mode} onCalculate`, data);
        },
      };

      return handleCreateLearnMore(options);
    },
    [amount, handleCreateLearnMore, logEvent],
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Create all Learn More instances when ready
  useEffect(() => {
    if (!isReady) return;

    logEvent("Creating Learn More instances");

    const instances = {
      auto: createLearnMoreInstance("AUTO"),
      modal: createLearnMoreInstance("MODAL"),
      popup: createLearnMoreInstance("POPUP"),
      redirect: createLearnMoreInstance("REDIRECT"),
    };

    setLearnMoreInstances(instances);
    logEvent("All Learn More instances created");
  }, [isReady, createLearnMoreInstance, logEvent]);

  // Update instances when amount changes
  useEffect(() => {
    if (!isReady) return;

    const updatePromises = Object.entries(learnMoreInstances).map(
      async ([mode, instance]) => {
        if (instance) {
          await instance.update({
            amount,
            presentationMode: mode.toUpperCase() as any,
          });
          logEvent(
            `Updated ${mode.toUpperCase()} instance with amount ${amount}`,
          );
        }
      },
    );

    Promise.all(updatePromises);
  }, [amount, learnMoreInstances, isReady, logEvent]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const openLearnMore = async (mode: string) => {
    const instance =
      learnMoreInstances[mode.toLowerCase() as keyof typeof learnMoreInstances];
    if (instance) {
      logEvent(`Opening ${mode} Learn More`);
      try {
        await instance.open();
        logEvent(`${mode} Learn More opened successfully`);
      } catch (err) {
        logEvent(`Failed to open ${mode} Learn More`, {
          error: (err as Error).message,
        });
      }
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: {error.message}
      </div>
    );
  }

  if (!isReady) {
    return <div style={{ padding: "20px" }}>Loading PayPal Messages...</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h1>PayPal Messages Learn More Demo</h1>

      {/* Amount Control */}
      <section style={{ marginBottom: "40px" }}>
        <h2>Amount Control</h2>
        <label style={{ display: "block", marginBottom: "10px" }}>
          <strong>Amount: </strong>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginLeft: "10px",
              width: "150px",
            }}
          />
        </label>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Current amount: ${amount}
        </p>
      </section>

      {/* Hook-Based Controls */}
      <section
        style={{
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Programmatic Learn More Control</h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
          Click each button to open the corresponding Learn More presentation
          mode. Each instance was created using handleCreateLearnMore().
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => openLearnMore("auto")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#0070ba",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Open AUTO Learn More
          </button>

          <button
            onClick={() => openLearnMore("modal")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#0070ba",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Open MODAL Learn More
          </button>

          <button
            onClick={() => openLearnMore("popup")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#0070ba",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Open POPUP Learn More
          </button>

          <button
            onClick={() => openLearnMore("redirect")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#0070ba",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Open REDIRECT Learn More
          </button>
        </div>
      </section>

      {/* Instance States */}
      <section
        style={{
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Instance States</h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
          Shows the isOpen state for each Learn More instance
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          {Object.entries(instanceStates).map(([mode, isOpen]) => (
            <div
              key={mode}
              style={{
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: isOpen ? "#e6f7e6" : "#f5f5f5",
              }}
            >
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                {mode}
              </div>
              <div style={{ marginTop: "5px", fontSize: "14px" }}>
                isOpen:{" "}
                <span
                  style={{
                    color: isOpen ? "green" : "gray",
                    fontWeight: "bold",
                  }}
                >
                  {isOpen ? "true" : "false"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Event Log */}
      <section
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2>Event Log</h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
          Real-time log of Learn More events (last 15 events)
        </p>

        {eventLog.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#999" }}>
            No events logged yet. Click a button to open Learn More.
          </p>
        ) : (
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              padding: "10px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {eventLog.map((log, index) => (
              <div key={index} style={{ marginBottom: "5px" }}>
                {log}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setEventLog([])}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Clear Event Log
        </button>
      </section>
    </div>
  );
};
