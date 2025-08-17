import React from "react";
import { Typography } from "../components/design-system/Typography";
import { Button } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import type { IconName } from "../components/ui/Icon/Icon";
import { ROUTES } from "./paths";

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-jade" />
  </div>
);

interface AccessDeniedProps {
  title?: string;
  message: React.ReactNode;
  iconName?: IconName;
  actions?: React.ReactNode;
  debugInfo?: React.ReactNode;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = "Access Denied",
  message,
  iconName = "shield",
  actions,
  debugInfo,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center surface-app">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-4 flex items-center justify-center text-text-primary">
          <Icon name={iconName} size="lg" className="mr-2" />
          <Typography variant="headline-md" as="h1">
            {title}
          </Typography>
        </div>
        <div className="mb-6 text-text-secondary">{message}</div>
        <div className="space-y-3">
          {actions ?? (
            <>
              <Button
                onClick={() => window.history.back()}
                variant="primary"
                className="w-full px-6 py-3 font-sans font-semibold"
              >
                <Icon name="arrow-left" size="sm" className="mr-2 inline" />
                Go Back
              </Button>
              <Button
                onClick={() => (window.location.href = ROUTES.DASHBOARD)}
                variant="ghost"
                className="w-full px-6 py-3 font-sans font-semibold"
              >
                <Icon name="home" size="sm" className="mr-2 inline" />
                Go to Dashboard
              </Button>
            </>
          )}
        </div>
        {debugInfo ? (
          <div className="mt-4 p-3 surface-subtle rounded-md text-sm text-text-secondary text-left overflow-auto">
            {typeof debugInfo === "string" ? (
              <pre className="whitespace-pre-wrap break-words">{debugInfo}</pre>
            ) : (
              debugInfo
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AccessDenied;
