/**
 * IncompleteFormationsPanel
 *
 * Shows formations created via AddNewPlayModal with poor metadata quality.
 * Allows coaches to review and improve metadata for formations created during play building.
 *
 * Features:
 * - Lists formations with 'needs_work' or 'incomplete' quality
 * - Grouped by metadata quality level
 * - Quick edit capability to improve metadata
 * - Shows what's missing (personnel, category, tags, etc.)
 *
 * Part of Formation Direction Comprehensive Solution - Phase 2
 */

import React from "react";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { FormationBadge } from "../playbook/FormationBadge";
import { useIncompleteFormations } from "../../hooks/useFormations";
import type { Formation } from "../../types/formation";
import { AlertCircle, Edit3, CheckCircle, ArrowLeft } from "lucide-react";

// Identify what's missing from a formation
const getMissingFields = (formation: Formation): string[] => {
  const missing: string[] = [];

  if (
    !formation.personnel_name &&
    (!formation.personnel_packages || formation.personnel_packages.length === 0)
  ) {
    missing.push("Personnel");
  }
  if (!formation.category) {
    missing.push("Category");
  }
  if (!formation.formation_type) {
    missing.push("Formation Type");
  }
  if (!formation.tags || formation.tags.length === 0) {
    missing.push("Tags");
  }
  if (!formation.description) {
    missing.push("Description");
  }
  if (!formation.direction) {
    missing.push("Direction");
  }

  return missing;
};

interface FormationCardProps {
  formation: Formation;
  variant: "warning" | "error";
  onEdit?: (formation: Formation) => void;
}

const FormationCard: React.FC<FormationCardProps> = ({
  formation,
  variant,
  onEdit,
}) => {
  const missingFields = getMissingFields(formation);
  const borderColor =
    variant === "warning" ? "border-warning-200" : "border-error-200";
  const bgColor = variant === "warning" ? "bg-warning-50" : "bg-error-50";
  const textColor =
    variant === "warning" ? "text-warning-700" : "text-error-700";

  return (
    <div
      className={`bg-primary border ${borderColor} rounded-lg p-md hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-md">
        <div className="flex-1 space-y-sm">
          {/* Formation name and badge */}
          <div className="flex items-center gap-sm">
            <FormationBadge
              formationId={formation.id}
              direction={formation.direction}
            />
            <Typography variant="body-md" className="font-medium text-primary">
              {formation.name}
            </Typography>
          </div>

          {/* Missing fields */}
          {missingFields.length > 0 && (
            <div className="flex items-center gap-xs flex-wrap">
              <Typography variant="body-xs" className="text-muted">
                Missing:
              </Typography>
              {missingFields.map((field, idx) => (
                <span
                  key={idx}
                  className={`px-xs py-spacing-xxs ${bgColor} ${textColor} text-xs rounded`}
                >
                  {field}
                </span>
              ))}
            </div>
          )}

          {/* Current metadata */}
          <div className="flex items-center gap-md text-xs text-muted">
            {formation.personnel_name && (
              <span>👥 {formation.personnel_name}</span>
            )}
            {formation.category && <span>📁 {formation.category}</span>}
            {formation.usage_count > 0 && (
              <span>
                🎯 Used in {formation.usage_count}{" "}
                {formation.usage_count === 1 ? "play" : "plays"}
              </span>
            )}
          </div>
        </div>

        {/* Edit button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit?.(formation)}
        >
          <Edit3 className="w-4 h-4 mr-xs" />
          Edit
        </Button>
      </div>
    </div>
  );
};

interface IncompleteFormationsPanelProps {
  playbookId: string;
  onFormationEdit?: (formation: Formation) => void;
  onBack?: () => void;
}

export const IncompleteFormationsPanel: React.FC<
  IncompleteFormationsPanelProps
> = ({ playbookId, onFormationEdit, onBack }) => {
  // Use React Query hook for automatic caching and loading states
  const { data: formations = [], isLoading: loading } =
    useIncompleteFormations(playbookId);

  // Group formations by quality
  const needsWork = formations.filter(
    (f) => f.metadata_quality === "needs_work"
  );
  const incomplete = formations.filter(
    (f) => f.metadata_quality === "incomplete"
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-lg space-y-md">
        {onBack && (
          <div className="h-8 w-48 bg-subtle rounded animate-pulse"></div>
        )}
        <div className="h-24 bg-subtle rounded animate-pulse"></div>
        <div className="space-y-sm">
          <div className="h-8 bg-subtle rounded w-1/3 animate-pulse"></div>
          <div className="h-32 bg-subtle rounded animate-pulse"></div>
          <div className="h-32 bg-subtle rounded animate-pulse"></div>
        </div>
        <Typography variant="body-sm" className="text-muted text-center">
          Loading incomplete formations...
        </Typography>
      </div>
    );
  }

  // Empty state
  if (formations.length === 0) {
    return (
      <div className="p-lg">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-md">
            <ArrowLeft className="w-4 h-4 mr-xs" />
            Back to Formation Details
          </Button>
        )}

        <div className="flex flex-col items-center justify-center py-xl gap-md text-center">
          <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <div>
            <Typography variant="headline-sm" className="text-primary mb-xs">
              All formations are complete! 🎉
            </Typography>
            <Typography variant="body-sm" className="text-muted">
              No formations need metadata improvements.
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      {/* Back button */}
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-md">
          <ArrowLeft className="w-4 h-4 mr-xs" />
          Back to Formation Details
        </Button>
      )}

      {/* Header */}
      <div className="flex items-start gap-md">
        <div className="w-12 h-12 rounded-full bg-warning-50 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-warning-600" />
        </div>
        <div className="flex-1">
          <Typography variant="headline-sm" className="text-primary mb-xs">
            Incomplete Formations ({formations.length})
          </Typography>
          <Typography variant="body-sm" className="text-muted">
            These formations were created during play building and need better
            metadata. Add missing information to improve organization and
            searchability.
          </Typography>
        </div>
      </div>

      {/* Needs Work Section */}
      {needsWork.length > 0 && (
        <div className="space-y-md">
          <div className="flex items-center gap-sm">
            <div className="w-2 h-2 rounded-full bg-warning-500"></div>
            <Typography variant="label-md" className="text-secondary">
              Needs Work ({needsWork.length})
            </Typography>
          </div>

          <div className="space-y-sm">
            {needsWork.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                variant="warning"
                onEdit={onFormationEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Incomplete Section */}
      {incomplete.length > 0 && (
        <div className="space-y-md">
          <div className="flex items-center gap-sm">
            <div className="w-2 h-2 rounded-full bg-error-500"></div>
            <Typography variant="label-md" className="text-secondary">
              Incomplete ({incomplete.length})
            </Typography>
          </div>

          <div className="space-y-sm">
            {incomplete.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                variant="error"
                onEdit={onFormationEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="bg-subtle border border-muted rounded-md p-md">
        <Typography variant="body-sm" className="text-muted">
          💡 <strong>Tip:</strong> Click "Edit" to add missing information.
          Complete metadata helps with searching, filtering, and playbook
          organization.
        </Typography>
      </div>
    </div>
  );
};
