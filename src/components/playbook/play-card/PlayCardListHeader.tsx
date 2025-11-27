import React from "react";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { PersonnelBadge } from "../PersonnelBadge";
import { WristbandBadge } from "../WristbandBadge";
import { SelectionCheckbox } from "../../ui/SelectionCheckbox";
import type { Play as PlayType } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";

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

  return (
    <div className="flex items-center gap-4 overflow-visible">
      {/* Selection checkbox on the left (when selection mode is on) */}
      {onSelectionChange && (
        <div className="shrink-0">
          <SelectionCheckbox
            isSelected={Boolean(isSelected)}
            onChange={(selected) => {
              console.log("[PlayCardListHeader] SelectionCheckbox onChange:", {
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
      {play.diagram_image_url && (
        <div className="shrink-0 w-20 h-14 rounded-xl overflow-hidden shadow-sm shadow-jade-500/10">
          <img
            src={play.diagram_image_url}
            alt={`${displayName} diagram`}
            className="w-full h-full object-cover"
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
            <span className="shrink-0 text-xs text-muted font-medium">
              {subtitleText}
            </span>
          )}
        </div>
        <div
          className={`flex flex-wrap items-center gap-2 ${
            isCompact ? "mt-1.5" : "mt-2"
          }`}
        >
          {/* 🎯 COLLAPSED STATE: Show essential info + preview data */}
          {!isExpanded && (
            <>
              {/* Personnel badge - Most important identifier */}
              {optimisticPlay.personnel && (
                <PersonnelBadge
                  personnel={optimisticPlay.personnel}
                  size="sm"
                  badgeCustomization={personnelConfig?.badgeCustomization}
                />
              )}

              {/* Play type badge */}
              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm ${getPlayTypeColor(optimisticPlay.p_type)}`}
              >
                {optimisticPlay.p_type}
              </span>

              {/* Wristband badge (if exists - highly visible identifier) */}
              {optimisticPlay.wristband_number && (
                <WristbandBadge
                  wristbandNumber={optimisticPlay.wristband_number}
                  size="sm"
                />
              )}

              {/* Formation info - helps identify play quickly */}
              {optimisticPlay.formation && (
                <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium">
                  {optimisticPlay.formation}
                </span>
              )}

              {/* Preferred hash - important for run plays */}
              {optimisticPlay.pref_hash && (
                <span className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium">
                  {optimisticPlay.pref_hash}
                </span>
              )}

              {/* Protection scheme - important for pass plays */}
              {optimisticPlay.protection && (
                <span className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-medium">
                  {optimisticPlay.protection}
                </span>
              )}

              {/* Motion - visual identifier */}
              {optimisticPlay.motion && (
                <span className="px-2 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-medium">
                  ↗️ {optimisticPlay.motion}
                </span>
              )}

              {/* Preferred down/distance */}
              {optimisticPlay.pref_down && (
                <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                  {optimisticPlay.pref_down}
                </span>
              )}
            </>
          )}

          {/* 📊 EXPANDED STATE: Show ALL badges and stats */}
          {isExpanded && (
            <>
              {/* Personnel badge */}
              {optimisticPlay.personnel && (
                <PersonnelBadge
                  personnel={optimisticPlay.personnel}
                  size="sm"
                  badgeCustomization={personnelConfig?.badgeCustomization}
                />
              )}

              {/* Play type badge */}
              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm ${getPlayTypeColor(optimisticPlay.p_type)}`}
              >
                {optimisticPlay.p_type}
              </span>

              {/* Wristband badge */}
              {optimisticPlay.wristband_number && (
                <WristbandBadge
                  wristbandNumber={optimisticPlay.wristband_number}
                  size="sm"
                />
              )}

              {/* Installation phase badge */}
              {phaseLabel && (
                <span className="px-2 py-0.5 bg-warning-500 text-primary rounded-full text-2xs font-semibold tracking-wide uppercase border border-warning-600">
                  {phaseLabel}
                </span>
              )}

              {/* Confidence */}
              <span
                className={`text-xs font-medium ${getConfidenceColor(optimisticPlay.confidence_base)}`}
              >
                {optimisticPlay.confidence_base}%
              </span>

              {/* Usage stats badges */}
              {optimisticPlay.times_called &&
                optimisticPlay.times_called > 0 && (
                  <>
                    <span className="px-2 py-0.5 bg-info-50 text-info-700 border border-info-200 rounded-full text-xs font-medium flex items-center gap-1">
                      <Icon name="trending-up" size={12} />
                      {optimisticPlay.times_called}x called
                    </span>

                    {optimisticPlay.times_successful !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSuccessRateBadgeColor(
                          optimisticPlay.times_successful /
                            optimisticPlay.times_called
                        )}`}
                      >
                        {Math.round(
                          (optimisticPlay.times_successful /
                            optimisticPlay.times_called) *
                            100
                        )}
                        % success
                      </span>
                    )}
                  </>
                )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 ml-4">
        {/* Star button for favorites (hidden when selection mode is on) */}
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
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          />
        )}

        {/* Assignments button */}
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

        {/* Expand/collapse button */}
        <Button
          onClick={onToggleExpand}
          variant="ghost"
          size="sm"
          icon={
            isExpanded ? (
              <Icon name="chevron-up" className="h-5 w-5" />
            ) : (
              <Icon name="chevron-down" className="h-5 w-5" />
            )
          }
          iconPosition="only"
          aria-label={isExpanded ? "Collapse details" : "Expand details"}
          aria-expanded={isExpanded}
          aria-controls={`play-details-${play.id}`}
          title={isExpanded ? "Collapse" : "Expand details"}
        />
      </div>
    </div>
  );
};

/**
 * Helper function to get badge color based on success rate
 */
function getSuccessRateBadgeColor(rate: number): string {
  if (rate >= 0.7) {
    return "bg-success-50 text-success-700 border border-success-200";
  }
  if (rate >= 0.5) {
    return "bg-warning-50 text-warning-700 border border-warning-200";
  }
  return "bg-error-50 text-error-700 border border-error-200";
}
