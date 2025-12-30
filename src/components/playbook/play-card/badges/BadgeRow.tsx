/**
 * BadgeRow Component
 *
 * Unified badge display component that handles both collapsed and expanded states.
 * Eliminates the duplicate CollapsedBadges/ExpandedBadges pattern.
 */

import React, { useEffect, useState } from "react";
import type { Play as PlayType } from "../../../../types/play";
import type { PersonnelConfiguration } from "../../../../types/personnel";
import { isPresetBadgeCustomization } from "../../../../types/personnel";
import type { SituationDefinitions } from "../../../../types/situationDefinitions";
import { TeamSituationDefinitionsService } from "../../../../services/teamSituationDefinitionsService";
import { useActiveTeamStore } from "../../../../stores/activeTeamStore";
import {
  getCustomSituationColorByLabel,
  getDistanceColorByLabel,
  getFieldZoneColorByLabel,
} from "../../../../utils/situationBucketing";
import { Badge, EditableSchemeBadge } from "../../../ui/Badge";
import { PersonnelBadge } from "../../PersonnelBadge";
import { WristbandBadge } from "../../WristbandBadge";
import Icon from "../../../ui/Icon/Icon";
import { useBadgeSchemes, type BadgeSchemes } from "./useBadgeSchemes";

// ============================================================================
// Types
// ============================================================================

interface BadgeRowProps {
  /** The play data to display badges for */
  play: PlayType;
  /** Original play for fallback values (optional) */
  originalPlay?: PlayType;
  /** Whether to show expanded (detailed) badges */
  isExpanded?: boolean;
  /** Personnel configurations for custom badge styling */
  personnelConfigurations?: PersonnelConfiguration[];
  /** Phase label to display (expanded only) */
  phaseLabel?: string | null;
  /** Confidence color resolver (expanded only) */
  getConfidenceColor?: (confidence: number) => string;
}

// ============================================================================
// Hooks
// ============================================================================

