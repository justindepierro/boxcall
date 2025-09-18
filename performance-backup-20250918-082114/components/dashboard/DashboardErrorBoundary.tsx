import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Dashboard Error Boundary
 *
 * Catches errors in dashboard components and provides a user-friendly fallback
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="compact-card h-full flex items-center justify-center">
          <div className="text-center max-w-sm">
            <Icon
              name="warning"
              size="lg"
              className="text-orange-500 mx-auto mb-3"
            />
            <Typography
              variant="headline-sm"
              className="text-text-primary mb-2"
            >
              Something went wrong
            </Typography>
            <Typography variant="body-sm" className="text-text-muted mb-4">
              This component encountered an error. Try refreshing the page.
            </Typography>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Refresh Page
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
