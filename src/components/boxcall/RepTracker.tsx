/**
 * RepTracker Component
 * Visual rep counter with quick result buttons + optional notes (Phase 12.1)
 *
 * Modernized Dec 2025: Premium visual design with gradients
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (emerald-*, jade-*, slate-*)
 * - Visual polish (shadows, button states)
 * These are design choices that don't need dark mode variants.
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */
/* eslint-disable max-lines-per-function */

import React, { useEffect, useState, useCallback } from "react";
import { Icon } from "../ui/Icon/Icon";
import type { ExecutionResult } from "../../types/session";

interface RepTrackerProps {
  currentRep: number;
  totalReps: number;
  onResult: (result: ExecutionResult, notes?: string, tags?: string[]) => void;
  onSkip: () => void;
  onGoToRep?: (repNumber: number) => void; // New: navigate to specific rep
  repHistory?: Map<number, { result: ExecutionResult; notes?: string }>; // New: history
  disabled?: boolean;
  className?: string;
}

/**
 * RepTracker - Visual rep counter with keyboard shortcuts
 *
 * Keyboard shortcuts:
 * - S: Success
 * - F: Failure
 * - N: Neutral
 * - K: Skip
 */
export const RepTracker: React.FC<RepTrackerProps> = ({
  currentRep,
  totalReps,
  onResult,
  onSkip,
  onGoToRep,
  repHistory = new Map(),
  disabled = false,
  className = "",
}) => {
  // Phase 12.1: Optional notes and tags
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Common quick tags for practice reps
  const quickTags = [
    { id: "perfect-execution", label: "Perfect", icon: "star" },
    { id: "great-blocking", label: "Great Blocking", icon: "shield" },
    { id: "good-timing", label: "Good Timing", icon: "clock" },
    {
      id: "missed-assignment",
      label: "Missed Assignment",
      icon: "alert-circle",
    },
    { id: "wrong-route", label: "Wrong Route", icon: "map" },
    { id: "good-protection", label: "Good Protection", icon: "shield-check" },
  ];

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleResult = useCallback(
    (result: ExecutionResult) => {
      onResult(
        result,
        notes || undefined,
        selectedTags.length > 0 ? selectedTags : undefined
      );
      // Reset notes for next rep
      setNotes("");
      setSelectedTags([]);
      setShowNotes(false);
    },
    [onResult, notes, selectedTags]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (disabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "s":
          handleResult("success");
          break;
        case "f":
          handleResult("failure");
          break;
        case "n":
          handleResult("neutral");
          break;
        case "k":
          onSkip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [disabled, handleResult, onSkip]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rep Counter - Modern Visual Display */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500 text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
            <Icon name="repeat" size="sm" className="text-jade-500" />
            Rep Progress
          </span>
          <span className="text-2xl font-black">
            <span className="text-jade-600">{currentRep}</span>
            <span className="text-slate-400 font-semibold"> / {totalReps}</span>
          </span>
        </div>

        {/* Rep Dots - Modern pill design with history */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalReps }, (_, i) => {
            const repNumber = i + 1;
            const historyEntry = repHistory.get(repNumber);
            const hasResult = !!historyEntry;
            const isCurrent = repNumber === currentRep;

            // Determine color based on result
            const getResultStyle = () => {
              if (!hasResult) {
                if (isCurrent) {
                  // Current rep without result: white background (blue border via rep-current class)
                  return "bg-white text-slate-700 font-bold";
                }
                return "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600";
              }

              // Has a result - show the result color
              const currentScale = isCurrent ? "" : "hover:scale-105"; // rep-current handles scale

              switch (historyEntry.result) {
                case "success":
                  return `bg-gradient-to-br from-emerald-500 to-green-600 text-white ${currentScale}`;
                case "failure":
                  return `bg-gradient-to-br from-red-500 to-rose-600 text-white ${currentScale}`;
                case "neutral":
                  return `bg-gradient-to-br from-slate-400 to-slate-500 text-white ${currentScale}`;
                case "skipped":
                  return `bg-gradient-to-br from-amber-400 to-orange-500 text-white ${currentScale}`;
                default:
                  return "bg-slate-100 text-slate-400";
              }
            };

            const getIcon = () => {
              if (!hasResult) return repNumber;
              switch (historyEntry.result) {
                case "success":
                  return <Icon name="check" size="sm" />;
                case "failure":
                  return <Icon name="x" size="sm" />;
                case "neutral":
                  return <Icon name="minus" size="sm" />;
                case "skipped":
                  return <Icon name="skip-forward" size="sm" />;
                default:
                  return repNumber;
              }
            };

            // Determine cursor style based on state
            const getCursorStyle = () => {
              if (disabled) return "opacity-50 cursor-not-allowed";
              if (onGoToRep) return "cursor-pointer";
              return "cursor-default";
            };

            return (
              <button
                key={repNumber}
                onClick={() => onGoToRep?.(repNumber)}
                disabled={disabled || !onGoToRep}
                title={
                  hasResult
                    ? `Rep ${repNumber}: ${historyEntry.result}${historyEntry.notes ? ` - ${historyEntry.notes}` : ""} (click to edit)`
                    : `Rep ${repNumber}`
                }
                className={`
                  w-11 h-11 rounded-2xl flex items-center justify-center
                  font-bold text-sm transition-all duration-300 shadow-sm
                  ${getResultStyle()}
                  ${isCurrent ? "rep-current" : ""}
                  ${getCursorStyle()}
                `}
                aria-label={`Rep ${repNumber}${hasResult ? ` - ${historyEntry.result}` : ""}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {getIcon()}
              </button>
            );
          })}
        </div>

        {/* Legend for rep colors */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white border-2 border-blue-500"></span>
            Current
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-emerald-400 to-green-500"></span>
            Success
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-red-400 to-rose-500"></span>
            Failure
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-slate-300 to-slate-400"></span>
            Neutral
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-amber-300 to-orange-400"></span>
            Skipped
          </span>
        </div>
      </div>

      {/* Optional Notes Section - Phase 12.1 */}
      {showNotes && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-primary font-semibold text-sm flex items-center gap-2">
              <Icon name="edit" size="sm" className="text-jade-500" />
              Add Notes
            </span>
            <button
              onClick={() => setShowNotes(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Icon name="x-circle" size="sm" />
            </button>
          </div>

          {/* Quick Tags */}
          <div>
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-3 block">
              Quick Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      px-3.5 py-2 rounded-xl text-xs font-semibold
                      border-2 transition-all duration-200 shadow-sm
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-jade-500 to-emerald-600 text-white border-jade-500 shadow-jade-500/25"
                          : "bg-white border-slate-200 text-slate-600 hover:border-jade-400 hover:text-jade-600"
                      }
                    `}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Textarea */}
          <div>
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2 block">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., QB made great read, RB stumbled at the line..."
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl
                text-sm text-primary placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-jade-500/30 focus:border-jade-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Quick Result Buttons - Hero Buttons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500 text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
            <Icon name="zap" size="sm" className="text-amber-500" />
            Quick Result
          </span>
          {!showNotes && (
            <button
              onClick={() => setShowNotes(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-jade-600 hover:text-jade-500 transition-colors"
            >
              <Icon name="edit" size="sm" />
              Add Note
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Success Button - Premium gradient design */}
          <button
            onClick={() => handleResult("success")}
            disabled={disabled}
            className={`
              relative h-28 rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden
              bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 
              hover:from-emerald-400 hover:via-emerald-500 hover:to-green-500
              text-white font-bold shadow-xl shadow-emerald-500/40
              transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/50
              active:scale-[0.98] group
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon name="check-circle" size="lg" className="drop-shadow-md" />
            <span className="text-xl font-black tracking-wide drop-shadow-sm">
              SUCCESS
            </span>
            <span className="text-xs opacity-80 font-medium bg-white/20 px-2.5 py-0.5 rounded-full">
              Press S
            </span>
          </button>

          {/* Failure Button - Premium gradient design */}
          <button
            onClick={() => handleResult("failure")}
            disabled={disabled}
            className={`
              relative h-28 rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden
              bg-gradient-to-br from-red-500 via-red-600 to-rose-600 
              hover:from-red-400 hover:via-red-500 hover:to-rose-500
              text-white font-bold shadow-xl shadow-red-500/40
              transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/50
              active:scale-[0.98] group
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon name="x-circle" size="lg" className="drop-shadow-md" />
            <span className="text-xl font-black tracking-wide drop-shadow-sm">
              FAILURE
            </span>
            <span className="text-xs opacity-80 font-medium bg-white/20 px-2.5 py-0.5 rounded-full">
              Press F
            </span>
          </button>

          {/* Neutral Button - Refined design */}
          <button
            onClick={() => handleResult("neutral")}
            disabled={disabled}
            className={`
              relative h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 overflow-hidden
              bg-gradient-to-br from-slate-100 to-slate-200 
              hover:from-slate-50 hover:to-slate-100
              border-2 border-slate-300 hover:border-slate-400
              text-slate-600 font-semibold
              transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
              active:scale-[0.98] group
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <Icon
              name="minus-circle"
              size="md"
              className="text-slate-500 group-hover:text-slate-600"
            />
            <span className="font-bold text-slate-700">Neutral</span>
            <span className="text-xs text-slate-400 font-medium">Press N</span>
          </button>

          {/* Skip Button - Subtle design */}
          <button
            onClick={onSkip}
            disabled={disabled}
            className={`
              relative h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 overflow-hidden
              bg-white hover:bg-slate-50
              border-2 border-slate-200 hover:border-slate-300
              text-slate-500 font-semibold
              transition-all duration-300 hover:scale-[1.02] hover:shadow-md
              active:scale-[0.98] group
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <Icon
              name="skip-forward"
              size="md"
              className="text-slate-400 group-hover:text-slate-500"
            />
            <span className="font-bold text-slate-600">Skip</span>
            <span className="text-xs text-slate-400 font-medium">Press K</span>
          </button>
        </div>
      </div>

      {/* Help Text - Compact and modern */}
      <div className="bg-gradient-to-r from-jade-50 to-emerald-50 border border-jade-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <Icon name="info" size="sm" className="text-white" />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            <span className="text-emerald-700 font-semibold">Success</span> =
            Rep executed well ·
            <span className="text-red-600 font-semibold"> Failure</span> = Rep
            didn't work ·
            <span className="text-slate-600 font-semibold"> Neutral</span> =
            Mediocre ·
            <span className="text-slate-500 font-semibold"> Skip</span> = Player
            absent
          </p>
        </div>
      </div>
    </div>
  );
};
