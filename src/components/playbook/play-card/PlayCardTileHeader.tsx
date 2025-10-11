import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../ui/Button/Button";
import Icon from "../../ui/Icon/Icon";
import { UserAvatar } from "../../ui/UserAvatar";
import type { Play as PlayType } from "../../../types/play";
import {
  getTileConfidenceClasses,
  getTileGradient,
  getTileIcon,
} from "./helpers";
import { getDiagramButtonText } from "../../../utils/diagramHelpers";

type SelectionHandler = (playId: string, selected: boolean) => void;

type PlayActionHandler = (play: PlayType) => void;

type StyleResolver = (type: string) => string;

interface PlayCardTileHeaderProps {
  play: PlayType;
  optimisticPlay: PlayType;
  displayName: string;
  subtitleText: string | null;
  showOneWordCalls: boolean;
  isSelected: boolean;
  onSelectionChange?: SelectionHandler;
  onEdit?: PlayActionHandler;
  onDuplicate?: PlayActionHandler;
  onCreateDiagram: () => void;
  getPlayTypeColor: StyleResolver;
  phaseLabel: string | null;
}

export const PlayCardTileHeader: React.FC<PlayCardTileHeaderProps> = ({
  play,
  optimisticPlay,
  displayName,
  subtitleText,
  showOneWordCalls,
  isSelected,
  onSelectionChange,
  onEdit,
  onDuplicate,
  onCreateDiagram,
  getPlayTypeColor,
  phaseLabel,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const tileTitle =
    showOneWordCalls && play.one_word_play
      ? play.one_word_play.toUpperCase()
      : displayName;

  const tileSubtitle =
    subtitleText ||
    (showOneWordCalls && play.one_word_play
      ? play.formation || optimisticPlay.p_type
      : play.one_word_play
        ? play.one_word_play.toUpperCase()
        : optimisticPlay.p_type);

  const { stroke: confidenceStrokeClass, text: confidenceTextClass } =
    getTileConfidenceClasses(optimisticPlay.confidence_base);

  return (
    <div className="flex flex-col items-center text-center overflow-visible">
      <div className="relative w-full max-w-80 mx-auto overflow-visible">
        {onSelectionChange && (
          <label
            className="absolute -top-3 -left-3 z-10 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border-2 dark:border-slate-600 shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={Boolean(isSelected)}
              onChange={(e) => onSelectionChange(play.id, e.target.checked)}
              className="w-5 h-5 rounded-lg border-0 text-brand-primary focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
            />
          </label>
        )}

        <motion.button
          type="button"
          onClick={() => onEdit?.(play)}
          className={`relative w-full aspect-square rounded-[1.75rem] bg-gradient-to-br ${getTileGradient(optimisticPlay.p_type)} shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-visible before:absolute before:inset-0 before:rounded-[1.75rem] before:bg-gradient-to-tr before:from-transparent before:via-white/20 before:to-transparent before:opacity-50 before:pointer-events-none focus:outline-none focus:ring-2 focus:ring-brand-primary/60`}
          aria-label={`Edit ${tileTitle}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icon
            name={getTileIcon(optimisticPlay.p_type)}
            className="absolute inset-0 m-auto w-[65%] h-[65%] text-white drop-shadow-lg"
            aria-hidden="true"
          />

          <div className="absolute -top-3 -right-3 w-11 h-11 rounded-full bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800">
            <svg
              className="absolute w-11 h-11 -rotate-90"
              viewBox="0 0 44 44"
              aria-hidden="true"
            >
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="3"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                className={confidenceStrokeClass}
                strokeWidth="3"
                strokeDasharray={`${(optimisticPlay.confidence_base / 100) * 113} 113`}
                strokeLinecap="round"
              />
            </svg>
            <span
              className={`relative text-2xs font-bold ${confidenceTextClass}`}
            >
              {optimisticPlay.confidence_base}
            </span>
          </div>

          {play.diagram_url && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateDiagram();
              }}
              className="absolute -bottom-3 -right-3 w-11 h-11 rounded-full bg-purple-500 shadow-md flex items-center justify-center border-2 border-white dark:border-slate-800 hover:bg-purple-600 transition-colors cursor-pointer"
              title="Edit diagram"
              aria-label="Edit diagram"
            >
              <Icon name="image" className="w-5 h-5 text-white" />
            </button>
          )}
        </motion.button>
      </div>

      <div className="mt-4 space-y-1 w-full">
        <h3
          className={`font-mono font-bold text-lg leading-tight text-text-primary line-clamp-2 ${
            showOneWordCalls && play.one_word_play ? "text-text-info" : ""
          }`}
          title={tileTitle}
        >
          {tileTitle}
        </h3>
        {tileSubtitle && (
          <p className="text-sm text-text-secondary line-clamp-2">
            {tileSubtitle}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPlayTypeColor(optimisticPlay.p_type)}`}
        >
          {optimisticPlay.p_type}
        </span>
        {optimisticPlay.f_type && (
          <span className="px-2 py-0.5 bg-surface-muted text-primary border-subtle rounded-full text-xs font-medium">
            {optimisticPlay.f_type}
          </span>
        )}
        {phaseLabel && (
          <span className="px-2 py-0.5 bg-warning-500 text-primary rounded-full text-2xs font-semibold tracking-wide uppercase border border-warning-600">
            {phaseLabel}
          </span>
        )}
        {optimisticPlay.created_by && (
          <div className="flex items-center gap-1">
            <span className="text-2xs text-text-muted">by</span>
            <UserAvatar
              userId={optimisticPlay.created_by}
              size="xs"
              showName={false}
              showPopover={true}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
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
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-surface-primary border border-border-medium rounded-lg shadow-lg z-50 py-1">
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
                {getDiagramButtonText(Boolean(play.diagram_url))}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
