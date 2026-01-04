/* eslint-disable max-lines-per-function, complexity */
import React, { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "../ui/Icon/Icon";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import type { Play } from "../../types/play";
import type { PersonnelConfiguration } from "../../types/personnel";
import { BadgeRow } from "./play-card/badges";
import { PlayDiagramTooltip } from "./play-card/PlayDiagramTooltip";
import { useLegacyPlayCardFeatures } from "./useLegacyPlayCardFeatures";

const PLAYTYPE_STYLES: Record<string, { gradient: string; badge: string }> = {
  run: {
    gradient: "from-jade-500 to-emerald-600",
    badge: "bg-gradient-to-r from-jade-500 to-emerald-600",
  },
  pass: {
    gradient: "from-purple-500 to-indigo-500",
    badge: "bg-gradient-to-r from-purple-500 to-indigo-500",
  },
  rpo: {
    gradient: "from-amber-500 to-orange-600",
    badge: "bg-gradient-to-r from-amber-500 to-orange-600",
  },
  "play action": {
    gradient: "from-orange-500 to-amber-600",
    badge: "bg-gradient-to-r from-orange-500 to-amber-600",
  },
  default: {
    gradient: "from-navy-600 to-blue-600",
    badge: "bg-gradient-to-r from-navy-600 to-blue-600",
  },
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const getPlayTypeStyle = (playType?: string) => {
  if (!playType) return PLAYTYPE_STYLES.default;
  const normalized = playType.toLowerCase();
  return PLAYTYPE_STYLES[normalized] ?? PLAYTYPE_STYLES.default;
};

const confidenceColor = (value: number) => {
  if (value >= 85) return "text-jade-600";
  if (value >= 70) return "text-emerald-600";
  if (value >= 60) return "text-amber-600";
  if (value >= 50) return "text-orange-600";
  return "text-red-600";
};

const StatPill: React.FC<{
  icon: IconName;
  label: string;
  value?: string | number | null;
}> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl bg-bg-muted px-3 py-2 text-sm text-text-primary">
      <Icon
        name={icon}
        size="sm"
        className="text-text-secondary"
        aria-hidden="true"
      />
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="font-medium text-text-primary">{value}</span>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{
  icon: IconName;
  label: string;
  colorClass: string;
  onClick?: () => void;
}> = ({ icon, label, colorClass, onClick }) => {
  if (!onClick) return null;
  return (
    <button
      type="button"
      className={`h-9 w-9 rounded-full ${colorClass} transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500 focus-visible:ring-offset-2 hover:scale-105 active:scale-95`}
      onClick={(event) => {
        event.stopPropagation();
        triggerHapticFeedback("light");
        onClick();
      }}
      aria-label={label}
    >
      <Icon name={icon} size="sm" className="text-current" aria-hidden="true" />
    </button>
  );
};

export interface PlayCardV2Props {
  play: Play;
  showOneWordCalls?: boolean;
  onEdit?: (play: Play) => void;
  onDuplicate?: (play: Play) => void;
  onEnterFullscreen?: (plays: Play[], playIndex: number) => void;
  onCreateDiagram?: (play: Play) => void;
  onAddToPracticeScript?: (play: Play) => void;
  onAddToGamePlan?: (play: Play) => void;
  onOpenAssignments?: (play: Play) => void;
  onPostToTeamBulletin?: (play: Play) => void;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  isSelected?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (playId: string) => void;
  directionDisplayFormat?: "full" | "abbrev" | "letter";
  allPlays?: Play[];
  isFocused?: boolean;
  searchQuery?: string;
  variant?: "list" | "tile";
  density?: "comfortable" | "compact";
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
  playTypeSuggestions?: string[];
  personnelSuggestions?: string[];
  personnelConfigurations?: PersonnelConfiguration[];
  onSave?: (playId: string, updates: Partial<Play>) => Promise<void>;
  existingPlays?: Play[];
}

export const PlayCardV2: React.FC<PlayCardV2Props> = React.memo(
  ({
    play,
    showOneWordCalls,
    onEdit,
    onDuplicate,
    onEnterFullscreen,
    onCreateDiagram,
    onAddToPracticeScript,
    onAddToGamePlan,
    onOpenAssignments,
    onPostToTeamBulletin,
    onSave,
    onSelectionChange,
    isSelected = false,
    isExpanded,
    onToggleExpand,
    directionDisplayFormat = "full",
    allPlays,
    isFocused,
    formationSuggestions,
    playNameSuggestions,
    playTypeSuggestions,
    personnelSuggestions,
    personnelConfigurations,
  }) => {
    const [expanded, setExpanded] = useState<boolean>(Boolean(isExpanded));
    const isMobile = useIsMobile();
    useEffect(() => {
      if (typeof isExpanded === "boolean") {
        setExpanded(isExpanded);
      }
    }, [isExpanded]);

    const legacy = useLegacyPlayCardFeatures({
      play,
      showOneWordCalls: Boolean(showOneWordCalls),
      directionDisplayFormat,
      onSave,
      formationSuggestions,
      playNameSuggestions,
      playTypeSuggestions,
      personnelSuggestions,
      personnelConfigurations,
    });

    const optimisticPlay = legacy.optimisticPlay;
    const displayName = legacy.displayName;
    const subtitleText = legacy.subtitleText;

    const playTypeStyle = useMemo(
      () => getPlayTypeStyle(optimisticPlay.p_type),
      [optimisticPlay.p_type]
    );

    const confidence = useMemo(
      () => clamp(optimisticPlay.confidence_base ?? 70),
      [optimisticPlay.confidence_base]
    );

    const confidenceStroke = useMemo(() => {
      const radius = 14;
      const circumference = 2 * Math.PI * radius;
      const filled = (confidence / 100) * circumference;
      return `${Math.round(filled)} ${Math.round(circumference)}`;
    }, [confidence]);

    const directionLabel = useMemo(() => {
      const dir = optimisticPlay.p_dir || optimisticPlay.f_dir;
      if (!dir) return null;
      if (directionDisplayFormat === "letter") return dir.charAt(0);
      if (directionDisplayFormat === "abbrev") return dir.slice(0, 3);
      return dir;
    }, [directionDisplayFormat, optimisticPlay.f_dir, optimisticPlay.p_dir]);

    const tags = useMemo(
      () =>
        Array.isArray(optimisticPlay.tags)
          ? optimisticPlay.tags.filter(Boolean)
          : [],
      [optimisticPlay.tags]
    );

    const diagramUrl =
      optimisticPlay.diagram_image_url ||
      (optimisticPlay as any).diagram_url ||
      undefined;

    const quickStats = useMemo(
      () =>
        [
          {
            icon: "users" as IconName,
            label: "Personnel",
            value: optimisticPlay.personnel,
          },
          {
            icon: "chevron-right" as IconName,
            label: "Direction",
            value: directionLabel,
          },
          {
            icon: "shield" as IconName,
            label: "Protection",
            value: optimisticPlay.protection,
          },
          {
            icon: "activity" as IconName,
            label: "Called",
            value: optimisticPlay.times_called
              ? `${optimisticPlay.times_called}x`
              : null,
          },
        ].filter((stat) => Boolean(stat.value)),
      [
        directionLabel,
        optimisticPlay.personnel,
        optimisticPlay.protection,
        optimisticPlay.times_called,
      ]
    );

    const handleHeaderKeyDown = (
      event: React.KeyboardEvent<HTMLDivElement>
    ) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleToggleExpand();
      }
    };

    const handleToggleExpand = () => {
      const next = !expanded;
      setExpanded(next);
      onToggleExpand?.(optimisticPlay.id);
      triggerHapticFeedback("selection");
    };

    const handleSelectChange = (selected: boolean) => {
      onSelectionChange?.(optimisticPlay.id, selected);
      triggerHapticFeedback("selection");
    };

    const handlePreviewClick = () => {
      if (onEnterFullscreen) {
        handleFullscreen();
        return;
      }

      if (onCreateDiagram) {
        onCreateDiagram(optimisticPlay);
      }
    };

    const handleFullscreen = () => {
      if (!onEnterFullscreen) return;
      const list =
        allPlays && allPlays.length > 0 ? allPlays : [optimisticPlay];
      const index = list.findIndex((p) => p.id === optimisticPlay.id);
      onEnterFullscreen(list, index >= 0 ? index : 0);
    };

    return (
      <PlayDiagramTooltip
        play={optimisticPlay}
        displayName={displayName}
        disabled={expanded || isMobile}
        hoverDelay={900}
        allPlays={allPlays || []}
        onEnterFullscreen={onEnterFullscreen}
      >
        <article
          className={`group relative overflow-hidden rounded-3xl border border-border bg-bg-surface/80 backdrop-blur-xl shadow-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl ${
            isFocused ? "ring-2 ring-jade-500 ring-offset-2" : ""
          } ${isSelected ? "outline outline-2 outline-offset-2 outline-jade-500" : ""}`}
          aria-pressed={expanded}
          aria-selected={isSelected}
        >
          <div
            className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${playTypeStyle.gradient}`}
            aria-hidden="true"
          />

          <div className="flex flex-col gap-4 p-4">
            <header
              className="flex items-start gap-3 cursor-pointer"
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
              onClick={handleToggleExpand}
              onKeyDown={handleHeaderKeyDown}
            >
              {onSelectionChange && (
                <div className="pt-1">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-md border-border bg-bg-surface text-jade-600 focus:ring-2 focus:ring-jade-500"
                    checked={isSelected}
                    onChange={(event) =>
                      handleSelectChange(event.target.checked)
                    }
                    onClick={(event) => event.stopPropagation()}
                    aria-label="Select play"
                  />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-mono text-lg font-semibold text-text-primary tracking-tight">
                    {displayName}
                  </h3>
                  {subtitleText && (
                    <span className="text-sm font-mono font-medium text-text-secondary truncate">
                      {subtitleText}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${playTypeStyle.badge}`}
                  >
                    {optimisticPlay.p_type || "Play"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">
                    {optimisticPlay.formation}
                  </span>
                  {directionLabel && <span>• {directionLabel}</span>}
                  {optimisticPlay.personnel && (
                    <span>• {optimisticPlay.personnel}</span>
                  )}
                  {optimisticPlay.one_word_play && !showOneWordCalls && (
                    <span className="rounded-md bg-bg-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
                      {optimisticPlay.one_word_play}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="relative h-16 w-16">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 36 36"
                    role="img"
                    aria-label={`Confidence ${confidence}%`}
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      className="stroke-border"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      className={confidenceColor(confidence)}
                      strokeWidth="3"
                      stroke="currentColor"
                      strokeDasharray={confidenceStroke}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
                    {confidence}
                  </span>
                </div>
              </div>
            </header>

            <BadgeRow
              play={optimisticPlay}
              isExpanded={expanded}
              personnelConfigurations={personnelConfigurations}
              phaseLabel={legacy.phaseLabel}
              getConfidenceColor={confidenceColor}
            />

            <div className="flex flex-wrap items-center gap-2">
              <ActionButton
                icon="edit"
                label="Edit play"
                colorClass="bg-jade-100 text-jade-700 hover:bg-jade-200"
                onClick={onEdit ? () => onEdit(optimisticPlay) : undefined}
              />
              <ActionButton
                icon="copy"
                label="Duplicate play"
                colorClass="bg-blue-100 text-blue-700 hover:bg-blue-200"
                onClick={
                  onDuplicate ? () => onDuplicate(optimisticPlay) : undefined
                }
              />
              <ActionButton
                icon="image"
                label="Open diagram"
                colorClass="bg-purple-100 text-purple-700 hover:bg-purple-200"
                onClick={
                  onCreateDiagram
                    ? () => onCreateDiagram(optimisticPlay)
                    : handleFullscreen
                }
              />
              <ActionButton
                icon="clipboard"
                label="Add to practice"
                colorClass="bg-amber-100 text-amber-700 hover:bg-amber-200"
                onClick={
                  onAddToPracticeScript
                    ? () => onAddToPracticeScript(optimisticPlay)
                    : undefined
                }
              />
              <ActionButton
                icon="target"
                label="Add to game plan"
                colorClass="bg-navy-100 text-navy-700 hover:bg-navy-200"
                onClick={
                  onAddToGamePlan
                    ? () => onAddToGamePlan(optimisticPlay)
                    : undefined
                }
              />
              <ActionButton
                icon="users"
                label="Assignments"
                colorClass="bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
                onClick={
                  onOpenAssignments
                    ? () => onOpenAssignments(optimisticPlay)
                    : undefined
                }
              />
              <ActionButton
                icon="message-circle"
                label="Post to team bulletin"
                colorClass="bg-pink-100 text-pink-700 hover:bg-pink-200"
                onClick={
                  onPostToTeamBulletin
                    ? () => onPostToTeamBulletin(optimisticPlay)
                    : undefined
                }
              />
            </div>

            {diagramUrl && (
              <div className="relative">
                <button
                  type="button"
                  className="group relative w-full overflow-hidden rounded-2xl border border-border bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500 focus-visible:ring-offset-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePreviewClick();
                  }}
                  aria-label="Open play diagram preview"
                >
                  <img
                    src={diagramUrl}
                    alt="Play diagram"
                    className="h-44 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-surface/40 via-transparent to-transparent transition duration-200 group-hover:from-bg-surface/60"
                    aria-hidden="true"
                  />
                  <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-bg-surface px-3 py-1 text-xs font-semibold text-text-primary shadow-md">
                    <Icon
                      name="maximize"
                      size="sm"
                      className="text-text-secondary"
                      aria-hidden="true"
                    />
                    <span>Fullscreen preview</span>
                  </div>
                </button>
              </div>
            )}

            {expanded && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {quickStats.map((stat) => (
                    <StatPill
                      key={stat.label}
                      icon={stat.icon}
                      label={stat.label}
                      value={stat.value}
                    />
                  ))}
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 8).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-bg-muted px-3 py-1 text-xs font-medium text-text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2">{legacy.details}</div>
              </div>
            )}

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl bg-bg-muted px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500 focus-visible:ring-offset-2"
              onClick={(event) => {
                event.stopPropagation();
                handleToggleExpand();
              }}
              aria-expanded={expanded}
            >
              <span>{expanded ? "Hide details" : "Show details"}</span>
              <Icon
                name={expanded ? "chevron-up" : "chevron-down"}
                size="sm"
                className="text-text-secondary"
                aria-hidden="true"
              />
            </button>
          </div>
        </article>
      </PlayDiagramTooltip>
    );
  }
);

PlayCardV2.displayName = "PlayCardV2";
