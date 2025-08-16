// Fully reconstructed PlayBuilderCore with diagram v2 draft persistence
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "../../ui/Icon";
import { Typography } from "../../design-system/Typography";
import { Button } from "../../ui/Button";
import type { Play } from "../../../types/play";
import { PlayBuilderForm } from "./PlayBuilderForm";
import { PlayBuilderPreview } from "./PlayBuilderPreview";
import { VisualPlayBuilderV2 } from "../diagram-v2/VisualPlayBuilderV2";
import { QuickEntry } from "./QuickEntry";
import {
  normalizePlayName,
  normalizeText,
  normalizeFormation,
} from "../../../utils/textNormalization";
import { PlaysService } from "../../../services/playsService";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";
import type { DiagramDocument } from "../diagram-v2/types";
import { computeComplexityScore } from "../diagram-v2/types";

interface PlayBuilderCoreProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (play: Partial<Play>) => void;
  initialPlay?: Partial<Play>;
}
const DRAFT_STORAGE_KEY = "bc_playbuilder_draft_v1";
const DRAFT_STORAGE_KEY_V2 = "bc_playbuilder_draft_v2";

export const PlayBuilderCore: React.FC<PlayBuilderCoreProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlay = {},
}) => {
  const [playData, setPlayData] = useState<Partial<Play>>({
    play_name: initialPlay.play_name || "",
    p_type: initialPlay.p_type || "Pass",
    formation: initialPlay.formation || "",
    one_word_play: initialPlay.one_word_play || "",
    notes: initialPlay.notes || "",
    personnel: initialPlay.personnel || "",
    f_type: initialPlay.f_type || "",
    f_dir: initialPlay.f_dir || "",
    protection: initialPlay.protection || "",
    confidence_base: initialPlay.confidence_base || 70,
    times_called: initialPlay.times_called || 0,
    complexity_score: initialPlay.complexity_score || 1,
    is_archived: initialPlay.is_archived || false,
  });
  // V2 diagram document (sole supported editor)
  const [diagramV2Doc, setDiagramV2Doc] = useState<DiagramDocument | null>(
    null
  );
  const [isQuickEntryVisible, setIsQuickEntryVisible] = useState(false);
  const [existingNames, setExistingNames] = useState<Set<string>>(new Set());
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [lastAutosave, setLastAutosave] = useState<number | null>(null);
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);
  const exportThumbnailRef = useRef<null | (() => Promise<string | null>)>(
    null
  );
  const autosaveTimerRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);
  // Hash snapshot to detect unsaved changes for close confirmation
  const [savedHash, setSavedHash] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmRef = useRef<HTMLDivElement | null>(null);

  interface DraftPayloadV2Only {
    data: Partial<Play>;
    diagram_v2?: DiagramDocument | null;
    ts: number;
  }
  type DraftPayload = DraftPayloadV2Only | null;
  const loadDraft = useCallback((): DraftPayload => {
    try {
      const rawV2 = localStorage.getItem(DRAFT_STORAGE_KEY_V2);
      if (rawV2) {
        const parsed = JSON.parse(rawV2) as DraftPayloadV2Only;
        return parsed;
      }
      const rawLegacy = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (rawLegacy) {
        const legacy = JSON.parse(rawLegacy) as {
          data?: Partial<Play>;
          ts?: number;
        };
        return legacy?.data
          ? { data: legacy.data, diagram_v2: null, ts: legacy.ts || Date.now() }
          : null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Compute a stable hash of current draft state (play + diagram)
  const computeCurrentHash = useCallback(() => {
    return JSON.stringify({
      play: playData,
      diagram: diagramV2Doc,
    });
  }, [playData, diagramV2Doc]);

  // Initialize saved hash when modal first opens (after any draft restore) if unset
  useEffect(() => {
    if (isOpen && !savedHash) {
      setSavedHash(computeCurrentHash());
    }
  }, [isOpen, savedHash, computeCurrentHash]);

  const isDirty = useCallback(() => {
    if (!isOpen) return false;
    const current = computeCurrentHash();
    return current !== savedHash;
  }, [computeCurrentHash, savedHash, isOpen]);

  const attemptClose = useCallback(() => {
    if (isDirty()) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  // ESC key close (uses attemptClose)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") attemptClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attemptClose]);
  const persistDraft = (
    data: Partial<Play>,
    diagramDoc: DiagramDocument | null
  ) => {
    try {
      const payload = JSON.stringify({
        data,
        diagram_v2: diagramDoc,
        ts: Date.now(),
      });
      localStorage.setItem(DRAFT_STORAGE_KEY_V2, payload);
      setLastAutosave(Date.now());
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDraftAutosave,
        data: {
          fields: Object.keys(data).length,
          hasDiagram: !!diagramDoc,
          v2: !!diagramDoc,
        },
      });
    } catch {
      /* ignore */
    }
  };
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_STORAGE_KEY_V2);
      telemetry.enqueue({ type: TelemetryEventTypes.PlayDraftClear });
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (initialPlay?.id) return; // editing existing play: skip draft restore
    const draft = loadDraft();
    if (draft && draft.data) {
      setPlayData((p) => ({ ...p, ...draft.data }));
      if ("diagram_v2" in draft && draft.diagram_v2)
        setDiagramV2Doc(draft.diagram_v2);
      if ("ts" in draft) setLastAutosave(draft.ts);
      setRestoredFromDraft(true);
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDraftRestore,
        data: {
          ageMs: draft.ts ? Date.now() - draft.ts : 0,
          hasDiagram: "diagram_v2" in draft && !!draft.diagram_v2,
          v2: "diagram_v2" in draft && !!draft.diagram_v2,
        },
      });
    } else {
      setRestoredFromDraft(false);
    }
  }, [isOpen, initialPlay?.id, loadDraft]);

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

  useEffect(() => {
    if (!isOpen) return;
    dirtyRef.current = true;
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(() => {
      if (dirtyRef.current) {
        const hasContent = Object.values(playData).some((v) =>
          typeof v === "string" ? v.trim().length > 0 : v !== undefined
        );
        if (hasContent) {
          persistDraft(playData, diagramV2Doc);
          dirtyRef.current = false;
        }
      }
    }, 1200);
    return () => {
      if (autosaveTimerRef.current)
        window.clearTimeout(autosaveTimerRef.current);
    };
  }, [playData, diagramV2Doc, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = () => {
      if (document.visibilityState === "hidden" && dirtyRef.current) {
        persistDraft(playData, diagramV2Doc);
        dirtyRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [isOpen, playData, diagramV2Doc]);

  const updateField = (field: keyof Play, value: string | number | boolean) =>
    setPlayData((prev) => ({ ...prev, [field]: value }));
  const handleQuickEntryParsed = (parsed: Partial<Play>) =>
    setPlayData((prev) => ({ ...prev, ...parsed }));
  const handleSave = async () => {
    if (
      !playData.play_name?.trim() ||
      !playData.p_type ||
      !playData.formation?.trim()
    ) {
      setAttemptedSave(true);
      return;
    }
    const normalized: Partial<Play> = {
      ...playData,
      play_name: normalizePlayName(playData.play_name || ""),
      formation: normalizeFormation(playData.formation || ""),
      one_word_play: playData.one_word_play
        ? normalizeText(playData.one_word_play)
        : "",
    };
    const currentNorm = (normalized.play_name || "").toLowerCase();
    const initialNorm = normalizePlayName(
      initialPlay.play_name || ""
    ).toLowerCase();
    const duplicate =
      existingNames.has(currentNorm) &&
      (!initialPlay?.id || currentNorm !== initialNorm);
    if (duplicate) {
      setAttemptedSave(true);
      return;
    }
    if (diagramV2Doc) {
      normalized.complexity_score = computeComplexityScore(diagramV2Doc);
      (
        normalized as Partial<Play> & { diagram_v2?: DiagramDocument }
      ).diagram_v2 = diagramV2Doc;
      // Try to generate a thumbnail PNG data URL for quick previews
      if (exportThumbnailRef.current) {
        try {
          const dataUrl = await exportThumbnailRef.current();
          if (dataUrl) {
            (normalized as Partial<Play>).diagram_url = dataUrl;
          }
        } catch {
          // non-fatal
        }
      }
    }
    onSave(normalized);
    clearDraft();
    telemetry.enqueue({
      type: TelemetryEventTypes.PlayDraftFinalize,
      data: { hasDiagram: !!diagramV2Doc, v2: !!diagramV2Doc },
    });
    // Update saved snapshot then close
    setSavedHash(computeCurrentHash());
    onClose();
  };
  const handleCancel = useCallback(() => attemptClose(), [attemptClose]);
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
  if (!playData.p_type) validationErrors.push("Play type is required");
  if (!playData.formation?.trim())
    validationErrors.push("Formation is required");
  if (isDuplicateName) validationErrors.push("Duplicate play name in playbook");
  // Cleaned legacy remnants removed.

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-y-auto focus-scroll"
        role="dialog"
        aria-modal="true"
        aria-label={
          initialPlay?.id ? "Edit play builder" : "Create play builder"
        }
        tabIndex={0}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
            onClick={attemptClose}
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
                      <span className="text-amber-600 font-medium">
                        Draft restored
                      </span>
                    )}
                    {lastAutosave && (
                      <span>
                        Autosaved{" "}
                        {new Date(lastAutosave).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                onClick={attemptClose}
                className="p-2 rounded-lg h-auto"
                aria-label="Close play builder"
                icon={<Icon name="close" size={20} />}
                iconPosition="only"
              />
            </div>

            {/* Content */}
            <div className="surface-card overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 bc-grid-gap bc-card-padding">
                {/* Form Section - 2/3 width */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <>
                      <Typography
                        variant="label-lg"
                        as="h4"
                        className="text-slate-500 mb-2"
                      >
                        Diagram Builder
                      </Typography>
                      <div className="mb-4 border border-dashed border-slate-300 rounded">
                        <VisualPlayBuilderV2
                          onClose={attemptClose}
                          onDocumentChange={(doc) => {
                            setDiagramV2Doc(doc);
                            setPlayData((prev) => ({
                              ...prev,
                              complexity_score: computeComplexityScore(doc),
                            }));
                            dirtyRef.current = true;
                          }}
                          onRequestExport={(exporter) => {
                            exportThumbnailRef.current = exporter;
                          }}
                        />
                      </div>
                    </>
                  </div>
                  <QuickEntry
                    onPlayParsed={handleQuickEntryParsed}
                    isVisible={isQuickEntryVisible}
                    onToggle={() =>
                      setIsQuickEntryVisible(!isQuickEntryVisible)
                    }
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
                  {/* Legacy diagram preview removed; V2 complexity shown within editor */}
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
                  icon={<Icon name="save" size={16} />}
                  iconPosition="left"
                >
                  {initialPlay?.id ? "Update Play" : "Create Play"}
                </Button>
                {/* Optional explicit Save & Close identical to primary (visible when valid and editing) */}
                {initialPlay?.id && (
                  <Button
                    onClick={handleSave}
                    disabled={!isValid}
                    variant="secondary"
                    size="sm"
                  >
                    Save & Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="discard-changes-title"
          aria-describedby="discard-changes-desc"
        >
          <div
            ref={confirmRef}
            className="surface-card rounded-md shadow-lg w-full max-w-sm p-5 space-y-4 border border-subtle"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Tab" && confirmRef.current) {
                const focusables = Array.from(
                  confirmRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                  )
                ).filter((el) => !el.hasAttribute("disabled"));
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                } else if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                }
              } else if (e.key === "Escape") {
                setConfirmOpen(false);
              }
            }}
          >
            <Typography
              id="discard-changes-title"
              variant="label-md"
              as="h3"
              className="text-text-primary"
            >
              Discard changes?
            </Typography>
            <p
              id="discard-changes-desc"
              className="text-xs text-slate-600 leading-relaxed"
            >
              You have unsaved edits to this play. If you leave now, those
              changes will be lost.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setConfirmOpen(false)}
                autoFocus
              >
                Stay
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => {
                  setConfirmOpen(false);
                  onClose();
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
