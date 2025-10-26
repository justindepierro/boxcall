/**
 * User Presence Panel
 *
 * Shows users currently collaborating on the diagram with real-time presence indicators
 */

import React from "react";
import { Users } from "lucide-react";
import { useCollaborativeStore } from "../stores/collaborativeStore";

interface UserPresencePanelProps {
  className?: string;
}

export const UserPresencePanel: React.FC<UserPresencePanelProps> = ({
  className,
}) => {
  const { users, isConnected } = useCollaborativeStore();

  if (!isConnected || users.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 bg-surface-primary border border-divider rounded-lg shadow-sm ${className || ""}`}
    >
      <Users className="w-4 h-4 text-text-secondary" />
      <div className="flex items-center gap-1">
        {users.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-1"
            title={user.name}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ))}
        {users.length > 3 && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-muted text-text-secondary text-xs font-medium">
            +{users.length - 3}
          </div>
        )}
      </div>
      <span className="text-sm text-text-secondary ml-1">
        {users.length} online
      </span>
    </div>
  );
};

export default UserPresencePanel;
