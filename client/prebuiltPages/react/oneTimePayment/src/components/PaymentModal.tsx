import React from "react";

interface ModalContent {
  title: string;
  message: string;
}

interface PaymentModalProps {
  content: ModalContent;
  onClose: () => void;
}

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
