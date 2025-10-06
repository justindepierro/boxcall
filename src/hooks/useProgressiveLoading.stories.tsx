import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useProgressiveLoading } from "./useProgressiveLoading";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useProgressiveLoading",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Progressive loading hook for smooth, staggered content appearance.

**Features:**
- Staggered loading states with customizable delays
- Step-by-step content revelation
- Reset functionality for re-triggering animations
- Configurable total steps and timing

**Usage:**
\`\`\`tsx
import { useProgressiveLoading } from './hooks/useProgressiveLoading';

function ProgressiveContent() {
  const { currentStep, isStepVisible, reset } = useProgressiveLoading(4, 200);

  return (
    <div>
      {isStepVisible(1) && <Header />}
      {isStepVisible(2) && <Content />}
      {isStepVisible(3) && <Sidebar />}
      {isStepVisible(4) && <Footer />}

      <Button onClick={reset}>Reload</Button>
    </div>
  );
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Progressive Loading Demo Component
const ProgressiveLoadingDemo = () => {
  const [totalSteps, setTotalSteps] = useState(4);
  const [delay, setDelay] = useState(150);
  const { currentStep, isStepVisible, reset } = useProgressiveLoading(
    totalSteps,
    delay
  );

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Progressive Loading</h3>
          <p className="text-sm text-secondary mb-4">
            Smooth, staggered content loading with customizable timing and
            steps.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Progress</h4>
            <Badge variant="info">
              {currentStep} / {totalSteps}
            </Badge>
          </div>

          <div className="w-full bg-surface-muted rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="text-center text-sm text-gray-600">
            {progressPercentage}% Complete
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Configuration</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Total Steps
              </label>
              <select
                value={totalSteps}
                onChange={(e) => setTotalSteps(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Delay (ms)
              </label>
              <select
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {[50, 100, 150, 200, 300, 500].map((num) => (
                  <option key={num} value={num}>
                    {num}ms
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step Visualization */}
        <div className="space-y-4">
          <h4 className="font-medium">Step Visibility</h4>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const visible = isStepVisible(stepNumber);

              return (
                <div
                  key={stepNumber}
                  className={`p-4 border rounded-lg text-center transition-all duration-500 ${
                    visible
                      ? "border-green-500 bg-green-50 opacity-100 transform scale-100"
                      : "border bg-surface-secondary opacity-50 transform scale-95"
                  }`}
                >
                  <div className="text-2xl font-bold mb-1">
                    {visible ? "✓" : "○"}
                  </div>
                  <div className="text-sm font-medium">Step {stepNumber}</div>
                  <div className="text-xs text-gray-600">
                    {visible ? "Visible" : "Hidden"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Preview */}
        <div className="space-y-4">
          <h4 className="font-medium">Content Preview</h4>
          <div className="space-y-3">
            {isStepVisible(1) && (
              <div className="p-3 bg-status-info-bg border border-blue-200 rounded animate-fade-in">
                <Badge variant="info" className="mb-1">
                  Step 1
                </Badge>
                <p className="text-sm">Header content appears first</p>
              </div>
            )}

            {isStepVisible(2) && (
              <div className="p-3 bg-green-50 border border-green-200 rounded animate-fade-in">
                <Badge variant="success" className="mb-1">
                  Step 2
                </Badge>
                <p className="text-sm">Main content loads next</p>
              </div>
            )}

            {isStepVisible(3) && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded animate-fade-in">
                <Badge variant="warning" className="mb-1">
                  Step 3
                </Badge>
                <p className="text-sm">Sidebar or secondary content</p>
              </div>
            )}

            {isStepVisible(4) && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded animate-fade-in">
                <Badge variant="neutral" className="mb-1">
                  Step 4
                </Badge>
                <p className="text-sm">Footer and final elements</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={reset} className="flex-1">
            Reset Animation
          </Button>
          <Button
            onClick={() => {
              reset();
              setTimeout(() => {
                // Trigger re-animation after reset
              }, 100);
            }}
            variant="outline"
            className="flex-1"
          >
            Restart
          </Button>
        </div>

        {/* Hook Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Hook Methods</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>
              <code>currentStep</code> - Current step number (0 to totalSteps)
            </div>
            <div>
              <code>isStepVisible(step)</code> - Check if a specific step should
              be visible
            </div>
            <div>
              <code>reset()</code> - Reset to step 0 and restart the animation
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <h4 className="font-medium">Parameters</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>
              <code>totalSteps</code> - Total number of steps in the sequence
              (default: 4)
            </div>
            <div>
              <code>delayMs</code> - Delay between each step in milliseconds
              (default: 150)
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj = {
  render: () => <ProgressiveLoadingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo of progressive loading with configurable steps and timing.",
      },
    },
  },
};

export const FastLoading: StoryObj = {
  render: () => {
    const { currentStep, isStepVisible } = useProgressiveLoading(3, 50);

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Fast Loading (50ms delay)
        </h3>
        <div className="space-y-3">
          <div>Current Step: {currentStep}</div>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`p-3 border rounded transition-all duration-200 ${
                isStepVisible(step)
                  ? "bg-green-50 border-green-200"
                  : "bg-surface-secondary border-gray-200"
              }`}
            >
              Step {step}: {isStepVisible(step) ? "Visible" : "Hidden"}
            </div>
          ))}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Fast progressive loading with 50ms delays between steps.",
      },
    },
  },
};

export const SlowLoading: StoryObj = {
  render: () => {
    const { currentStep, isStepVisible } = useProgressiveLoading(5, 500);

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Slow Loading (500ms delay)
        </h3>
        <div className="space-y-3">
          <div>Current Step: {currentStep}</div>
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`p-3 border rounded transition-all duration-500 ${
                isStepVisible(step)
                  ? "bg-status-info-bg border-blue-200"
                  : "bg-surface-secondary border-gray-200"
              }`}
            >
              Step {step}: {isStepVisible(step) ? "Visible" : "Hidden"}
            </div>
          ))}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Slow progressive loading with 500ms delays between steps.",
      },
    },
  },
};
