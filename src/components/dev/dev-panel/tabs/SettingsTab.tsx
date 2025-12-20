import React from "react";

type Props = {
  userEmail?: string | null;
  mode: string;
};

export const SettingsTab: React.FC<Props> = ({ userEmail, mode }) => {
  return (
    <div className="space-y-md">
      <h3 className="text-lg font-semibold text-primary">Dev Settings</h3>
      <div className="space-y-xs text-sm">
        <div>
          <strong>User:</strong> {userEmail ?? "—"}
        </div>
        <div>
          <strong>Environment:</strong> {mode}
        </div>
        <div>
          <strong>Hotkey:</strong> Ctrl+Shift+D
        </div>
        <div className="mt-md pt-md border-t border-muted">
          <p className="text-xs text-secondary">
            This panel is only visible to authorized developers.
          </p>
        </div>
      </div>
    </div>
  );
};
