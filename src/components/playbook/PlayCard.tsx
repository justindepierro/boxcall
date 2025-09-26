import React, { useState } from "react";
import { Typography } from "../design-system/Typography";
import Icon from "../ui/Icon/Icon";
import type { Play as PlayType } from "../../types/play";
import { getDisplayName, getSubtitleText } from "../../utils/playNameUtils";
import {
  getPlayFlags,
  addFlag,
  removeFlag,
  POSITION_OPTIONS,
  type PlayFlags,
} from "../../utils/localPlayFlags";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button/Button";
import { INSTALL_PHASES, type InstallPhase } from "../../types/play";
interface PlayCardProps {
  play: PlayType;
  showOneWordCalls?: boolean;
  onEdit?: (play: PlayType) => void;
  onDuplicate?: (play: PlayType) => void;
  onCreateDiagram?: (play: PlayType) => void;
  onAddToPracticeScript?: (play: PlayType) => void;
  onAddToGamePlan?: (play: PlayType) => void;
  // Bulk Operations
  isSelected?: boolean;
  onSelectionChange?: (playId: string, selected: boolean) => void;
  density?: "comfortable" | "compact";
}
export const PlayCard: React.FC<PlayCardProps> = ({
  play,
  showOneWordCalls = false,
  onEdit,
  onDuplicate,
  onCreateDiagram,
  onAddToPracticeScript,
  onAddToGamePlan,
  // Bulk Operations
  isSelected = false,
  onSelectionChange,
  density = "comfortable",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompact = density === "compact";
  const getPlayTypeColor = (type: string) => {
    switch (type) {
      case "Pass":
        // Electric purple background with white text for high contrast
        return "bg-electric-600 text-white";
      case "Run":
        // Jade green background with white text for high contrast
        return "bg-jade-600 text-white";
      case "RPO":
        // Navy background with light text for professional look
        return "bg-navy-700 text-white";
      case "Play Action":
        // Amber background with dark text for good contrast
        return "bg-warning-500 text-gray-900";
      default:
        // Neutral gray with good contrast
        return "bg-gray-600 text-white";
    }
  };
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85)
      return "text-white bg-jade-600 px-1.5 py-0.5 rounded font-semibold"; // High confidence - dark jade bg
    if (confidence >= 70)
      return "text-jade-800 bg-jade-100 px-1.5 py-0.5 rounded font-medium"; // Good confidence - light jade bg
    if (confidence >= 60)
      return "text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-medium"; // Medium confidence - light amber bg
    if (confidence >= 50)
      return "text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded font-medium"; // Low-medium confidence - light orange bg
    return "text-white bg-red-600 px-1.5 py-0.5 rounded font-semibold"; // Low confidence - red bg
  };
  const phaseLabel = ((): string | null => {
    if (!play.install_phase) return null;
    const value = play.install_phase as string;
    const isPhase = (val: string): val is InstallPhase =>
      (INSTALL_PHASES as readonly string[]).includes(val);
    if (!isPhase(value)) return null;
    return value
      .replace("install", "Install ")
      .replace("gameplan", "Game Plan")
      .replace("situational", "Situational");
  })();
  const handleCreateDiagram = () => {
    if (onCreateDiagram) {
      onCreateDiagram(play);
    }
  };
  const displayName = getDisplayName(play, showOneWordCalls);
  const subtitleText = getSubtitleText(play, showOneWordCalls);
  const [flags, setFlags] = useState<PlayFlags>(() => getPlayFlags(play.id));
  const [newFlag, setNewFlag] = useState("");
  const [newPlayer, setNewPlayer] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [showTagsEditor, setShowTagsEditor] = useState(false);
  return (
    <>
      <div
        className={`surface-card rounded-lg border transition-colors shadow-sm ${
          isSelected
            ? "border-text-accent ring-2 ring-surface-info"
            : "border-subtle hover:border-border-light"
        } ${isCompact ? "text-[13px]" : ""}`}
      >
        <div className={isCompact ? "p-3 sm:p-4" : "p-4 sm:p-6"}>
          {play.diagram_url && (
            <div className="mb-3 -mt-1">
              <img
                src={play.diagram_url}
                alt={`${displayName} diagram preview`}
                className="w-full h-40 object-cover rounded-md border border-subtle"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          {/* Collapsed/Skinny Mode */}
          <div className="flex items-center justify-between">
            {/* Selection Checkbox: always available for quick selection */}
            <div className="flex items-center mr-3">
              <input
                type="checkbox"
                checked={Boolean(isSelected)}
                onChange={(e) => onSelectionChange?.(play.id, e.target.checked)}
                className="rounded border-border text-text-info focus:ring-text-accent"
                title="Select play"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title bar: Primary + small secondary on one line when space allows */}
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
              {/* Badges row */}
              <div
                className={`flex flex-wrap items-center gap-2 ${
                  isCompact ? "mt-1" : "mt-2"
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getPlayTypeColor(play.p_type)}`}
                >
                  {play.p_type}
                </span>
                {play.f_type && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-[11px] font-medium">
                    {play.f_type}
                  </span>
                )}
                {phaseLabel && (
                  <span className="px-2 py-0.5 bg-warning-500 text-gray-900 rounded-full text-[10px] font-semibold tracking-wide uppercase border border-warning-600">
                    {phaseLabel}
                  </span>
                )}
                <span
                  className={`text-xs font-medium ${getConfidenceColor(play.confidence_base)}`}
                >
                  {play.confidence_base}%
                </span>
              </div>
            </div>
            {/* Action Buttons - Mobile Touch-Optimized */}
            <div className="flex items-center space-x-1 ml-4">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
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
                className={`p-3 !h-auto ${isCompact ? "min-w-[40px] min-h-[40px]" : "min-w-[48px] min-h-[48px]"}`}
              />
              <Button
                onClick={() => onEdit?.(play)}
                variant="ghost"
                size="sm"
                icon={<Icon name="edit" className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Edit play"
                title="Edit play"
                className={`p-3 !h-auto ${isCompact ? "min-w-[40px] min-h-[40px]" : "min-w-[48px] min-h-[48px]"}`}
              />
              <Button
                onClick={() => onDuplicate?.(play)}
                variant="ghost"
                size="sm"
                icon={<Icon name="copy" className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Duplicate play"
                title="Duplicate play"
                className={`p-3 !h-auto ${isCompact ? "min-w-[40px] min-h-[40px]" : "min-w-[48px] min-h-[48px]"}`}
              />
              <Button
                onClick={handleCreateDiagram}
                variant="ghost"
                size="sm"
                icon={<Icon name="image" className="h-5 w-5" />}
                iconPosition="only"
                aria-label="Create diagram"
                title="Create diagram"
                className={`p-3 !h-auto ${isCompact ? "min-w-[40px] min-h-[40px]" : "min-w-[48px] min-h-[48px]"}`}
              />
            </div>
          </div>
          {/* Expanded Details */}
          {isExpanded && (
            <div
              id={`play-details-${play.id}`}
              className="mt-4 pt-4 border-t border-subtle space-y-4"
              role="region"
              aria-label={`Details for ${displayName}`}
            >
              {/* Overview bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getPlayTypeColor(play.p_type)}`}
                >
                  {play.p_type}
                </span>
                {play.personnel && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-[11px] font-medium">
                    Personnel: {play.personnel}
                  </span>
                )}
                {phaseLabel && (
                  <span className="px-2 py-0.5 bg-warning-500 text-gray-900 rounded-full text-[10px] font-semibold uppercase border border-warning-600">
                    {phaseLabel}
                  </span>
                )}
                {play.one_word_play && !showOneWordCalls && (
                  <span className="px-2 py-0.5 bg-electric-100 text-electric-800 border border-electric-200 rounded-full text-[11px] font-medium">
                    Code: {play.one_word_play.toUpperCase()}
                  </span>
                )}
                <span
                  className={`ml-auto text-xs font-medium ${getConfidenceColor(play.confidence_base)}`}
                >
                  Confidence {play.confidence_base}%
                </span>
              </div>

              {/* Main details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formation */}
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary flex items-center mb-2"
                  >
                    <Icon name="target" className="h-4 w-4 mr-1" /> Formation
                  </Typography>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-secondary">Base</dt>
                      <dd className="text-text-primary">{play.formation}</dd>
                    </div>
                    {play.f_type && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Type</dt>
                        <dd className="text-text-primary">{play.f_type}</dd>
                      </div>
                    )}
                    {play.f_dir && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Direction</dt>
                        <dd className="text-text-primary">{play.f_dir}</dd>
                      </div>
                    )}
                    {play.back_align && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Back Align</dt>
                        <dd className="text-text-primary">{play.back_align}</dd>
                      </div>
                    )}
                    {play.shift && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Shift</dt>
                        <dd className="text-text-primary">{play.shift}</dd>
                      </div>
                    )}
                    {play.motion && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Motion</dt>
                        <dd className="text-text-primary">{play.motion}</dd>
                      </div>
                    )}
                    {(play.ftag1 || play.ftag2) && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Tags</dt>
                        <dd className="text-text-primary">
                          {[play.ftag1, play.ftag2].filter(Boolean).join(", ")}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Play details */}
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary flex items-center mb-2"
                  >
                    <Icon name="hash" className="h-4 w-4 mr-1" /> Play Details
                  </Typography>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-secondary">Core</dt>
                      <dd className="text-text-primary">{play.play_name}</dd>
                    </div>
                    {play.protection && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Protection</dt>
                        <dd className="text-text-primary">{play.protection}</dd>
                      </div>
                    )}
                    {play.p_dir && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Direction</dt>
                        <dd className="text-text-primary">{play.p_dir}</dd>
                      </div>
                    )}
                    {(play.r_str || play.p_str) && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Strength</dt>
                        <dd className="text-text-primary">
                          {[play.r_str, play.p_str].filter(Boolean).join(", ")}
                        </dd>
                      </div>
                    )}
                    {(play.p_tag1 || play.p_tag2) && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Tags</dt>
                        <dd className="text-text-primary">
                          {[play.p_tag1, play.p_tag2]
                            .filter(Boolean)
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                    {(play.check_into ||
                      play.key_player1 ||
                      play.key_player2) && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Keys</dt>
                        <dd className="text-text-primary">
                          {[play.check_into, play.key_player1, play.key_player2]
                            .filter(Boolean)
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Preferences */}
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary flex items-center mb-2"
                  >
                    Preferences
                  </Typography>
                  <dl className="space-y-1 text-sm">
                    {play.pref_down && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Down</dt>
                        <dd className="text-text-primary">{play.pref_down}</dd>
                      </div>
                    )}
                    {play.pref_dis && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Distance</dt>
                        <dd className="text-text-primary">{play.pref_dis}</dd>
                      </div>
                    )}
                    {play.pref_hash && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Hash</dt>
                        <dd className="text-text-primary">{play.pref_hash}</dd>
                      </div>
                    )}
                    {play.pref_cov && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Coverage</dt>
                        <dd className="text-text-primary">{play.pref_cov}</dd>
                      </div>
                    )}
                    {play.pref_front && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Front</dt>
                        <dd className="text-text-primary">{play.pref_front}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Usage & Stats */}
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary flex items-center mb-2"
                  >
                    <Icon name="clock" className="h-4 w-4 mr-1" /> Usage & Stats
                  </Typography>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-secondary">Times Called</dt>
                      <dd className="text-text-primary">{play.times_called}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-secondary">Times Successful</dt>
                      <dd className="text-text-primary">
                        {play.times_successful}
                      </dd>
                    </div>
                    {play.last_used_at && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-secondary">Last Used</dt>
                        <dd className="text-text-primary">
                          {new Date(play.last_used_at).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Notes */}
              {play.notes && (
                <div className="surface-subtle rounded-md p-3">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary mb-1"
                  >
                    Notes
                  </Typography>
                  <p className="text-sm text-text-primary whitespace-pre-line">
                    {play.notes}
                  </p>
                </div>
              )}

              {/* Tags & Roles (summary + editor) */}
              <div className="surface-subtle rounded-md p-3">
                <div className="flex items-center justify-between">
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary"
                  >
                    Tags & Roles
                  </Typography>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setShowTagsEditor((s) => !s)}
                    aria-expanded={showTagsEditor}
                  >
                    {showTagsEditor ? "Hide" : "Edit"}
                  </Button>
                </div>
                {/* Summary chips */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    ...flags.positions.map((x) => `Position:${x}`),
                    ...flags.players.map((x) => `Player:${x}`),
                    ...flags.flags.map((x) => `Flag:${x}`),
                  ]
                    .slice(0, 8)
                    .map((chip) => (
                      <span
                        key={chip}
                        className="px-2 py-0.5 text-[11px] rounded bg-surface-secondary text-text-primary"
                      >
                        {chip}
                      </span>
                    ))}
                  {flags.positions.length +
                    flags.players.length +
                    flags.flags.length >
                    8 && (
                    <span className="text-xs text-text-secondary">
                      +
                      {flags.positions.length +
                        flags.players.length +
                        flags.flags.length -
                        8}{" "}
                      more
                    </span>
                  )}
                </div>
                {showTagsEditor && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Positions */}
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Positions
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {flags.positions.map((pos) => (
                          <Button
                            key={pos}
                            size="xs"
                            variant="subtle"
                            className="!h-auto px-2 py-0.5 text-[11px]"
                            onClick={() =>
                              setFlags(removeFlag(play.id, "positions", pos))
                            }
                            title="Remove"
                          >
                            {pos} ×
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={newPosition}
                          onChange={(e) => setNewPosition(e.target.value)}
                          className="border-subtle rounded px-2 py-1 text-xs"
                        >
                          <option value="">Select…</option>
                          {POSITION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            if (!newPosition) return;
                            const next = addFlag(
                              play.id,
                              "positions",
                              newPosition
                            );
                            setFlags(next);
                            setNewPosition("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    {/* Players */}
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Players
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {flags.players.map((pl) => (
                          <Button
                            key={pl}
                            size="xs"
                            variant="subtle"
                            className="!h-auto px-2 py-0.5 text-[11px]"
                            onClick={() =>
                              setFlags(removeFlag(play.id, "players", pl))
                            }
                            title="Remove"
                          >
                            {pl} ×
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={newPlayer}
                          onChange={(e) => setNewPlayer(e.target.value)}
                          placeholder="Add player (e.g., Z, WR1)"
                          className="border-subtle rounded px-2 py-1 text-xs flex-1"
                        />
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            if (!newPlayer.trim()) return;
                            const next = addFlag(
                              play.id,
                              "players",
                              newPlayer.trim()
                            );
                            setFlags(next);
                            setNewPlayer("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    {/* Flags */}
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Flags
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {flags.flags.map((fl) => (
                          <Button
                            key={fl}
                            size="xs"
                            variant="subtle"
                            className="!h-auto px-2 py-0.5 text-[11px]"
                            onClick={() =>
                              setFlags(removeFlag(play.id, "flags", fl))
                            }
                            title="Remove"
                          >
                            {fl} ×
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={newFlag}
                          onChange={(e) => setNewFlag(e.target.value)}
                          placeholder="Add flag (e.g., Red Zone, 3rd&Short)"
                          className="border-subtle rounded px-2 py-1 text-xs flex-1"
                        />
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            if (!newFlag.trim()) return;
                            const next = addFlag(
                              play.id,
                              "flags",
                              newFlag.trim()
                            );
                            setFlags(next);
                            setNewFlag("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Workflow actions */}
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="label-lg"
                    as="h4"
                    className="text-text-primary mb-1"
                  >
                    Add to Workflow
                  </Typography>
                  <p className="text-xs text-text-secondary">
                    Build practice scripts and game plans from this play
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onAddToPracticeScript?.(play)}
                    title="Add this play to a practice script"
                    className="surface-subtle hover:bg-surface-info text-text-info border-surface-primary"
                  >
                    <Icon name="calendar" className="h-3 w-3 mr-1" /> Practice
                    Script
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onAddToGamePlan?.(play)}
                    title="Add this play to a game plan"
                    className="surface-subtle hover:bg-surface-success text-text-success border-surface-primary"
                  >
                    <Icon name="gamepad-2" className="h-3 w-3 mr-1" /> Game Plan
                  </Button>
                  <Badge variant="premium" size="sm">
                    Week 3
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Legacy VisualPlayBuilder modal removed (always-on V2 route). */}
    </>
  );
};
