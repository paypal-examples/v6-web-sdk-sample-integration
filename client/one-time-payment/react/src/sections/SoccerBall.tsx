import React, { useContext, useState, useCallback } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import PayPalButton from "../components/PayPalButton";
import VenmoButton from "../components/VenmoButton";
import { PaymentSessionOptions, OnApproveData } from "../types/paypal";
import ProductDisplay from "../components/ProductDisplay";
import PaymentModal from "../components/PaymentModal";

import soccerBallImage from '../static/images/world-cup.jpg'
import { captureOrder } from "../utils";
import "../static/styles/SoccerBall.css";
import "../static/styles/Modal.css";

// Types
type ModalType = 'success' | 'cancel' | 'error' | null;

interface ModalContent {
  title: string;
  message: string;
}

// Constants
const PRODUCT = {
  name: "World Cup Ball",
  icon: "⚽️",
  price: 100.00,
  imageSrc: soccerBallImage,
  imageAlt: "Official World Cup Soccer Ball",
} as const;

const SoccerBall: React.FC = () => {
  const { sdkInstance, eligiblePaymentMethods } = useContext(PayPalSDKContext);
  const [modalState, setModalState] = useState<ModalType>(null);

  // Payment handlers
  const handlePaymentCallbacks: PaymentSessionOptions = {
    onApprove: async (data: OnApproveData) => {
      console.log('Payment approved:', data);
      const captureResult = await captureOrder({ orderId: data.orderId });
      console.log('Payment capture result:', captureResult);
      setModalState('success');
    },

    onCancel: () => {
      console.log('Payment cancelled');
      setModalState('cancel');
    },

    onError: (error: Error) => {
      console.error('Payment error:', error);
      setModalState('error');
    }
  };

  const getModalContent = useCallback((state: ModalType): ModalContent | null => {
    switch (state) {
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
  }, []);

  // Check payment method eligibility
  const isPayPalEligible = sdkInstance && eligiblePaymentMethods?.isEligible('paypal');
  const isVenmoEligible = sdkInstance && eligiblePaymentMethods?.isEligible('venmo');

  const modalContent = getModalContent(modalState);

  return (
    <div className="soccer-ball-container" data-testid="soccer-ball-container">
      {modalContent && (
        <PaymentModal
          content={modalContent}
          onClose={() => setModalState(null)}
        />
      )}
      
      <ProductDisplay product={PRODUCT} />

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
