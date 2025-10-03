import { Tooltip } from "../components/ui/Tooltip/Tooltip";

/**
 * Minimal tooltip test - inline on any page
 * Just paste this into your browser console or add to App.tsx temporarily
 */
export const MinimalTooltipTest = () => {
  return (
    <div style={{ padding: "100px", backgroundColor: "#f0f0f0" }}>
      <h1>Minimal Tooltip Test</h1>
      <p>Hover over the button below:</p>
      <br />

      <Tooltip content="Hello! I am a tooltip 👋">
        <button
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Hover me!
        </button>
      </Tooltip>

      <br />
      <br />

      <Tooltip content="Bottom tooltip!" placement="bottom">
        <button
          style={{
            padding: "12px 24px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Bottom tooltip
        </button>
      </Tooltip>

      <br />
      <br />

      <Tooltip content="Instant tooltip!" delay={0}>
        <button
          style={{
            padding: "12px 24px",
            backgroundColor: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          No delay tooltip
        </button>
      </Tooltip>
    </div>
  );
};

export default MinimalTooltipTest;
