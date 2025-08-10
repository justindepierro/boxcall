import { Typography } from "../design-system";
/**
 * Toast Demo Component
 * Quick demo to show the new toast system working
 */
import React from "react";
import { useToast } from "../../hooks/useToast";
import { Card, Button } from "../ui";

export const ToastDemo: React.FC = () => {
  const toast = useToast();

  const showToasts = () => {
    toast.success("Role switched successfully!", "Changed to Head Coach mode");

    setTimeout(() => {
      toast.info(
        "Database connection tested",
        "Connection established to Supabase"
      );
    }, 500);

    setTimeout(() => {
      toast.warning("Demo data loading...", "This may take a few seconds");
    }, 1000);
  };

  return (
    <Card className="p-6 m-4">
      <Typography variant="headline-md" className="mb-4">
        🎉 Toast System Demo
      </Typography>
      <Typography variant="body-md" className="mb-4">
        The new professional toast system is ready! This provides much better
        feedback than the old stale DevPanel.
      </Typography>
      <Button
        onClick={showToasts}
        variant="primary"
        size="sm"
        className="px-4 py-2"
      >
        Test Toast Notifications
      </Button>
      <div className="mt-4 text-sm text-text-secondary">
        <p>✅ Toast system fully implemented</p>
        <p>✅ Database loading issue fixed</p>
        <p>🔧 DevPanel improvements ready (pending DevTools syntax fix)</p>
      </div>
    </Card>
  );
};
