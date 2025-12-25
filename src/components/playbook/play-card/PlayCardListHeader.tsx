import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Badge } from "../../ui/Badge";
import { Dropdown } from "../../ui/Dropdown";
import type { BadgeColorScheme } from "../../../types/badge";
import {
  BADGE_COLOR_SCHEME_OPTIONS,
  isBadgeColorScheme,
} from "../../../types/badge";
import {
  getPlayTypeBadgeScheme,
  useTeamBadgeSchemeOverrides,
} from "../../../hooks/useTeamBadgeSchemeOverrides";

type ToggleHandler = () => void;

type PlayActionHandler = (play: PlayType) => void;

type StyleResolver = (value: string) => string;

const COLOR_OPTIONS: Array<{ value: BadgeColorScheme; label: string }> =
  BADGE_COLOR_SCHEME_OPTIONS;

const EditablePlayTypeBadge: React.FC<{
  value: string;
  scheme: BadgeColorScheme;
  onChangeScheme: (scheme: BadgeColorScheme) => Promise<void>;
}> = ({ value, scheme, onChangeScheme }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!rootRef.current?.contains(target)) setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const label = value.trim();
  if (!label) return null;

  return (
    <span ref={rootRef} className="relative inline-flex">
      <Badge
        variant="neutral"
        scheme={scheme}
        size="sm"
        onClick={() => setOpen((v) => !v)}
        ariaLabel={`Change ${label} badge color`}
      >
        {label}
      </Badge>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-divider rounded-lg p-2 shadow-md">
          <Dropdown
            label="Color"
            value={scheme}
            onChange={async (next) => {
              if (!isBadgeColorScheme(next)) return;
              setSaving(true);
              try {
                await onChangeScheme(next);
                setOpen(false);
              } finally {
                setSaving(false);
              }
            }}
            options={COLOR_OPTIONS}
            size="sm"
            disabled={saving}
          />
        </div>
      )}
    </span>
  );
};

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
}> = ({
  play,
  getPlayTypeColor: _getPlayTypeColor,
  personnelConfig,
  teamDefs,
  playTypeScheme,
  onChangePlayTypeScheme,
}) => (
  <>
    {play.personnel && (
      <PersonnelBadge
        personnel={play.personnel}
        size="sm"
        badgeCustomization={personnelConfig?.badgeCustomization ?? undefined}
      />
    )}

    {play.p_type && (
      <EditablePlayTypeBadge
        value={play.p_type}
        scheme={playTypeScheme}
        onChangeScheme={onChangePlayTypeScheme}
      />
    )}

    {play.wristband_number && (
      <WristbandBadge wristbandNumber={play.wristband_number} size="sm" />
    )}

    {play.formation && (
      <span className="px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-lg text-xs font-semibold">
        {play.formation}
      </span>
    )}

    {play.pref_hash && (
      <span className="px-2 py-1 bg-surface-muted text-secondary border border-divider rounded-lg text-xs font-medium">
        {play.pref_hash}
      </span>
    )}

    {play.protection && (
      <span className="px-2 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-lg text-xs font-semibold">
        {play.protection}
      </span>
    )}

    {play.motion && (
      <span className="px-2 py-1 bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-lg text-xs font-semibold">
        ↗️ {play.motion}
      </span>
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
}> = ({
  play,
  getPlayTypeColor: _getPlayTypeColor,
  getConfidenceColor,
  phaseLabel,
  personnelConfig,
  teamDefs,
  playTypeScheme,
  onChangePlayTypeScheme,
}) => (
  <>
    {play.personnel && (
      <PersonnelBadge
        personnel={play.personnel}
        size="sm"
        badgeCustomization={personnelConfig?.badgeCustomization ?? undefined}
      />
    )}

    {play.p_type && (
      <EditablePlayTypeBadge
        value={play.p_type}
        scheme={playTypeScheme}
        onChangeScheme={onChangePlayTypeScheme}
      />
    )}

    {play.wristband_number && (
      <WristbandBadge wristbandNumber={play.wristband_number} size="sm" />
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
  const { overrides, setPlayTypeScheme } = useTeamBadgeSchemeOverrides();

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
