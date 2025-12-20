import React from "react";

type DesignConfig = {
  theme: "light" | "dark" | "auto";
  density: "compact" | "comfortable";
  motion: "enabled" | "reduced" | "disabled";
  glassmorphism: boolean;
};

type Props = {
  config: DesignConfig;
  updateConfig: (updates: Partial<DesignConfig>) => void;
};

export const DesignSystemTab: React.FC<Props> = ({ config, updateConfig }) => {
  return (
    <div className="space-y-md">
      <h3 className="text-lg font-semibold text-primary">Design System</h3>
      <div className="grid grid-cols-2 gap-md text-sm">
        <div>
          <strong>Theme:</strong> {config.theme}
        </div>
        <div>
          <strong>Density:</strong> {config.density}
        </div>
        <div>
          <strong>Motion:</strong> {config.motion}
        </div>
        <div>
          <strong>Glassmorphism:</strong> {config.glassmorphism ? "✅" : "❌"}
        </div>
      </div>
      <div className="mt-md">
        <h4 className="font-medium mb-xs">Quick Actions</h4>
        <div className="flex gap-xs">
          <button
            onClick={() =>
              updateConfig({
                theme: config.theme === "dark" ? "light" : "dark",
              })
            }
            className="px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover"
          >
            Toggle Theme
          </button>
          <button
            onClick={() =>
              updateConfig({
                density:
                  config.density === "compact" ? "comfortable" : "compact",
              })
            }
            className="px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover"
          >
            Toggle Density
          </button>
        </div>
      </div>
    </div>
  );
};
