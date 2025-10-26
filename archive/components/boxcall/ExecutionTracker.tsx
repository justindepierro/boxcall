import React, { useState, useCallback } from "react";
import { Card } from "../ui";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import type { UnifiedDiagramData } from "../playbook/diagram-editor/types/UnifiedDiagramTypes";

export type RouteExecutionResult =
  | "success"
  | "failure"
  | "neutral"
  | "not-executed";

export interface RouteExecution {
  routeId: string;
  result: RouteExecutionResult;
  notes?: string;
  timestamp: Date;
}

interface ExecutionTrackerProps {
  /** The diagram data for the current play */
  diagramData: UnifiedDiagramData;
  /** Current route executions */
  executions?: RouteExecution[];
  /** Callback when route execution is logged */
  onRouteExecution?: (
    routeId: string,
    result: RouteExecutionResult,
    notes?: string
  ) => void;
  /** Whether tracking is enabled */
  enabled?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ExecutionTracker - Route-by-route performance logging
 *
 * Allows coaches to track individual route performance during live sessions,
 * providing detailed analytics beyond play-level success/failure.
 */
export const ExecutionTracker: React.FC<ExecutionTrackerProps> = ({
  diagramData,
  executions = [],
  onRouteExecution,
  enabled = true,
  className = "",
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [executionNotes, setExecutionNotes] = useState("");

  // Get routes from diagram data
  const routes = diagramData.pixiData.routes || [];

  // Get execution result for a route
  const getRouteExecution = useCallback(
    (routeId: string): RouteExecution | undefined => {
      return executions.find((exec) => exec.routeId === routeId);
    },
    [executions]
  );

  // Handle route execution logging
  const handleRouteExecution = useCallback(
    (routeId: string, result: RouteExecutionResult) => {
      if (!enabled || !onRouteExecution) return;

      const notes = selectedRouteId === routeId ? executionNotes : undefined;
      onRouteExecution(routeId, result, notes);

      // Clear selection and notes
      setSelectedRouteId(null);
      setExecutionNotes("");
    },
    [enabled, onRouteExecution, selectedRouteId, executionNotes]
  );

  // Handle route selection for notes
  const handleRouteSelect = useCallback(
    (routeId: string) => {
      if (!enabled) return;

      if (selectedRouteId === routeId) {
        setSelectedRouteId(null);
        setExecutionNotes("");
      } else {
        setSelectedRouteId(routeId);
        setExecutionNotes("");
      }
    },
    [enabled, selectedRouteId]
  );

  if (!enabled || routes.length === 0) {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon name="target" size="sm" className="text-primary" />
        <Typography variant="headline-sm" className="font-semibold">
          Route Execution
        </Typography>
      </div>

      <Typography variant="body-sm" color="muted" className="mb-4">
        Track individual route performance for detailed analytics
      </Typography>

      <div className="space-y-3">
        {routes.map((route) => {
          const execution = getRouteExecution(route.id);
          const isSelected = selectedRouteId === route.id;

          return (
            <div
              key={route.id}
              className={`border rounded-lg p-3 transition-colors ${
                isSelected ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Typography variant="body-sm" className="font-medium">
                    Route {route.id}
                  </Typography>
                  {execution && (
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        execution.result === "success"
                          ? "bg-success/10 text-success"
                          : execution.result === "failure"
                            ? "bg-error/10 text-error"
                            : execution.result === "neutral"
                              ? "bg-warning/10 text-warning"
                              : "bg-muted/10 text-muted"
                      }`}
                    >
                      {execution.result === "not-executed"
                        ? "Not Executed"
                        : execution.result}
                    </div>
                  )}
                </div>

                {!execution && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRouteSelect(route.id)}
                    className="text-xs"
                  >
                    {isSelected ? "Cancel" : "Add Notes"}
                  </Button>
                )}
              </div>

              {isSelected && (
                <div className="mb-3">
                  <textarea
                    value={executionNotes}
                    onChange={(e) => setExecutionNotes(e.target.value)}
                    placeholder="Execution notes (optional)..."
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                  />
                </div>
              )}

              {!execution && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRouteExecution(route.id, "success")}
                    className="flex-1 text-xs"
                  >
                    <Icon name="check" size="sm" className="mr-1" />
                    Success
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRouteExecution(route.id, "failure")}
                    className="flex-1 text-xs"
                  >
                    <Icon name="close" size="sm" className="mr-1" />
                    Failure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRouteExecution(route.id, "neutral")}
                    className="flex-1 text-xs"
                  >
                    <Icon name="minus" size="sm" className="mr-1" />
                    Neutral
                  </Button>
                </div>
              )}

              {execution?.notes && (
                <Typography
                  variant="body-xs"
                  color="muted"
                  className="mt-2 italic"
                >
                  "{execution.notes}"
                </Typography>
              )}
            </div>
          );
        })}
      </div>

      {executions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <Typography variant="body-sm" color="muted">
              Routes Tracked: {executions.length}/{routes.length}
            </Typography>
            <Typography variant="body-sm" className="font-medium">
              {Math.round(
                (executions.filter((e) => e.result === "success").length /
                  executions.length) *
                  100
              )}
              % Success Rate
            </Typography>
          </div>
        </div>
      )}
    </Card>
  );
};
