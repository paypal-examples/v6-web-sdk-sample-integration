import React, { useContext } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import PayPalButton from "./PayPalButton";
import VenmoButton from "./VenmoButton";
import { PaymentSessionOptions } from "../types/paypal";

import soccerBallImage from '../static/images/world-cup.jpg'
import "../static/styles/SoccerBall.css";

// Constants
const PRODUCT = {
  name: "World Cup Ball",
  icon: "⚽️",
  price: 100.00,
  imageSrc: soccerBallImage,
  imageAlt: "Official World Cup Soccer Ball",
};

const SoccerBall: React.FC = () => {
  const { isReady, eligiblePaymentMethods } = useContext(PayPalSDKContext);

  // Payment handlers
  const handlePaymentCallbacks: {
    onApprove: PaymentSessionOptions['onApprove'];
    onCancel: PaymentSessionOptions['onCancel'];
    onError: PaymentSessionOptions['onError'];
  } = {
    onApprove: (data) => {
      console.log('Payment approved:', data);
    },

    onCancel: () => {
      console.log('Payment cancelled');
    },

    onError: (error: any) => {
      console.error('Payment error:', error);
    }
  };

  // Check payment method eligibility
  const isPayPalEligible = isReady && eligiblePaymentMethods?.isEligible('paypal');
  const isVenmoEligible = isReady && eligiblePaymentMethods?.isEligible('venmo');

  return (
    <div className="soccer-ball-container">
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
