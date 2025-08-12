import { Typography } from "../../design-system/Typography";
/**
 * Core Play Builder - Main container component
 * Database-aligned with clean architecture
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Save } from "lucide-react";
import { Button } from "../../ui/Button";
import type { Play } from "../../../types/play";
import { PlayBuilderForm } from "./PlayBuilderForm";
import { PlayBuilderPreview } from "./PlayBuilderPreview";
import { QuickEntry } from "./QuickEntry";
// Explicit normalization to guarantee consistency BEFORE hitting service layer
import {
  normalizePlayName,
  normalizeText,
  normalizeFormation,
} from "../../../utils/textNormalization";
import { PlaysService } from "../../../services/playsService";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";

interface PlayBuilderCoreProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (play: Partial<Play>) => void;
  initialPlay?: Partial<Play>;
}

// Local storage key helper (single draft for now; future: key by user/team)
const DRAFT_STORAGE_KEY = "bc_playbuilder_draft_v1";

export const PlayBuilderCore: React.FC<PlayBuilderCoreProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlay = {},
}) => {
  // Database-aligned play state (only valid fields)
  const [playData, setPlayData] = useState<Partial<Play>>({
    // Core required fields
    play_name: initialPlay.play_name || "",
    p_type: initialPlay.p_type || "Pass",
    formation: initialPlay.formation || "",

    // Optional database fields
    one_word_play: initialPlay.one_word_play || "",
    notes: initialPlay.notes || "",
    personnel: initialPlay.personnel || "",
    f_type: initialPlay.f_type || "",
    f_dir: initialPlay.f_dir || "",
    protection: initialPlay.protection || "",

    // Performance metrics
    confidence_base: initialPlay.confidence_base || 70,
    times_called: initialPlay.times_called || 0,
    times_successful: initialPlay.times_successful || 0,
    complexity_score: initialPlay.complexity_score || 1,

    // Metadata
    is_archived: initialPlay.is_archived || false,
  });

  const [isQuickEntryVisible, setIsQuickEntryVisible] = useState(false);
  const [existingNames, setExistingNames] = useState<Set<string>>(new Set());
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [lastAutosave, setLastAutosave] = useState<number | null>(null);
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);

  // --- Draft Persistence Helpers ---
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data: Partial<Play>; ts: number };
      return parsed;
    } catch {
      return null;
    }
  };
  const persistDraft = (data: Partial<Play>) => {
    try {
      const payload = JSON.stringify({ data, ts: Date.now() });
      localStorage.setItem(DRAFT_STORAGE_KEY, payload);
      setLastAutosave(Date.now());
  telemetry.enqueue({ 
        type: TelemetryEventTypes.PlayDraftAutosave,
        data: { fields: Object.keys(data).length },
      });
    } catch {
      // ignore quota / private mode errors
    }
  };
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      telemetry.enqueue({ type: TelemetryEventTypes.PlayDraftClear });
    } catch {
      /* noop */
    }
  };

  // When modal opens, attempt to load draft if not editing an existing play
  useEffect(() => {
    if (!isOpen) return;
    if (initialPlay?.id) return; // editing existing play: skip draft restore
    const draft = loadDraft();
    if (draft && draft.data) {
      setPlayData((prev) => ({ ...prev, ...draft.data }));
      setRestoredFromDraft(true);
      setLastAutosave(draft.ts);
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDraftRestore,
        data: { ageMs: Date.now() - draft.ts },
      });
    } else {
      setRestoredFromDraft(false);
    }
  }, [isOpen, initialPlay?.id]);

  // Track changes to playData to schedule autosave
  useEffect(() => {
    if (!isOpen) return;
    dirtyRef.current = true;
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(() => {
      if (dirtyRef.current) {
        // Minimal validation before autosave: only save if at least one field has content
        const hasContent = Object.values(playData).some(
          (v) => typeof v === "string" ? v.trim().length > 0 : v !== undefined
        );
        if (hasContent) {
          persistDraft(playData);
          dirtyRef.current = false;
        }
      }
    }, 1200); // debounce 1.2s
    return () => {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    };
  }, [playData, isOpen]);

  // Save draft on blur / visibility change as a safety net
  useEffect(() => {
    if (!isOpen) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && dirtyRef.current) {
        persistDraft(playData);
        dirtyRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isOpen, playData]);

  // Load existing play names for duplicate detection when modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const playbookId = await PlaysService.ensureUserHasPlaybook();
        const plays = await PlaysService.getPlaysByPlaybook(playbookId);
        setExistingNames(
          new Set(
            plays
              .filter((p) => p.play_name)
              .map((p) => normalizePlayName(p.play_name).toLowerCase())
          )
        );
      } catch (e) {
        console.error("Failed to load existing play names", e);
      }
    })();
  }, [isOpen]);

  const updateField = (field: keyof Play, value: string | number | boolean) => {
    setPlayData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuickEntryParsed = (parsedData: Partial<Play>) => {
    setPlayData((prev) => ({ ...prev, ...parsedData }));
  };

  const handleSave = () => {
    // Validate required fields (raw first)
    if (!playData.play_name?.trim()) {
      setAttemptedSave(true);
      return; // inline validation handles message
    }
    if (!playData.p_type) {
      setAttemptedSave(true);
      return;
    }
    if (!playData.formation?.trim()) {
      setAttemptedSave(true);
      return;
    }

    // Apply normalization before persisting (defensive even though service also normalizes)
    const normalized: Partial<Play> = {
      ...playData,
      play_name: normalizePlayName(playData.play_name),
      formation: normalizeFormation(playData.formation || ""),
      one_word_play: playData.one_word_play
        ? normalizeText(playData.one_word_play)
        : "",
    };

    // Duplicate detection (exclude if editing the same play)
    const currentNorm = (normalized.play_name || "").toLowerCase();
    const initialNorm = normalizePlayName(
      initialPlay.play_name || ""
    ).toLowerCase();
    const isDuplicate =
      existingNames.has(currentNorm) &&
      (!initialPlay?.id || currentNorm !== initialNorm);
    if (isDuplicate) {
      setAttemptedSave(true);
      return;
    }

  console.log("💾 Saving (normalized) play data:", normalized);
  onSave(normalized);
  clearDraft();
  telemetry.enqueue({
    type: TelemetryEventTypes.PlayDraftFinalize,
    data: { hasDiagram: false },
  });
  onClose();
  };

  const handleCancel = () => {
  onClose();
  };

  if (!isOpen) return null;

  const normalizedName = normalizePlayName(playData.play_name || "");
  const isDuplicateName =
    !!normalizedName &&
    existingNames.has(normalizedName.toLowerCase()) &&
    (!initialPlay?.id ||
      normalizePlayName(initialPlay.play_name || "").toLowerCase() !==
        normalizedName.toLowerCase());

  const isValid = !!(
    playData.play_name?.trim() &&
    playData.p_type &&
    playData.formation?.trim() &&
    !isDuplicateName
  );

  const validationErrors: string[] = [];
  if (!playData.play_name?.trim())
    validationErrors.push("Play name is required");
        telemetry.enqueue({
          type: TelemetryEventTypes.PlayDraftFinalize,
          data: { hasDiagram: false },
        });
  if (!playData.p_type) validationErrors.push("Play type is required");
  if (!playData.formation?.trim())
    validationErrors.push("Formation is required");
  if (isDuplicateName) validationErrors.push("Duplicate play name in playbook");

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto focus-scroll"
      role="dialog"
      aria-modal="true"
      aria-label={initialPlay?.id ? "Edit play builder" : "Create play builder"}
      tabIndex={0}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom surface-card elevation-modal rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="surface-subtle px-6 py-4 border-b border-subtle flex items-center justify-between">
            <div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="text-slate-900"
              >
                {initialPlay?.id ? "Edit Play" : "Create New Play"}
              </Typography>
              <p className="text-sm text-slate-500 mt-1">
                Build your play with proper database fields
              </p>
              {!initialPlay?.id && (
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                  {restoredFromDraft && (
                    <span className="text-amber-600 font-medium">Draft restored</span>
                  )}
                  {lastAutosave && (
                    <span>
                      Autosaved {new Date(lastAutosave).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {lastAutosave && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        clearDraft();
                        setRestoredFromDraft(false);
                        setLastAutosave(null);
                      }}
                      className="h-auto px-1 py-0 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear draft
                    </Button>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="neutralLink"
              size="xs"
              onClick={onClose}
              className="p-2 rounded-lg h-auto"
              aria-label="Close play builder"
              icon={<X className="h-5 w-5" />}
              iconPosition="only"
            />
          </div>

          {/* Content */}
          <div className="surface-card overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 bc-grid-gap bc-card-padding">
              {/* Form Section - 2/3 width */}
              <div className="lg:col-span-2">
                <QuickEntry
                  onPlayParsed={handleQuickEntryParsed}
                  isVisible={isQuickEntryVisible}
                  onToggle={() => setIsQuickEntryVisible(!isQuickEntryVisible)}
                />

                <PlayBuilderForm
                  playData={playData}
                  onUpdateField={updateField}
                  duplicateName={isDuplicateName}
                  showErrors={attemptedSave}
                />
              </div>

              {/* Preview Section - 1/3 width */}
              <div className="lg:col-span-1">
                <PlayBuilderPreview
                  playData={playData}
                  isValid={isValid}
                  validationErrors={validationErrors}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="surface-subtle px-6 py-4 border-t border-subtle flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {isValid ? (
                <span className="text-jade-600">✓ Ready to save</span>
              ) : (
                <span className="text-amber-600">
                  ⚠ Missing required fields
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleCancel} variant="ghost" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isValid}
                variant="primary"
                size="sm"
                icon={<Save className="h-4 w-4" />}
                iconPosition="left"
              >
                {initialPlay?.id ? "Update Play" : "Create Play"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
