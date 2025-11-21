import React, { useContext } from "react";
import { PayPalSDKContext } from "../context/sdkContext";
import ProductDisplay from "../components/ProductDisplay";

import soccerBallImage from "../static/images/world-cup.jpg";
import "../static/styles/SoccerBall.css";
import "../static/styles/Modal.css";
import CardFields from "../components/CardFields";

// Constants
const PRODUCT = {
  name: "World Cup Ball",
  icon: "⚽️",
  price: 100.0,
  imageSrc: soccerBallImage,
  imageAlt: "Official World Cup Soccer Ball",
} as const;

const SoccerBall: React.FC = () => {
  const { sdkInstance, eligiblePaymentMethods } = useContext(PayPalSDKContext);

  // Check payment method eligibility
  const isCardFieldsEligible =
    sdkInstance && eligiblePaymentMethods?.isEligible("advanced_cards");

  return (
    <div className="soccer-ball-container" data-testid="soccer-ball-container">
      <ProductDisplay product={PRODUCT} />

      <div className="payment-options">
        {isCardFieldsEligible && <CardFields />}
      </div>
    </div>
  );
};

export default SoccerBall;
