import React, { useState } from "react";
import { DataSyncService, CSVService, PlaysService } from "@services";
import type { CSVParseResult } from "@services/csv";
import { Modal } from "../../ui/Modal/Modal";
import { logError } from "../../../utils/logger";
import { useToast } from "../../../hooks/useToast";
import {
  UploadStep,
  PreviewStep,
  ImportingStep,
  CompleteStep,
} from "./CSVImportSteps";

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

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  playbookId,
  onImportComplete,
}) => {
  const toast = useToast();
  const [step, setStep] = useState<
    "upload" | "preview" | "importing" | "complete"
  >("upload");
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [importProgress, setImportProgress] = useState(0);
  const [_importError, setImportError] = useState<string | null>(null);

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
      setParseResult(result);
      setStep("preview");
    } catch (error) {
      logError("Error reading file:", error);
      toast.error("Error reading file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!parseResult) return;

    setStep("importing");
    setIsProcessing(true);
    setImportProgress(0);
    setImportError(null);

    try {
      console.info("Starting CSV import...");
      setImportProgress(10);

      let actualPlaybookId = playbookId;

      if (!playbookId || playbookId === "demo-playbook-id") {
        console.info("Getting real playbook for user...");
        actualPlaybookId = await PlaysService.ensureUserHasPlaybook();
        console.info("✅ Using playbook ID:", actualPlaybookId);
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

      const playsForImport = conversionResult.plays.map((play) => {
        const {
          id: _id,
          created_at: _createdAt,
          updated_at: _updatedAt,
          created_by: _createdBy,
          ...playData
        } = play;
        return {
          ...playData,
          playbook_id: actualPlaybookId,
        };
      });
      setImportProgress(60);

      const result = await DataSyncService.bulkCreatePlays(
        actualPlaybookId,
        playsForImport
      );
      setImportProgress(90);

      const importResult: ImportResult = {
        success: result.success,
        totalRows: conversionResult.totalRows,
        importedPlays: result.success ? conversionResult.plays.length : 0,
        errors: [...conversionResult.errors, ...(result.errors || [])],
        warnings: conversionResult.warnings,
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
      setParseResult({ ...parseResult, previews: updatedPreviews });
    }
  };

  const renderStep = () => {
    switch (step) {
      case "upload":
        return (
          <UploadStep
            isProcessing={isProcessing}
            dragActive={dragActive}
            csvFile={csvFile}
            onDrag={handleDrag}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
            onDownloadSample={downloadSampleCSV}
          />
        );
      case "preview":
        return parseResult ? (
          <PreviewStep
            parseResult={parseResult}
            expandedRows={expandedRows}
            onToggleRowExpansion={toggleRowExpansion}
            onUpdatePreview={handleUpdatePreview}
            onBack={() => setStep("upload")}
            onImport={handleImport}
          />
        ) : null;
      case "importing":
        return <ImportingStep importProgress={importProgress} />;
      case "complete":
        return (
          <CompleteStep
            importResult={importResult}
            onClose={onClose}
            onBackToPreview={() => {
              setStep("preview");
              setImportError(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Plays" size="lg">
      <div className="p-lg">{renderStep()}</div>
    </Modal>
  );
};
