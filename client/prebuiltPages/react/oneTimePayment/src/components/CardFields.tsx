import { useContext, useEffect, useRef, useState } from "react";
import { CardFieldsSessionOutput } from "../types/paypal";
import { PayPalSDKContext } from "../context/sdkContext";

type CardFieldProps = {
  cardFieldsSession: CardFieldsSessionOutput | null;
  type: "number" | "expiry" | "cvv";
  placeholder: string;
  style: React.CSSProperties;
};

const CardField: React.FC<CardFieldProps> = ({ style, cardFieldsSession, type, placeholder }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardFieldsSession) return;
    
    const field = cardFieldsSession.createCardFieldsComponent({
      type,
      placeholder,
    });
    containerRef.current?.appendChild(field);

    return () => { field.remove(); };
  }, [cardFieldsSession]);
  
  return cardFieldsSession ? (
    <div style={style} ref={containerRef} />
   ) : (
    null
  );
};

const CardFields: React.FC = () => {
  const { sdkInstance } = useContext(PayPalSDKContext);
  const cardFieldsSessionRef = useRef<CardFieldsSessionOutput | null>(null);
  const [ isCardFieldSessionReady, setIsCardFieldSessionReady ] = useState<boolean>(false);
  
  useEffect(() => {
    if (sdkInstance) {
      cardFieldsSessionRef.current = sdkInstance.createCardFieldsOneTimePaymentSession();
      setIsCardFieldSessionReady(true);
    }

    return () => {
      cardFieldsSessionRef.current = null;
      setIsCardFieldSessionReady(false);
    };
  }, [sdkInstance]);

  return isCardFieldSessionReady ? (
    <div style={{
      width: "100%",
    }}>
      <CardField
        style={{ height: "3rem", marginBottom: "1rem" }}
        cardFieldsSession={cardFieldsSessionRef.current}
        type="number" placeholder="Card Number"
      />
      <CardField
        style={{ height: "3rem", marginBottom: "1rem" }}
        cardFieldsSession={cardFieldsSessionRef.current}
        type="expiry"
        placeholder="MM/YY"
      />
      <CardField
        style={{ height: "3rem", marginBottom: "1rem" }}
        cardFieldsSession={cardFieldsSessionRef.current}
        type="cvv"
        placeholder="CVV"
      />
    </div>
  ) : null;
};

export default CardFields;
