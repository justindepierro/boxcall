import React, { useEffect, useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import type { Formation } from "../../types/formation";
import { FormationService } from "../../services/formationService";
import { logError } from "../../utils/logger";

interface FormationBadgeProps {
  formationId?: string | null;
  formationName?: string; // Fallback if formationId is null
  direction?: "base" | "left" | "right" | null;
  showPersonnel?: boolean;
  showUsageCount?: boolean;
  showDirection?: boolean;
  size?: "sm" | "md";
  className?: string;
}

function getTextSizeClass(size: "sm" | "md"): string {
  return size === "sm" ? "text-xs" : "text-sm";
}

function DirectionIndicator({
  direction,
}: {
  direction: "base" | "left" | "right" | null | undefined;
}) {
  if (!direction || direction === "base") return null;

  if (direction === "left") {
    return (
      <span className="inline-flex items-center">
        <Icon name="arrow-left" className="w-3 h-3" />
      </span>
    );
  }

  if (direction === "right") {
    return (
      <span className="inline-flex items-center">
        <Icon name="arrow-right" className="w-3 h-3" />
      </span>
    );
  }

  return null;
}

function LoadingBadge({
  size,
  className,
}: {
  size: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-secondary border border-border rounded-full ${getTextSizeClass(
        size
      )} font-medium ${className || ""}`}
    >
      <Icon name="refresh-cw" className="w-3 h-3 animate-spin" />
      <span>Loading...</span>
    </span>
  );
}

function PersonnelBadge({
  showPersonnel,
  personnel,
  textSizeClass,
}: {
  showPersonnel: boolean;
  personnel: string | null | undefined;
  textSizeClass: string;
}) {
  if (!showPersonnel || !personnel) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-jade-100 text-jade-700 border border-jade-300 rounded-full ${textSizeClass} font-medium`}
    >
      <Icon name="users" className="w-3 h-3" />
      {personnel}
    </span>
  );
}

function UsageCountBadge({
  showUsageCount,
  usageCount,
  textSizeClass,
}: {
  showUsageCount: boolean;
  usageCount: number | undefined;
  textSizeClass: string;
}) {
  if (!showUsageCount) return null;
  if (usageCount === undefined || usageCount <= 0) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-info-50 text-info-700 border border-info-200 rounded-full ${textSizeClass} font-medium`}
    >
      <Icon name="trending-up" className="w-3 h-3" />
      {usageCount}x
    </span>
  );
}

function useFormationDetails(formationId?: string | null) {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formationId) {
      setFormation(null);
      return;
    }

    let mounted = true;

    const loadFormation = async () => {
      setLoading(true);
      try {
        const data = await FormationService.getFormationById(formationId);
        if (mounted && data) {
          setFormation(data);
        }
      } catch (error) {
        logError("Failed to load formation:", error);
        if (mounted) {
          setFormation(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFormation();

    return () => {
      mounted = false;
    };
  }, [formationId]);

  return { formation, loading };
}

/**
 * FormationBadge Component
 *
 * Displays formation information with optional direction arrow, personnel, and usage count.
 *
 * Features:
 * - Loads formation details from database if formationId provided
 * - Falls back to formationName text if no ID
 * - Shows direction indicator (Base/←Left/→Right)
 * - Shows linked personnel (e.g., "11 Personnel")
 * - Shows usage count (e.g., "5x")
 * - Handles loading and error states gracefully
 *
 * @example
 * // With database relationship
 * <FormationBadge formationId="uuid-123" showPersonnel showUsageCount />
 *
 * // Backwards compatible with text only
 * <FormationBadge formationName="Shotgun" />
 */
export const FormationBadge: React.FC<FormationBadgeProps> = ({
  formationId,
  formationName,
  direction,
  showPersonnel = true,
  showUsageCount = false,
  showDirection = true,
  size = "sm",
  className = "",
}) => {
  const { formation, loading } = useFormationDetails(formationId);
  const textSizeClass = getTextSizeClass(size);

  // Determine what to display
  const displayName = formation?.name || formationName;
  const displayDirection = direction || formation?.direction;
  const displayPersonnel = formation?.personnel_name;
  const displayUsageCount = formation?.usage_count;

  // Don't render if no formation info
  if (!displayName && !loading) {
    return null;
  }

  // Loading state
  if (loading) {
    return <LoadingBadge size={size} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Main formation badge */}
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-300 rounded-full ${textSizeClass} font-medium`}
      >
        {displayName}

        {/* Direction indicator */}
        {showDirection && <DirectionIndicator direction={displayDirection} />}
      </span>

      <PersonnelBadge
        showPersonnel={showPersonnel}
        personnel={displayPersonnel}
        textSizeClass={textSizeClass}
      />

      <UsageCountBadge
        showUsageCount={showUsageCount}
        usageCount={displayUsageCount}
        textSizeClass={textSizeClass}
      />
    </div>
  );
};
