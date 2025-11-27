/**
 * FormationQualityBadge
 *
 * Visual indicator of formation metadata quality and completeness.
 * Shows color-coded badge with completeness percentage and quality level.
 *
 * Quality Levels:
 * - Complete (100%): All metadata fields filled
 * - Good (75-99%): Most metadata complete
 * - Needs Work (50-74%): Some metadata missing
 * - Incomplete (<50%): Many fields missing
 */

import React from "react";
import { Typography } from "../design-system/Typography";
import type {
  FormationMetadataQuality,
  Formation,
} from "../../types/formation";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { formatFieldName } from "../../utils/formationQuality";

interface FormationQualityBadgeProps {
  formation: Formation;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

interface QualityConfig {
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const QUALITY_CONFIG: Record<FormationMetadataQuality, QualityConfig> = {
  complete: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Complete",
    bgColor: "bg-success-50",
    textColor: "text-success-700",
    borderColor: "border-success-200",
  },
  good: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Good",
    bgColor: "bg-info-50",
    textColor: "text-info-700",
    borderColor: "border-info-200",
  },
  needs_work: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Needs Work",
    bgColor: "bg-warning-50",
    textColor: "text-warning-700",
    borderColor: "border-warning-200",
  },
  incomplete: {
    icon: <XCircle className="w-4 h-4" />,
    label: "Incomplete",
    bgColor: "bg-error-50",
    textColor: "text-error-700",
    borderColor: "border-error-200",
  },
};

export const FormationQualityBadge: React.FC<FormationQualityBadgeProps> = ({
  formation,
  showDetails = false,
  size = "md",
}) => {
  const quality: FormationMetadataQuality =
    formation.metadata_quality || "incomplete";
  const completeness = formation.metadata_completeness || 0;
  const config = QUALITY_CONFIG[quality];

  // Determine missing fields from creation context
  const missingFields: string[] =
    (formation.creation_context?.incomplete_fields as string[]) || [];

  // Size classes
  const sizeClasses = {
    sm: "px-spacing-xs py-spacing-xxs text-xs",
    md: "px-spacing-sm py-spacing-xs text-sm",
    lg: "px-spacing-md py-spacing-sm text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="inline-flex flex-col gap-spacing-xs">
      {/* Main Badge */}
      <div
        className={`
          inline-flex items-center gap-spacing-xs
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          border rounded-md ${sizeClasses[size]}
          font-medium
        `}
      >
        <span className={iconSizes[size]}>{config.icon}</span>
        <span>{config.label}</span>
        <span className="font-bold">{Math.round(completeness)}%</span>
      </div>

      {/* Details (optional) */}
      {showDetails && missingFields.length > 0 && (
        <div
          className={`
          p-spacing-sm ${config.bgColor} ${config.borderColor}
          border rounded-md
        `}
        >
          <div className="flex items-start gap-spacing-xs mb-spacing-xs">
            <AlertCircle className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
            <Typography
              variant="caption"
              className="text-secondary font-medium"
            >
              Missing Fields:
            </Typography>
          </div>
          <ul className="list-disc list-inside space-y-spacing-xxs ml-spacing-sm">
            {missingFields.map((field) => (
              <li key={field}>
                <Typography variant="caption" className="text-muted">
                  {formatFieldName(field)}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
