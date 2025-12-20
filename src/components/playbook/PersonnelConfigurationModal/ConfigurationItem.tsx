/**
 * ConfigurationItem Component
 *
 * Individual personnel configuration card with expanded/collapsed states
 */

import React from "react";
import { Icon } from "../../ui/Icon";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { Input } from "../../ui/Input";
import { FormSelect } from "../../ui/FormSelect/FormSelect";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { BadgeCustomizer } from "../BadgeCustomizer";
import { PersonnelBadge } from "../PersonnelBadge";
import type { PlayerPosition } from "../../../types/personnel";
import type { ConfigurationItemProps } from "./types";

type CollapsedHeaderProps = Pick<
  ConfigurationItemProps,
  | "config"
  | "isExpanded"
  | "justSaved"
  | "summary"
  | "onToggleExpanded"
  | "onToggleDefault"
  | "onRemove"
>;

const CollapsedHeader: React.FC<CollapsedHeaderProps> = ({
  config,
  isExpanded,
  justSaved,
  summary,
  onToggleExpanded,
  onToggleDefault,
  onRemove,
}) => {
  return (
    <div className="flex items-center gap-3 p-4">
      <button
        onClick={onToggleDefault}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-tertiary transition-colors"
        title={config.isDefault ? "Default personnel" : "Set as default"}
      >
        <Icon
          name="star"
          className={`w-5 h-5 transition-colors ${
            config.isDefault
              ? "text-warning-strong fill-warning-strong"
              : "text-tertiary"
          }`}
        />
      </button>

      <button
        onClick={onToggleExpanded}
        className="flex-1 flex items-center justify-between text-left hover:bg-tertiary/50 rounded-lg p-2 -m-2 transition-colors"
      >
        <div className="flex-1">
          <div className="font-semibold text-primary flex items-center gap-2">
            {config.name || "Unnamed Personnel"}
            {config.badgeCustomization && (
              <PersonnelBadge
                personnel={config.name || "Personnel"}
                size="sm"
                badgeCustomization={config.badgeCustomization}
              />
            )}
            {justSaved && (
              <Icon
                name="check-circle"
                className="inline-block w-4 h-4 text-success-600"
              />
            )}
          </div>
          <div className="text-sm text-tertiary mt-0.5">{summary}</div>
        </div>
        <Icon
          name="chevron-down"
          className={`w-5 h-5 text-tertiary transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <Button
        onClick={() => {
          triggerHapticFeedback("light");
          onRemove();
        }}
        variant="ghost"
        size="sm"
        className="flex-shrink-0 text-error-500 hover:bg-error-50"
      >
        <Icon name="delete" className="w-4 h-4" />
      </Button>
    </div>
  );
};

type ExpandedContentProps = Pick<
  ConfigurationItemProps,
  | "config"
  | "isCustomizerOpen"
  | "onUpdateName"
  | "onToggleCustomizer"
  | "onUpdateBadgeCustomization"
  | "onAddPlayer"
  | "onRemovePlayer"
  | "onUpdatePlayerLabel"
  | "onUpdatePlayerPosition"
  | "onToggleWildcatQB"
>;

const BadgeCustomizerSection: React.FC<
  Pick<
    ExpandedContentProps,
    | "config"
    | "isCustomizerOpen"
    | "onToggleCustomizer"
    | "onUpdateBadgeCustomization"
  >
> = ({
  config,
  isCustomizerOpen,
  onToggleCustomizer,
  onUpdateBadgeCustomization,
}) => {
  return (
    <>
      <div>
        <Button
          onClick={onToggleCustomizer}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Icon
            name={isCustomizerOpen ? "chevron-up" : "star"}
            className="w-4 h-4 mr-2"
          />
          {isCustomizerOpen ? "Hide Badge Customizer" : "Customize Badge"}
        </Button>
      </div>

      {isCustomizerOpen && (
        <div className="animate-in slide-in-from-top-2">
          <BadgeCustomizer
            personnelName={config.name || "Personnel"}
            customization={
              config.badgeCustomization || {
                style: "solid",
                colorPresetId: "electric-blue",
                fontFamily: "default",
              }
            }
            onChange={onUpdateBadgeCustomization}
            onSave={onToggleCustomizer}
          />
        </div>
      )}
    </>
  );
};

const OffensiveLineInfo: React.FC = () => {
  return (
    <div className="space-y-2">
      <Typography variant="label-md" className="flex items-center gap-2 mb-3">
        <Icon name="shield" className="w-4 h-4 text-brand-jade" />
        OFFENSIVE LINE
      </Typography>

      <Typography variant="caption" color="muted" className="text-xs">
        Offensive line positions are managed separately
      </Typography>

      <Typography variant="caption" color="muted" className="text-xs mt-2">
        Default: LT, LG, C, RG, RT (customize with up to 3 characters)
      </Typography>
    </div>
  );
};

type SkillPositionsListProps = Pick<
  ExpandedContentProps,
  | "config"
  | "onAddPlayer"
  | "onRemovePlayer"
  | "onUpdatePlayerLabel"
  | "onUpdatePlayerPosition"
  | "onToggleWildcatQB"
>;

const SkillPositionsList: React.FC<SkillPositionsListProps> = ({
  config,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerLabel,
  onUpdatePlayerPosition,
  onToggleWildcatQB,
}) => {
  return (
    <div className="space-y-2">
      <Typography variant="label-md" className="flex items-center gap-2 mb-3">
        <Icon name="users" className="w-4 h-4 text-brand-jade" />
        SKILL POSITIONS
      </Typography>

      {(config.players ?? []).map((player, index) => (
        <div key={player.id} className="flex items-center gap-2">
          <Input
            value={player.label}
            onChange={(e) => onUpdatePlayerLabel(player.id, e.target.value)}
            placeholder={index === 0 ? "Q" : "Label"}
            maxLength={3}
            className="w-16 h-9 text-center font-mono font-bold uppercase text-sm"
          />

          <span className="text-tertiary text-sm">—</span>

          {index === 0 ? (
            <div className="flex-1 h-9 px-3 flex items-center justify-between rounded-lg border border-default bg-tertiary text-sm font-medium opacity-75 cursor-not-allowed">
              <span className="text-primary">QB</span>
              <Icon name="lock" className="w-4 h-4 text-tertiary" />
            </div>
          ) : (
            <FormSelect
              value={player.player_position}
              onChange={(value) =>
                onUpdatePlayerPosition(player.id, value as PlayerPosition)
              }
              options={[
                { value: "RB", label: "RB (Running Back)" },
                { value: "TE", label: "TE (Tight End)" },
                { value: "WR", label: "WR (Wide Receiver)" },
              ]}
              className="flex-1"
            />
          )}

          {player.player_position === "QB" && index === 0 && (
            <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={player.is_wildcat_qb || false}
                onChange={() => onToggleWildcatQB(player.id)}
                className="w-3.5 h-3.5 rounded border-default text-brand-jade focus:ring-brand-jade focus:ring-offset-0"
              />
              <Typography variant="caption" className="text-tertiary text-xs">
                Wildcat QB
              </Typography>
            </label>
          )}

          {index !== 0 && (
            <button
              onClick={() => onRemovePlayer(player.id)}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-error-500 hover:bg-error-50 transition-colors"
              title="Remove player"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={onAddPlayer}
        className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-dashed border-default hover:border-brand-jade hover:bg-tertiary text-secondary hover:text-brand-jade transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Icon name="plus" className="w-4 h-4" />
        Add Player
      </button>
    </div>
  );
};

const ExpandedContent: React.FC<ExpandedContentProps> = ({
  config,
  isCustomizerOpen,
  onUpdateName,
  onToggleCustomizer,
  onUpdateBadgeCustomization,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerLabel,
  onUpdatePlayerPosition,
  onToggleWildcatQB,
}) => {
  return (
    <div className="px-4 pb-4 space-y-4 border-t border-default pt-4">
      <div>
        <Typography variant="label-md" className="mb-2">
          Personnel Name
        </Typography>
        <Input
          value={config.name}
          onChange={(e) => onUpdateName(e.target.value)}
          placeholder="Personnel Name"
          className="font-medium"
        />
      </div>

      <BadgeCustomizerSection
        config={config}
        isCustomizerOpen={isCustomizerOpen}
        onToggleCustomizer={onToggleCustomizer}
        onUpdateBadgeCustomization={onUpdateBadgeCustomization}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkillPositionsList
          config={config}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onUpdatePlayerLabel={onUpdatePlayerLabel}
          onUpdatePlayerPosition={onUpdatePlayerPosition}
          onToggleWildcatQB={onToggleWildcatQB}
        />
        <OffensiveLineInfo />
      </div>
    </div>
  );
};

export const ConfigurationItem: React.FC<ConfigurationItemProps> = ({
  config,
  isExpanded,
  isCustomizerOpen,
  justSaved,
  summary,
  onToggleExpanded,
  onToggleDefault,
  onRemove,
  onUpdateName,
  onToggleCustomizer,
  onUpdateBadgeCustomization,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerLabel,
  onUpdatePlayerPosition,
  onToggleWildcatQB,
}) => {
  return (
    <div className="rounded-xl border-2 border-default bg-secondary overflow-hidden transition-all">
      <CollapsedHeader
        config={config}
        isExpanded={isExpanded}
        justSaved={justSaved}
        summary={summary}
        onToggleExpanded={onToggleExpanded}
        onToggleDefault={onToggleDefault}
        onRemove={onRemove}
      />

      {/* Expanded Content */}
      {isExpanded && (
        <ExpandedContent
          config={config}
          isCustomizerOpen={isCustomizerOpen}
          onUpdateName={onUpdateName}
          onToggleCustomizer={onToggleCustomizer}
          onUpdateBadgeCustomization={onUpdateBadgeCustomization}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onUpdatePlayerLabel={onUpdatePlayerLabel}
          onUpdatePlayerPosition={onUpdatePlayerPosition}
          onToggleWildcatQB={onToggleWildcatQB}
        />
      )}
    </div>
  );
};
