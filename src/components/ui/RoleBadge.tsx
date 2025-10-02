import React from "react";
import { Shield, Crown, Users, GraduationCap, User, Heart } from "lucide-react";

export type AppRole =
  | "admin"
  | "head_coach"
  | "coach"
  | "free_coach"
  | "player"
  | "family";

interface RoleBadgeProps {
  role: AppRole | string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const getRoleConfig = (role: string) => {
  switch (role) {
    case "admin":
      return {
        label: "Platform Admin",
        icon: Shield,
        colors:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        iconColor: "text-red-600 dark:text-red-400",
      };
    case "head_coach":
      return {
        label: "Head Coach",
        icon: Crown,
        colors:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
        iconColor: "text-purple-600 dark:text-purple-400",
      };
    case "coach":
      return {
        label: "Coach",
        icon: Users,
        colors:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
      };
    case "free_coach":
      return {
        label: "Coach (Free)",
        icon: GraduationCap,
        colors:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        iconColor: "text-green-600 dark:text-green-400",
      };
    case "player":
      return {
        label: "Player",
        icon: User,
        colors:
          "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
        iconColor: "text-orange-600 dark:text-orange-400",
      };
    case "family":
      return {
        label: "Family",
        icon: Heart,
        colors:
          "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800",
        iconColor: "text-pink-600 dark:text-pink-400",
      };
    default:
      return {
        label: role.charAt(0).toUpperCase() + role.slice(1),
        icon: User,
        colors:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
        iconColor: "text-gray-600 dark:text-gray-400",
      };
  }
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return {
        container: "px-2 py-1 text-xs",
        icon: "w-3 h-3",
      };
    case "lg":
      return {
        container: "px-4 py-2 text-sm",
        icon: "w-5 h-5",
      };
    default: // md
      return {
        container: "px-3 py-1.5 text-sm",
        icon: "w-4 h-4",
      };
  }
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = "md",
  showIcon = false,
  className = "",
}) => {
  const config = getRoleConfig(role);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  return (
    <span
      className={`
      inline-flex items-center gap-2 rounded-full border font-medium
      ${config.colors} 
      ${sizeClasses.container}
      ${className}
    `}
      role="status"
      aria-label={`User role: ${config.label}`}
    >
      {showIcon && (
        <Icon className={`${sizeClasses.icon} ${config.iconColor}`} aria-hidden="true" />
      )}
      <span aria-hidden="true">{config.label}</span>
    </span>
  );
};

// Subscription tier badge
interface SubscriptionBadgeProps {
  tier: string;
  className?: string;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  tier,
  className = "",
}) => {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "premium":
        return {
          label: "Premium",
          colors: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
        };
      case "free":
        return {
          label: "Free",
          colors:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        };
      default:
        return {
          label: tier.charAt(0).toUpperCase() + tier.slice(1),
          colors:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        };
    }
  };

  const config = getTierConfig(tier);

  return (
    <span
      className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${config.colors}
      ${className}
    `}
    >
      {config.label}
    </span>
  );
};
