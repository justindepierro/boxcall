import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Play } from "../../types/play";
import { SecurePlaysService } from "../../services/securePlaysService";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Typography } from "../design-system";

type PlayDirection = "Left" | "Right" | "Middle" | "";

type BulkRow = {
  id: string;
  personnel: string;
  formation: string;
  playName: string;
  playDir: PlayDirection;
  confirmDuplicate: boolean;
};

type DuplicateMatch = {
  existingPlayId: string;
  existingTitle: string;
  score: number;
};

export interface BulkQuickAddPlaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  existingPlays: Play[];
  onCreated?: () => void;
}

const DEFAULT_ROW_COUNT = 1;
const DUPLICATE_SCORE_THRESHOLD = 0.86;

const DIRECTION_OPTIONS = [
  { value: "", label: "Direction" },
  { value: "Left", label: "Left" },
  { value: "Middle", label: "Middle" },
  { value: "Right", label: "Right" },
] as const;

function makeRow(): BulkRow {
  return {
    id: `row_${Math.random().toString(36).slice(2)}`,
    personnel: "",
    formation: "",
    playName: "",
    playDir: "",
    confirmDuplicate: false,
  };
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "");
}

function buildSignature(input: {
  personnel: string;
  formation: string;
  playName: string;
  playDir: string;
}) {
  return [
    normalizeText(input.personnel),
    normalizeText(input.formation),
    normalizeText(input.playName),
    normalizeText(input.playDir),
  ]
    .filter(Boolean)
    .join("|");
}

function diceCoefficient(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i += 1) {
    const gram = a.slice(i, i + 2);
    bigrams.set(gram, (bigrams.get(gram) || 0) + 1);
  }

  let intersectionSize = 0;
  for (let i = 0; i < b.length - 1; i += 1) {
    const gram = b.slice(i, i + 2);
    const count = bigrams.get(gram) || 0;
    if (count > 0) {
      bigrams.set(gram, count - 1);
      intersectionSize += 1;
    }
  }

  const totalBigrams = a.length - 1 + (b.length - 1);
  return (2 * intersectionSize) / totalBigrams;
}

function playDisplayTitle(play: Play) {
  const title = play.one_word_play || play.play_name;
  return `${title}${play.p_dir ? ` (${play.p_dir})` : ""}`;
}

