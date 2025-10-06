import { Tooltip } from "../components/ui/Tooltip/Tooltip";

/**
 * Simple test page to verify tooltips are working
 * Navigate to /tooltip-test to see this page
 */
export const TooltipTest = () => {
  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <h1 className="text-2xl font-bold mb-8 text-text-primary">
        Tooltip Test Page
      </h1>

      <div className="space-y-8">
        {/* Test 1: Simple button */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Test 1: Simple Button with Tooltip
          </h2>
          <Tooltip content="This is a tooltip!">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Hover over me
            </button>
          </Tooltip>
        </div>

        {/* Test 2: Different placements */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Test 2: Different Placements
          </h2>
          <div className="flex gap-4 items-center justify-center p-8">
            <Tooltip content="Top tooltip" placement="top">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
                Top
              </button>
            </Tooltip>

            <Tooltip content="Bottom tooltip" placement="bottom">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
                Bottom
              </button>
            </Tooltip>

            <Tooltip content="Left tooltip" placement="left">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
                Left
              </button>
            </Tooltip>

            <Tooltip content="Right tooltip" placement="right">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
                Right
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Test 3: Icon button simulation */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Test 3: Icon Button Simulation
          </h2>
          <Tooltip content="Close">
            <button
              className="w-8 h-8 flex items-center justify-center bg-surface-muted rounded-lg hover:bg-gray-300"
              aria-label="Close"
            >
              ✕
            </button>
          </Tooltip>
        </div>

        {/* Test 4: Span with tooltip */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Test 4: Span with Tooltip
          </h2>
          <Tooltip content="This is text with a tooltip">
            <span className="text-blue-500 cursor-pointer border-b border-dashed border-blue-500">
              Hover over this text
            </span>
          </Tooltip>
        </div>

        {/* Test 5: Disabled tooltip */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Test 5: Disabled Tooltip (should not show)
          </h2>
          <Tooltip content="You should not see this" disabled>
            <button className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
              Disabled tooltip
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TooltipTest;
