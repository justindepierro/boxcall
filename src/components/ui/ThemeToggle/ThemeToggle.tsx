import React, { useState, useEffect } from "react";

import {
  applyTheme,
  getStoredTheme,
  type ThemeName,
} from "../../../themes/ThemeManager";
import { Button } from "../Button";

// Only support light and dark mode
const cycleOrder: ThemeName[] = ["light", "dark"];

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

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle light/dark mode"
      onClick={cycle}
      className={`flex items-center justify-center p-1 ${className}`}
    >
      {theme === "light" ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="5" fill="#FBBF24" />
          <g stroke="#FBBF24" strokeWidth="2">
            <line x1="10" y1="2" x2="10" y2="0" />
            <line x1="10" y1="18" x2="10" y2="20" />
            <line x1="2" y1="10" x2="0" y2="10" />
            <line x1="18" y1="10" x2="20" y2="10" />
            <line x1="15.07" y1="4.93" x2="16.49" y2="3.51" />
            <line x1="4.93" y1="15.07" x2="3.51" y2="16.49" />
            <line x1="4.93" y1="4.93" x2="3.51" y2="3.51" />
            <line x1="15.07" y1="15.07" x2="16.49" y2="16.49" />
          </g>
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 13.5A7.5 7.5 0 0 1 6.5 3a7.5 7.5 0 1 0 10.5 10.5Z"
            fill="#FBBF24"
          />
        </svg>
      )}
    </Button>
  );
};

export default ThemeToggle;
