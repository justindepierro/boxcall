import React, { useState } from "react";
import { DataSyncService, CSVService, PlaysService } from "@services";
import type { CSVParseResult } from "@services/csv";
import { Modal } from "../../ui/Modal/Modal";
import { debug, logError } from "../../../utils/logger";
import { useToast } from "../../../hooks/useToast";
import {
  UploadStep,
  PreviewStep,
  ImportingStep,
  CompleteStep,
  type CSVRowMatchDecision,
  type CSVRowImportMode,
  type CSVImportIntent,
} from "./CSVImportSteps";
import type { Play } from "../../../types/play";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  onImportComplete?: (result: ImportResult) => void;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  importedPlays: number;
  errors: string[];
  warnings: string[];
}

type CSVImportStepId = "upload" | "preview" | "importing" | "complete";

type ExistingPlayCandidate = {
  id: string;
  formation?: string | null;
  play_name?: string | null;
  p_type?: string | null;
  personnel?: string | null;
};

const SMART_MATCH_MIN_SIMILARITY = 0.85;

function renderCSVImportModalStep(params: {
  step: CSVImportStepId;
  isProcessing: boolean;
  dragActive: boolean;
  csvFile: File | null;
  parseResult: CSVParseResult | null;
  expandedRows: Set<number>;
  importProgress: number;
  importResult: ImportResult | null;
  importIntent?: CSVImportIntent;
  onChangeImportIntent?: (intent: CSVImportIntent) => void;
  rowDecisions?: Record<number, CSVRowMatchDecision>;
  onApproveUpdate?: (rowNumber: number, approved: boolean) => void;
  onSetRowMode?: (rowNumber: number, mode: CSVRowImportMode) => void;
  onApproveAllUpdates?: () => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadSample: () => void;
  onToggleRowExpansion: (rowNumber: number) => void;
  onUpdatePreview: (
    rowNumber: number,
    field: string,
    value: string | boolean | number
  ) => void;
  onBackToUpload: () => void;
  onImport: () => void;
  onClose: () => void;
  onBackToPreview: () => void;
}) {
  const {
    step,
    isProcessing,
    dragActive,
    csvFile,
    parseResult,
    expandedRows,
    importProgress,
    importResult,
    importIntent,
    onChangeImportIntent,
    rowDecisions,
    onApproveUpdate,
    onSetRowMode,
    onApproveAllUpdates,
    onDrag,
    onDrop,
    onFileChange,
    onDownloadSample,
    onToggleRowExpansion,
    onUpdatePreview,
    onBackToUpload,
    onImport,
    onClose,
    onBackToPreview,
  } = params;

  switch (step) {
    case "upload":
      return (
        <UploadStep
          isProcessing={isProcessing}
          dragActive={dragActive}
          csvFile={csvFile}
          onDrag={onDrag}
          onDrop={onDrop}
          onFileChange={onFileChange}
          onDownloadSample={onDownloadSample}
        />
      );
    case "preview":
      return parseResult ? (
        <PreviewStep
          parseResult={parseResult}
          expandedRows={expandedRows}
          onToggleRowExpansion={onToggleRowExpansion}
          onUpdatePreview={onUpdatePreview}
          onBack={onBackToUpload}
          onImport={onImport}
          importIntent={importIntent}
          onChangeImportIntent={onChangeImportIntent}
          rowDecisions={rowDecisions}
          onApproveUpdate={onApproveUpdate}
          onSetRowMode={onSetRowMode}
          onApproveAllUpdates={onApproveAllUpdates}
        />
      ) : null;
    case "importing":
      return <ImportingStep importProgress={importProgress} />;
    case "complete":
      return (
        <CompleteStep
          importResult={importResult}
          onClose={onClose}
          onBackToPreview={onBackToPreview}
        />
      );
    default:
      return null;
  }
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  playbookId,
  onImportComplete,
}) => {
  const toast = useToast();
  const [step, setStep] = useState<CSVImportStepId>("upload");
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [importProgress, setImportProgress] = useState(0);
  const [_importError, setImportError] = useState<string | null>(null);
  const [resolvedPlaybookId, setResolvedPlaybookId] = useState<string | null>(
    playbookId || null
  );
  const [importIntent, setImportIntent] = useState<CSVImportIntent>("import_new");
  const [rowDecisions, setRowDecisions] = useState<
    Record<number, CSVRowMatchDecision>
  >({});

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsProcessing(true);
    setCsvFile(file);

    try {
      const content = await file.text();
      const result = CSVService.parseCSVForPreview(content);

      // Resolve playbook ID early so we can fetch existing plays for smart matching
      let actualPlaybookId = playbookId;
      if (!actualPlaybookId || actualPlaybookId === "demo-playbook-id") {
        actualPlaybookId = await PlaysService.ensureUserHasPlaybook();
      }
      setResolvedPlaybookId(actualPlaybookId);

      // Fetch existing plays (for suggestions + smart update matching)
      let existingPlays: Play[] = [];
      try {
        existingPlays = await PlaysService.getPlaysByPlaybook(actualPlaybookId, {
          limit: 5000,
        });
      } catch (e) {
        debug("[CSVImportModal] Failed to load existing plays for matching", e);
      }

      const existingPlaysForPreview = existingPlays.map((p) => ({
        id: p.id,
        formation: p.formation ?? null,
        play_name: p.play_name ?? null,
        p_type: p.p_type ?? null,
        personnel: p.personnel ?? null,
      }));

      const enriched: CSVParseResult = {
        ...result,
        existingPlays: existingPlaysForPreview,
      };

      setParseResult(enriched);

      // Initialize smart match decisions for each preview row
      setRowDecisions(
        buildRowDecisionsForIntent(
          importIntent,
          enriched.previews,
          existingPlaysForPreview
        )
      );

      setStep("preview");
    } catch (error) {
      logError("Error reading file:", error);
      toast.error("Error reading file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const normalizeForMatch = (value: unknown): string => {
    if (typeof value !== "string") return "";
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  };

  const diceCoefficient = (a: string, b: string): number => {
    const aa = normalizeForMatch(a);
    const bb = normalizeForMatch(b);
    if (!aa || !bb) return 0;
    if (aa === bb) return 1;
    if (aa.length < 2 || bb.length < 2) return 0;

    const bigrams = new Map<string, number>();
    for (let i = 0; i < aa.length - 1; i++) {
      const gram = aa.slice(i, i + 2);
      bigrams.set(gram, (bigrams.get(gram) || 0) + 1);
    }

    let intersectionSize = 0;
    for (let i = 0; i < bb.length - 1; i++) {
      const gram = bb.slice(i, i + 2);
      const count = bigrams.get(gram) || 0;
      if (count > 0) {
        bigrams.set(gram, count - 1);
        intersectionSize++;
      }
    }

    const totalBigrams = aa.length - 1 + (bb.length - 1);
    return totalBigrams === 0 ? 0 : (2 * intersectionSize) / totalBigrams;
  };

  const findBestExistingMatch = (
    preview: CSVParseResult["previews"][number],
    existing: ExistingPlayCandidate[],
    options?: { allowLooseNameMatch?: boolean }
  ): { play: ExistingPlayCandidate; score: number } | null => {
    const formation = normalizeForMatch(preview.data.formation);
    const name = normalizeForMatch(preview.data.play_name);
    const pType = normalizeForMatch(preview.data.p_type);
    if (!formation || !name) return null;

    const candidates = existing.filter((p) => {
      if (normalizeForMatch(p.formation) !== formation) return false;
      const candidateType = normalizeForMatch(p.p_type);
      // If both sides have a type, require it to match
      if (pType && candidateType && pType !== candidateType) return false;
      return true;
    });
    if (candidates.length === 0) return null;

    let best: { play: ExistingPlayCandidate; score: number } | null = null;
    for (const p of candidates) {
      const score = diceCoefficient(name, p.play_name || "");
      if (!best || score > best.score) {
        best = { play: p, score };
      }
    }

    // Suggested update threshold (approval still required)
    if (best && best.score >= SMART_MATCH_MIN_SIMILARITY) return best;

    // Optional fallback: if formation doesn't line up but play name is an exact (or near-exact)
    // match, still suggest an update (approval required).
    if (options?.allowLooseNameMatch) {
      let bestLoose: { play: ExistingPlayCandidate; score: number } | null = null;
      for (const p of existing) {
        const candidateType = normalizeForMatch(p.p_type);
        if (pType && candidateType && pType !== candidateType) continue;
        const score = diceCoefficient(name, p.play_name || "");
        if (!bestLoose || score > bestLoose.score) {
          bestLoose = { play: p, score };
        }
      }

      if (bestLoose && bestLoose.score >= 0.95) {
        return bestLoose;
      }
    }

    return null;
  };

  const buildRowDecisionsForIntent = (
    intent: CSVImportIntent,
    previews: CSVParseResult["previews"],
    existing: ExistingPlayCandidate[]
  ): Record<number, CSVRowMatchDecision> => {
    const decisions: Record<number, CSVRowMatchDecision> = {};

    for (const preview of previews) {
      if (!preview.isValid) {
        decisions[preview.rowNumber] = { mode: "skip", approved: true };
        continue;
      }

      const match = findBestExistingMatch(preview, existing);

      if (intent === "update_existing") {
        const updateMatch =
          match ||
          findBestExistingMatch(preview, existing, { allowLooseNameMatch: true });

        if (updateMatch) {
          decisions[preview.rowNumber] = {
            mode: "update",
            approved: false,
            matchedPlayId: updateMatch.play.id,
            matchedPlayName: updateMatch.play.play_name || undefined,
            similarity: updateMatch.score,
          };
        } else {
          decisions[preview.rowNumber] = { mode: "skip", approved: true };
        }
        continue;
      }

      // import_new
      if (match) {
        // Default: avoid duplicating an existing play unless coach explicitly chooses Create
        decisions[preview.rowNumber] = {
          mode: "skip",
          approved: true,
          matchedPlayId: match.play.id,
          matchedPlayName: match.play.play_name || undefined,
          similarity: match.score,
        };
      } else {
        decisions[preview.rowNumber] = { mode: "create", approved: true };
      }
    }

    return decisions;
  };

  const handleApproveUpdate = (rowNumber: number, approved: boolean) => {
    setRowDecisions((prev) => {
      const current = prev[rowNumber];
      if (!current) return prev;
      return {
        ...prev,
        [rowNumber]: {
          ...current,
          approved,
        },
      };
    });
  };

  const handleSetRowMode = (rowNumber: number, mode: CSVRowImportMode) => {
    setRowDecisions((prev) => {
      const current = prev[rowNumber];
      if (!current) return prev;
      return {
        ...prev,
        [rowNumber]: {
          ...current,
          mode,
          approved: mode === "update" ? current.approved : true,
        },
      };
    });
  };

  const handleApproveAllUpdates = () => {
    setRowDecisions((prev) => {
      const next: Record<number, CSVRowMatchDecision> = { ...prev };
      for (const [rowKey, decision] of Object.entries(prev)) {
        if (decision.mode === "update") {
          next[Number(rowKey)] = { ...decision, approved: true };
        }
      }
      return next;
    });
  };

  const handleChangeImportIntent = (intent: CSVImportIntent) => {
    setImportIntent(intent);
    if (!parseResult) return;

    const existingForMatch: ExistingPlayCandidate[] = (parseResult.existingPlays || [])
      .filter((p): p is ExistingPlayCandidate => Boolean(p.id))
      .map((p) => ({
        id: String(p.id),
        formation: p.formation ?? null,
        play_name: p.play_name ?? null,
        p_type: p.p_type ?? null,
        personnel: p.personnel ?? null,
      }));

    setRowDecisions(
      buildRowDecisionsForIntent(intent, parseResult.previews, existingForMatch)
    );
  };

  const handleImport = async () => {
    if (!parseResult) return;

    setStep("importing");
    setIsProcessing(true);
    setImportProgress(0);
    setImportError(null);

    try {
      debug("[CSVImportModal] Starting CSV import");
      setImportProgress(10);

      let actualPlaybookId = resolvedPlaybookId || playbookId;

      if (!actualPlaybookId || actualPlaybookId === "demo-playbook-id") {
        debug("[CSVImportModal] Resolving user playbook");
        actualPlaybookId = await PlaysService.ensureUserHasPlaybook();
        setResolvedPlaybookId(actualPlaybookId);
        debug("[CSVImportModal] Using playbook ID", {
          playbookId: actualPlaybookId,
        });
      }
      setImportProgress(25);

      const conversionResult = CSVService.convertPreviewsToPlays(
        parseResult.previews,
        actualPlaybookId
      );

      if (conversionResult.plays.length === 0) {
        throw new Error("No valid plays to import");
      }
      setImportProgress(40);

      const playsByRow = conversionResult.playsByRowNumber || {};
      const createPlays: Array<
        Omit<Play, "id" | "created_at" | "updated_at" | "created_by">
      > = [];
      const updatePlays: Array<{ id: string; updates: Partial<Play> }> = [];
      const decisionWarnings: string[] = [];

      for (const preview of parseResult.previews) {
        const decision = rowDecisions[preview.rowNumber];
        if (!decision) continue;
        const converted = playsByRow[preview.rowNumber];
        if (!converted) continue;

        if (decision.mode === "skip") {
          continue;
        }

        if (decision.mode === "update") {
          if (!decision.matchedPlayId) {
            decisionWarnings.push(
              `Row ${preview.rowNumber}: Update selected but no match found; skipped.`
            );
            continue;
          }

          if (!decision.approved) {
            decisionWarnings.push(
              `Row ${preview.rowNumber}: Update suggested but not approved; skipped.`
            );
            continue;
          }

          const { id: _id, created_at: _ca, updated_at: _ua, created_by: _cb, ...updates } =
            converted;
          updatePlays.push({ id: decision.matchedPlayId, updates });
          continue;
        }

        // Create
        const {
          id: _id,
          created_at: _createdAt,
          updated_at: _updatedAt,
          created_by: _createdBy,
          ...playData
        } = converted;
        createPlays.push({
          ...(playData as any),
          playbook_id: actualPlaybookId,
        });
      }

      setImportProgress(55);

      const createResult =
        createPlays.length > 0
          ? await DataSyncService.bulkCreatePlays(actualPlaybookId, createPlays)
          : { success: true, errors: [] as string[] };

      setImportProgress(75);

      const updated: Play[] = [];
      const updateErrors: string[] = [];
      if (updatePlays.length > 0) {
        for (const u of updatePlays) {
          try {
            const updatedPlay = await PlaysService.updatePlay(u.id, u.updates);
            updated.push(updatedPlay);
          } catch (e) {
            updateErrors.push(
              e instanceof Error
                ? e.message
                : "Unknown error updating existing play"
            );
          }
        }
      }

      setImportProgress(90);

      const importResult: ImportResult = {
        success:
          Boolean(createResult.success) &&
          createResult.errors.length === 0 &&
          updateErrors.length === 0,
        totalRows: conversionResult.totalRows,
        importedPlays:
          (createResult.success ? createPlays.length : 0) + updated.length,
        errors: [
          ...conversionResult.errors,
          ...(createResult.errors || []),
          ...updateErrors,
        ],
        warnings: [...conversionResult.warnings, ...decisionWarnings],
      };

      setImportResult(importResult);
      setImportProgress(100);
      setStep("complete");

      if (onImportComplete) {
        onImportComplete(importResult);
      }
    } catch (error) {
      logError("❌ Import failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setImportError(errorMessage);
      setImportResult({
        success: false,
        totalRows: parseResult?.previews.length || 0,
        importedPlays: 0,
        errors: [errorMessage],
        warnings: [],
      });
      setStep("complete");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleCSV = CSVService.generateSampleCSV();
    CSVService.downloadCSV(sampleCSV, "boxcall-sample-plays.csv");
  };

  const toggleRowExpansion = (rowNumber: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowNumber)) {
      newExpanded.delete(rowNumber);
    } else {
      newExpanded.add(rowNumber);
    }
    setExpandedRows(newExpanded);
  };

  const handleUpdatePreview = (
    rowNumber: number,
    field: string,
    value: string | boolean | number
  ) => {
    if (parseResult) {
      const updatedPreviews = parseResult.previews.map((p) =>
        p.rowNumber === rowNumber
          ? { ...p, data: { ...p.data, [field]: value } }
          : p
      );
      const updatedParse = { ...parseResult, previews: updatedPreviews };
      setParseResult(updatedParse);

      const previewRow = updatedPreviews.find((p) => p.rowNumber === rowNumber);
      const existingForMatch: ExistingPlayCandidate[] = (parseResult.existingPlays || [])
        .filter((p): p is ExistingPlayCandidate => Boolean(p.id))
        .map((p) => ({
          id: String(p.id),
          formation: p.formation ?? null,
          play_name: p.play_name ?? null,
          p_type: p.p_type ?? null,
          personnel: p.personnel ?? null,
        }));

      if (previewRow && existingForMatch.length > 0) {
        const match = findBestExistingMatch(previewRow, existingForMatch);
        setRowDecisions((prev) => {
          const current = prev[rowNumber];
          if (match) {
            return {
              ...prev,
              [rowNumber]: {
                mode: current?.mode === "skip" ? "skip" : "update",
                approved: false,
                matchedPlayId: match.play.id,
                matchedPlayName: match.play.play_name || undefined,
                similarity: match.score,
              },
            };
          }

          return {
            ...prev,
            [rowNumber]: {
              mode: current?.mode === "skip" ? "skip" : "create",
              approved: true,
            },
          };
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Plays" size="lg">
      <div className="p-lg">
        {renderCSVImportModalStep({
          step,
          isProcessing,
          dragActive,
          csvFile,
          parseResult,
          expandedRows,
          importProgress,
          importResult,
          importIntent,
          onChangeImportIntent: handleChangeImportIntent,
          onDrag: handleDrag,
          onDrop: handleDrop,
          onFileChange: handleFileChange,
          onDownloadSample: downloadSampleCSV,
          onToggleRowExpansion: toggleRowExpansion,
          onUpdatePreview: handleUpdatePreview,
          onBackToUpload: () => setStep("upload"),
          onImport: handleImport,
          rowDecisions,
          onApproveUpdate: handleApproveUpdate,
          onSetRowMode: handleSetRowMode,
          onApproveAllUpdates: handleApproveAllUpdates,
          onClose,
          onBackToPreview: () => {
            setStep("preview");
            setImportError(null);
          },
        })}
      </div>
    </Modal>
  );
};
