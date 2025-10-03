import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { useMobileErrorHandler } from "./useMobileErrorHandler";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useMobileErrorHandler",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Mobile error handler hook for managing error states in mobile interfaces.

**Features:**
- Error state management for mobile UI
- Different error types (network, timeout, server, generic)
- Error clearing functionality
- Mobile-optimized error display

**Usage:**
\`\`\`tsx
import { useMobileErrorHandler } from './hooks/useMobileErrorHandler';

function MobileComponent() {
  const { errorState, handleError, clearError } = useMobileErrorHandler();

  const handleApiCall = async () => {
    try {
      await apiCall();
    } catch (error) {
      handleError(error as Error);
    }
  };

  return (
    <div>
      {errorState && (
        <ErrorBanner
          type={errorState.type}
          title={errorState.title}
          message={errorState.message}
          onDismiss={clearError}
        />
      )}
      <Button onClick={handleApiCall}>Make API Call</Button>
    </div>
  );
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Mobile Error Handler Demo Component
const MobileErrorHandlerDemo = () => {
  const { errorState, handleError, clearError } = useMobileErrorHandler();
  const [errorType, setErrorType] = useState<string>("network");

  const simulateError = (type: string) => {
    const mockErrors = {
      network: new Error(
        "Network connection failed. Please check your internet connection."
      ),
      timeout: new Error(
        "Request timed out. The server took too long to respond."
      ),
      server: new Error("Server error occurred. Please try again later."),
      generic: new Error(
        "An unexpected error occurred. Please contact support if this persists."
      ),
    };

    handleError(mockErrors[type as keyof typeof mockErrors]);
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case "network":
        return "warning";
      case "timeout":
        return "neutral";
      case "server":
        return "danger";
      case "generic":
        return "info";
      default:
        return "neutral";
    }
  };

  return (
    <Card className="w-full max-w-md p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Mobile Error Handler</h3>
          <p className="text-sm text-gray-600 mb-4">
            Simulate different types of mobile errors and see how they're
            handled.
          </p>
        </div>

        {/* Error Type Selector */}
        <div className="space-y-4">
          <h4 className="font-medium">Error Type</h4>
          <div className="flex flex-wrap gap-2">
            {["network", "timeout", "server", "generic"].map((type) => (
              <Button
                key={type}
                size="sm"
                variant={errorType === type ? "primary" : "outline"}
                onClick={() => setErrorType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Simulate Error */}
        <div className="space-y-4">
          <h4 className="font-medium">Simulate Error</h4>
          <Button onClick={() => simulateError(errorType)} className="w-full">
            Trigger {errorType.charAt(0).toUpperCase() + errorType.slice(1)}{" "}
            Error
          </Button>
        </div>

        {/* Current Error State */}
        <div className="space-y-4">
          <h4 className="font-medium">Current Error State</h4>

          {errorState ? (
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={getErrorTypeColor(errorState.type)}>
                  {errorState.type.toUpperCase()}
                </Badge>
                <Button size="sm" variant="outline" onClick={clearError}>
                  Clear
                </Button>
              </div>
              <h5 className="font-medium text-red-800 mb-1">
                {errorState.title}
              </h5>
              <p className="text-sm text-red-700">{errorState.message}</p>
            </div>
          ) : (
            <div className="p-4 border rounded-lg text-center text-gray-500">
              No active error
            </div>
          )}
        </div>

        {/* Hook Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Hook Methods</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>
              <code>handleError(error)</code> - Process and display an error
            </div>
            <div>
              <code>clearError()</code> - Clear the current error state
            </div>
            <div>
              <code>errorState</code> - Current error state object
            </div>
          </div>
        </div>

        {/* Error Types */}
        <div className="space-y-4">
          <h4 className="font-medium">Error Types</h4>
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="warning">network</Badge>
              <span>Network connectivity issues</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral">timeout</Badge>
              <span>Request timeout errors</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger">server</Badge>
              <span>Server-side errors</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">generic</Badge>
              <span>General application errors</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj = {
  render: () => <MobileErrorHandlerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo of the mobile error handler hook with different error types.",
      },
    },
  },
};

export const NetworkError: StoryObj = {
  render: () => {
    const { errorState, handleError } = useMobileErrorHandler();

    React.useEffect(() => {
      handleError(
        new Error(
          "Network connection failed. Please check your internet connection."
        )
      );
    }, [handleError]);

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Network Error Example</h3>
        {errorState && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <Badge variant="warning" className="mb-2">
              NETWORK
            </Badge>
            <h4 className="font-medium">{errorState.title}</h4>
            <p className="text-sm">{errorState.message}</p>
          </div>
        )}
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example of how network errors are displayed in mobile interfaces.",
      },
    },
  },
};

export const ServerError: StoryObj = {
  render: () => {
    const { errorState, handleError } = useMobileErrorHandler();

    React.useEffect(() => {
      handleError(new Error("Internal server error. Please try again later."));
    }, [handleError]);

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Server Error Example</h3>
        {errorState && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <Badge variant="danger" className="mb-2">
              SERVER
            </Badge>
            <h4 className="font-medium">{errorState.title}</h4>
            <p className="text-sm">{errorState.message}</p>
          </div>
        )}
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example of how server errors are displayed in mobile interfaces.",
      },
    },
  },
};
