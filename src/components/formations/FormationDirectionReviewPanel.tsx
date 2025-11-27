/**
 * FormationDirectionReviewPanel
 *
 * Shows formations needing direction attention with quick-fix actions.
 * Part of Formation Direction Comprehensive Solution - Phase 1.
 *
 * Features:
 * - Priority-based grouping (High/Med/Low based on usage)
 * - "Create Opposite" action (opens CreateOppositeFormationModal)
 * - "Mark as Standalone" action (for formations that don't need opposites)
 * - Success state when all formations are configured
 * - Real-time updates after actions
 * - Back button to return to previous tab
 */

import React, { useState, useContext } from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { AlertCircle, Check, ArrowLeftRight, ArrowLeft } from "lucide-react";
import {
  auditFormationDirections,
  type FormationAuditResult,
} from "../../utils/formationAudit";
import { FormationService } from "../../services/formationService";
import { CreateOppositeFormationModal } from "./CreateOppositeFormationModal";
import { error as logError, debug } from "../../utils/logger";
import { ToastContext } from "../../contexts/ToastContext";
import type { Formation } from "../../types/formation";

interface FormationDirectionReviewPanelProps {
  playbookId: string;
  onFixComplete?: () => void;
  onBack?: () => void; // NEW: Callback to navigate back to previous tab
}

export const FormationDirectionReviewPanel: React.FC<
  FormationDirectionReviewPanelProps
