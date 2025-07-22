import React from "react";

/**
 * Interface for the content displayed in the modal.
 */
interface ModalContent {
  /** The modal title text. */
  title: string;
  /** The modal message text. */
  message: string;
}

/**
 * Props for the PaymentModal component.
 */
interface PaymentModalProps {
  /** Content to display in the modal. */
  content: ModalContent;
  /** Callback fired when the modal is closed. */
  onClose: () => void;
}

/**
 * PaymentModal component displays a modal dialog with a title, message, and close button.
 *
 * @param {PaymentModalProps} props - The props for the PaymentModal component.
 * @returns {JSX.Element} The rendered modal component.
 */
const PaymentModal: React.FC<PaymentModalProps> = ({ content, onClose }) => {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="payment-modal"
    >
      <div className="modal-content">
        <button
          className="close-button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close modal"
          data-testid="modal-close-button"
        >
          ×
        </button>
        <h2 id="modal-title">{content.title}</h2>
        <p>{content.message}</p>
      </div>
    </div>
  );
};

export default PaymentModal;
