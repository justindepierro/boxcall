/**
 * Contextual Actions Panel
 * Phase 2A Sprint 2: Smart context-aware quick actions
 */

import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import Card from "../ui/Card/Card";
import { useAdaptiveDashboard } from "../../hooks/useAdaptiveDashboard";

interface ContextualActionsPanelProps {
  className?: string;
  maxActions?: number;
}

export function ContextualActionsPanel({
  className = "",
  maxActions = 3,
}: ContextualActionsPanelProps) {
  const { contextualActions, isAdaptiveMode } = useAdaptiveDashboard();

  if (!isAdaptiveMode || contextualActions.length === 0) {
    return null;
  }

  const visibleActions = contextualActions.slice(0, maxActions);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <Typography variant="headline-sm" className="flex items-center gap-2">
          <Icon name="sparkles" size={16} className="text-blue-500" />
          Smart Actions
        </Typography>

        <div className="space-y-2">
          {visibleActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 p-3 h-auto"
              onClick={action.action}
            >
              {/* @ts-expect-error - Dynamic icon names */}
              <Icon name={action.icon} size={16} className="text-blue-600" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-text-muted">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default ContextualActionsPanel;
