import React from "react";
import { Typography } from "../design-system";

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = "Loading",
  subtitle,
  className = "min-h-screen",
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-background ${className}`}
    >
      <div className="text-center space-y-4">
        {/* Spinning circle loader */}
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>

        <div className="space-y-2 max-w-md">
          <Typography variant="headline-lg" color="muted">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body-sm" color="muted">
              {subtitle}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
