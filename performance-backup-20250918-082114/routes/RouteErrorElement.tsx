import React from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Typography } from "../components/design-system/Typography";
import { Button } from "../components/ui";

export const RouteErrorElement: React.FC = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred while loading this page.";
  let statusText: string | undefined;

  if (isRouteErrorResponse(error)) {
    statusText = `${error.status} ${error.statusText}`;
    if (error.status === 401) {
      title = "Unauthorized";
      message = "Please sign in to continue.";
    } else if (error.status === 403) {
      title = "Access denied";
      message = "You don’t have permission to view this page.";
    } else if (error.status === 404) {
      title = "Page not found";
      message = "The page you requested does not exist.";
    } else {
      title = "Application error";
      // Safely narrow unknown error shapes without using `any`
      const data = (error as { data?: unknown }).data;
      const hasMessage = (x: unknown): x is { message?: unknown } =>
        !!x && typeof x === "object" && "message" in x;
      if (hasMessage(data) && typeof data.message === "string") {
        message = data.message;
      }
    }
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center surface-app p-6">
      <div className="text-center max-w-lg">
        <div className="mb-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </span>
        </div>
        <Typography variant="headline-sm" as="h1" className="mb-2">
          {title}
        </Typography>
        {statusText && (
          <p className="text-xs text-text-tertiary mb-1">{statusText}</p>
        )}
        <p className="text-text-secondary mb-4">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorElement;
