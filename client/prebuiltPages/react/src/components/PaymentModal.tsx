import type { ModalContent } from "../types";
import "../styles/Modal.css";

interface PaymentModalProps {
  content: ModalContent;
  onClose: () => void;
}

const PaymentModal = ({ content, onClose }: PaymentModalProps) => {
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
