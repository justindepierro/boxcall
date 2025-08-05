import React from "react";
import { Icon } from "../ui/Icon/Icon";
// Square Progress Bar Component
interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  variant?: "jade" | "navy" | "gray";
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  animated?: boolean;
}
export const SquareProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  variant = "jade",
  size = "md",
  showPercentage = true,
  animated = true,
}) => {
  const getBarColors = () => {
    switch (variant) {
      case "jade":
        return "bg-jade-500";
      case "navy":
        return "bg-navy-500";
      case "gray":
        return "bg-gray-500";
      default:
        return "bg-jade-500";
    }
  };
  const getBackgroundColors = () => {
    switch (variant) {
      case "jade":
        return "bg-jade-100 dark:bg-jade-900/20";
      case "navy":
        return "bg-navy-100 dark:bg-navy-900/20";
      case "gray":
        return "bg-gray-100 dark:bg-gray-900/20";
      default:
        return "bg-jade-100 dark:bg-jade-900/20";
    }
  };
  const getHeight = () => {
    switch (size) {
      case "sm":
        return "h-2";
      case "md":
        return "h-3";
      case "lg":
        return "h-4";
      default:
        return "h-3";
    }
  };
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-sans font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-mono font-bold text-gray-600 dark:text-gray-400">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${getHeight()} ${getBackgroundColors()} rounded-sm overflow-hidden`}
      >
        <div
          className={`${getHeight()} ${getBarColors()} rounded-sm ${
            animated ? "transition-all duration-700 ease-out" : ""
          }`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
// Square Loading Spinner Component
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "jade" | "navy" | "gray";
  label?: string;
}
export const SquareLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "jade",
  label,
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "md":
        return "w-6 h-6";
      case "lg":
        return "w-8 h-8";
      case "xl":
        return "w-12 h-12";
      default:
        return "w-6 h-6";
    }
  };
  const getBorderColor = () => {
    switch (variant) {
      case "jade":
        return "border-jade-500";
      case "navy":
        return "border-navy-500";
      case "gray":
        return "border-gray-500";
      default:
        return "border-jade-500";
    }
  };
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`${getSpinnerSize()} border-2 ${getBorderColor()} border-t-transparent rounded-sm animate-spin`}
      />
      {label && (
        <span className="text-sm font-sans font-medium text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );
};
// Square Skeleton Loader Component
interface SkeletonProps {
  lines?: number;
  width?: string;
  height?: string;
  className?: string;
}
export const SquareSkeleton: React.FC<SkeletonProps> = ({
  lines = 3,
  width = "w-full",
  height = "h-4",
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse`}
          style={{
            animationDelay: `${index * 0.1}s`,
            width: index === lines - 1 ? "75%" : "100%", // Last line shorter
          }}
        />
      ))}
    </div>
  );
};
// Square Pulse Animation Component
interface PulseIndicatorProps {
  variant?: "jade" | "navy" | "red";
  size?: "sm" | "md" | "lg";
  label?: string;
}
export const SquarePulseIndicator: React.FC<PulseIndicatorProps> = ({
  variant = "jade",
  size = "md",
  label,
}) => {
  const getSize = () => {
    switch (size) {
      case "sm":
        return "w-2 h-2";
      case "md":
        return "w-3 h-3";
      case "lg":
        return "w-4 h-4";
      default:
        return "w-3 h-3";
    }
  };
  const getColors = () => {
    switch (variant) {
      case "jade":
        return "bg-jade-500";
      case "navy":
        return "bg-navy-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-jade-500";
    }
  };
  return (
    <div className="flex items-center space-x-2">
      <div className={`${getSize()} ${getColors()} rounded-sm animate-pulse`} />
      {label && (
        <span className="text-sm font-sans font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
};
// Football-Specific Loading Component
export const FootballLoadingSpinner: React.FC<{ message?: string }> = ({
  message = "Loading team data...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        {/* Spinning football field */}
        <div className="w-16 h-16 border-4 border-jade-200 dark:border-jade-800 rounded-sm animate-spin">
          <div className="absolute inset-2 bg-green-100 dark:bg-green-900/20 rounded-sm flex items-center justify-center">
            <Icon name="award" className="w-5 h-5" />
          </div>
        </div>
        {/* Pulsing yard lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-0.5 bg-jade-500 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-1">
          {message}
        </p>
        <SquareProgressBar
          value={Math.random() * 100} // Simulated progress
          variant="jade"
          size="sm"
          showPercentage={false}
          animated
        />
      </div>
    </div>
  );
};
// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
}
export const SquarePageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = "right",
}) => {
  const getTransitionClass = () => {
    switch (direction) {
      case "left":
        return "animate-slideInLeft";
      case "right":
        return "animate-slideInRight";
      case "up":
        return "animate-slideInUp";
      case "down":
        return "animate-slideInDown";
      default:
        return "animate-slideInRight";
    }
  };
  return <div className={`${getTransitionClass()}`}>{children}</div>;
};
export default {
  SquareProgressBar,
  SquareLoadingSpinner,
  SquareSkeleton,
  SquarePulseIndicator,
  FootballLoadingSpinner,
  SquarePageTransition,
};
