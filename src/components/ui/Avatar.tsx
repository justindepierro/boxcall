/**
 * Avatar Component
 *
 * Displays user profile picture with fallback to initials
 * Supports different sizes and clickable variants
 */

import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

export function Avatar({
  src,
  name,
  size = "md",
  className = "",
  onClick,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get initials from name (first letter of first and last name)
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const isClickable = !!onClick;

  // Generate a consistent color based on name
  const getColorFromName = (name: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-full
    flex items-center justify-center
    font-semibold
    text-white
    ${isClickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
    ${className}
  `.trim();

  // Show initials if no src or if image failed
  if (!src || imageError) {
    return (
      <div
        className={`${baseClasses} ${getColorFromName(name)}`}
        onClick={onClick}
        role={isClickable ? "button" : undefined}
        title={name}
      >
        {initials}
      </div>
    );
  }

  // Show image with fallback
  return (
    <div
      className={baseClasses}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
    >
      <img
        src={src}
        alt={name}
        className="w-full h-full rounded-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

/**
 * AvatarWithIcon Component
 * Avatar with an optional badge/icon overlay
 */

interface AvatarWithIconProps extends AvatarProps {
  icon?: React.ReactNode;
  iconPosition?: "top-right" | "bottom-right";
}

export function AvatarWithIcon({
  icon,
  iconPosition = "bottom-right",
  ...avatarProps
}: AvatarWithIconProps) {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div className="relative inline-block">
      <Avatar {...avatarProps} />
      {icon && (
        <div
          className={`absolute ${positionClasses[iconPosition]} transform translate-x-1/4 -translate-y-1/4`}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