> = ({ playbookId, onFixComplete, onBack }) => {
  const toast = useContext(ToastContext);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<FormationAuditResult[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [showOppositeModal, setShowOppositeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadIssues = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await auditFormationDirections(playbookId);
      setIssues(result);
    } catch (error: unknown) {
      logError(
        "[FormationDirectionReviewPanel] Error loading formation issues:",
        error
      );
      toast?.error(
        "Error loading formation review. Please try again.",
        "Load Error"
      );
    } finally {
      setLoading(false);
    }
  }, [playbookId, toast]);

  React.useEffect(() => {
    if (playbookId) {
      loadIssues();
    }
  }, [playbookId, loadIssues]);

  const handleCreateOpposite = async (issue: FormationAuditResult) => {
    try {
      const formation = await FormationService.getFormationById(issue.id);
      if (formation) {
        setSelectedFormation(formation);
        setShowOppositeModal(true);
      }
    } catch (error) {
      logError(
        "[FormationDirectionReviewPanel] Error loading formation:",
        error
      );
      toast?.error("Failed to load formation details.", "Load Error");
    }
  };

  const handleMarkAsStandalone = async (
    formationId: string,
    formationName: string
  ) => {
    setActionLoading(formationId);
    try {
      debug(
        "[FormationDirectionReviewPanel] Marking as standalone:",
        formationId
      );
      await FormationService.markAsStandalone(formationId);

      toast?.success(
        `"${formationName}" marked as standalone formation.`,
        "Marked as Standalone"
      );

      // Reload issues
      await loadIssues();
      onFixComplete?.();
    } catch (error) {
      logError(
        "[FormationDirectionReviewPanel] Failed to mark as standalone:",
        error
      );
      toast?.error(
        "Failed to mark as standalone. Please try again.",
        "Update Failed"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleOppositeCreated = async () => {
    toast?.success(
      "Opposite formation created and linked!",
      "Formation Created"
    );

    // Close modal and reload
    setShowOppositeModal(false);
    setSelectedFormation(null);
    await loadIssues();
    onFixComplete?.();
  };

  const handleMarkedAsStandalone = async () => {
    toast?.success("Formation marked as standalone.", "Marked as Standalone");

    // Close modal and reload
    setShowOppositeModal(false);
    setSelectedFormation(null);
    await loadIssues();
    onFixComplete?.();
  };

  if (loading) {
    return (
      <div className="p-lg space-y-md">
        {/* Skeleton for back button */}
        {onBack && (
          <div className="h-8 w-48 bg-subtle rounded animate-pulse"></div>
        )}

        {/* Skeleton for summary */}
        <div className="h-24 bg-subtle rounded animate-pulse"></div>

        {/* Skeleton for formation list */}
        <div className="space-y-sm">
          <div className="h-8 bg-subtle rounded w-1/3 animate-pulse"></div>
          <div className="h-32 bg-subtle rounded animate-pulse"></div>
          <div className="h-32 bg-subtle rounded animate-pulse"></div>
        </div>

        <Typography variant="body-sm" className="text-muted text-center">
          Scanning formations for direction issues...
        </Typography>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="p-lg bg-success-50 rounded-lg border border-success-200">
        <div className="flex items-center gap-md">
          <Check className="w-6 h-6 text-success-600 flex-shrink-0" />
          <div>
            <Typography variant="headline-md" className="text-success-800">
              All formations are properly configured! 🎉
            </Typography>
            <Typography
              variant="body-sm"
              className="text-success-700 mt-xs"
            >
              Every formation has proper direction setup.
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  // Group by severity
  const highPriority = issues.filter((i) => i.severity === "high");
  const mediumPriority = issues.filter((i) => i.severity === "medium");
  const lowPriority = issues.filter((i) => i.severity === "low");

  return (
    <div className="space-y-lg">
      {/* Back Button */}
      {onBack && (
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Formation Details
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="p-md bg-warning-50 border border-warning-200 rounded-lg">
        <div className="flex items-start gap-md">
          <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0" />
          <div className="flex-1">
            <Typography variant="headline-md" className="text-warning-800">
              {issues.length} formation{issues.length === 1 ? "" : "s"} need
              attention
            </Typography>
            <Typography
              variant="body-sm"
              className="text-warning-700 mt-xs"
            >
              These formations should have opposite-side versions for a complete
              playbook.
            </Typography>
          </div>
        </div>
      </div>

      {/* High Priority */}
      {highPriority.length > 0 && (
        <FormationIssueSection
          title="🔴 High Priority (Used 10+ times)"
          issues={highPriority}
          onCreateOpposite={handleCreateOpposite}
          onMarkAsStandalone={handleMarkAsStandalone}
          actionLoading={actionLoading}
        />
      )}

      {/* Medium Priority */}
      {mediumPriority.length > 0 && (
        <FormationIssueSection
          title="🟡 Medium Priority (Used 3-9 times)"
          issues={mediumPriority}
          onCreateOpposite={handleCreateOpposite}
          onMarkAsStandalone={handleMarkAsStandalone}
          actionLoading={actionLoading}
        />
      )}

      {/* Low Priority */}
      {lowPriority.length > 0 && (
        <FormationIssueSection
          title="⚪ Low Priority (Used 0-2 times)"
          issues={lowPriority}
          onCreateOpposite={handleCreateOpposite}
          onMarkAsStandalone={handleMarkAsStandalone}
          actionLoading={actionLoading}
        />
      )}

      {/* CreateOppositeFormationModal */}
      {selectedFormation && (
        <CreateOppositeFormationModal
          isOpen={showOppositeModal}
          onClose={() => {
            setShowOppositeModal(false);
            setSelectedFormation(null);
          }}
          originalFormation={selectedFormation}
          onOppositeCreated={handleOppositeCreated}
          onMarkedAsStandalone={handleMarkedAsStandalone}
        />
      )}
    </div>
  );
};

/**
 * Sub-component for displaying a group of formation issues
 */
interface FormationIssueSectionProps {
  title: string;
  issues: FormationAuditResult[];
  onCreateOpposite: (issue: FormationAuditResult) => void;
  onMarkAsStandalone: (id: string, name: string) => void;
  actionLoading: string | null;
}

const FormationIssueSection: React.FC<FormationIssueSectionProps> = ({
  title,
  issues,
  onCreateOpposite,
  onMarkAsStandalone,
  actionLoading,
}) => {
  return (
    <div>
      <Typography
        variant="headline-sm"
        className="text-primary mb-md"
      >
        {title}
      </Typography>
      <div className="space-y-sm">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="p-md bg-secondary rounded-lg border border-primary hover:border-emphasis transition-colors"
          >
            <div className="flex items-center justify-between gap-md">
              <div className="flex-1">
                <div className="flex items-center gap-sm">
                  <Typography variant="label-md" className="text-primary">
                    {issue.name}
                  </Typography>
                  {issue.direction && (
                    <span className="px-xs py-0.5 bg-muted text-muted text-xs rounded">
                      {issue.direction}
                    </span>
                  )}
                </div>
                <Typography
                  variant="body-xs"
                  className="text-muted mt-xs"
                >
                  Used in {issue.usage_count} play
                  {issue.usage_count === 1 ? "" : "s"}
                  {issue.issue === "missing_opposite" &&
                    " • Missing opposite formation"}
                  {issue.issue === "missing_direction" &&
                    " • Direction not set"}
                  {issue.issue === "both" && " • No direction or opposite"}
                </Typography>
              </div>
              <div className="flex gap-sm flex-shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onCreateOpposite(issue)}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === issue.id ? (
                    "Loading..."
                  ) : (
                    <>
                      <ArrowLeftRight className="w-4 h-4 mr-xs" />
                      Create Opposite
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsStandalone(issue.id, issue.name)}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === issue.id ? "Marking..." : "Standalone"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
