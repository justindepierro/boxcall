import React, { useState } from "react";
// (Removed unused Rocket, Wrench imports after log text simplification)
import { Typography } from "../../design-system/Typography";
import { Icon } from "../../ui/Icon/Icon";
import { DataSyncService, CSVService, PlaysService } from "@services";
import type { CSVParseResult } from "@services/csv";
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
      console.info("Starting CSV import...");

      // Get or create a real playbook for the current user
      let actualPlaybookId = playbookId;

      if (!playbookId || playbookId === "demo-playbook-id") {
        console.info("Getting real playbook for user...");
        actualPlaybookId = await PlaysService.ensureUserHasPlaybook();
        console.info("✅ Using playbook ID:", actualPlaybookId);
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
    <div className="space-y-spacing-lg">
      <div className="text-center">
        <Typography
          variant="headline-sm"
          as="h3"
          className="text-text-primary mb-spacing-xs"
        >
          Import Plays from CSV
        </Typography>
        <p className="text-sm text-text-secondary">
          Upload your existing playbook data to get started quickly
        </p>
      </div>

      <div
        className={`relative placeholder-zone rounded-lg p-spacing-2xl text-center transition-colors ${
          dragActive
            ? "border-electric-400 surface-subtle"
            : "border-border hover:border-border-light"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="space-y-spacing-md">
            <Icon
              name="refresh-cw"
              className="h-12 w-12 text-jade-600 mx-auto animate-spin"
            />
            <p className="text-text-secondary">Processing your CSV file...</p>
          </div>
        ) : (
          <div className="space-y-spacing-md">
            <Icon
              name="upload"
              className="h-12 w-12 text-text-secondary mx-auto"
            />
            <div>
              <p className="text-text-secondary">
                Drag and drop your CSV file here, or{" "}
                <label className="text-text-accent hover:text-text-accent cursor-pointer font-medium">
                  browse to upload
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <p className="text-xs text-text-tertiary mt-spacing-xs">
                Supports CSV files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="surface-subtle border border-subtle rounded-lg p-spacing-md">
        <div className="flex items-start">
          <Icon
            name="info"
            className="h-5 w-5 text-text-info mt-spacing-xs mr-spacing-sm flex-shrink-0"
          />
          <div>
            <Typography
              variant="body-sm"
              as="h4"
              className="font-medium text-text-primary mb-spacing-xs tracking-tight"
            >
              Expected CSV Format
            </Typography>
            <p className="text-sm text-text-secondary mb-spacing-xs">
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
        <div className="surface-subtle border border-subtle rounded-lg p-spacing-md">
          <div className="flex items-center">
            <Icon
              name="check-circle"
              className="h-5 w-5 text-text-success mr-spacing-sm"
            />
            <div>
              <Typography
                variant="body-sm"
                as="p"
                className="font-medium text-text-primary"
              >
                File uploaded: {csvFile.name}
              </Typography>
              <p className="text-sm text-text-secondary">
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
        <div className="text-center py-spacing-2xl">
          <Icon
            name="error"
            className="h-12 w-12 text-text-error mx-auto mb-spacing-md"
          />
          <p className="text-text-secondary">No data to preview</p>
        </div>
      );
    }

    const { previews, summary } = parseResult;

    return (
      <div className="space-y-spacing-lg">
        <div className="text-center">
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-text-primary mb-spacing-xs"
          >
            Review Your Plays
          </Typography>
          <p className="text-sm text-text-secondary">
            Verify the imported data before adding to your playbook
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-spacing-md surface-subtle rounded-lg p-spacing-md">
          <div className="text-center">
            <Typography variant="headline-sm" as="p" className="mb-spacing-xs">
              {summary.totalRows}
            </Typography>
            <Typography variant="caption" className="text-text-secondary">
              Total Rows
            </Typography>
          </div>
          <div className="text-center">
            <Typography
              variant="headline-sm"
              as="p"
              className="text-text-success mb-spacing-xs"
            >
              {summary.validPlays}
            </Typography>
            <Typography variant="caption" className="text-text-secondary">
              Valid Plays
            </Typography>
          </div>
          <div className="text-center">
            <Typography
              variant="headline-sm"
              as="p"
              className="text-text-error mb-spacing-xs"
            >
              {summary.invalidPlays}
            </Typography>
            <Typography variant="caption" className="text-text-secondary">
              Invalid Plays
            </Typography>
          </div>
          <div className="text-center">
            <Typography
              variant="headline-sm"
              as="p"
              className="text-text-warning mb-spacing-xs"
            >
              {summary.warnings}
            </Typography>
            <Typography variant="caption" className="text-text-secondary">
              Warnings
            </Typography>
          </div>
        </div>

        {/* Column Mapping Info */}
        {Object.keys(summary.suggestedMappings).length > 0 && (
          <div className="surface-subtle border border-subtle rounded-lg p-spacing-md">
            <div className="flex items-start">
              <Icon
                name="info"
                className="h-5 w-5 text-text-info mt-spacing-xs mr-spacing-sm flex-shrink-0"
              />
              <div>
                <Typography
                  variant="body-sm"
                  as="h4"
                  className="font-medium text-text-primary mb-spacing-xs tracking-tight"
                >
                  Smart Column Mapping Applied
                </Typography>
                <p className="text-sm text-text-secondary mb-spacing-xs">
                  We automatically detected and mapped your columns:
                </p>
                <div className="text-xs text-text-secondary space-y-spacing-xs">
                  {Object.entries(summary.suggestedMappings).map(
                    ([original, mapped]) => (
                      <div key={original}>
                        <span className="font-mono bg-surface-secondary px-spacing-xs rounded-lg">
                          {original}
                        </span>
                        {" → "}
                        <span className="font-mono bg-surface-secondary px-spacing-xs rounded-lg">
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
          <div className="surface-subtle px-spacing-md py-spacing-xs divider-b">
            <Typography
              variant="body-sm"
              as="h4"
              className="font-medium text-text-primary tracking-tight"
            >
              Play Details
            </Typography>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="surface-subtle sticky top-0">
                <tr>
                  <th className="px-spacing-sm py-spacing-xs text-left text-xs font-medium text-text-secondary w-8"></th>
                  <th className="px-spacing-sm py-spacing-xs text-left text-xs font-medium text-text-secondary">
                    Personnel
                  </th>
                  <th className="px-spacing-sm py-spacing-xs text-left text-xs font-medium text-text-secondary">
                    Formation
                  </th>
                  <th className="px-spacing-sm py-spacing-xs text-left text-xs font-medium text-text-secondary">
                    Play Name
                  </th>
                  <th className="px-spacing-sm py-spacing-xs text-left text-xs font-medium text-text-secondary">
                    Type
                  </th>
                  <th className="px-spacing-sm py-spacing-xs text-left text-xs font-medium text-text-secondary">
                    Status
                  </th>
                  <th className="px-spacing-sm py-spacing-xs text-left text-xs font-medium text-text-secondary w-8">
                    ...
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {previews.map((preview) => (
                  <React.Fragment key={preview.rowNumber}>
                    <tr
                      className={`${preview.isValid ? "surface-card" : "surface-subtle"} hover:surface-subtle`}
                    >
                      <td className="px-spacing-sm py-spacing-xs text-xs text-text-secondary">
                        {preview.rowNumber}
                      </td>
                      <td className="px-spacing-sm py-spacing-xs font-mono text-xs">
                        {preview.data.personnel || "-"}
                      </td>
                      <td className="px-spacing-sm py-spacing-xs font-medium text-xs">
                        {preview.data.formation}
                      </td>
                      <td className="px-spacing-sm py-spacing-xs text-xs">
                        {preview.data.play_name}
                      </td>
                      <td className="px-spacing-sm py-spacing-xs text-xs">
                        <span
                          className={`inline-flex items-center px-spacing-xs py-spacing-xs rounded-full text-xs font-medium ${
                            preview.data.p_type === "Pass"
                              ? "bg-surface-info text-text-info"
                              : preview.data.p_type === "Run"
                                ? "bg-surface-success text-text-success"
                                : preview.data.p_type === "RPO"
                                  ? "bg-surface-accent text-text-accent"
                                  : "surface-subtle text-text-primary"
                          }`}
                        >
                          {preview.data.p_type || "Unknown"}
                        </span>
                      </td>
                      <td className="px-spacing-sm py-spacing-xs">
                        <div className="flex items-center space-x-spacing-xs">
                          {preview.isValid ? (
                            <Icon
                              name="check-circle"
                              className="h-4 w-4 text-text-success"
                            />
                          ) : (
                            <Icon
                              name="error"
                              className="h-4 w-4 text-text-error"
                            />
                          )}
                          {preview.warnings.length > 0 && (
                            <Icon
                              name="alert-triangle"
                              className="h-4 w-4 text-text-warning"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-spacing-sm py-spacing-xs">
                        <Button
                          onClick={() => toggleRowExpansion(preview.rowNumber)}
                          variant="neutralLink"
                          size="xs"
                          icon={
                            expandedRows.has(preview.rowNumber) ? (
                              <Icon name="chevron-down" className="h-4 w-4" />
                            ) : (
                              <Icon name="chevron-right" className="h-4 w-4" />
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
                        <td colSpan={7} className="px-spacing-sm py-spacing-md">
                          <div className="space-y-spacing-sm">
                            {/* Additional Play Details */}
                            <div className="grid grid-cols-3 gap-spacing-md text-xs">
                              <div>
                                <span className="font-medium text-text-secondary">
                                  Audible:
                                </span>
                                <span className="ml-1 font-mono">
                                  {preview.data.one_word_play || "-"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-text-secondary">
                                  Protection:
                                </span>
                                <span className="ml-1 font-mono">
                                  {preview.data.protection || "-"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-text-secondary">
                                  Notes:
                                </span>
                                <span className="ml-1">
                                  {preview.data.notes || "-"}
                                </span>
                              </div>
                            </div>

                            {/* Errors */}
                            {preview.errors.length > 0 && (
                              <div className="bg-surface-error border border-subtle rounded-lg p-spacing-xs">
                                <p className="text-xs font-medium text-text-error mb-spacing-xs">
                                  Errors:
                                </p>
                                <ul className="text-xs text-text-error space-y-spacing-xs">
                                  {preview.errors.map((error, idx) => (
                                    <li key={idx}>• {error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Warnings */}
                            {preview.warnings.length > 0 && (
                              <div className="bg-surface-warning border border-subtle rounded-lg p-spacing-xs">
                                <p className="text-xs font-medium text-text-warning mb-spacing-xs">
                                  Warnings:
                                </p>
                                <ul className="text-xs text-text-warning space-y-spacing-xs">
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
        <div className="flex justify-between gap-spacing-sm">
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
    <div className="text-center space-y-spacing-lg">
      <div>
        <Icon
          name="refresh-cw"
          className="h-16 w-16 text-text-accent mx-auto mb-spacing-md animate-spin"
        />
        <Typography
          variant="headline-sm"
          as="h3"
          className="text-text-primary mb-spacing-xs"
        >
          Importing Plays...
        </Typography>
        <p className="text-sm text-text-secondary">
          Processing your CSV file and adding plays to the database
        </p>
      </div>
      <div className="surface-subtle rounded-lg p-spacing-md">
        <p className="text-sm text-text-secondary">
          Please wait while we process your plays. This may take a moment for
          large files.
        </p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-spacing-lg">
      <div>
        {importResult?.success ? (
          <>
            <Icon
              name="check-circle"
              className="h-16 w-16 text-text-success mx-auto mb-spacing-md"
            />
            <Typography
              variant="headline-sm"
              as="h3"
              className="text-text-primary mb-spacing-xs"
            >
              Import Complete!
            </Typography>
            <p className="text-sm text-text-secondary">
              Successfully imported {importResult.importedPlays} plays to your
              playbook
            </p>
          </>
        ) : (
          <>
            <Icon
              name="error"
              className="h-16 w-16 text-text-error mx-auto mb-spacing-md"
            />
            <Typography
              variant="headline-sm"
              as="h3"
              className="text-text-primary mb-spacing-xs"
            >
              Import Had Issues
            </Typography>
            <p className="text-sm text-text-secondary">
              {importResult?.importedPlays || 0} plays imported, but some errors
              occurred
            </p>
          </>
        )}
      </div>

      {importResult && (
        <div className="surface-subtle rounded-lg p-spacing-md">
          <div className="grid grid-cols-4 gap-spacing-md text-center">
            <div>
              <Typography
                variant="headline-sm"
                as="p"
                className="text-text-success mb-spacing-xs"
              >
                {importResult.importedPlays}
              </Typography>
              <Typography variant="caption" className="text-text-secondary">
                Plays Added
              </Typography>
            </div>
            <div>
              <Typography
                variant="headline-sm"
                as="p"
                className="text-text-info mb-spacing-xs"
              >
                {importResult.totalRows}
              </Typography>
              <Typography variant="caption" className="text-text-secondary">
                Total Rows
              </Typography>
            </div>
            <div>
              <Typography
                variant="headline-sm"
                as="p"
                className="text-text-error mb-spacing-xs"
              >
                {importResult.errors.length}
              </Typography>
              <Typography variant="caption" className="text-text-secondary">
                Errors
              </Typography>
            </div>
            <div>
              <Typography
                variant="headline-sm"
                as="p"
                className="text-text-warning mb-spacing-xs"
              >
                {importResult.warnings?.length || 0}
              </Typography>
              <Typography variant="caption" className="text-text-secondary">
                Warnings
              </Typography>
            </div>
          </div>
        </div>
      )}

      {importResult?.warnings && importResult.warnings.length > 0 && (
        <div className="surface-subtle border border-subtle rounded-lg p-spacing-md text-left">
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-text-warning mb-spacing-xs tracking-tight"
          >
            Import Warnings:
          </Typography>
          <ul className="text-sm text-text-warning list-disc list-inside space-y-spacing-xs">
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
        <div className="surface-subtle border border-subtle rounded-lg p-spacing-md text-left">
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-text-error mb-spacing-xs tracking-tight"
          >
            Import Errors:
          </Typography>
          <ul className="text-sm text-text-error list-disc list-inside space-y-spacing-xs">
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
      <div className="flex items-center justify-center min-h-screen pt-spacing-md px-spacing-md pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-text-primary bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className="inline-block align-bottom surface-card elevation-modal rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="surface-subtle px-spacing-lg py-spacing-md divider-b flex items-center justify-between">
            <Typography
              variant="headline-sm"
              as="h2"
              className="text-text-primary"
            >
              CSV Import
            </Typography>
            <Button
              onClick={onClose}
              variant="neutralLink"
              size="sm"
              icon={<Icon name="close" className="h-6 w-6" />}
              iconPosition="only"
              aria-label="Close modal"
            />
          </div>
          <div className="surface-card px-spacing-lg py-spacing-2xl">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};