function useTeamSituationDefinitions(): Partial<SituationDefinitions> | null {
  const activeTeamId = useActiveTeamStore((s) => s.activeTeamId);
  const [defs, setDefs] = useState<SituationDefinitions | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!activeTeamId) {
      setDefs(null);
      return () => {
        isMounted = false;
      };
    }

    const load = async () => {
      try {
        const loaded = await TeamSituationDefinitionsService.get(activeTeamId);
        if (isMounted) setDefs(loaded);
      } catch {
        if (isMounted) setDefs(null);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [activeTeamId]);

  return defs;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getSuccessRateBadgeColor(rate: number): string {
  if (rate >= 0.7) {
    return "bg-success-50 text-success-700 border border-success-200";
  }
  if (rate >= 0.5) {
    return "bg-warning-50 text-warning-700 border border-warning-200";
  }
  return "bg-error-50 text-error-700 border border-error-200";
}

// ============================================================================
// Sub-Components (reduce complexity)
// ============================================================================

/** Core badges shown in both collapsed and expanded states */
const CoreBadges: React.FC<{
  play: PlayType;
  schemes: BadgeSchemes;
  personnelConfig?: PersonnelConfiguration;
}> = ({ play, schemes, personnelConfig }) => (
  <>
    {play.personnel &&
      (isPresetBadgeCustomization(personnelConfig?.badgeCustomization) ? (
        <PersonnelBadge
          personnel={play.personnel}
          size="sm"
          badgeCustomization={personnelConfig.badgeCustomization}
        />
      ) : (
        <EditableSchemeBadge
          label={play.personnel}
          scheme={schemes.personnel.scheme}
          onChangeScheme={schemes.personnel.onChange}
          size="sm"
          ariaLabel={`Change ${play.personnel} badge color`}
        />
      ))}

    {play.p_type && (
      <EditableSchemeBadge
        label={play.p_type}
        scheme={schemes.playType.scheme}
        onChangeScheme={schemes.playType.onChange}
        size="sm"
        ariaLabel={`Change ${play.p_type} badge color`}
      />
    )}

    {play.wristband_number && (
      <WristbandBadge wristbandNumber={play.wristband_number} size="sm" />
    )}

    {play.formation && (
      <EditableSchemeBadge
        label={play.formation}
        scheme={schemes.formation.scheme}
        onChangeScheme={schemes.formation.onChange}
        size="sm"
        ariaLabel={`Change ${play.formation} badge color`}
      />
    )}

    {play.protection && (
      <EditableSchemeBadge
        label={play.protection}
        scheme={schemes.protection.scheme}
        onChangeScheme={schemes.protection.onChange}
        size="sm"
        ariaLabel={`Change ${play.protection} badge color`}
      />
    )}

    {play.motion && (
      <EditableSchemeBadge
        label={`↗️ ${play.motion}`}
        scheme={schemes.motion.scheme}
        onChangeScheme={schemes.motion.onChange}
        size="sm"
        ariaLabel={`Change ${play.motion} badge color`}
      />
    )}
  </>
);

/** Badges only shown in collapsed state */
const CollapsedOnlyBadges: React.FC<{ play: PlayType }> = ({ play }) => (
  <>
    {play.pref_hash && (
      <span className="px-2 py-1 bg-surface-muted text-secondary border border-divider rounded-lg text-xs font-medium">
        {play.pref_hash}
      </span>
    )}
    {play.pref_down && (
      <span className="px-2 py-1 bg-warning-lightest text-warning-dark border border-warning-light rounded-lg text-xs font-semibold">
        {play.pref_down}
      </span>
    )}
  </>
);

/** Badges only shown in expanded state */
const ExpandedOnlyBadges: React.FC<{
  play: PlayType;
  phaseLabel?: string | null;
  getConfidenceColor?: (confidence: number) => string;
}> = ({ play, phaseLabel, getConfidenceColor }) => (
  <>
    {phaseLabel && (
      <span className="px-2 py-0.5 bg-warning-500 text-primary rounded-full text-2xs font-semibold tracking-wide uppercase border border-warning-600">
        {phaseLabel}
      </span>
    )}

    {getConfidenceColor && (
      <span
        className={`text-xs font-medium ${getConfidenceColor(
          typeof play.confidence_base === "number" ? play.confidence_base : 70
        )}`}
      >
        {typeof play.confidence_base === "number" ? play.confidence_base : 70}%
      </span>
    )}

    {play.times_called && play.times_called > 0 && (
      <>
        <span className="px-2 py-0.5 bg-info-50 text-info-700 border border-info-200 rounded-full text-xs font-medium flex items-center gap-1">
          <Icon name="trending-up" size={12} />
          {play.times_called}x called
        </span>
        {play.times_successful !== undefined && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSuccessRateBadgeColor(
              play.times_successful / play.times_called
            )}`}
          >
            {Math.round((play.times_successful / play.times_called) * 100)}%
            success
          </span>
        )}
      </>
    )}
  </>
);

/** Situation badges (always shown) */
const SituationBadges: React.FC<{
  play: PlayType;
  teamDefs: Partial<SituationDefinitions> | null;
}> = ({ play, teamDefs }) => (
  <>
    {play.pref_dis && (
      <Badge
        variant="neutral"
        scheme={getDistanceColorByLabel(teamDefs, play.pref_dis)}
        size="sm"
      >
        {play.pref_dis}
      </Badge>
    )}
    {play.pref_field_pos && (
      <Badge
        variant="neutral"
        scheme={getFieldZoneColorByLabel(teamDefs, play.pref_field_pos)}
        size="sm"
      >
        {play.pref_field_pos}
      </Badge>
    )}
    {play.pref_situation && (
      <Badge
        variant="neutral"
        scheme={getCustomSituationColorByLabel(teamDefs, play.pref_situation)}
        size="sm"
      >
        {play.pref_situation}
      </Badge>
    )}
  </>
);

// ============================================================================
// Main Component
// ============================================================================

export const BadgeRow: React.FC<BadgeRowProps> = ({
  play,
  originalPlay,
  isExpanded = false,
  personnelConfigurations = [],
  phaseLabel,
  getConfidenceColor,
}) => {
  const teamDefs = useTeamSituationDefinitions();
  const schemes = useBadgeSchemes({ play, originalPlay });

  const personnelConfig = personnelConfigurations.find(
    (config) => config.name === play.personnel
  );

  return (
    <>
      <CoreBadges
        play={play}
        schemes={schemes}
        personnelConfig={personnelConfig}
      />
      {!isExpanded && <CollapsedOnlyBadges play={play} />}
      {isExpanded && (
        <ExpandedOnlyBadges
          play={play}
          phaseLabel={phaseLabel}
          getConfidenceColor={getConfidenceColor}
        />
      )}
      <SituationBadges play={play} teamDefs={teamDefs} />
    </>
  );
};

export default BadgeRow;
