/**
 * Version History Panel Component
 *
 * Displays version history for diagram editing with rollback capabilities.
 * Shows timeline of changes with user attribution and descriptions.
 */

import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Badge } from "@components/ui/Badge";
import {
  useVersionHistory,
  useVersionControl,
} from "../hooks/useVersionControl";
import { formatDistanceToNow } from "date-fns";
import { History, RotateCcw, Save, X, Clock, User } from "lucide-react";
import { cn } from "@lib/utils/cn";

interface VersionHistoryPanelProps {
  playId: string;
  onClose?: () => void;
  className?: string;
}

export function VersionHistoryPanel({
  playId,
  onClose,
  className,
}: VersionHistoryPanelProps) {
  const { versions, selectedVersionId, isLoading, error, selectVersion } =
    useVersionHistory();

  const { rollbackToVersion, saveVersion } = useVersionControl({ playId });

  const handleRollback = async (versionNumber: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to rollback to version ${versionNumber}? This will overwrite the current diagram.`
    );

    if (confirmed) {
      await rollbackToVersion(versionNumber);
    }
  };

  const handleSaveVersion = async () => {
    const description = prompt("Enter a description for this version:");
    if (description?.trim()) {
      await saveVersion(description.trim());
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-80 h-96", className)}>
        <div className="p-4 border-b border-border">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <History className="w-4 h-4" />
            Version History
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jade-600"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-80 h-96", className)}>
        <div className="p-4 border-b border-border">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <History className="w-4 h-4" />
            Version History
          </h3>
        </div>
        <div className="p-4">
          <div className="text-center text-text-error text-sm p-4">{error}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("w-80 h-96 flex flex-col", className)}>
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <History className="w-4 h-4" />
            Version History
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveVersion}
              className="h-6 w-6 p-0"
              title="Save current version"
            >
              <Save className="w-3 h-3" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
                title="Close panel"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {versions.length === 0 ? (
          <div className="text-center text-text-secondary text-sm py-8">
            No versions found
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedVersionId === version.id
                    ? "border-jade-300 bg-jade-50"
                    : "border-border hover:border-jade-200 hover:bg-jade-25"
                )}
                onClick={() => selectVersion(version.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="text-xs">
                      v{version.versionNumber}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="success" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRollback(version.versionNumber);
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Rollback to version ${version.versionNumber}`}
                    disabled={index === 0} // Can't rollback to current version
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>

                {version.changeDescription && (
                  <div className="text-sm text-text-primary mb-2 line-clamp-2">
                    {version.changeDescription}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(version.createdAt, {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span
                      className="truncate max-w-20"
                      title={version.createdBy}
                    >
                      {version.createdBy.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
