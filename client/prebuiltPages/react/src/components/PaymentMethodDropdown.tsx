import { useId, useRef, useState, type ReactNode } from "react";

export interface PaymentMethodOption {
  /** Stable key, e.g. "paypal" | "venmo" | "paylater" | "credit" | "guest". */
  key: string;
  /** Human-readable label shown in the trigger and the list. */
  label: string;
  /** The fully-configured SDK button element for this method. */
  button: ReactNode;
}

interface PaymentMethodDropdownProps {
  options: PaymentMethodOption[];
}

/**
 * Presents all eligible payment methods inside a single collapsible dropdown
 * rather than a vertical stack of buttons. Clicking the trigger opens a list of
 * methods; selecting one collapses the list and reveals that method's SDK button
 * below.
 *
 * Every method's SDK button stays mounted the whole time — selection only toggles
 * which one is visible. Each SDK button drives its own payment session, so
 * mounting/unmounting on every selection would needlessly tear down and re-create
 * those sessions; hiding the inactive ones avoids that churn.
 */
const PaymentMethodDropdown = ({ options }: PaymentMethodDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    options[0]?.key ?? null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selectedOption =
    options.find((option) => option.key === selectedKey) ?? null;

  const handleSelect = (key: string) => {
    setSelectedKey(key);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="payment-method-dropdown">
      <button
        type="button"
        ref={triggerRef}
        className="payment-method-dropdown-toggle"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedOption?.label ?? "Select a payment method"}</span>
        <span className="payment-method-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      <ul
        id={listId}
        role="listbox"
        className="payment-method-list"
        hidden={!isOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        }}
      >
        {options.map((option) => (
          <li
            key={option.key}
            role="option"
            aria-selected={option.key === selectedKey}
            className="payment-method-option"
          >
            <button
              type="button"
              className="payment-method-option-button"
              onClick={() => handleSelect(option.key)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>

      {/*
        All buttons stay mounted; only the selected one is shown. Toggle
        visibility with `hidden` rather than conditionally rendering, so the SDK
        session behind each button is preserved across selections.
      */}
      {options.map((option) => (
        <div
          key={option.key}
          className="payment-method-panel"
          hidden={option.key !== selectedKey}
        >
          {option.button}
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodDropdown;
