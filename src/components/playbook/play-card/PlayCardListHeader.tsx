import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { PersonnelBadge } from "../PersonnelBadge";
import { WristbandBadge } from "../WristbandBadge";
import { SelectionCheckbox } from "../../ui/SelectionCheckbox";
import type { Play as PlayType } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";
import { debug } from "../../../utils/logger";
import type { SituationDefinitions } from "../../../types/situationDefinitions";
import { TeamSituationDefinitionsService } from "../../../services/teamSituationDefinitionsService";
import { useActiveTeamStore } from "../../../stores/activeTeamStore";
import {
  getCustomSituationColorByLabel,
  getDistanceColorByLabel,
  getFieldZoneColorByLabel,
} from "../../../utils/situationBucketing";
import { Badge, EditableSchemeBadge } from "../../ui/Badge";
import type { BadgeColorScheme } from "../../../types/badge";
import {
  getCategoryBadgeScheme,
  getPlayTypeBadgeScheme,
  useTeamBadgeSchemeOverrides,
} from "../../../hooks/useTeamBadgeSchemeOverrides";

type ToggleHandler = () => void;

type PlayActionHandler = (play: PlayType) => void;

type StyleResolver = (value: string) => string;

interface PlayCardListHeaderProps {
  play: PlayType;
  optimisticPlay: PlayType;
  displayName: string;
  subtitleText: string | null;
  showOneWordCalls: boolean;
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  isCompact: boolean;
  isExpanded: boolean;
  onToggleExpand: ToggleHandler;
  onEdit?: PlayActionHandler;
  onDuplicate?: PlayActionHandler;
  onOpenAssignments?: () => void;
  getPlayTypeColor: StyleResolver;
  getConfidenceColor: (confidence: number) => string;
  phaseLabel: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  personnelConfigurations?: PersonnelConfiguration[];
}

