import React from "react";
import { UserProfilePopover } from "./UserProfilePopover";
import { Typography } from "../design-system/Typography";

interface UserAvatarProps {
  userId: string;
  name?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showPopover?: boolean;
  showOnHover?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  name,
  avatarUrl,
  role,
  size = "md",
  showName = false,
  showPopover = true,
  showOnHover = true,
  placement = "bottom",
  className = "",
  onClick,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return {
          avatar: "w-6 h-6",
          text: "text-xs",
          spacing: "space-x-1",
        };
      case "sm":
        return {
          avatar: "w-8 h-8",
          text: "text-sm",
          spacing: "space-x-2",
        };
      case "md":
        return {
          avatar: "w-10 h-10",
          text: "text-sm",
          spacing: "space-x-2",
        };
      case "lg":
        return {
          avatar: "w-12 h-12",
          text: "text-base",
          spacing: "space-x-3",
        };
      case "xl":
        return {
          avatar: "w-16 h-16",
          text: "text-lg",
          spacing: "space-x-3",
        };
      default:
        return {
          avatar: "w-10 h-10",
          text: "text-sm",
          spacing: "space-x-2",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getAvatarFallback = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case "coach":
      case "head_coach":
      case "assistant_coach":
        return "text-blue-600";
      case "player":
        return "text-green-600";
      case "family":
      case "parent":
        return "text-purple-600";
      case "admin":
        return "text-red-600";
      default:
        return "text-secondary";
    }
  };

  const formatDisplayName = (name: string | null) => {
    if (!name) return "Unknown User";

    // For coaches, show "Coach LastName" if it's a full name
    if (role?.includes("coach") && name.includes(" ")) {
      const parts = name.split(" ");
      return `Coach ${parts[parts.length - 1]}`;
    }

    return name;
  };

  const avatarElement = (
    <div
      className={`
        inline-flex items-center ${sizeClasses.spacing} ${className}
        ${showPopover ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
      `}
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className={`${sizeClasses.avatar} rounded-full overflow-hidden bg-surface-muted flex items-center justify-center flex-shrink-0`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || "User"}
            className="w-full h-full object-cover"
          />
        ) : (
          <Typography variant="body-sm" className="text-secondary font-semibold">
            {getAvatarFallback(name || null)}
          </Typography>
        )}
      </div>

      {/* Name */}
      {showName && (
        <div className="min-w-0 flex-1">
          <Typography
            variant="body-sm"
            className={`font-medium truncate ${getRoleColor(role || null)}`}
          >
            {formatDisplayName(name || null)}
          </Typography>
        </div>
      )}
    </div>
  );

  // Wrap with popover if enabled
  if (showPopover) {
    return (
      <UserProfilePopover
        userId={userId}
        trigger={avatarElement}
        placement={placement}
        showOnHover={showOnHover}
      />
    );
  }

  return avatarElement;
};
