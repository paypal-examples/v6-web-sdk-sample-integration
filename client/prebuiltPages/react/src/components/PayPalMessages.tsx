import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

type LearnMoreInstances = {
  auto: LearnMore | undefined;
  modal: LearnMore | undefined;
  popup: LearnMore | undefined;
  redirect: LearnMore | undefined;
};

/**
 * Comprehensive Learn More demo featuring amount control,
 * four presentation modes, instance state tracking, and event logging.
 */
export const PayPalMessagesLearnMore: React.FC<LearnMoreDemoProps> = ({
  initialAmount = "50.00",
}) => {
  const [amount, setAmount] = useState(initialAmount);

  const [, setInstanceStates] = useState<{
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

  const createLearnMoreInstance = useCallback(
    (mode: string) => {
      const options: LearnMoreOptions = {
        amount,
        presentationMode: mode as LearnMoreOptions["presentationMode"],
        onShow: (data) => {
          console.log(`${mode} onShow`, data);
          setInstanceStates((prev) => ({
            ...prev,
            [mode.toLowerCase()]: true,
          }));
        },
        onClose: (data) => {
          console.log(`${mode} onClose`, data);
          setInstanceStates((prev) => ({
            ...prev,
            [mode.toLowerCase()]: false,
          }));
        },
        onApply: (data) => {
          console.log(`${mode} onApply`, data);
        },
        onCalculate: (data) => {
          console.log(`${mode} onCalculate`, data);
        },
      };

      return handleCreateLearnMore(options);
    },
    [amount, handleCreateLearnMore],
  );

  const learnMoreInstances = useMemo<LearnMoreInstances>(() => {
    if (!isReady) {
      return { auto: undefined, modal: undefined, popup: undefined, redirect: undefined };
    }

    return {
      auto: createLearnMoreInstance("AUTO"),
      modal: createLearnMoreInstance("MODAL"),
      popup: createLearnMoreInstance("POPUP"),
      redirect: createLearnMoreInstance("REDIRECT"),
    };
  }, [isReady, createLearnMoreInstance]);

  useEffect(() => {
    if (!isReady) return;

    Object.entries(learnMoreInstances).forEach(async ([mode, instance]) => {
      if (instance) {
        await instance.update({
          amount,
          presentationMode:
            mode.toUpperCase() as LearnMoreOptions["presentationMode"],
        });
        console.log(
          `Updated ${mode.toUpperCase()} instance with amount ${amount}`,
        );
      }
    });
  }, [amount, learnMoreInstances, isReady]);

  const openLearnMore = async (mode: string) => {
    const instance =
      learnMoreInstances[mode.toLowerCase() as keyof typeof learnMoreInstances];
    if (instance) {
      console.log(`Opening ${mode} Learn More`);
      try {
        await instance.open();
        console.log(`${mode} Learn More opened successfully`);
      } catch (err) {
        console.error(`Failed to open ${mode} Learn More`, err);
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

    </div>
  );
};
