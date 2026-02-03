import { useState } from "react";

const ErrorTest = () => {
  const [throwError, setThrowError] = useState(false);

  if (throwError) throw new Error("Test error!");

  return (
    <button
      onClick={() => setThrowError(true)}
      style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "#d32f2f",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "1em",
      }}
    >
      Throw Error
    </button>
  );
};

export default ErrorTest;
