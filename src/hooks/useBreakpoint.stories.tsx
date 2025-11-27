import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { useBreakpoint } from "./useBreakpoint";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useBreakpoint",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# useBreakpoint Hook

A custom hook for detecting the current screen breakpoint based on window width.

## Breakpoints

- **mobile**: < 640px
- **tablet**: 640px - 1023px
- **laptop**: 1024px - 1279px
- **desktop**: ≥ 1280px

## Usage

\`\`\`tsx
const breakpoint = useBreakpoint();

return (
  <div>
    Current breakpoint: {breakpoint}
    {breakpoint === 'mobile' && <MobileLayout />}
    {breakpoint === 'tablet' && <TabletLayout />}
    {breakpoint === 'desktop' && <DesktopLayout />}
  </div>
);
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// BREAKPOINT DISPLAY DEMO
// ============================================================================

const BreakpointDemo: React.FC = () => {
  const breakpoint = useBreakpoint();

  const breakpointInfo = {
    mobile: { label: "Mobile", range: "< 640px", color: "info" as const },
    tablet: {
      label: "Tablet",
      range: "640px - 1023px",
      color: "warning" as const,
    },
    laptop: {
      label: "Laptop",
      range: "1024px - 1279px",
      color: "success" as const,
    },
    desktop: { label: "Desktop", range: "≥ 1280px", color: "neutral" as const },
  };

  const currentInfo = breakpointInfo[breakpoint as keyof typeof breakpointInfo];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Current Breakpoint</h3>

      <div className="space-y-4">
        <div className="text-center">
          <Badge variant={currentInfo.color} className="text-lg px-4 py-2">
            {currentInfo.label}
          </Badge>
          <div className="mt-2 text-sm text-secondary">
            Range: {currentInfo.range}
          </div>
        </div>

        <div className="space-y-2">
          <strong>All Breakpoints:</strong>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(breakpointInfo).map(([key, info]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border-2 ${
                  key === breakpoint
                    ? "border-blue-500 bg-status-info-bg"
                    : "border bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">{info.label}</div>
                <div className="text-xs text-secondary">{info.range}</div>
                {key === breakpoint && (
                  <Badge variant="success" className="mt-1 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-secondary rounded-lg">
          <strong>Resize your browser window</strong> to see the breakpoint
          change in real-time. This hook automatically updates when the window
          is resized.
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// RESPONSIVE LAYOUT DEMO
// ============================================================================

const ResponsiveLayoutDemo: React.FC = () => {
  const breakpoint = useBreakpoint();

  const layouts = {
    mobile: {
      title: "Mobile Layout",
      description: "Single column, stacked components",
      className: "grid grid-cols-1 gap-4",
    },
    tablet: {
      title: "Tablet Layout",
      description: "Two columns, balanced layout",
      className: "grid grid-cols-2 gap-4",
    },
    laptop: {
      title: "Laptop Layout",
      description: "Three columns, expanded content",
      className: "grid grid-cols-3 gap-4",
    },
    desktop: {
      title: "Desktop Layout",
      description: "Four columns, full-width layout",
      className: "grid grid-cols-4 gap-4",
    },
  };

  const currentLayout = layouts[breakpoint as keyof typeof layouts];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Responsive Layout Demo</h3>

      <div className="space-y-4">
        <div className="text-center">
          <Badge variant="info" className="mb-2">
            {breakpoint.toUpperCase()}
          </Badge>
          <div className="text-sm text-secondary">
            {currentLayout.description}
          </div>
        </div>

        <div className={currentLayout.className}>
          {Array.from(
            {
              length:
                breakpoint === "mobile"
                  ? 4
                  : breakpoint === "tablet"
                    ? 4
                    : breakpoint === "laptop"
                      ? 6
                      : 8,
            },
            (_, i) => (
              <div
                key={i}
                className="p-4 bg-status-info-bg border border-blue-200 rounded-lg text-center"
              >
                <div className="text-sm font-medium">Item {i + 1}</div>
              </div>
            )
          )}
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <strong>Try resizing:</strong> Watch how the layout automatically
          adapts to different screen sizes using the useBreakpoint hook.
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// CONDITIONAL RENDERING DEMO
// ============================================================================

const ConditionalRenderingDemo: React.FC = () => {
  const breakpoint = useBreakpoint();

  const MobileComponent = () => (
    <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
      <h4 className="font-semibold text-green-800">📱 Mobile View</h4>
      <p className="text-sm text-green-700">
        Simplified interface for small screens
      </p>
    </div>
  );

  const TabletComponent = () => (
    <div className="p-4 bg-status-info-bg border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-primary dark:text-blue-300">
        📟 Tablet View
      </h4>
      <p className="text-sm text-blue-700">
        Balanced layout for medium screens
      </p>
    </div>
  );

  const DesktopComponent = () => (
    <div className="p-4 bg-purple-100 border border-purple-200 rounded-lg">
      <h4 className="font-semibold text-purple-800">🖥️ Desktop View</h4>
      <p className="text-sm text-purple-700">
        Full-featured interface for large screens
      </p>
    </div>
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Conditional Rendering Demo</h3>

      <div className="space-y-4">
        <div className="text-center">
          <Badge variant="info">Current: {breakpoint.toUpperCase()}</Badge>
        </div>

        <div className="space-y-4">
          {breakpoint === "mobile" && <MobileComponent />}
          {(breakpoint === "tablet" || breakpoint === "laptop") && (
            <TabletComponent />
          )}
          {breakpoint === "desktop" && <DesktopComponent />}

          <div className="p-4 bg-secondary border border rounded-lg">
            <strong>Conditional Logic:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Mobile: Shows mobile-specific component</li>
              <li>• Tablet/Laptop: Shows tablet-optimized component</li>
              <li>• Desktop: Shows full desktop component</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// STORIES
// ============================================================================

export const BreakpointDisplay: Story = {
  render: () => <BreakpointDemo />,
};

export const ResponsiveLayout: Story = {
  render: () => <ResponsiveLayoutDemo />,
};

export const ConditionalRendering: Story = {
  render: () => <ConditionalRenderingDemo />,
};

export const CompleteBreakpointDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Complete Breakpoint Hook Demo</h2>
      <BreakpointDemo />
      <ResponsiveLayoutDemo />
      <ConditionalRenderingDemo />
    </div>
  ),
};
