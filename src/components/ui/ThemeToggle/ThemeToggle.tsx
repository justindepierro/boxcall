import React, { useState, useEffect } from "react";
import {
  THEME_IDS,
  applyTheme,
  getStoredTheme,
  type ThemeName,
} from "../../../themes/ThemeManager";
import { Button } from "../Button";

// Order we cycle through
const cycleOrder: ThemeName[] = [...THEME_IDS];

export const ThemeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const [theme, setTheme] = useState<ThemeName>(
    () => getStoredTheme() ?? cycleOrder[0]
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const cycle = () => {
    const idx = cycleOrder.indexOf(theme);
    const next = cycleOrder[(idx + 1) % cycleOrder.length];
    setTheme(next);
  };

  const label = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "high-contrast":
        return "HC";
      default:
        return theme;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={cycle}
      className={`flex items-center gap-1 font-medium ${className}`}
    >
      <span
        className="inline-block w-2 h-2 rounded-sm"
        style={{ background: "var(--semantic-primary)" }}
      />
      <span>{label()}</span>
    </Button>
  );
};

export default ThemeToggle;
