import React from "react";

export interface ConfidenceBadgeProps {
  confidence: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * ConfidenceBadge - A circular progress indicator showing play confidence level
 *
 * Features:
 * - Circular SVG progress ring
 * - Color-coded by confidence level (red < 50, yellow < 70, green >= 70)
 * - Configurable sizes
 * - Optional numeric label
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <ConfidenceBadge confidence={75} size="md" showLabel />
 * ```
 */
export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  size = "md",
  showLabel = true,
  className = "",
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      svg: "w-8 h-8",
      circle: { r: 14, cx: 16, cy: 16, strokeWidth: 2, circumference: 88 },
      text: "text-2xs",
    },
    md: {
      container: "w-11 h-11",
      svg: "w-11 h-11",
      circle: { r: 18, cx: 22, cy: 22, strokeWidth: 3, circumference: 113 },
      text: "text-2xs",
    },
    lg: {
      container: "w-14 h-14",
      svg: "w-14 h-14",
      circle: { r: 22, cx: 28, cy: 28, strokeWidth: 4, circumference: 138 },
      text: "text-xs",
    },
  };

  const config = sizeConfig[size];

  // Color determination based on confidence level
  const getStrokeColor = () => {
    if (confidence >= 70) return "stroke-success-strong";
    if (confidence >= 50) return "stroke-warning-strong";
    return "stroke-danger-strong";
  };

  const getTextColor = () => {
    if (confidence >= 70) return "text-success-strong";
    if (confidence >= 50) return "text-warning-strong";
    return "text-danger-strong";
  };

  const strokeDasharray = `${(confidence / 100) * config.circle.circumference} ${config.circle.circumference}`;

  return (
    <div
      className={`${config.container} rounded-full bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800 ${className}`}
      role="meter"
      aria-valuenow={confidence}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Confidence: ${confidence}%`}
    >
      <svg
        className={`absolute ${config.svg} -rotate-90`}
        viewBox={`0 0 ${config.circle.cx * 2} ${config.circle.cy * 2}`}
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx={config.circle.cx}
          cy={config.circle.cy}
          r={config.circle.r}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth={config.circle.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.circle.cx}
          cy={config.circle.cy}
          r={config.circle.r}
          fill="none"
          className={getStrokeColor()}
          strokeWidth={config.circle.strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <span className={`relative ${config.text} font-bold ${getTextColor()}`}>
          {confidence}
        </span>
      )}
    </div>
  );
};
