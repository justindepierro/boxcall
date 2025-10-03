import React, { useState } from "react";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { UserAvatar } from "../../ui/UserAvatar";
import type { Play as PlayType } from "../../../types/play";

type ToggleHandler = () => void;

type SelectionHandler = (playId: string, selected: boolean) => void;

type PlayActionHandler = (play: PlayType) => void;

type StyleResolver = (value: string) => string;

interface PlayCardListHeaderProps {
  play: PlayType;
  optimisticPlay: PlayType;
  displayName: string;
  subtitleText: string | null;
  showOneWordCalls: boolean;
  isSelected: boolean;
  onSelectionChange?: SelectionHandler;
  isCompact: boolean;
  isExpanded: boolean;
  onToggleExpand: ToggleHandler;
  onEdit?: PlayActionHandler;
  onDuplicate?: PlayActionHandler;
  onCreateDiagram: () => void;
  getPlayTypeColor: StyleResolver;
  getConfidenceColor: (confidence: number) => string;
  phaseLabel: string | null;
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
  onEdit,
  onDuplicate,
  onCreateDiagram,
  getPlayTypeColor,
  getConfidenceColor,
  phaseLabel,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex items-center justify-between overflow-visible">
      <div className="flex items-center mr-3">
        <input
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={(e) => onSelectionChange?.(play.id, e.target.checked)}
          className="w-4 h-4 rounded border-2 border-slate-300 text-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 cursor-pointer transition-all hover:border-brand-primary bg-white/90"
          title="Select play"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3
            className={`truncate font-mono font-bold ${
              isCompact ? "text-base" : "text-lg"
            } ${
              showOneWordCalls && play.one_word_play
                ? "text-text-info"
                : "text-text-primary"
            } text-left`}
          >
            {displayName}
          </h3>
          {subtitleText && (
            <span className="shrink-0 text-[11px] text-text-secondary italic">
              {subtitleText}
            </span>
          )}
        </div>
        <div
          className={`flex flex-wrap items-center gap-2 ${
            isCompact ? "mt-1" : "mt-2"
          }`}
        >
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getPlayTypeColor(optimisticPlay.p_type)}`}
          >
            {optimisticPlay.p_type}
          </span>
          {optimisticPlay.f_type && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-[11px] font-medium">
              {optimisticPlay.f_type}
            </span>
          )}
          {phaseLabel && (
            <span className="px-2 py-0.5 bg-warning-500 text-gray-900 rounded-full text-[10px] font-semibold tracking-wide uppercase border border-warning-600">
              {phaseLabel}
            </span>
          )}
          <span
            className={`text-xs font-medium ${getConfidenceColor(optimisticPlay.confidence_base)}`}
          >
            {optimisticPlay.confidence_base}%
          </span>
          {optimisticPlay.created_by && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted">by</span>
              <UserAvatar
                userId={optimisticPlay.created_by}
                size="xs"
                showName={false}
                showPopover={true}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1 ml-4">
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
        <div className="relative">
          <Button
            onClick={() => setShowDropdown(!showDropdown)}
            variant="ghost"
            size="sm"
            icon={<Icon name="menu" className="h-5 w-5" />}
            iconPosition="only"
            aria-label="More options"
            title="More options"
          />
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-primary border border-border-medium rounded-lg shadow-lg z-50 py-1">
              <button
                type="button"
                onClick={() => {
                  onEdit?.(play);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-surface-secondary/50 flex items-center gap-2"
              >
                <Icon name="edit" className="h-4 w-4" />
                Edit play
              </button>
              <button
                type="button"
                onClick={() => {
                  onDuplicate?.(play);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-surface-secondary/50 flex items-center gap-2"
              >
                <Icon name="copy" className="h-4 w-4" />
                Duplicate play
              </button>
              <button
                type="button"
                onClick={() => {
                  onCreateDiagram();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-surface-secondary/50 flex items-center gap-2"
              >
                <Icon name="image" className="h-4 w-4" />
                Create diagram
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
}