const CollapsedBadges: React.FC<{
  play: PlayType;
  getPlayTypeColor: StyleResolver;
  personnelConfig?: PersonnelConfiguration;
  teamDefs: Partial<SituationDefinitions> | null;
  playTypeScheme: BadgeColorScheme;
  onChangePlayTypeScheme: (scheme: BadgeColorScheme) => Promise<void>;
  personnelScheme: BadgeColorScheme;
  onChangePersonnelScheme: (scheme: BadgeColorScheme) => Promise<void>;
  formationScheme: BadgeColorScheme;
  onChangeFormationScheme: (scheme: BadgeColorScheme) => Promise<void>;
  protectionScheme: BadgeColorScheme;
  onChangeProtectionScheme: (scheme: BadgeColorScheme) => Promise<void>;
  motionScheme: BadgeColorScheme;
  onChangeMotionScheme: (scheme: BadgeColorScheme) => Promise<void>;
}> = ({
  play,
  getPlayTypeColor: _getPlayTypeColor,
  personnelConfig,
  teamDefs,
  playTypeScheme,
  onChangePlayTypeScheme,
  personnelScheme,
  onChangePersonnelScheme,
  formationScheme,
  onChangeFormationScheme,
  protectionScheme,
  onChangeProtectionScheme,
  motionScheme,
  onChangeMotionScheme,
}) => (
  <>
    {play.personnel && (
      <>
        {personnelConfig?.badgeCustomization ? (
          <PersonnelBadge
            personnel={play.personnel}
            size="sm"
            badgeCustomization={personnelConfig.badgeCustomization}
          />
        ) : (
          <EditableSchemeBadge
            label={play.personnel}
            scheme={personnelScheme}
            onChangeScheme={onChangePersonnelScheme}
            size="sm"
            ariaLabel={`Change ${play.personnel} badge color`}
          />
        )}
      </>
    )}

    {play.p_type && (
      <EditableSchemeBadge
        label={play.p_type}
        scheme={playTypeScheme}
        onChangeScheme={onChangePlayTypeScheme}
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
        scheme={formationScheme}
        onChangeScheme={onChangeFormationScheme}
        size="sm"
        ariaLabel={`Change ${play.formation} badge color`}
      />
    )}

    {play.pref_hash && (
      <span className="px-2 py-1 bg-surface-muted text-secondary border border-divider rounded-lg text-xs font-medium">
        {play.pref_hash}
      </span>
    )}

    {play.protection && (
      <EditableSchemeBadge
        label={play.protection}
        scheme={protectionScheme}
        onChangeScheme={onChangeProtectionScheme}
        size="sm"
        ariaLabel={`Change ${play.protection} badge color`}
      />
    )}

    {play.motion && (
      <EditableSchemeBadge
        label={`↗️ ${play.motion}`}
        scheme={motionScheme}
        onChangeScheme={onChangeMotionScheme}
        size="sm"
        ariaLabel={`Change ${play.motion} badge color`}
      />
    )}

    {play.pref_down && (
      <span className="px-2 py-1 bg-warning-lightest text-warning-dark border border-warning-light rounded-lg text-xs font-semibold">
        {play.pref_down}
      </span>
    )}

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

const ExpandedBadges: React.FC<{
  play: PlayType;
  getPlayTypeColor: StyleResolver;
  getConfidenceColor: (confidence: number) => string;
  phaseLabel: string | null;
  personnelConfig?: PersonnelConfiguration;
  teamDefs: Partial<SituationDefinitions> | null;
  playTypeScheme: BadgeColorScheme;
  onChangePlayTypeScheme: (scheme: BadgeColorScheme) => Promise<void>;
  personnelScheme: BadgeColorScheme;
  onChangePersonnelScheme: (scheme: BadgeColorScheme) => Promise<void>;
  formationScheme: BadgeColorScheme;
  onChangeFormationScheme: (scheme: BadgeColorScheme) => Promise<void>;
  protectionScheme: BadgeColorScheme;
  onChangeProtectionScheme: (scheme: BadgeColorScheme) => Promise<void>;
  motionScheme: BadgeColorScheme;
  onChangeMotionScheme: (scheme: BadgeColorScheme) => Promise<void>;
}> = ({
  play,
  getPlayTypeColor: _getPlayTypeColor,
  getConfidenceColor,
  phaseLabel,
  personnelConfig,
  teamDefs,
  playTypeScheme,
  onChangePlayTypeScheme,
  personnelScheme,
  onChangePersonnelScheme,
  formationScheme,
  onChangeFormationScheme,
  protectionScheme,
  onChangeProtectionScheme,
  motionScheme,
  onChangeMotionScheme,
}) => (
  <>
    {play.personnel && (
      <>
        {personnelConfig?.badgeCustomization ? (
          <PersonnelBadge
            personnel={play.personnel}
            size="sm"
            badgeCustomization={personnelConfig.badgeCustomization}
          />
        ) : (
          <EditableSchemeBadge
            label={play.personnel}
            scheme={personnelScheme}
            onChangeScheme={onChangePersonnelScheme}
            size="sm"
            ariaLabel={`Change ${play.personnel} badge color`}
          />
        )}
      </>
    )}

    {play.p_type && (
      <EditableSchemeBadge
        label={play.p_type}
        scheme={playTypeScheme}
        onChangeScheme={onChangePlayTypeScheme}
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
        scheme={formationScheme}
        onChangeScheme={onChangeFormationScheme}
        size="sm"
        ariaLabel={`Change ${play.formation} badge color`}
      />
    )}

    {play.protection && (
      <EditableSchemeBadge
        label={play.protection}
        scheme={protectionScheme}
        onChangeScheme={onChangeProtectionScheme}
        size="sm"
        ariaLabel={`Change ${play.protection} badge color`}
      />
    )}

    {play.motion && (
      <EditableSchemeBadge
        label={`↗️ ${play.motion}`}
        scheme={motionScheme}
        onChangeScheme={onChangeMotionScheme}
        size="sm"
        ariaLabel={`Change ${play.motion} badge color`}
      />
    )}

    {phaseLabel && (
      <span className="px-2 py-0.5 bg-warning-500 text-primary rounded-full text-2xs font-semibold tracking-wide uppercase border border-warning-600">
        {phaseLabel}
      </span>
    )}

    <span
      className={`text-xs font-medium ${getConfidenceColor(typeof play.confidence_base === "number" ? play.confidence_base : 70)}`}
    >
      {typeof play.confidence_base === "number" ? play.confidence_base : 70}%
    </span>

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

function useTeamSituationDefinitionsForBadges(): Partial<SituationDefinitions> | null {
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

const ActionButtons: React.FC<{
  play: PlayType;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenAssignments?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({
  play,
  onSelectionChange,
  isFavorite,
  onToggleFavorite,
  onOpenAssignments,
  isExpanded,
  onToggleExpand,
}) => (
  <div className="flex items-center gap-1 ml-4">
    {!onSelectionChange && (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        variant="ghost"
        size="sm"
        icon={
          <Icon
            name={isFavorite ? "star" : "star"}
            className={
              isFavorite ? "text-warning-500 fill-current" : "text-muted"
            }
          />
        }
        iconPosition="only"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      />
    )}

    {onOpenAssignments && (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onOpenAssignments();
        }}
        variant="ghost"
        size="sm"
        icon={<Icon name="users" className="text-primary-500" />}
        iconPosition="only"
        aria-label="Player Assignments"
        title="Player Assignments"
      />
    )}

    <Button
      onClick={onToggleExpand}
      variant="ghost"
      size="sm"
      icon={
        <Icon
          name="chevron-down"
          className={`h-5 w-5 transition-transform duration-300 ease-in-out ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        />
      }
      iconPosition="only"
      aria-label={isExpanded ? "Collapse details" : "Expand details"}
      aria-expanded={isExpanded}
      aria-controls={`play-details-${play.id}`}
      title={isExpanded ? "Collapse" : "Expand details"}
    />
  </div>
);

function getSuccessRateBadgeColor(rate: number): string {
  if (rate >= 0.7) {
    return "bg-success-50 text-success-700 border border-success-200";
  }
  if (rate >= 0.5) {
    return "bg-warning-50 text-warning-700 border border-warning-200";
  }
  return "bg-error-50 text-error-700 border border-error-200";
}

// eslint-disable-next-line max-lines-per-function
export const PlayCardListHeader: React.FC<PlayCardListHeaderProps> = ({
  play,
  optimisticPlay,
  displayName,
  subtitleText,
  showOneWordCalls,
  isSelected,
  onSelectionChange,
  isCompact,
  isExpanded,
  onToggleExpand,
  onEdit: _onEdit,
  onDuplicate: _onDuplicate,
  onOpenAssignments,
  getPlayTypeColor,
  getConfidenceColor,
  phaseLabel,
  isFavorite,
  onToggleFavorite,
  personnelConfigurations = [],
}) => {
  // Find the badge customization for this play's personnel
  const personnelConfig = personnelConfigurations.find(
    (config) => config.name === optimisticPlay.personnel
  );

  const teamDefs = useTeamSituationDefinitionsForBadges();
  const { overrides, setPlayTypeScheme, setCategoryScheme } =
    useTeamBadgeSchemeOverrides();

  const playTypeScheme = useMemo(
    () =>
      getPlayTypeBadgeScheme(overrides, optimisticPlay.p_type ?? play.p_type),
    [overrides, optimisticPlay.p_type, play.p_type]
  );

  const onChangePlayTypeScheme = useMemo(() => {
    const playType = (optimisticPlay.p_type ?? play.p_type)?.trim();
    if (!playType) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setPlayTypeScheme(playType, scheme);
    };
  }, [optimisticPlay.p_type, play.p_type, setPlayTypeScheme]);

  const formationScheme = useMemo(
    () =>
      getCategoryBadgeScheme(
        overrides,
        "formation",
        optimisticPlay.formation ?? play.formation
      ),
    [overrides, optimisticPlay.formation, play.formation]
  );

  const onChangeFormationScheme = useMemo(() => {
    const formation = (optimisticPlay.formation ?? play.formation)?.trim();
    if (!formation) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("formation", formation, scheme);
    };
  }, [optimisticPlay.formation, play.formation, setCategoryScheme]);

  const protectionScheme = useMemo(
    () =>
      getCategoryBadgeScheme(
        overrides,
        "protection",
        optimisticPlay.protection ?? play.protection
      ),
    [overrides, optimisticPlay.protection, play.protection]
  );

  const onChangeProtectionScheme = useMemo(() => {
    const protection = (optimisticPlay.protection ?? play.protection)?.trim();
    if (!protection) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("protection", protection, scheme);
    };
  }, [optimisticPlay.protection, play.protection, setCategoryScheme]);

  const motionScheme = useMemo(
    () =>
      getCategoryBadgeScheme(
        overrides,
        "motion",
        optimisticPlay.motion ?? play.motion
      ),
    [overrides, optimisticPlay.motion, play.motion]
  );

  const onChangeMotionScheme = useMemo(() => {
    const motion = (optimisticPlay.motion ?? play.motion)?.trim();
    if (!motion) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("motion", motion, scheme);
    };
  }, [optimisticPlay.motion, play.motion, setCategoryScheme]);

  const personnelScheme = useMemo(
    () =>
      getCategoryBadgeScheme(
        overrides,
        "personnel",
        optimisticPlay.personnel ?? play.personnel
      ),
    [overrides, optimisticPlay.personnel, play.personnel]
  );

  const onChangePersonnelScheme = useMemo(() => {
    const personnel = (optimisticPlay.personnel ?? play.personnel)?.trim();
    if (!personnel) return async () => {};
    return async (scheme: BadgeColorScheme) => {
      await setCategoryScheme("personnel", personnel, scheme);
    };
  }, [optimisticPlay.personnel, play.personnel, setCategoryScheme]);

  return (
    <div className="flex items-center gap-4 overflow-visible">
      {/* Selection checkbox on the left (when selection mode is on) */}
      {onSelectionChange && (
        <div className="shrink-0">
          <SelectionCheckbox
            isSelected={Boolean(isSelected)}
            onChange={(selected) => {
              debug("[PlayCardListHeader] SelectionCheckbox onChange:", {
                playId: play.id,
                selected,
              });
              onSelectionChange(play.id, selected);
            }}
            label={`Select ${displayName}`}
          />
        </div>
      )}

      {/* Photo thumbnail (if available) */}
      {(play.diagram_url || (play as any).diagram_image_url) && (
        <div className="shrink-0 w-20 h-14 rounded-xl overflow-hidden shadow-sm shadow-jade-500/10">
          <img
            src={play.diagram_url || (play as any).diagram_image_url}
            alt={`${displayName} diagram`}
            className="w-full h-full object-cover"
            // iOS Safari compatibility
            crossOrigin="anonymous"
            decoding="async"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <h3
            className={`truncate font-mono font-bold ${
              isCompact ? "text-base" : "text-lg"
            } ${
              showOneWordCalls && play.one_word_play
                ? "text-jade-600"
                : "text-primary"
            }`}
          >
            {displayName}
          </h3>
          {subtitleText && (
            <span className="text-secondary text-sm italic ml-2">
              {subtitleText}
            </span>
          )}
        </div>
        <div
          className={`flex flex-wrap items-center gap-2 transition-all duration-300 ease-in-out ${
            isCompact ? "mt-1.5" : "mt-2"
          }`}
        >
          {/* 🎯 COLLAPSED STATE: Show essential info + preview data */}
          {!isExpanded && (
            <CollapsedBadges
              play={optimisticPlay}
              getPlayTypeColor={getPlayTypeColor}
              personnelConfig={personnelConfig}
              teamDefs={teamDefs}
              playTypeScheme={playTypeScheme}
              onChangePlayTypeScheme={onChangePlayTypeScheme}
              personnelScheme={personnelScheme}
              onChangePersonnelScheme={onChangePersonnelScheme}
              formationScheme={formationScheme}
              onChangeFormationScheme={onChangeFormationScheme}
              protectionScheme={protectionScheme}
              onChangeProtectionScheme={onChangeProtectionScheme}
              motionScheme={motionScheme}
              onChangeMotionScheme={onChangeMotionScheme}
            />
          )}

          {/* 📊 EXPANDED STATE: Show ALL badges and stats */}
          {isExpanded && (
            <ExpandedBadges
              play={optimisticPlay}
              getPlayTypeColor={getPlayTypeColor}
              getConfidenceColor={getConfidenceColor}
              phaseLabel={phaseLabel}
              personnelConfig={personnelConfig}
              teamDefs={teamDefs}
              playTypeScheme={playTypeScheme}
              onChangePlayTypeScheme={onChangePlayTypeScheme}
              personnelScheme={personnelScheme}
              onChangePersonnelScheme={onChangePersonnelScheme}
              formationScheme={formationScheme}
              onChangeFormationScheme={onChangeFormationScheme}
              protectionScheme={protectionScheme}
              onChangeProtectionScheme={onChangeProtectionScheme}
              motionScheme={motionScheme}
              onChangeMotionScheme={onChangeMotionScheme}
            />
          )}
        </div>
      </div>

      <ActionButtons
        play={play}
        onSelectionChange={onSelectionChange}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onOpenAssignments={onOpenAssignments}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    </div>
  );
};
