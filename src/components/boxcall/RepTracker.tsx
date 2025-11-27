/**
 * RepTracker Component
 * Visual rep counter with quick result buttons + optional notes (Phase 12.1)
 */

import React, { useEffect, useState, useCallback } from "react";
import { Typography } from "../design-system";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import type { ExecutionResult } from "../../types/session";

interface RepTrackerProps {
  currentRep: number;
  totalReps: number;
  onResult: (result: ExecutionResult, notes?: string, tags?: string[]) => void;
  onSkip: () => void;
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
      {/* Rep Counter Dots */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Typography variant="body-sm" className="text-secondary">
            Rep Progress
          </Typography>
          <Typography variant="body-sm" className="font-medium">
            {currentRep} / {totalReps}
          </Typography>
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalReps }, (_, i) => {
            const repNumber = i + 1;
            const isCompleted = repNumber < currentRep;
            const isCurrent = repNumber === currentRep;

            return (
              <button
                key={repNumber}
                onClick={() => {
                  // Allow clicking to jump to a specific rep (future enhancement)
                  // For now, just visual indicator
                }}
                disabled={disabled}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  border-2 transition-all
                  ${
                    isCompleted
                      ? "bg-success border-success text-white"
                      : isCurrent
                        ? "bg-primary border-primary text-white ring-2 ring-primary/30"
                        : "bg-surface-secondary border-border text-muted hover:border-primary/50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                aria-label={`Rep ${repNumber}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <Typography
                  variant="body-sm"
                  className={`font-medium ${isCompleted ? "line-through" : ""}`}
                >
                  {repNumber}
                </Typography>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Notes Section - Phase 12.1 */}
      {showNotes && (
        <div className="bg-surface-secondary border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="body-sm" className="font-medium">
              Add Notes (Optional)
            </Typography>
            <button
              onClick={() => setShowNotes(false)}
              className="text-muted hover:text-primary"
            >
              <Icon name="x-circle" size="sm" />
            </button>
          </div>

          {/* Quick Tags */}
          <div>
            <Typography variant="body-xs" className="text-muted mb-2">
              Quick Tags
            </Typography>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium
                      border transition-all
                      ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-surface-primary border-border text-secondary hover:border-primary/50"
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
            <Typography variant="body-xs" className="text-muted mb-2">
              Notes
            </Typography>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., QB made great read, RB stumbled at the line..."
              rows={3}
              className="w-full px-3 py-2 bg-surface-primary border border-border rounded-lg
                text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* Quick Result Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Typography variant="body-sm" className="text-secondary">
            Quick Result (or use keyboard: S/F/N/K)
          </Typography>
          {!showNotes && (
            <button
              onClick={() => setShowNotes(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Icon name="edit" size="sm" />
              Add Note
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Success Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleResult("success")}
            disabled={disabled}
            className="h-20 bg-success hover:bg-success/90 border-success"
          >
            <div className="flex flex-col items-center gap-2">
              <Icon name="check-circle" size="lg" />
              <div>
                <Typography variant="body-md" className="font-semibold">
                  Success
                </Typography>
                <Typography variant="body-xs" className="opacity-80">
                  Press S
                </Typography>
              </div>
            </div>
          </Button>

          {/* Failure Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleResult("failure")}
            disabled={disabled}
            className="h-20 bg-error hover:bg-error/90 border-error"
          >
            <div className="flex flex-col items-center gap-2">
              <Icon name="x-circle" size="lg" />
              <div>
                <Typography variant="body-md" className="font-semibold">
                  Failure
                </Typography>
                <Typography variant="body-xs" className="opacity-80">
                  Press F
                </Typography>
              </div>
            </div>
          </Button>

          {/* Neutral Button */}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleResult("neutral")}
            disabled={disabled}
            className="h-20"
          >
            <div className="flex flex-col items-center gap-2">
              <Icon name="minus-circle" size="lg" />
              <div>
                <Typography variant="body-md" className="font-semibold">
                  Neutral
                </Typography>
                <Typography variant="body-xs" className="text-muted">
                  Press N
                </Typography>
              </div>
            </div>
          </Button>

          {/* Skip Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={onSkip}
            disabled={disabled}
            className="h-20 border-2 border-border hover:border-primary/50"
          >
            <div className="flex flex-col items-center gap-2">
              <Icon name="skip-forward" size="lg" />
              <div>
                <Typography variant="body-md" className="font-semibold">
                  Skip
                </Typography>
                <Typography variant="body-xs" className="text-muted">
                  Press K
                </Typography>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-surface-secondary border border-border rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Icon name="info" size="sm" className="text-primary mt-0.5" />
          <Typography variant="body-xs" className="text-secondary">
            <strong>Success:</strong> Rep executed well
            <br />
            <strong>Failure:</strong> Rep did not work
            <br />
            <strong>Neutral:</strong> Mediocre execution
            <br />
            <strong>Skip:</strong> Player absent/injured
          </Typography>
        </div>
      </div>
    </div>
  );
};
