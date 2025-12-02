/**
 * BoxCall Design System Showcase
 * Modern, comprehensive demonstration of our design system
 */

import { useState } from "react";
import { Button } from "../ui/Button/Button";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon/Icon";
import Card from "../ui/Card/Card";
import { Typography } from "./Typography";
import { DarkModeToggle } from "../ui/DarkModeToggle";

export function DesignSystemShowcase() {
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Navigation sections
  const sections = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "colors", label: "Colors", icon: "palette" },
    { id: "typography", label: "Typography", icon: "type" },
    { id: "components", label: "Components", icon: "grid" },
    { id: "buttons", label: "Buttons", icon: "pointer" },
    { id: "badges", label: "Badges", icon: "tag" },
    { id: "icons", label: "Icons", icon: "sparkles" },
  ];

  // Color scales from our design system
  const brandScales = [
    {
      name: "Jade",
      base: "jade",
      shades: [
        "50",
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
      ],
    },
    {
      name: "Navy",
      base: "navy",
      shades: [
        "50",
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
      ],
    },
  ];

  const semanticColors = [
    {
      name: "Success",
      colors: [
        "success-subtle",
        "success-muted",
        "success-emphasis",
        "success-500",
      ],
    },
    {
      name: "Error",
      colors: ["error-subtle", "error-muted", "error-emphasis", "error-500"],
    },
    {
      name: "Warning",
      colors: [
        "warning-subtle",
        "warning-muted",
        "warning-emphasis",
        "warning-500",
      ],
    },
    {
      name: "Info",
      colors: ["info-subtle", "info-muted", "info-emphasis", "info-500"],
    },
  ];

  const neutralColors = [
    "neutral-50",
    "neutral-100",
    "neutral-200",
    "neutral-300",
    "neutral-400",
    "neutral-500",
    "neutral-600",
    "neutral-700",
    "neutral-800",
    "neutral-900",
  ];

  // Button variants
  const buttonVariants = [
    "primary",
    "secondary",
    "outline",
    "ghost",
    "danger",
    "success",
    "warning",
    "glass",
    "gradient",
    "subtle",
  ];

  // Badge variants
  const badgeVariants = [
    "neutral",
    "info",
    "success",
    "warning",
    "danger",
    "accent",
    "premium",
  ];

  // Icon samples
  const iconSamples = [
    "home",
    "user",
    "users",
    "target",
    "calendar",
    "clock",
    "edit",
    "delete",
    "save",
    "download",
    "upload",
    "search",
    "filter",
    "check",
    "alert",
    "info",
    "star",
    "trophy",
    "bell",
    "settings",
    "book",
    "flag",
    "zap",
    "award",
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-12">
        <Typography variant="display-xl" className="text-primary">
          BoxCall Design System
        </Typography>
        <Typography
          variant="body-lg"
          className="text-secondary max-w-2xl mx-auto"
        >
          A comprehensive, token-based design system for professional football
          coaching. Built with React, TypeScript, and Tailwind CSS.
        </Typography>
        <div className="flex justify-center items-center gap-4 pt-4">
          <DarkModeToggle />
          <Badge variant="success">v2.0</Badge>
          <Badge variant="info">TypeScript</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-jade-100 rounded-lg">
              <Icon name="grid" className="text-jade-600" />
            </div>
            <Typography variant="headline-sm">Design Tokens</Typography>
          </div>
          <Typography variant="body-sm" className="text-secondary">
            Semantic color tokens, spacing scales, and typography presets for
            consistent theming
          </Typography>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-electric-100 rounded-lg">
              <Icon name="grid" className="text-electric-600" />
            </div>
            <Typography variant="headline-sm">Components</Typography>
          </div>
          <Typography variant="body-sm" className="text-secondary">
            Reusable UI components with variants, sizes, and accessibility
            built-in
          </Typography>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-navy-100 rounded-lg">
              <Icon name="zap" className="text-navy-600" />
            </div>
            <Typography variant="headline-sm">Performance</Typography>
          </div>
          <Typography variant="body-sm" className="text-secondary">
            Tree-shakeable, optimized for production, minimal bundle impact
          </Typography>
        </Card>
      </div>
    </div>
  );

  const renderColors = () => (
    <div className="space-y-8">
      <div>
        <Typography variant="display-lg" className="mb-2">
          Color System
        </Typography>
        <Typography variant="body-md" className="text-secondary">
          Our color system uses semantic tokens for consistent theming across
          the application
        </Typography>
      </div>

      {/* Brand Colors */}
      <div>
        <Typography variant="headline-md" className="mb-4">
          Brand Colors
        </Typography>
        {brandScales.map((scale) => (
          <div key={scale.name} className="mb-6">
            <Typography
              variant="body-sm"
              className="mb-2 font-semibold text-secondary"
            >
              {scale.name}
            </Typography>
            <div className="grid grid-cols-10 gap-2">
              {scale.shades.map((shade) => (
                <div key={shade} className="space-y-1">
                  <div
                    className="h-16 rounded-lg border border-border"
                    style={{
                      backgroundColor: `var(--color-${scale.base}-${shade})`,
                    }}
                  />
                  <Typography
                    variant="caption"
                    className="text-center text-muted"
                  >
                    {shade}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Semantic Colors */}
      <div>
        <Typography variant="headline-md" className="mb-4">
          Semantic Colors
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semanticColors.map((semantic) => (
            <Card key={semantic.name} variant="elevated" className="p-4">
              <Typography variant="body-sm" className="mb-3 font-semibold">
                {semantic.name}
              </Typography>
              <div className="flex gap-2">
                {semantic.colors.map((color) => (
                  <div key={color} className="flex-1 space-y-1">
                    <div
                      className="h-12 rounded border border-border"
                      style={{ backgroundColor: `var(--color-${color})` }}
                    />
                    <Typography
                      variant="caption"
                      className="text-muted text-xs"
                    >
                      {color.split("-")[1]}
                    </Typography>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Neutral Scale */}
      <div>
        <Typography variant="headline-md" className="mb-4">
          Neutral Scale
        </Typography>
        <div className="grid grid-cols-10 gap-2">
          {neutralColors.map((color) => (
            <div key={color} className="space-y-1">
              <div
                className="h-16 rounded-lg border border-border"
                style={{ backgroundColor: `var(--color-${color})` }}
              />
              <Typography variant="caption" className="text-center text-muted">
                {color.split("-")[1]}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTypography = () => (
    <div className="space-y-8">
      <div>
        <Typography variant="display-lg" className="mb-2">
          Typography
        </Typography>
        <Typography variant="body-md" className="text-secondary">
          Our typography system uses a modular scale for consistent hierarchy
        </Typography>
      </div>

      <Card variant="elevated" className="p-6 space-y-6">
        <div>
          <Typography variant="display-xl">Display XL</Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 60px / 3.75rem
          </Typography>
        </div>
        <div>
          <Typography variant="display-lg">Display LG</Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 48px / 3rem
          </Typography>
        </div>
        <div>
          <Typography variant="display-md">Display MD</Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 36px / 2.25rem
          </Typography>
        </div>
        <div>
          <Typography variant="headline-lg">Headline LG</Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 36px / 2.25rem
          </Typography>
        </div>
        <div>
          <Typography variant="headline-md">Headline MD</Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 30px / 1.875rem
          </Typography>
        </div>
        <div>
          <Typography variant="headline-sm">Headline SM</Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 24px / 1.5rem
          </Typography>
        </div>
        <div>
          <Typography variant="body-lg">
            Body LG - The quick brown fox jumps over the lazy dog
          </Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 18px / 1.125rem
          </Typography>
        </div>
        <div>
          <Typography variant="body-md">
            Body MD - The quick brown fox jumps over the lazy dog
          </Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 16px / 1rem
          </Typography>
        </div>
        <div>
          <Typography variant="body-sm">
            Body SM - The quick brown fox jumps over the lazy dog
          </Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 14px / 0.875rem
          </Typography>
        </div>
        <div>
          <Typography variant="caption">
            Caption - The quick brown fox jumps over the lazy dog
          </Typography>
          <Typography variant="caption" className="text-muted">
            Font size: 12px / 0.75rem
          </Typography>
        </div>
      </Card>
    </div>
  );

  const renderButtons = () => (
    <div className="space-y-8">
      <div>
        <Typography variant="display-lg" className="mb-2">
          Buttons
        </Typography>
        <Typography variant="body-md" className="text-secondary">
          Button components with multiple variants, sizes, and states
        </Typography>
      </div>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Variants
        </Typography>
        <div className="flex flex-wrap gap-3">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant as any}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Sizes
        </Typography>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          With Icons
        </Typography>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">
            <Icon name="plus" className="mr-2" />
            Add Play
          </Button>
          <Button variant="secondary">
            <Icon name="download" className="mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Icon name="save" className="mr-2" />
            Save
          </Button>
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          States
        </Typography>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Normal</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-8">
      <div>
        <Typography variant="display-lg" className="mb-2">
          Badges
        </Typography>
        <Typography variant="body-md" className="text-secondary">
          Badge components for status indicators and labels
        </Typography>
      </div>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Variants
        </Typography>
        <div className="flex flex-wrap gap-3">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant as any}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Badge>
          ))}
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Sizes
        </Typography>
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Real Examples
        </Typography>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="danger">Inactive</Badge>
          <Badge variant="info">11 Personnel</Badge>
          <Badge variant="neutral">Trips</Badge>
          <Badge variant="accent">Red Zone</Badge>
        </div>
      </Card>
    </div>
  );

  const renderIcons = () => (
    <div className="space-y-8">
      <div>
        <Typography variant="display-lg" className="mb-2">
          Icons
        </Typography>
        <Typography variant="body-md" className="text-secondary">
          Lucide icon library with consistent sizing and colors
        </Typography>
      </div>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Icon Library
        </Typography>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {iconSamples.map((iconName) => (
            <div
              key={iconName}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <Icon name={iconName as any} size="lg" />
              <Typography
                variant="caption"
                className="text-muted text-center text-xs"
              >
                {iconName}
              </Typography>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Sizes
        </Typography>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Icon name="star" size="sm" />
            <Typography variant="caption" className="text-muted">
              Small
            </Typography>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Icon name="star" size="md" />
            <Typography variant="caption" className="text-muted">
              Medium
            </Typography>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Icon name="star" size="lg" />
            <Typography variant="caption" className="text-muted">
              Large
            </Typography>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Icon name="star" size="xl" />
            <Typography variant="caption" className="text-muted">
              XL
            </Typography>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Colors
        </Typography>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Icon name="user" size="lg" color="primary" />
            <Typography variant="caption" className="text-muted">
              Primary
            </Typography>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Icon name="user" size="lg" color="success" />
            <Typography variant="caption" className="text-muted">
              Success
            </Typography>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Icon name="user" size="lg" color="error" />
            <Typography variant="caption" className="text-muted">
              Error
            </Typography>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Icon name="user" size="lg" color="warning" />
            <Typography variant="caption" className="text-muted">
              Warning
            </Typography>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Icon name="user" size="lg" color="info" />
            <Typography variant="caption" className="text-muted">
              Info
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderComponents = () => (
    <div className="space-y-8">
      <div>
        <Typography variant="display-lg" className="mb-2">
          Components
        </Typography>
        <Typography variant="body-md" className="text-secondary">
          Core UI components used throughout BoxCall
        </Typography>
      </div>

      <div>
        <Typography variant="headline-md" className="mb-4">
          Cards
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default" className="p-4">
            <Typography variant="body-md" className="font-semibold mb-2">
              Default Card
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Standard card with subtle styling
            </Typography>
          </Card>
          <Card variant="elevated" className="p-4">
            <Typography variant="body-md" className="font-semibold mb-2">
              Elevated Card
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Card with enhanced shadow
            </Typography>
          </Card>
          <Card variant="glass" className="p-4">
            <Typography variant="body-md" className="font-semibold mb-2">
              Glass Card
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Glassmorphism effect
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "colors":
        return renderColors();
      case "typography":
        return renderTypography();
      case "buttons":
        return renderButtons();
      case "badges":
        return renderBadges();
      case "icons":
        return renderIcons();
      case "components":
        return renderComponents();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-surface-elevated border-r border-border p-6 overflow-y-auto hidden lg:block">
        <Typography variant="headline-sm" className="mb-6">
          Design System
        </Typography>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeSection === section.id
                  ? "bg-jade-100 text-jade-900"
                  : "hover:bg-surface-overlay text-secondary"
              }`}
            >
              <Icon name={section.icon as any} size="sm" />
              <Typography variant="body-sm">{section.label}</Typography>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6">
            <Card variant="elevated" className="p-2">
              <div className="flex gap-2 overflow-x-auto">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-jade-100 text-jade-900"
                        : "text-secondary"
                    }`}
                  >
                    <Typography variant="body-sm">{section.label}</Typography>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Section Content */}
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
