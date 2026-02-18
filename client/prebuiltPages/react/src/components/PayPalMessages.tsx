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
 * Basic PayPal Messages component using auto-bootstrap mode.
 *
 * With `auto-bootstrap={true}`, the `<paypal-message>` web component handles
 * fetching and rendering Pay Later content on its own — no manual fetch calls needed.
 * This is the simplest integration path for displaying Pay Later messaging.
 *
 * The `onPaypalMessageClick` event fires when a buyer clicks the "Learn More"
 * link within the message, which can be used to track analytics or trigger
 * custom behavior.
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
 * Manual messaging component that fetches content programmatically.
 *
 * Use this approach over auto-bootstrap when you need control over when content
 * is fetched, want to customize fetch options per render, or need to react to
 * the content before displaying it (via the `onReady` callback).
 *
 * The two-step flow is:
 * 1. Call `handleFetchContent()` with styling and callback options
 * 2. Apply the returned content to the `<paypal-message>` element via `setContent()`
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
 * Learn More demo with programmatic control over all 4 presentation modes.
 *
 * Each mode determines how the financing details are displayed to the buyer:
 * - AUTO: defaults to MODAL, but falls back to POPUP if the content is not embeddable in an iframe
 * - MODAL: iframe overlay with accessibility features (tab trapping, close button)
 * - POPUP: opens in a new browser popup window
 * - REDIRECT: opens in a new browser tab via window.open()
 *
 * Instances support dynamic reconfiguration via `instance.update()`, used here
 * to keep messaging in sync when the cart amount changes.
 *
 * Callback hooks:
 * - onShow/onClose: fired when the Learn More experience opens or closes
 * - onApply: fired when the buyer clicks the "Apply Now" button in the modal
 * - onCalculate: fired when the buyer interacts with the payment calculator in the modal
 */
export const PayPalMessagesLearnMore: React.FC<LearnMoreDemoProps> = ({
  initialAmount = "50.00",
}) => {
  const [amount, setAmount] = useState(initialAmount);

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
        },
        onClose: (data) => {
          console.log(`${mode} onClose`, data);
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
