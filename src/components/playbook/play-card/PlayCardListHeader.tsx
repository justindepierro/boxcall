import React from "react";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import type { Play as PlayType } from "../../../types/play";

type ToggleHandler = () => void;

type StyleResolver = (value: string) => string;

interface PlayCardListHeaderProps {
  play: PlayType;
  optimisticPlay: PlayType;
  displayName: string;
  subtitleText: string | null;
  showOneWordCalls: boolean;
  isCompact: boolean;
  isExpanded: boolean;
  onToggleExpand: ToggleHandler;
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
  isCompact,
  isExpanded,
  onToggleExpand,
  getPlayTypeColor,
  getConfidenceColor,
  phaseLabel,
}) => {
  return (
    <div className="flex items-center justify-between overflow-visible">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3
            className={`truncate font-mono font-bold ${
              isCompact ? "text-base" : "text-lg"
            } ${
              showOneWordCalls && play.one_word_play
                ? "text-text-info"
                : "text-text-xssssrimary"
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
            className={`text-xsssss font-medium ${getConfidenceColor(optimisticPlay.confidence_base)}`}
          >
            {optimisticPlay.confidence_base}%
          </span>
        </div>
      </div>

      <div className="flex items-center ml-4">
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
