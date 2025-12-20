import React from "react";
import { requestAppReset } from "../../../../utils/appReset";

type Props = {
  onToggleContrastDebug: () => void;
};

export const DebugTab: React.FC<Props> = ({ onToggleContrastDebug }) => {
  return (
    <div className="space-y-md">
      <h3 className="text-lg font-semibold text-primary">Debug Tools</h3>
      <div className="space-y-xs">
        <div className="flex items-center justify-between">
          <span>Contrast Debug Overlay</span>
          <button
            onClick={onToggleContrastDebug}
            className="px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover"
          >
            Toggle
          </button>
        </div>
        <button
          onClick={() => {
            requestAppReset("devpanel-force-reset");
          }}
          className="w-full px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover text-left"
        >
          🔄 Force Reload
        </button>
      </div>
    </div>
  );
};
