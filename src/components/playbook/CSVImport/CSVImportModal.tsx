import React, { useState } from "react";
// (Removed unused Rocket, Wrench imports after log text simplification)
import { Typography } from "../../design-system/Typography";
import {
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Info,
  AlertTriangle,
} from "lucide-react";
import { DataSyncService } from "../../../services/dataSyncService";
import { CSVService, type CSVParseResult } from "../../../services/csv";
import { PlaysService } from "../../../services/playsService";
import { Button } from "../../ui/Button/Button";

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
  const [step, setStep] = useState<
    "upload" | "preview" | "importing" | "complete"
  >("upload");
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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
      alert("Please upload a CSV file");
      return;
    }

    setIsProcessing(true);
    setCsvFile(file);

    try {
      const content = await file.text();

      // Parse the CSV content for preview
      const result = CSVService.parseCSVForPreview(content);
      setParseResult(result);
      setStep("preview");
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!parseResult) return;

    setStep("importing");
    setIsProcessing(true);

    try {
      console.log("Starting CSV import...");

      // Get or create a real playbook for the current user
      let actualPlaybookId = playbookId;

      if (!playbookId || playbookId === "demo-playbook-id") {
        console.log("Getting real playbook for user...");
        actualPlaybookId = await PlaysService.ensureUserHasPlaybook();
        console.log("✅ Using playbook ID:", actualPlaybookId);
      }

      // Convert previews to plays and import
      const conversionResult = CSVService.convertPreviewsToPlays(
        parseResult.previews,
        actualPlaybookId
      );

      if (conversionResult.plays.length === 0) {
        throw new Error("No valid plays to import");
      }

      // Prepare plays for bulk import (remove generated IDs and timestamps)
      const playsForImport = conversionResult.plays.map((play) => {
        const {
          id: _id,
          created_at: _createdAt,
          updated_at: _updatedAt,
          ...playData
        } = play;
        return playData;
      });

      // Use DataSync service to bulk import the converted plays
      const result = await DataSyncService.bulkCreatePlays(
        actualPlaybookId,
        playsForImport
      );

      const importResult: ImportResult = {
        success: result.success,
        totalRows: conversionResult.totalRows,
        importedPlays: result.success ? conversionResult.plays.length : 0,
        errors: [...conversionResult.errors, ...(result.errors || [])],
        warnings: conversionResult.warnings,
      };

      setImportResult(importResult);
      setStep("complete");

      if (onImportComplete) {
        onImportComplete(importResult);
      }
    } catch (error) {
      console.error("❌ Import failed:", error);
      setImportResult({
        success: false,
        totalRows: 0,
        importedPlays: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
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

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Typography
          variant="headline-sm"
          as="h3"
          className="text-slate-900 mb-2"
        >
          Import Plays from CSV
        </Typography>
        <p className="text-sm text-slate-600">
          Upload your existing playbook data to get started quickly
        </p>
      </div>

      <div
        className={`relative placeholder-zone rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-jade-400 surface-subtle"
            : "border-slate-300 hover:border-slate-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-jade-600 mx-auto animate-spin" />
            <p className="text-slate-600">Processing your CSV file...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-slate-400 mx-auto" />
            <div>
              <p className="text-slate-600">
                Drag and drop your CSV file here, or{" "}
                <label className="text-jade-600 hover:text-jade-700 cursor-pointer font-medium">
                  browse to upload
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Supports CSV files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="surface-subtle border border-subtle rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <Typography
              variant="body-sm"
              as="h4"
              className="font-medium text-blue-900 mb-1 tracking-tight"
            >
              Expected CSV Format
            </Typography>
            <p className="text-sm text-blue-800 mb-2">
              Your CSV should include columns for: formation, play_name, p_type,
              personnel, one_word_play, etc.
            </p>
            <Button onClick={downloadSampleCSV} variant="infoLink" size="xs">
              Download sample CSV template →
            </Button>
          </div>
        </div>
      </div>

      {csvFile && (
        <div className="surface-subtle border border-subtle rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <Typography
                variant="body-sm"
                as="p"
                className="font-medium text-green-900"
              >
                File uploaded: {csvFile.name}
              </Typography>
              <p className="text-sm text-green-800">
                Ready to preview and import
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const toggleRowExpansion = (rowNumber: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowNumber)) {
      newExpanded.delete(rowNumber);
    } else {
      newExpanded.add(rowNumber);
    }
    setExpandedRows(newExpanded);
  };

  const renderPreviewStep = () => {
    if (!parseResult) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">No data to preview</p>
        </div>
      );
    }

    const { previews, summary } = parseResult;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-slate-900 mb-2"
          >
            Review Your Plays
          </Typography>
          <p className="text-sm text-slate-600">
            Verify the imported data before adding to your playbook
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 surface-subtle rounded-lg p-4">
          <div className="text-center">
            <Typography variant="headline-sm" as="p" className="mb-1">
              {summary.totalRows}
            </Typography>
            <Typography variant="caption" className="text-slate-600">
              Total Rows
            </Typography>
          </div>
          <div className="text-center">
            <Typography
              variant="headline-sm"
              as="p"
              className="text-green-600 mb-1"
            >
              {summary.validPlays}
            </Typography>
            <Typography variant="caption" className="text-slate-600">
              Valid Plays
            </Typography>
          </div>
          <div className="text-center">
            <Typography
              variant="headline-sm"
              as="p"
              className="text-red-600 mb-1"
            >
              {summary.invalidPlays}
            </Typography>
            <Typography variant="caption" className="text-slate-600">
              Invalid Plays
            </Typography>
          </div>
          <div className="text-center">
            <Typography
              variant="headline-sm"
              as="p"
              className="text-amber-600 mb-1"
            >
              {summary.warnings}
            </Typography>
            <Typography variant="caption" className="text-slate-600">
              Warnings
            </Typography>
          </div>
        </div>

        {/* Column Mapping Info */}
        {Object.keys(summary.suggestedMappings).length > 0 && (
          <div className="surface-subtle border border-subtle rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <Typography
                  variant="body-sm"
                  as="h4"
                  className="font-medium text-blue-900 mb-1 tracking-tight"
                >
                  Smart Column Mapping Applied
                </Typography>
                <p className="text-sm text-blue-800 mb-2">
                  We automatically detected and mapped your columns:
                </p>
                <div className="text-xs text-blue-700 space-y-1">
                  {Object.entries(summary.suggestedMappings).map(
                    ([original, mapped]) => (
                      <div key={original}>
                        <span className="font-mono bg-blue-100 px-1 rounded">
                          {original}
                        </span>
                        {" → "}
                        <span className="font-mono bg-blue-100 px-1 rounded">
                          {mapped}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plays Table */}
        <div className="border border-subtle rounded-lg overflow-hidden">
          <div className="surface-subtle px-4 py-2 border-b border-subtle">
            <Typography
              variant="body-sm"
              as="h4"
              className="font-medium text-slate-900 tracking-tight"
            >
              Play Details
            </Typography>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="surface-subtle sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-8"></th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                    Personnel
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                    Formation
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                    Play Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-8">
                    ...
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {previews.map((preview) => (
                  <React.Fragment key={preview.rowNumber}>
                    <tr
                      className={`${preview.isValid ? "surface-card" : "surface-subtle"} hover:surface-subtle`}
                    >
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {preview.rowNumber}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {preview.data.personnel || "-"}
                      </td>
                      <td className="px-3 py-2 font-medium text-xs">
                        {preview.data.formation}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {preview.data.play_name}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            preview.data.p_type === "Pass"
                              ? "bg-blue-100 text-blue-800"
                              : preview.data.p_type === "Run"
                                ? "bg-green-100 text-green-800"
                                : preview.data.p_type === "RPO"
                                  ? "bg-purple-100 text-purple-800"
                                  : "surface-subtle text-text-primary"
                          }`}
                        >
                          {preview.data.p_type || "Unknown"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1">
                          {preview.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          {preview.warnings.length > 0 && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          onClick={() => toggleRowExpansion(preview.rowNumber)}
                          variant="neutralLink"
                          size="xs"
                          icon={
                            expandedRows.has(preview.rowNumber) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )
                          }
                          iconPosition="only"
                          aria-label={
                            expandedRows.has(preview.rowNumber)
                              ? "Collapse row"
                              : "Expand row"
                          }
                        />
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedRows.has(preview.rowNumber) && (
                      <tr className="surface-subtle">
                        <td colSpan={7} className="px-3 py-4">
                          <div className="space-y-3">
                            {/* Additional Play Details */}
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="font-medium text-slate-600">
                                  Audible:
                                </span>
                                <span className="ml-1 font-mono">
                                  {preview.data.one_word_play || "-"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-600">
                                  Protection:
                                </span>
                                <span className="ml-1 font-mono">
                                  {preview.data.protection || "-"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-600">
                                  Notes:
                                </span>
                                <span className="ml-1">
                                  {preview.data.notes || "-"}
                                </span>
                              </div>
                            </div>

                            {/* Errors */}
                            {preview.errors.length > 0 && (
                              <div className="bg-red-100 border border-subtle rounded p-2">
                                <p className="text-xs font-medium text-red-800 mb-1">
                                  Errors:
                                </p>
                                <ul className="text-xs text-red-700 space-y-1">
                                  {preview.errors.map((error, idx) => (
                                    <li key={idx}>• {error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Warnings */}
                            {preview.warnings.length > 0 && (
                              <div className="bg-amber-100 border border-subtle rounded p-2">
                                <p className="text-xs font-medium text-amber-800 mb-1">
                                  Warnings:
                                </p>
                                <ul className="text-xs text-amber-700 space-y-1">
                                  {preview.warnings.map((warning, idx) => (
                                    <li key={idx}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3">
          <Button onClick={() => setStep("upload")} variant="ghost" size="sm">
            Back
          </Button>
          <Button
            onClick={handleImport}
            disabled={summary.validPlays === 0}
            variant="primary"
            size="sm"
          >
            Import {summary.validPlays} Valid Plays
          </Button>
        </div>
      </div>
    );
  };

  const renderImportingStep = () => (
    <div className="text-center space-y-6">
      <div>
        <Loader2 className="h-16 w-16 text-jade-600 mx-auto mb-4 animate-spin" />
        <Typography
          variant="headline-sm"
          as="h3"
          className="text-slate-900 mb-2"
        >
          Importing Plays...
        </Typography>
        <p className="text-sm text-slate-600">
          Processing your CSV file and adding plays to the database
        </p>
      </div>
      <div className="surface-subtle rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Please wait while we process your plays. This may take a moment for
          large files.
        </p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div>
        {importResult?.success ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <Typography
              variant="headline-sm"
              as="h3"
              className="text-slate-900 mb-2"
            >
              Import Complete!
            </Typography>
            <p className="text-sm text-slate-600">
              Successfully imported {importResult.importedPlays} plays to your
              playbook
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <Typography
              variant="headline-sm"
              as="h3"
              className="text-slate-900 mb-2"
            >
              Import Had Issues
            </Typography>
            <p className="text-sm text-slate-600">
              {importResult?.importedPlays || 0} plays imported, but some errors
              occurred
            </p>
          </>
        )}
      </div>

      {importResult && (
        <div className="surface-subtle rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <Typography
                variant="headline-sm"
                as="p"
                className="text-green-600 mb-1"
              >
                {importResult.importedPlays}
              </Typography>
              <Typography variant="caption" className="text-slate-600">
                Plays Added
              </Typography>
            </div>
            <div>
              <Typography
                variant="headline-sm"
                as="p"
                className="text-blue-600 mb-1"
              >
                {importResult.totalRows}
              </Typography>
              <Typography variant="caption" className="text-slate-600">
                Total Rows
              </Typography>
            </div>
            <div>
              <Typography
                variant="headline-sm"
                as="p"
                className="text-red-600 mb-1"
              >
                {importResult.errors.length}
              </Typography>
              <Typography variant="caption" className="text-slate-600">
                Errors
              </Typography>
            </div>
            <div>
              <Typography
                variant="headline-sm"
                as="p"
                className="text-amber-600 mb-1"
              >
                {importResult.warnings?.length || 0}
              </Typography>
              <Typography variant="caption" className="text-slate-600">
                Warnings
              </Typography>
            </div>
          </div>
        </div>
      )}

      {importResult?.warnings && importResult.warnings.length > 0 && (
        <div className="surface-subtle border border-subtle rounded-lg p-4 text-left">
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-amber-900 mb-2 tracking-tight"
          >
            Import Warnings:
          </Typography>
          <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
            {importResult.warnings
              .slice(0, 5)
              .map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            {importResult.warnings.length > 5 && (
              <li>... and {importResult.warnings.length - 5} more warnings</li>
            )}
          </ul>
        </div>
      )}

      {importResult?.errors && importResult.errors.length > 0 && (
        <div className="surface-subtle border border-subtle rounded-lg p-4 text-left">
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-red-900 mb-2 tracking-tight"
          >
            Import Errors:
          </Typography>
          <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
            {importResult.errors
              .slice(0, 5)
              .map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            {importResult.errors.length > 5 && (
              <li>... and {importResult.errors.length - 5} more errors</li>
            )}
          </ul>
        </div>
      )}

      <Button onClick={onClose} variant="primary" size="sm">
        View Playbook
      </Button>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case "upload":
        return renderUploadStep();
      case "preview":
        return renderPreviewStep();
      case "importing":
        return renderImportingStep();
      case "complete":
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto focus-scroll"
      role="dialog"
      aria-modal="true"
      aria-label="CSV import modal"
      tabIndex={0}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className="inline-block align-bottom surface-card elevation-modal rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="surface-subtle px-6 py-4 border-b border-subtle flex items-center justify-between">
            <Typography
              variant="headline-sm"
              as="h2"
              className="text-slate-900"
            >
              CSV Import
            </Typography>
            <Button
              onClick={onClose}
              variant="neutralLink"
              size="sm"
              icon={<X className="h-6 w-6" />}
              iconPosition="only"
              aria-label="Close modal"
            />
          </div>
          <div className="surface-card px-6 py-8">{renderStep()}</div>
        </div>
      </div>
    </div>
  );
};
