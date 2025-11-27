import React, { useState, useEffect } from "react";
import {
  isRouteErrorResponse,
  useRouteError,
  useNavigate,
} from "react-router-dom";
import { Typography } from "../components/design-system/Typography";
import { Button } from "../components/ui";
import { useAuth } from "../app/auth-store";

export const RouteErrorElement: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  let title = "Something went wrong";
  let message = "An unexpected error occurred while loading this page.";
  let statusText: string | undefined;
  let showSignOut = false;
  let showRetry = true;

  if (isRouteErrorResponse(error)) {
    statusText = `${error.status} ${error.statusText}`;

    switch (error.status) {
      case 401:
        title = "Authentication Required";
        message = "Please sign in to continue.";
        showSignOut = true;
        break;
      case 403:
        title = "Access Denied";
        message = "You don't have permission to view this page.";
        showSignOut = false;
        break;
      case 404:
        title = "Page Not Found";
        message = "The page you requested does not exist.";
        showRetry = false;
        break;
      case 500:
        title = "Server Error";
        message = "Something went wrong on our end. Please try again.";
        break;
      case 503:
        title = "Service Unavailable";
        message =
          "The service is temporarily unavailable. Please try again later.";
        break;
      default: {
        title = "Application Error";
        const data = (error as { data?: unknown }).data;
        const hasMessage = (x: unknown): x is { message?: unknown } =>
          !!x && typeof x === "object" && "message" in x;
        if (hasMessage(data) && typeof data.message === "string") {
          message = data.message;
        }
      }
    }
  } else if (error instanceof Error) {
    message = error.message || message;

    // Check for network-related errors
    if (!isOnline || message.toLowerCase().includes("network")) {
      title = "Connection Error";
      message = "Please check your internet connection and try again.";
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    window.location.reload();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      // Force navigation even if sign out fails
      navigate("/login", { replace: true });
    }
  };

  const handleGoHome = () => {
    navigate(user ? "/dashboard" : "/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center surface-app p-6">
      <div className="text-center max-w-lg">
        <div className="mb-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-error text-error">
            {!isOnline ? "📶" : "!"}
          </span>
        </div>

        <Typography variant="headline-sm" as="h1" className="mb-2">
          {title}
        </Typography>

        {statusText && (
          <p className="text-xs text-tertiary mb-1">{statusText}</p>
        )}

        <p className="text-secondary mb-4">{message}</p>

        {!isOnline && (
          <div className="mb-4 p-3 bg-warning/20/10 border border-warning/20/20 rounded-md">
            <p className="text-sm text-warning">
              You're currently offline. Some features may not be available.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="primary" size="sm" onClick={handleGoHome}>
            {user ? "Go to Dashboard" : "Go to Login"}
          </Button>

          {showRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetry}
              disabled={!isOnline && retryCount >= 3}
            >
              {retryCount > 0 ? `Retry (${retryCount})` : "Retry"}
            </Button>
          )}

          {showSignOut && user && (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          )}
        </div>

        {retryCount >= 3 && (
          <p className="text-xs text-tertiary mt-4">
            Still having issues? Try refreshing the page or contact support.
          </p>
        )}
      </div>
    </div>
  );
};

export default RouteErrorElement;
