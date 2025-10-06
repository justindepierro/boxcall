import { Tooltip } from "../components/ui/Tooltip/Tooltip";
import { colorTokens } from "../design-system/tokens";

/**
 * Minimal tooltip test - inline on any page
 * Just paste this into your browser console or add to App.tsx temporarily
 */
export const MinimalTooltipTest = () => {
  return (
    <div className="p-24 bg-surface-muted">
      <h1>Minimal Tooltip Test</h1>
      <p>Hover over the button below:</p>
      <br />

      <Tooltip content="Hello! I am a tooltip 👋">
        <button
          className="px-6 py-3 text-white border-0 rounded-xl cursor-pointer text-base"
          style={{
            backgroundColor: colorTokens.blue[500],
          }}
        >
          Hover me!
        </button>
      </Tooltip>

      <br />
      <br />

      <Tooltip content="Bottom tooltip!" placement="bottom">
        <button
          className="px-6 py-3 text-white border-0 rounded-xl cursor-pointer text-base"
          style={{
            backgroundColor: colorTokens.emerald[500],
          }}
        >
          Bottom tooltip
        </button>
      </Tooltip>

      <br />
      <br />

      <Tooltip content="Instant tooltip!" delay={0}>
        <button
          className="px-6 py-3 text-white border-0 rounded-xl cursor-pointer text-base"
          style={{
            backgroundColor: colorTokens.amber[500],
          }}
        >
          No delay tooltip
        </button>
      </Tooltip>
    </div>
  );
};

export default MinimalTooltipTest;
