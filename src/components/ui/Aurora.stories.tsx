import type { Meta, StoryObj } from "@storybook/react";
import { Aurora } from "./Aurora";
import { Card } from "./Card";

/**
 * Aurora provides animated, gradient background effects for pages.
 * The component supports 4 variants optimized for different use cases.
 *
 * ## Variants
 * - **shell**: Default background for most pages (standard intensity)
 * - **field**: Medium intensity for interactive canvas/field views
 * - **minimal**: Subtle background for content-heavy pages
 * - **none**: No background effects for maximum content focus
 *
 * ## Usage Guidelines
 * - Use `shell` for general pages (Dashboard, Settings, etc.)
 * - Use `field` for interactive spaces (Playbook diagrams, field views)
 * - Use `minimal` for content-first experiences (articles, forms)
 * - Use `none` when you need custom backgrounds
 */
const meta = {
  title: "UI/Aurora",
  component: Aurora,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Animated gradient background system providing visual depth and brand identity. Variants are optimized for different page types and content densities.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["shell", "field", "minimal", "none"],
      description: "Visual variant of the aurora background",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "shell" },
      },
    },
    fullHeight: {
      control: "boolean",
      description: "Whether the aurora should fill the viewport height",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    animated: {
      control: "boolean",
      description: "Enable/disable gradient animation (for performance)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof Aurora>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sample content component for demonstrations
 */
const SampleContent = ({ title }: { title: string }) => (
  <div className="container mx-auto px-4 py-16">
    <Card className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
      <p className="text-slate-600 mb-6">
        This demonstrates the Aurora background component with various content
        overlays. The animated gradient provides visual depth while maintaining
        readability.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Feature {i}
            </h3>
            <p className="text-slate-600">Content card on Aurora background</p>
          </Card>
        ))}
      </div>
    </Card>
  </div>
);

/**
 * Default story - Shell variant (most common use case)
 */
export const Default: Story = {
  args: {
    variant: "shell",
    fullHeight: true,
    children: <SampleContent title="Shell Variant - Default Background" />,
  },
};

/**
 * Shell variant - Standard background for general pages
 * Best for: Dashboard, Settings, Team pages
 */
export const Shell: Story = {
  args: {
    variant: "shell",
    fullHeight: true,
    children: <SampleContent title="Shell Variant - General Purpose" />,
  },
};

/**
 * Field variant - Medium intensity for interactive canvas views
 * Best for: Playbook diagrams, field layouts, interactive spaces
 */
export const Field: Story = {
  args: {
    variant: "field",
    fullHeight: true,
    children: <SampleContent title="Field Variant - Playbook Views" />,
  },
};

/**
 * Minimal variant - Subtle background for content-heavy pages
 * Best for: Forms, articles, text-heavy content
 */
export const Minimal: Story = {
  args: {
    variant: "minimal",
    fullHeight: true,
    children: <SampleContent title="Minimal Variant - Content Focus" />,
  },
};

/**
 * None variant - No background effects
 * Best for: Custom backgrounds, maximum content focus
 */
export const None: Story = {
  args: {
    variant: "none",
    fullHeight: true,
    children: <SampleContent title="None Variant - No Background" />,
  },
};

/**
 * Content-sized - Aurora adapts to content height
 * Useful for page sections rather than full-page backgrounds
 */
export const ContentSized: Story = {
  args: {
    variant: "shell",
    fullHeight: false,
    children: (
      <div className="p-8">
        <Card className="p-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Content-Sized Aurora
          </h2>
          <p className="text-slate-600">
            This Aurora background is not full height - it sizes to its content.
            Useful for sections within a page rather than full-page backgrounds.
          </p>
        </Card>
      </div>
    ),
  },
};

/**
 * Dark Mode - Shell variant optimized for dark mode
 */
export const DarkMode: Story = {
  args: {
    variant: "shell",
    fullHeight: true,
    children: <SampleContent title="Aurora in Dark Mode" />,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * Complex Layout - Aurora with realistic page structure
 * Shows how Aurora works with navigation, sidebars, and content areas
 */
export const ComplexLayout: Story = {
  args: {
    variant: "field",
    fullHeight: true,
    children: (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-50">
            Complex Page Layout
          </h1>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Navigation
              </h2>
              <ul className="space-y-2">
                {["Dashboard", "Playbook", "Roster", "Settings"].map((item) => (
                  <li key={item}>
                    <button className="text-slate-700 hover:text-primary-600 transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Main Content Area
              </h2>
              <p className="text-slate-600 mb-4">
                Aurora backgrounds work seamlessly with complex layouts
                including navigation, sidebars, and multiple content sections.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                  >
                    <p className="text-xs text-slate-500">Metric {i}</p>
                    <p className="text-2xl font-bold text-slate-900">1,234</p>
                  </div>
                ))}
              </div>
            </Card>
          </main>
        </div>
      </div>
    ),
  },
};

/**
 * Performance Test - Multiple Aurora instances
 * Tests rendering performance with stacked backgrounds
 */
export const PerformanceTest: Story = {
  args: {
    variant: "shell",
    children: (
      <div className="space-y-8">
        {(["shell", "field", "minimal"] as const).map((variant) => (
          <Aurora key={variant} variant={variant} className="h-64">
            <div className="flex items-center justify-center h-full">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 capitalize">
                  {variant} Variant
                </h2>
                <p className="text-slate-600">
                  Performance with multiple instances
                </p>
              </Card>
            </div>
          </Aurora>
        ))}
      </div>
    ),
  },
};
