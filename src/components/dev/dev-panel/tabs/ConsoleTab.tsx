import React from "react";
import { debug } from "../../../../utils/logger";

type Props = {
  user: unknown;
  config: unknown;
};

export const ConsoleTab: React.FC<Props> = ({ user, config }) => {
  return (
    <div className="space-y-md">
      <h3 className="text-lg font-semibold text-primary">Console Tools</h3>
      <div className="space-y-xs">
        <button
          onClick={() => debug("Current user:", user)}
          className="w-full px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover text-left"
        >
          👤 Log Current User
        </button>
        <button
          onClick={() => debug("Design system config:", config)}
          className="w-full px-sm py-xs bg-secondary rounded-lg text-sm hover:bg-surface-hover text-left"
        >
          🎨 Log Design Config
        </button>
      </div>
    </div>
  );
};
