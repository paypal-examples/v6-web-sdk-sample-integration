import { useNavigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import ErrorTest from "../components/ErrorTest";

const ErrorBoundaryTestPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Error Boundary Test</h1>

      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Error Boundaries catch JavaScript errors in React components.
      </p>

      {/* Without Error Boundary */}
      <div
        style={{
          padding: "2rem",
          margin: "2rem 0",
          border: "2px solid #d32f2f",
          borderRadius: "8px",
          backgroundColor: "#ffebee",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#d32f2f" }}>
          Without Error Boundary
        </h2>
        <p>This will crash the entire app:</p>
        <ErrorTest />
      </div>

      {/* With Error Boundary */}
      <div
        style={{
          padding: "2rem",
          margin: "2rem 0",
          border: "2px solid #4caf50",
          borderRadius: "8px",
          backgroundColor: "#f1f8f4",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#2e7d32" }}>With Error Boundary</h2>
        <p>This will show a fallback UI:</p>
        <ErrorBoundary>
          <ErrorTest />
        </ErrorBoundary>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#0070ba",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default ErrorBoundaryTestPage;
