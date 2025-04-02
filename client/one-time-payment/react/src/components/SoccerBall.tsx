import React, { useContext, useState } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import PayPalButton from "./PayPalButton";
import VenmoButton from "./VenmoButton";
import { PaymentSessionOptions } from "../types/paypal";

import soccerBallImage from '../static/images/world-cup.jpg'
import "../static/styles/SoccerBall.css";
import "../static/styles/Modal.css";

// Constants
const PRODUCT = {
  name: "World Cup Ball",
  icon: "⚽️",
  price: 100.00,
  imageSrc: soccerBallImage,
  imageAlt: "Official World Cup Soccer Ball",
};

type ModalType = 'success' | 'cancel' | 'error' | null;

const SoccerBall: React.FC = () => {
  const { isReady, eligiblePaymentMethods } = useContext(PayPalSDKContext);
  const [modalState, setModalState] = useState<ModalType>(null);

  // Payment handlers
  const handlePaymentCallbacks: {
    onApprove: PaymentSessionOptions['onApprove'];
    onCancel: PaymentSessionOptions['onCancel'];
    onError: PaymentSessionOptions['onError'];
  } = {
    onApprove: (data) => {
      console.log('Payment approved:', data);
      setModalState('success');
    },

    onCancel: () => {
      console.log('Payment cancelled');
      setModalState('cancel');
    },

    onError: (error: any) => {
      console.error('Payment error:', error);
      setModalState('error');
    }
  };

  const getModalContent = () => {
    switch (modalState) {
      case 'success':
        return {
          title: 'Payment Successful! 🎉',
          message: 'Thank you for your purchase!'
        };
      case 'cancel':
        return {
          title: 'Payment Cancelled',
          message: 'Your payment was cancelled.'
        };
      case 'error':
        return {
          title: 'Payment Error',
          message: 'There was an error processing your payment. Please try again.'
        };
      default:
        return null;
    }
  };

  // Check payment method eligibility
  const isPayPalEligible = isReady && eligiblePaymentMethods?.isEligible('paypal');
  const isVenmoEligible = isReady && eligiblePaymentMethods?.isEligible('venmo');

  const modalContent = getModalContent();

  return (
    <div className="soccer-ball-container">
      {modalContent && (
        <div className="modal-overlay" onClick={() => setModalState(null)}>
          <div className="modal-content">
            <button 
              className="close-button" 
              onClick={(e) => {
                e.stopPropagation();
                setModalState(null);
              }}
            >
              ×
            </button>
            <h2>{modalContent.title}</h2>
            <p>{modalContent.message}</p>
          </div>
        </div>
      )}
      
      <div className="product-header">
        <h1 className="product-title">{PRODUCT.icon} {PRODUCT.name}</h1>
        <h3 className="product-price">Price: ${PRODUCT.price.toFixed(2)}</h3>
      </div>

      <div className="product-image-container">
        <img
          src={PRODUCT.imageSrc}
          alt={PRODUCT.imageAlt}
          className="product-image"
        />
      </div>

      <div className="checkout-summary">
        <p>Estimated Total: ${PRODUCT.price.toFixed(2)}</p>
        <p>Taxes, discounts and shipping calculated at checkout</p>
      </div>

      <div className="payment-options">
        {isPayPalEligible && (
          <PayPalButton
            {...handlePaymentCallbacks}
          />
        )}

        {isVenmoEligible && (
          <VenmoButton
            {...handlePaymentCallbacks}
          />
        )}
      </div>
    </div>
  );
};

export default SoccerBall;