// eslint-disable-next-line max-lines-per-function
export const BulkQuickAddPlaysModal: React.FC<BulkQuickAddPlaysModalProps> = ({
  isOpen,
  onClose,
  playbookId,
  existingPlays,
  onCreated,
}) => {
  const [rows, setRows] = useState<BulkRow[]>(() =>
    Array.from({ length: DEFAULT_ROW_COUNT }, () => makeRow())
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingSignatures = useMemo(() => {
    return existingPlays.map((p) => {
      return {
        playId: p.id,
        signature: buildSignature({
          personnel: p.personnel ?? "",
          formation: p.formation ?? "",
          playName: p.one_word_play ?? p.play_name ?? "",
          playDir: p.p_dir ?? "",
        }),
        title: playDisplayTitle(p),
      };
    });
  }, [existingPlays]);

  const trimmedRows = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      personnel: r.personnel.trim(),
      formation: r.formation.trim(),
      playName: r.playName.trim(),
    }));
  }, [rows]);

  const activeRows = useMemo(() => {
    return trimmedRows.filter((r) => {
      const anyValue =
        r.personnel.length ||
        r.formation.length ||
        r.playName.length ||
        r.playDir;
      return Boolean(anyValue);
    });
  }, [trimmedRows]);

  const validationErrors = useMemo(() => {
    const errorsById = new Map<string, string>();

    for (const r of activeRows) {
      if (!r.personnel) errorsById.set(r.id, "Personnel is required");
      else if (!r.formation) errorsById.set(r.id, "Formation is required");
      else if (!r.playName) errorsById.set(r.id, "Play is required");
      else if (!r.playDir) errorsById.set(r.id, "Direction is required");
    }

    return errorsById;
  }, [activeRows]);

  const duplicatesById = useMemo(() => {
    const map = new Map<string, DuplicateMatch>();

    for (const r of activeRows) {
      const signature = buildSignature({
        personnel: r.personnel,
        formation: r.formation,
        playName: r.playName,
        playDir: r.playDir,
      });

      let best: DuplicateMatch | null = null;
      for (const existing of existingSignatures) {
        const score = diceCoefficient(signature, existing.signature);
        if (!best || score > best.score) {
          best = {
            existingPlayId: existing.playId,
            existingTitle: existing.title,
            score,
          };
        }
      }

      if (best && best.score >= DUPLICATE_SCORE_THRESHOLD) {
        map.set(r.id, best);
      }
    }

    return map;
  }, [activeRows, existingSignatures]);

  const hasBlockingErrors =
    activeRows.length === 0 || validationErrors.size > 0;

  const hasUnconfirmedDuplicates = useMemo(() => {
    for (const r of activeRows) {
      if (duplicatesById.has(r.id) && !r.confirmDuplicate) return true;
    }
    return false;
  }, [activeRows, duplicatesById]);

  const canSubmit =
    !isSubmitting && !hasBlockingErrors && !hasUnconfirmedDuplicates;

  const setRow = useCallback((rowId: string, patch: Partial<BulkRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r))
    );
  }, []);

  const handleAddRow = useCallback(() => {
    setRows((prev) => [...prev, makeRow()]);
  }, []);

  const handleRemoveRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      let createdCount = 0;

      for (const r of activeRows) {
        await SecurePlaysService.createPlay({
          playbook_id: playbookId,
          formation: r.formation,
          play_name: r.playName,
          personnel: r.personnel,
          p_dir: r.playDir,
          // Required by validation/DB; default to Pass for quick add.
          p_type: "Pass",
          creation_source: "unknown",
          creation_context: {
            user_action: "bulk_quick_add",
          },
        } as any);
        createdCount += 1;
      }

      toast.success(
        `Created ${createdCount} play${createdCount === 1 ? "" : "s"}`
      );
      onCreated?.();
      onClose();

      setRows(Array.from({ length: DEFAULT_ROW_COUNT }, () => makeRow()));
    } catch (e: any) {
      toast.error(e?.message ? String(e.message) : "Failed to create plays");
    } finally {
      setIsSubmitting(false);
    }
  }, [activeRows, canSubmit, onClose, onCreated, playbookId]);

  let submitLabel = "Creating…";
  if (!isSubmitting) {
    const plural = activeRows.length === 1 ? "" : "s";
    submitLabel = `Create ${activeRows.length} Play${plural}`;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Quick Add"
      size="xl"
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Typography variant="body" color="muted">
          Add multiple plays with the bare minimum. If a new play looks very
          similar to an existing one, you’ll need to confirm “add anyway”.
        </Typography>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const error = validationErrors.get(row.id);
            const dup = duplicatesById.get(row.id);

            let rowBorderClass = "border-divider";
            if (error) rowBorderClass = "border-text-error";
            else if (dup) rowBorderClass = "border-text-warning";

            return (
              <div
                key={row.id}
                className={`bg-surface-card border rounded-lg p-4 ${rowBorderClass}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="body-sm" className="font-semibold">
                    Row {index + 1}
                  </Typography>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(row.id)}
                    disabled={isSubmitting || rows.length <= 1}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    label="Personnel"
                    value={row.personnel}
                    onChange={(e) =>
                      setRow(row.id, {
                        personnel: e.target.value,
                        confirmDuplicate: false,
                      })
                    }
                    placeholder="11, 12, 21…"
                    fullWidth
                  />
                  <Input
                    label="Formation"
                    value={row.formation}
                    onChange={(e) =>
                      setRow(row.id, {
                        formation: e.target.value,
                        confirmDuplicate: false,
                      })
                    }
                    placeholder="Trips Right, Ace…"
                    fullWidth
                  />
                  <Input
                    label="Play"
                    value={row.playName}
                    onChange={(e) =>
                      setRow(row.id, {
                        playName: e.target.value,
                        confirmDuplicate: false,
                      })
                    }
                    placeholder="Stick, Power, Flood…"
                    fullWidth
                  />

                  <Select
                    label="Direction"
                    value={row.playDir}
                    options={DIRECTION_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    onChange={(value) =>
                      setRow(row.id, {
                        playDir: (value as PlayDirection) || "",
                        confirmDuplicate: false,
                      })
                    }
                    fullWidth
                  />
                </div>

                {error && (
                  <div className="mt-2">
                    <Typography variant="body-xs" color="error">
                      {error}
                    </Typography>
                  </div>
                )}

                {dup && (
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <Typography variant="body-xs" color="warning">
                        Possible duplicate of: {dup.existingTitle}
                      </Typography>
                      <Typography variant="body-xs" color="muted">
                        Similarity: {Math.round(dup.score * 100)}%
                      </Typography>
                    </div>

                    <label className="flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        checked={row.confirmDuplicate}
                        onChange={(e) =>
                          setRow(row.id, { confirmDuplicate: e.target.checked })
                        }
                        disabled={isSubmitting}
                        className="h-4 w-4 rounded-lg border-light text-info"
                      />
                      <Typography variant="body-xs" className="font-semibold">
                        Add anyway
                      </Typography>
                    </label>
                  </div>
                )}
              </div>
            );
          })}

          <Button
            variant="success"
            fullWidth
            onClick={handleAddRow}
            disabled={isSubmitting}
            className="justify-center"
          >
            Add Another Play
          </Button>
        </div>

        {activeRows.length === 0 && (
          <Typography variant="body-sm" color="muted">
            Start typing in any row to add plays.
          </Typography>
        )}

        {hasUnconfirmedDuplicates && (
          <Typography variant="body-sm" color="warning">
            Confirm “Add anyway” for flagged duplicates to continue.
          </Typography>
        )}
      </div>
    </Modal>
  );
};

BulkQuickAddPlaysModal.displayName = "BulkQuickAddPlaysModal";
