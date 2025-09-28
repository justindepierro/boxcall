import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useContext } from "react";
import { ToastProvider } from "../components/ui/Toast";
import { ToastContext } from "./ToastContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

const meta: Meta = {
  title: "Contexts/ToastContext",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Toast notification system with context provider for displaying temporary messages.

**Features:**
- Multiple toast types: success, error, warning, info
- Auto-dismiss with configurable duration
- Manual dismiss option
- Action buttons support
- Professional animations and styling
- Context-based state management

**Usage:**
\`\`\`tsx
import { ToastProvider, ToastContext } from './components/ui/Toast';

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

function YourComponent() {
  const { success, error, warning, info, addToast } = useContext(ToastContext);

  return (
    <button onClick={() => success("Operation completed!")}>
      Show Success Toast
    </button>
  );
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Toast Demo Component
const ToastDemo = () => {
  const toastContext = useContext(ToastContext);

  if (!toastContext) {
    return <div>ToastContext not available</div>;
  }

  const { success, error, warning, info, addToast, toasts, removeToast } =
    toastContext as NonNullable<typeof toastContext>;

  const [customMessage, setCustomMessage] = React.useState("");
  const [customTitle, setCustomTitle] = React.useState("");
  const [customDuration, setCustomDuration] = React.useState(4000);

  const showCustomToast = () => {
    if (!customMessage.trim()) return;

    addToast({
      type: "info",
      message: customMessage,
      title: customTitle || undefined,
      duration: customDuration,
      action: customTitle
        ? {
            label: "Undo",
            onClick: () => info("Action undone!"),
          }
        : undefined,
    });

    setCustomMessage("");
    setCustomTitle("");
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Toast Context Demo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Test different types of toast notifications. Active toasts:{" "}
            {toasts.length}
          </p>
        </div>

        {/* Preset Toast Buttons */}
        <div className="space-y-4">
          <h4 className="font-medium">Preset Toasts</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={() => success("Operation completed successfully!")}
            >
              Success Toast
            </Button>
            <Button
              variant="danger"
              onClick={() => error("Something went wrong!")}
            >
              Error Toast
            </Button>
            <Button
              variant="warning"
              onClick={() => warning("Please check your input")}
            >
              Warning Toast
            </Button>
            <Button onClick={() => info("Here's some information")}>
              Info Toast
            </Button>
          </div>
        </div>

        {/* Custom Toast */}
        <div className="space-y-4">
          <h4 className="font-medium">Custom Toast</h4>
          <div className="space-y-3">
            <Input
              placeholder="Toast message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
            <Input
              placeholder="Toast title (optional)"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
            <div className="flex gap-2 items-center">
              <label className="text-sm">Duration (ms):</label>
              <Input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <Button onClick={showCustomToast} disabled={!customMessage.trim()}>
              Show Custom Toast
            </Button>
          </div>
        </div>

        {/* Active Toasts List */}
        {toasts.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Active Toasts</h4>
            <div className="space-y-2">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{toast.type}</span>
                    <span className="text-sm text-gray-600">
                      {toast.title && `"${toast.title}"`} "{toast.message}"
                    </span>
                    {toast.action && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Has Action
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeToast(toast.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Context Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Available Methods</h4>
          <div className="text-sm space-y-1">
            <div>
              <code>success(message, title?)</code> - Show success toast
            </div>
            <div>
              <code>error(message, title?)</code> - Show error toast
            </div>
            <div>
              <code>warning(message, title?)</code> - Show warning toast
            </div>
            <div>
              <code>info(message, title?)</code> - Show info toast
            </div>
            <div>
              <code>addToast(toast)</code> - Add custom toast with full options
            </div>
            <div>
              <code>removeToast(id)</code> - Manually remove toast
            </div>
            <div>
              <code>toasts</code> - Array of active toasts
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story wrapper that provides the ToastProvider
const ToastStoryWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

export const Default: StoryObj = {
  render: () => (
    <ToastStoryWrapper>
      <ToastDemo />
    </ToastStoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Complete toast context demo with all toast types and custom options.",
      },
    },
  },
};

export const SuccessToast: StoryObj = {
  render: () => (
    <ToastStoryWrapper>
      <Card className="p-6">
        <Button
          variant="primary"
          onClick={() => {
            const ctx = (window as any).__toastContext;
            if (ctx) ctx.success("File uploaded successfully!");
          }}
        >
          Show Success Toast
        </Button>
      </Card>
    </ToastStoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates success toast notifications.",
      },
    },
  },
};

export const ErrorToast: StoryObj = {
  render: () => (
    <ToastStoryWrapper>
      <Card className="p-6">
        <Button
          variant="danger"
          onClick={() => {
            const ctx = (window as any).__toastContext;
            if (ctx) ctx.error("Failed to save changes");
          }}
        >
          Show Error Toast
        </Button>
      </Card>
    </ToastStoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates error toast notifications.",
      },
    },
  },
};

export const ToastWithAction: StoryObj = {
  render: () => (
    <ToastStoryWrapper>
      <Card className="p-6">
        <Button
          onClick={() => {
            const ctx = (window as any).__toastContext;
            if (ctx) {
              ctx.addToast({
                type: "warning",
                title: "Unsaved Changes",
                message: "You have unsaved changes that will be lost.",
                action: {
                  label: "Save Now",
                  onClick: () => ctx.success("Changes saved!"),
                },
              });
            }
          }}
        >
          Show Toast with Action
        </Button>
      </Card>
    </ToastStoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows toast with action button for user interaction.",
      },
    },
  },
};
