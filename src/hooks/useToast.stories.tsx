import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useToast } from "./useToast";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system/Typography";
import { Input } from "../components/ui/Input";

const meta: Meta = {
  title: "Hooks/useToast",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A React hook for displaying toast notifications with different types (success, error, warning, info) and customizable actions.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

const ToastDemo: React.FC = () => {
  const { success, error, warning, info, addToast, removeToast, toasts } =
    useToast();
  const [customMessage, setCustomMessage] = useState("");
  const [customTitle, setCustomTitle] = useState("");

  return (
    <Card className="p-6 max-w-lg">
      <div className="space-y-6">
        <Typography variant="headline-md">Toast Hook Demo</Typography>

        <div className="space-y-4">
          <Typography variant="body-sm" color="muted">
            Active Toasts: <strong>{toasts.length}</strong>
          </Typography>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => success("Operation completed successfully!")}
            >
              Success Toast
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => error("Something went wrong!")}
            >
              Error Toast
            </Button>

            <Button
              variant="warning"
              size="sm"
              onClick={() => warning("Please review this warning")}
            >
              Warning Toast
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => info("Here is some information")}
            >
              Info Toast
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Typography variant="body-md">Custom Toast</Typography>

          <Input
            label="Title (optional)"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Toast title"
          />

          <Input
            label="Message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Toast message"
          />

          <Button
            variant="outline"
            onClick={() => {
              if (customMessage.trim()) {
                addToast({
                  type: "info",
                  title: customTitle.trim() || undefined,
                  message: customMessage,
                  duration: 5000,
                  action: {
                    label: "Undo",
                    onClick: () => alert("Undo action clicked!"),
                  },
                });
                setCustomMessage("");
                setCustomTitle("");
              }
            }}
            disabled={!customMessage.trim()}
            className="w-full"
          >
            Add Custom Toast
          </Button>
        </div>

        <div className="space-y-2">
          <Typography variant="body-md">Toast with Action</Typography>
          <Button
            variant="primary"
            onClick={() => {
              const toastId = success(
                "Item saved successfully!",
                "Save Complete"
              );
              // Simulate removing the toast after action
              setTimeout(() => removeToast(toastId), 3000);
            }}
          >
            Toast with Auto-Remove
          </Button>
        </div>

        {toasts.length > 0 && (
          <div className="p-3 bg-surface-secondary rounded-lg">
            <Typography variant="body-xs" color="muted">
              Toast IDs: {toasts.map((t) => t.id.slice(0, 8)).join(", ")}
            </Typography>
          </div>
        )}
      </div>
    </Card>
  );
};

export const Default: StoryObj = {
  render: () => <ToastDemo />,
};

export const ToastTypes: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="body-md">
        Different toast types demonstrate various use cases and visual styles.
      </Typography>
      <ToastDemo />
    </div>
  ),
};

export const CustomActions: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="body-md">
        Toasts can include custom actions that users can interact with.
      </Typography>
      <ToastDemo />
    </div>
  ),
};
