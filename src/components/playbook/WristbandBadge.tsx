import React from "react";

interface WristbandBadgeProps {
  wristbandNumber: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const WristbandBadge: React.FC<WristbandBadgeProps> = ({
  wristbandNumber,
  size = "sm",
  className = "",
}) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-bold bg-purple-100 text-purple-800 border border-purple-300 transition-colors hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 ${sizeClasses[size]} ${className}`}
      title={`Wristband: ${wristbandNumber}`}
    >
      <span className="font-mono">{wristbandNumber}</span>
    </span>
  );
};
