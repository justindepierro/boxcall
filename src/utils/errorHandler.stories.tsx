import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import {
  BoxCallError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  PermissionError,
  errorHandler,
  useErrorHandler,
} from "./errorHandler";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const meta: Meta = {
  title: "Utils/errorHandler",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Global error handling utilities for BoxCall with consistent error reporting and user feedback.

**Features:**
- Custom error classes with user-friendly messages
- Global error handler with queue and offline support
- Validation error handling with field-level details
- React hook for component-level error handling

**Usage:**
\`\`\`tsx
import { useErrorHandler, NetworkError } from './utils/errorHandler';

function MyComponent() {
  const { handleError, handleApiError } = useErrorHandler();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      handleApiError(error, { action: 'handleAction' });
    }
  };

  return <button onClick={handleAction}>Do Action</button>;
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Error Handler Demo Component
const ErrorHandlerDemo = () => {
  const {
    handleApiError,
    handleValidationError,
    handleNetworkError,
    getStoredErrors,
  } = useErrorHandler();
  const [storedErrors, setStoredErrors] = React.useState(() =>
    getStoredErrors()
  );

  const triggerDifferentErrors = () => {
    // Network error
    handleNetworkError(new Error("Failed to connect to server"), {
      endpoint: "/api/teams",
      method: "GET",
    });

    // Validation error
    handleValidationError(
      [
        {
          field: "email",
          message: "Invalid email format",
          code: "INVALID_FORMAT",
        },
        { field: "password", message: "Password too short", code: "TOO_SHORT" },
      ],
      { form: "login" }
    );

    // API error
    handleApiError(new Error("Database connection failed"), {
      table: "teams",
      operation: "SELECT",
    });

    // Update stored errors
    setTimeout(() => setStoredErrors(getStoredErrors()), 100);
  };

  const clearStoredErrors = () => {
    // Clear localStorage manually for demo
    try {
      localStorage.removeItem("boxcall_errors");
      setStoredErrors([]);
    } catch {
      console.warn("Failed to clear errors");
    }
  };

  return (
    <Card className="w-full max-w-6xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Error Handler System</h3>
          <p className="text-sm text-secondary mb-4">
            Global error handling with custom error classes, queue management,
            and offline support.
          </p>
        </div>

        {/* Error Classes */}
        <div className="space-y-4">
          <h4 className="font-medium">Error Classes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "BoxCallError",
                description: "Base error class with code and context",
                example: new BoxCallError(
                  "Something went wrong",
                  "CUSTOM_ERROR",
                  { userId: "123" }
                ),
              },
              {
                name: "NetworkError",
                description: "Network connectivity issues",
                example: new NetworkError("Connection timeout", {
                  retryCount: 3,
                }),
              },
              {
                name: "ValidationError",
                description: "Form validation failures",
                example: new ValidationError("Invalid input", [
                  { field: "email", message: "Required", code: "REQUIRED" },
                ]),
              },
              {
                name: "AuthenticationError",
                description: "Auth-related errors",
                example: new AuthenticationError("Session expired"),
              },
              {
                name: "PermissionError",
                description: "Permission denied errors",
                example: new PermissionError("Access denied"),
              },
            ].map((errorType) => (
              <div key={errorType.name} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium">{errorType.name}</h5>
                  <Badge variant="info" className="text-xs">
                    {errorType.example.code}
                  </Badge>
                </div>
                <p className="text-sm text-secondary mb-2">
                  {errorType.description}
                </p>
                <div className="text-xs text-muted space-y-1">
                  <div>
                    <strong>Message:</strong> {errorType.example.message}
                  </div>
                  {errorType.example.userMessage && (
                    <div>
                      <strong>User Message:</strong>{" "}
                      {errorType.example.userMessage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Trigger */}
        <div className="space-y-4">
          <h4 className="font-medium">Trigger Error Examples</h4>
          <div className="flex gap-3">
            <Button onClick={triggerDifferentErrors} variant="danger">
              Trigger Sample Errors
            </Button>
            <Button onClick={clearStoredErrors} variant="outline">
              Clear Stored Errors
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Check browser console for error logging and localStorage for
            persistence.
          </div>
        </div>

        {/* Stored Errors */}
        <div className="space-y-4">
          <h4 className="font-medium">Stored Errors ({storedErrors.length})</h4>

          {storedErrors.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {storedErrors.map((error, index) => (
                <div key={index} className="p-3 border rounded-lg bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="danger" className="text-xs">
                      Error {index + 1}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-error-600 mb-2">
                    {error.message}
                  </div>
                  <div className="text-xs text-secondary space-y-1">
                    <div>
                      <strong>URL:</strong> {error.url}
                    </div>
                    {error.context && (
                      <div>
                        <strong>Context:</strong>{" "}
                        {JSON.stringify(error.context)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No stored errors. Trigger some errors to see them here.
            </div>
          )}
        </div>

        {/* Error Handler Features */}
        <div className="space-y-4">
          <h4 className="font-medium">Error Handler Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Global Error Handling</h5>
              <div className="text-sm text-secondary space-y-1">
                <div>• Catches uncaught JavaScript errors</div>
                <div>• Handles unhandled promise rejections</div>
                <div>• Queues errors when offline</div>
                <div>• Stores errors in localStorage</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Error Types</h5>
              <div className="text-sm text-secondary space-y-1">
                <div>• Network errors with retry logic</div>
                <div>• Validation errors with field details</div>
                <div>• Authentication errors</div>
                <div>• Permission errors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Function Signatures */}
        <div className="space-y-4">
          <h4 className="font-medium">Function Signatures</h4>
          <div className="text-sm space-y-2 text-gray-600">
            <div>
              <code>handleApiError(error, context?): void</code>
            </div>
            <div>
              <code>handleValidationError(errors, context?): void</code>
            </div>
            <div>
              <code>handleNetworkError(error, context?): void</code>
            </div>
            <div>
              <code>useErrorHandler(): ErrorHandlerHook</code>
            </div>
          </div>
        </div>

        {/* Error Report Structure */}
        <div className="space-y-4">
          <h4 className="font-medium">ErrorReport Structure</h4>
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="text-sm space-y-1 text-gray-700">
              <div>
                <code>message</code> - Error message string
              </div>
              <div>
                <code>stack</code> - Error stack trace (optional)
              </div>
              <div>
                <code>url</code> - Current page URL
              </div>
              <div>
                <code>timestamp</code> - ISO timestamp string
              </div>
              <div>
                <code>userAgent</code> - Browser user agent
              </div>
              <div>
                <code>userId</code> - User identifier (optional)
              </div>
              <div>
                <code>sessionId</code> - Session identifier (optional)
              </div>
              <div>
                <code>context</code> - Additional context data (optional)
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj = {
  render: () => <ErrorHandlerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Complete error handler system demo with error classes and global handling.",
      },
    },
  },
};

export const ErrorClasses: StoryObj = {
  render: () => {
    const errorExamples = [
      new BoxCallError("Custom error occurred", "CUSTOM_ERROR", {
        component: "TestComponent",
      }),
      new NetworkError("Failed to fetch data", { endpoint: "/api/users" }),
      new ValidationError("Form validation failed", [
        { field: "email", message: "Invalid format", code: "INVALID_FORMAT" },
        { field: "password", message: "Too weak", code: "TOO_WEAK" },
      ]),
      new AuthenticationError("Token expired", { lastLogin: "2024-01-01" }),
      new PermissionError("Insufficient permissions", {
        requiredRole: "admin",
      }),
    ];

    return (
      <Card className="p-6 max-w-4xl">
        <h3 className="text-lg font-semibold mb-4">Error Classes</h3>
        <div className="space-y-4">
          {errorExamples.map((error, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium">{error.constructor.name}</h4>
                <Badge variant="danger">{error.code}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>Message:</strong> {error.message}
                </div>
                {error.userMessage && (
                  <div>
                    <strong>User Message:</strong> {error.userMessage}
                  </div>
                )}
                {error.context && (
                  <div>
                    <strong>Context:</strong>{" "}
                    {JSON.stringify(error.context, null, 2)}
                  </div>
                )}
                {error instanceof ValidationError && (
                  <div className="mt-3">
                    <strong>Validation Errors:</strong>
                    <div className="mt-2 space-y-1">
                      {error.validationErrors.map((ve, i) => (
                        <div key={i} className="p-2 bg-error-bg rounded text-xs">
                          <Badge variant="danger" className="mr-2">
                            {ve.field}
                          </Badge>
                          {ve.message} ({ve.code})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows all error classes with their properties and user messages.",
      },
    },
  },
};

export const ErrorHandlingHook: StoryObj = {
  render: () => {
    const {
      handleError,
      handleApiError,
      handleValidationError,
      handleNetworkError,
    } = useErrorHandler();

    const [lastAction, setLastAction] = React.useState<string>("");

    const actions = [
      {
        label: "Handle API Error",
        action: () => {
          handleApiError(new Error("API call failed"), {
            endpoint: "/api/test",
          });
          setLastAction("API Error");
        },
      },
      {
        label: "Handle Validation Error",
        action: () => {
          handleValidationError([
            { field: "username", message: "Required field", code: "REQUIRED" },
          ]);
          setLastAction("Validation Error");
        },
      },
      {
        label: "Handle Network Error",
        action: () => {
          handleNetworkError("Connection timeout");
          setLastAction("Network Error");
        },
      },
      {
        label: "Handle Generic Error",
        action: () => {
          handleError(new Error("Something went wrong"), { component: "Demo" });
          setLastAction("Generic Error");
        },
      },
    ];

    return (
      <Card className="p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">useErrorHandler Hook</h3>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Click buttons to trigger different types of errors. Check console
            for logging.
          </div>

          <div className="grid grid-cols-2 gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                variant="outline"
                className="text-sm"
              >
                {action.label}
              </Button>
            ))}
          </div>

          {lastAction && (
            <div className="p-3 border rounded-lg bg-blue-50">
              <div className="text-sm">
                <strong>Last Action:</strong> {lastAction}
              </div>
              <div className="text-xs text-secondary mt-1">
                Error logged to console and stored for reporting.
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <div>
              <strong>Hook Methods:</strong>
            </div>
            <div>
              • <code>handleError(error, context)</code> - Generic error
              handling
            </div>
            <div>
              • <code>handleApiError(error, context)</code> - API error handling
            </div>
            <div>
              • <code>handleValidationError(errors, context)</code> - Validation
              error handling
            </div>
            <div>
              • <code>handleNetworkError(error, context)</code> - Network error
              handling
            </div>
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the useErrorHandler hook with different error handling methods.",
      },
    },
  },
};

export const ErrorQueueManagement: StoryObj = {
  render: () => {
    const { getStoredErrors } = useErrorHandler();
    const [storedErrors, setStoredErrors] = React.useState(() =>
      getStoredErrors()
    );

    const addMultipleErrors = () => {
      for (let i = 0; i < 5; i++) {
        errorHandler.handleError(new Error(`Test error ${i + 1}`), {
          test: true,
          index: i,
        });
      }
      setTimeout(() => setStoredErrors(getStoredErrors()), 100);
    };

    const clearErrors = () => {
      try {
        localStorage.removeItem("boxcall_errors");
        setStoredErrors([]);
      } catch {
        console.warn("Failed to clear errors");
      }
    };

    return (
      <Card className="p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Error Queue Management</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={addMultipleErrors} variant="danger">
              Add 5 Test Errors
            </Button>
            <Button onClick={clearErrors} variant="outline">
              Clear All Errors
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Errors are queued and stored in localStorage for offline scenarios.
            Only the last 10 errors are kept to prevent storage bloat.
          </div>

          <div className="space-y-2">
            <div className="font-medium text-sm">
              Stored Errors: {storedErrors.length}
            </div>
            {storedErrors.slice(-3).map((error, index) => (
              <div key={index} className="p-2 border rounded text-xs">
                <div className="font-medium">{error.message}</div>
                <div className="text-muted">
                  {new Date(error.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            {storedErrors.length > 3 && (
              <div className="text-xs text-gray-500">
                ... and {storedErrors.length - 3} more
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows error queue management and localStorage persistence.",
      },
    },
  },
};
