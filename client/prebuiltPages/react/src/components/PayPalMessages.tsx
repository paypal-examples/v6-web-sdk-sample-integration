import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePayPalMessages } from "@paypal/react-paypal-js/sdk-v6";
import type {
  LearnMore,
  LearnMoreOptions,
  PayPalMessagesElement,
} from "@paypal/react-paypal-js/sdk-v6";

interface PayPalMessagesProps {
  amount?: string;
}

/**
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
      }}
    ></paypal-message>
  );
};

/**
 * Manual messaging component that fetches content programmatically
 * and applies it to the web component via setContent().
 */
export const ManualMessagingComponent: React.FC<PayPalMessagesProps> = ({
  amount,
}) => {
  const containerRef = useRef<PayPalMessagesElement | null>(null);
  const [messageContent, setMessageContent] =
    useState<Record<string, unknown> | null>(null);

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
        amount,
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

/**
 * Comprehensive Learn More demo featuring amount control,
 * four presentation modes, instance state tracking, and event logging.
 */
export const PayPalMessagesLearnMore: React.FC<LearnMoreDemoProps> = ({
  initialAmount = "50.00",
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [eventLog, setEventLog] = useState<string[]>([]);

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

  const { handleCreateLearnMore, error, isReady } = usePayPalMessages({
    buyerCountry: "US",
    currencyCode: "USD",
  });

  const logEvent = useCallback((eventName: string, detail?: unknown) => {
    const timestamp = new Date().toLocaleTimeString();
    const message = `[${timestamp}] ${eventName}${
      detail ? ": " + JSON.stringify(detail) : ""
    }`;
    console.log(message);
    setEventLog((prev) => [message, ...prev].slice(0, 15));
  }, []);

  const createLearnMoreInstance = useCallback(
    (mode: string) => {
      const options: LearnMoreOptions = {
        amount,
        presentationMode: mode as LearnMoreOptions["presentationMode"],
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

  useEffect(() => {
    if (!isReady) return;

    const updatePromises = Object.entries(learnMoreInstances).map(
      async ([mode, instance]) => {
        if (instance) {
          await instance.update({
            amount,
            presentationMode:
              mode.toUpperCase() as LearnMoreOptions["presentationMode"],
          });
          logEvent(
            `Updated ${mode.toUpperCase()} instance with amount ${amount}`,
          );
        }
      },
    );

    Promise.all(updatePromises);
  }, [amount, learnMoreInstances, isReady, logEvent]);

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
      <h2>Learn More Demo</h2>

      {/* Amount Control */}
      <section style={{ marginBottom: "40px" }}>
        <h3>Amount Control</h3>
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

      {/* Presentation Mode Buttons */}
      <section
        style={{
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Programmatic Learn More Control</h3>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
          Click each button to open the corresponding Learn More presentation
          mode. Each instance was created using handleCreateLearnMore().
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {["AUTO", "MODAL", "POPUP", "REDIRECT"].map((mode) => (
            <button
              key={mode}
              onClick={() => openLearnMore(mode)}
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
              Open {mode} Learn More
            </button>
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
        <h3>Event Log</h3>
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
