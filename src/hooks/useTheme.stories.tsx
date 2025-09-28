import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useTheme } from "./useTheme";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system/Typography";

const meta: Meta = {
  title: "Hooks/useTheme",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A React hook for managing application themes with support for dark mode, light mode, and high-contrast themes.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

const ThemeDemo: React.FC = () => {
  const {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isHighContrast,
    availableThemes,
  } = useTheme();
  const [clickCount, setClickCount] = useState(0);

  return (
    <Card className="p-6 max-w-md">
      <div className="space-y-4">
        <Typography variant="headline-md">Theme Hook Demo</Typography>

        <div className="space-y-2">
          <Typography variant="body-sm" color="muted">
            Current Theme: <strong>{theme}</strong>
          </Typography>
          <Typography variant="body-sm" color="muted">
            Is Dark: <strong>{isDark ? "Yes" : "No"}</strong>
          </Typography>
          <Typography variant="body-sm" color="muted">
            Is High Contrast: <strong>{isHighContrast ? "Yes" : "No"}</strong>
          </Typography>
          <Typography variant="body-sm" color="muted">
            Toggle Clicks: <strong>{clickCount}</strong>
          </Typography>
        </div>

        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={() => {
              toggleTheme();
              setClickCount((prev) => prev + 1);
            }}
            className="w-full"
          >
            Toggle Theme (Cycle)
          </Button>

          <div className="grid grid-cols-3 gap-2">
            {availableThemes.map((themeName) => (
              <Button
                key={themeName}
                variant={theme === themeName ? "primary" : "outline"}
                size="sm"
                onClick={() => setTheme(themeName)}
              >
                {themeName}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-surface-secondary">
          <Typography variant="body-sm">
            This card demonstrates how the theme affects component styling. The
            background and text colors change based on the selected theme.
          </Typography>
        </div>
      </div>
    </Card>
  );
};

export const Default: StoryObj = {
  render: () => <ThemeDemo />,
};

export const ThemePersistence: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="body-md">
        Theme changes persist across browser sessions. Try changing the theme
        and refreshing the page.
      </Typography>
      <ThemeDemo />
    </div>
  ),
};

export const CrossTabSync: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="body-md">
        Theme changes sync across browser tabs. Open this story in multiple tabs
        and change the theme in one tab.
      </Typography>
      <ThemeDemo />
    </div>
  ),
};
