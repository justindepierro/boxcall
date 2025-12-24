/**
 * CSVImport Step Components
 * Individual step renderers for the CSV import wizard
 */

import React from "react";
import { Typography } from "../../design-system/Typography";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import type { CSVParseResult } from "@services/csv";
import { CSVValidationRowEditor } from "./CSVValidationRowEditor";

interface ImportResult {
  success: boolean;
  totalRows: number;
  importedPlays: number;
  errors: string[];
  warnings: string[];
}

// Upload Step
interface UploadStepProps {
  isProcessing: boolean;
  dragActive: boolean;
  csvFile: File | null;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadSample: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  isProcessing,
  dragActive,
  csvFile,
  onDrag,
  onDrop,
  onFileChange,
  onDownloadSample,
}) => (
  <div className="space-y-lg">
    <div className="text-center">
      <Typography variant="headline-sm" as="h3" className="text-primary mb-xs">
        Import Plays from CSV
      </Typography>
      <p className="text-sm text-secondary">
        Upload your existing playbook data to get started quickly
      </p>
    </div>

    <div
      className={`relative placeholder-zone rounded-lg p-2xl text-center transition-colors ${
        dragActive
          ? "border-electric-400 bg-subtle"
          : "border-border hover:border-light"
      }`}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
    >
      {isProcessing ? (
        <div className="space-y-md">
          <Icon
            name="refresh-cw"
            className="h-12 w-12 text-jade-600 mx-auto animate-spin"
          />
          <p className="text-secondary">Processing your CSV file...</p>
        </div>
      ) : (
        <div className="space-y-md">
          <Icon name="upload" className="h-12 w-12 text-secondary mx-auto" />
          <div>
            <p className="text-secondary">
              Drag and drop your CSV file here, or{" "}
              <label className="text-accent hover:text-accent cursor-pointer font-medium">
                browse to upload
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
            </p>
            <p className="text-xs text-tertiary mt-xs">
              Supports CSV files up to 10MB
            </p>
          </div>
        </div>
      )}
    </div>

    <div className="bg-subtle border border-muted rounded-lg p-md">
      <div className="flex items-start">
        <Icon
          name="info"
          className="h-5 w-5 text-info mt-xs mr-sm flex-shrink-0"
        />
        <div>
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-primary mb-xs tracking-tight"
          >
            Expected CSV Format
          </Typography>
          <p className="text-sm text-secondary mb-xs">
            Your CSV should include columns for: formation, play_name, p_type,
            personnel, one_word_play. You can also include advanced fields like
            protection, p_dir, f_dir, tags (ftag/p_tag), strengths (r_str/p_str),
            preferences (pref_*), check_into, key_player*, motion/shift, and
            notes.
          </p>
          <Button onClick={onDownloadSample} variant="infoLink" size="xs">
            Download sample CSV template →
          </Button>
        </div>
      </div>
    </div>

    {csvFile && (
      <div className="bg-subtle border border-muted rounded-lg p-md">
        <div className="flex items-center">
          <Icon name="check-circle" className="h-5 w-5 text-success mr-sm" />
          <div>
            <Typography
              variant="body-sm"
              as="p"
              className="font-medium text-primary"
            >
              File uploaded: {csvFile.name}
            </Typography>
            <p className="text-sm text-secondary">
              Ready to preview and import
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Importing Step
interface ImportingStepProps {
  importProgress: number;
}

export const ImportingStep: React.FC<ImportingStepProps> = ({
  importProgress,
}) => (
  <div className="text-center space-y-lg">
    <div>
      <div className="relative">
        <Icon
          name="loader"
          className="h-16 w-16 text-accent mx-auto mb-md animate-spin"
        />
      </div>
      <Typography variant="headline-sm" as="h3" className="text-primary mb-xs">
        Importing Plays...
      </Typography>
      <p className="text-sm text-secondary">
        Processing your CSV file and adding plays to the database
      </p>
    </div>

    <div className="bg-subtle rounded-lg p-md">
      <div className="mb-sm">
        <div className="flex justify-between items-center mb-xs">
          <span className="text-sm font-medium text-primary">Progress</span>
          <span className="text-sm font-medium text-accent">
            {importProgress}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${importProgress}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-secondary">
        Please wait while we process your plays. This may take a moment for
        large files.
      </p>
    </div>
  </div>
);

// Complete Step
interface CompleteStepProps {
  importResult: ImportResult | null;
  onClose: () => void;
  onBackToPreview: () => void;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  importResult,
  onClose,
  onBackToPreview,
}) => (
  <div className="text-center space-y-lg">
    <div>
      {importResult?.success ? (
        <>
          <Icon
            name="check-circle"
            className="h-16 w-16 text-success mx-auto mb-md"
          />
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-primary mb-xs"
          >
            Import Complete!
          </Typography>
          <p className="text-sm text-secondary">
            Successfully imported {importResult.importedPlays} plays to your
            playbook
          </p>
        </>
      ) : (
        <>
          <Icon
            name="alert-circle"
            className="h-16 w-16 text-error mx-auto mb-md"
          />
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-error mb-xs"
          >
            {importResult?.importedPlays
              ? "Import Partially Failed"
              : "Import Failed"}
          </Typography>
          <p className="text-sm text-secondary">
            {importResult?.importedPlays
              ? `${importResult.importedPlays} plays imported, but some errors occurred`
              : "Unable to import plays. Please check the errors below and try again."}
          </p>
        </>
      )}
    </div>

    {importResult && (
      <div className="bg-subtle rounded-lg p-md">
        <div className="grid grid-cols-4 gap-md text-center">
          <div>
            <Typography
              variant="headline-sm"
              as="p"
              className="text-success mb-xs"
            >
              {importResult.importedPlays}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Plays Added
            </Typography>
          </div>
          <div>
            <Typography
              variant="headline-sm"
              as="p"
              className="text-info mb-xs"
            >
              {importResult.totalRows}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Total Rows
            </Typography>
          </div>
          <div>
            <Typography
              variant="headline-sm"
              as="p"
              className="text-error mb-xs"
            >
              {importResult.errors.length}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Errors
            </Typography>
          </div>
          <div>
            <Typography
              variant="headline-sm"
              as="p"
              className="text-warning mb-xs"
            >
              {importResult.warnings?.length || 0}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Warnings
            </Typography>
          </div>
        </div>
      </div>
    )}

    {importResult?.warnings && importResult.warnings.length > 0 && (
      <div className="bg-subtle border border-muted rounded-lg p-md text-left">
        <Typography
          variant="body-sm"
          as="h4"
          className="font-medium text-warning mb-xs tracking-tight"
        >
          Import Warnings:
        </Typography>
        <ul className="text-sm text-warning list-disc list-inside space-y-xs">
          {importResult.warnings.slice(0, 5).map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
          {importResult.warnings.length > 5 && (
            <li>... and {importResult.warnings.length - 5} more warnings</li>
          )}
        </ul>
      </div>
    )}

    {importResult?.errors && importResult.errors.length > 0 && (
      <div className="bg-subtle border border-muted rounded-lg p-md text-left">
        <Typography
          variant="body-sm"
          as="h4"
          className="font-medium text-error mb-xs tracking-tight"
        >
          Import Errors:
        </Typography>
        <ul className="text-sm text-error list-disc list-inside space-y-xs">
          {importResult.errors.slice(0, 5).map((error, index) => (
            <li key={index}>{error}</li>
          ))}
          {importResult.errors.length > 5 && (
            <li>... and {importResult.errors.length - 5} more errors</li>
          )}
        </ul>
      </div>
    )}

    <div className="flex gap-sm justify-center">
      {importResult?.success ? (
        <Button onClick={onClose} variant="primary" size="sm">
          View Playbook
        </Button>
      ) : (
        <>
          <Button onClick={onBackToPreview} variant="secondary" size="sm">
            Back to Preview
          </Button>
          <Button onClick={onClose} variant="primary" size="sm">
            Close
          </Button>
        </>
      )}
    </div>
  </div>
);

// Preview Step
interface PreviewStepProps {
  parseResult: CSVParseResult;
  expandedRows: Set<number>;
  onToggleRowExpansion: (rowNumber: number) => void;
  onUpdatePreview: (
    rowNumber: number,
    field: string,
    value: string | boolean | number
  ) => void;
  onBack: () => void;
  onImport: () => void;
  importIntent?: CSVImportIntent;
  onChangeImportIntent?: (intent: CSVImportIntent) => void;
  rowDecisions?: Record<number, CSVRowMatchDecision>;
  onApproveUpdate?: (rowNumber: number, approved: boolean) => void;
  onSetRowMode?: (rowNumber: number, mode: CSVRowImportMode) => void;
  onApproveAllUpdates?: () => void;
}

export type CSVImportIntent = "update_existing" | "import_new";

export type CSVRowImportMode = "create" | "update" | "skip";

export interface CSVRowMatchDecision {
  mode: CSVRowImportMode;
  approved: boolean;
  matchedPlayId?: string;
  matchedPlayName?: string;
  similarity?: number;
}

type CSVPreviewRow = CSVParseResult["previews"][number];
type CSVPreviewSummary = CSVParseResult["summary"];

function getPlayTypePillClasses(pType: string | undefined): string {
  if (pType === "Pass") return "bg-info/20 text-info";
  if (pType === "Run") return "bg-success/20 text-success";
  if (pType === "RPO") return "bg-surface-accent text-accent";
  return "bg-subtle text-primary";
}

const PreviewSummaryStats: React.FC<{ summary: CSVPreviewSummary }> = ({
  summary,
}) => {
  return (
    <div className="grid grid-cols-4 gap-md bg-subtle rounded-lg p-md">
      <div className="text-center">
        <Typography variant="headline-sm" as="p" className="mb-xs">
          {summary.totalRows}
        </Typography>
        <Typography variant="caption" className="text-secondary">
          Total Rows
        </Typography>
      </div>
      <div className="text-center">
        <Typography variant="headline-sm" as="p" className="text-success mb-xs">
          {summary.validPlays}
        </Typography>
        <Typography variant="caption" className="text-secondary">
          Valid Plays
        </Typography>
      </div>
      <div className="text-center">
        <Typography variant="headline-sm" as="p" className="text-error mb-xs">
          {summary.invalidPlays}
        </Typography>
        <Typography variant="caption" className="text-secondary">
          Invalid Plays
        </Typography>
      </div>
      <div className="text-center">
        <Typography variant="headline-sm" as="p" className="text-warning mb-xs">
          {summary.warnings}
        </Typography>
        <Typography variant="caption" className="text-secondary">
          Warnings
        </Typography>
      </div>
    </div>
  );
};

const PreviewColumnMappingInfo: React.FC<{
  suggestedMappings: CSVPreviewSummary["suggestedMappings"];
}> = ({ suggestedMappings }) => {
  if (Object.keys(suggestedMappings).length === 0) return null;

  return (
    <div className="bg-subtle border border-muted rounded-lg p-md">
      <div className="flex items-start">
        <Icon
          name="info"
          className="h-5 w-5 text-info mt-xs mr-sm flex-shrink-0"
        />
        <div>
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-primary mb-xs tracking-tight"
          >
            Smart Column Mapping Applied
          </Typography>
          <p className="text-sm text-secondary mb-xs">
            We automatically detected and mapped your columns:
          </p>
          <div className="text-xs text-secondary space-y-xs">
            {Object.entries(suggestedMappings).map(([original, mapped]) => (
              <div key={original}>
                <span className="font-mono bg-secondary px-xs rounded-lg">
                  {original}
                </span>
                {" → "}
                <span className="font-mono bg-secondary px-xs rounded-lg">
                  {mapped}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PreviewPlaysTable: React.FC<{
  previews: CSVPreviewRow[];
  expandedRows: Set<number>;
  onToggleRowExpansion: (rowNumber: number) => void;
  onUpdatePreview: PreviewStepProps["onUpdatePreview"];
  existingFormations: string[];
  existingPlayNames: string[];
  existingPersonnel: string[];
  rowDecisions?: Record<number, CSVRowMatchDecision>;
  onApproveUpdate?: PreviewStepProps["onApproveUpdate"];
  onSetRowMode?: PreviewStepProps["onSetRowMode"];
}> = ({
  previews,
  expandedRows,
  onToggleRowExpansion,
  onUpdatePreview,
  existingFormations,
  existingPlayNames,
  existingPersonnel,
  rowDecisions,
  onApproveUpdate,
  onSetRowMode,
}) => {
  return (
    <div className="border border-muted rounded-lg overflow-hidden">
      <div className="bg-subtle px-md py-xs divider-b">
        <Typography
          variant="body-sm"
          as="h4"
          className="font-medium text-primary tracking-tight"
        >
          Play Details
        </Typography>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-subtle sticky top-0">
            <tr>
              <th className="px-sm py-xs text-left text-xs font-medium text-secondary">
                Action
              </th>
              <th className="px-sm py-xs text-left text-xs font-medium text-secondary w-8"></th>
              <th className="px-sm py-xs text-left text-xs font-medium text-secondary">
                Personnel
              </th>
              <th className="px-sm py-xs text-left text-xs font-medium text-secondary">
                Formation
              </th>
              <th className="px-sm py-xs text-left text-xs font-medium text-secondary">
                Play Name
              </th>
              <th className="px-sm py-xs text-left text-xs font-medium text-secondary">
                Type
              </th>
              <th className="px-sm py-xs text-left text-xs font-medium text-secondary">
                Status
              </th>
              <th className="px-sm py-xs text-left text-xs font-medium text-secondary w-8">
                ...
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {previews.map((preview) => (
              <React.Fragment key={preview.rowNumber}>
                <tr
                  className={`${preview.isValid ? "bg-primary" : "bg-subtle"} hover:bg-subtle`}
                >
                  <td className="px-sm py-xs align-top">
                    {(() => {
                      const decision = rowDecisions?.[preview.rowNumber];
                      const mode = decision?.mode || "create";
                      const isUpdate = mode === "update";
                      const isSkip = mode === "skip";
                      const approved = Boolean(decision?.approved);
                      const similarity =
                        typeof decision?.similarity === "number"
                          ? Math.round(decision.similarity * 100)
                          : null;

                      const badgeClass = isSkip
                        ? "bg-muted text-tertiary"
                        : isUpdate
                          ? approved
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                          : "bg-subtle text-secondary";

                      const badgeText = isSkip
                        ? "Skip"
                        : isUpdate
                          ? approved
                            ? "Update (approved)"
                            : "Update (needs approval)"
                          : "Create";

                      return (
                        <div className="space-y-xs">
                          <div
                            className={`inline-flex items-center px-xs py-xs rounded-full text-xs font-medium ${badgeClass}`}
                          >
                            {badgeText}
                          </div>

                          {decision?.matchedPlayName && isUpdate && (
                            <div className="text-xs text-tertiary">
                              Match: {decision.matchedPlayName}
                              {similarity !== null ? ` (${similarity}%)` : ""}
                            </div>
                          )}

                          {onSetRowMode && (
                            <div className="flex flex-wrap gap-xs">
                              {mode !== "create" && (
                                <Button
                                  onClick={() =>
                                    onSetRowMode(preview.rowNumber, "create")
                                  }
                                  variant="neutralLink"
                                  size="xs"
                                >
                                  Create
                                </Button>
                              )}
                              {decision?.matchedPlayId && mode !== "update" && (
                                <Button
                                  onClick={() =>
                                    onSetRowMode(preview.rowNumber, "update")
                                  }
                                  variant="neutralLink"
                                  size="xs"
                                >
                                  Update
                                </Button>
                              )}
                              {mode !== "skip" && (
                                <Button
                                  onClick={() =>
                                    onSetRowMode(preview.rowNumber, "skip")
                                  }
                                  variant="neutralLink"
                                  size="xs"
                                >
                                  Skip
                                </Button>
                              )}
                            </div>
                          )}

                          {isUpdate && onApproveUpdate && (
                            <Button
                              onClick={() =>
                                onApproveUpdate(preview.rowNumber, !approved)
                              }
                              variant={approved ? "neutralLink" : "infoLink"}
                              size="xs"
                            >
                              {approved ? "Unapprove" : "Approve"}
                            </Button>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-sm py-xs text-xs text-secondary">
                    {preview.rowNumber}
                  </td>
                  <td className="px-sm py-xs font-mono text-xs">
                    {preview.data.personnel || "-"}
                  </td>
                  <td className="px-sm py-xs font-medium text-xs">
                    {preview.data.formation}
                  </td>
                  <td className="px-sm py-xs text-xs">
                    {preview.data.play_name}
                  </td>
                  <td className="px-sm py-xs text-xs">
                    <span
                      className={`inline-flex items-center px-xs py-xs rounded-full text-xs font-medium ${getPlayTypePillClasses(
                        preview.data.p_type
                      )}`}
                    >
                      {preview.data.p_type || "Unknown"}
                    </span>
                  </td>
                  <td className="px-sm py-xs">
                    <div className="flex items-center space-x-xs">
                      {preview.isValid ? (
                        <Icon
                          name="check-circle"
                          className="h-4 w-4 text-success"
                        />
                      ) : (
                        <Icon name="error" className="h-4 w-4 text-error" />
                      )}
                      {preview.warnings.length > 0 && (
                        <Icon
                          name="alert-triangle"
                          className="h-4 w-4 text-warning"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-sm py-xs">
                    <Button
                      onClick={() => onToggleRowExpansion(preview.rowNumber)}
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

                {expandedRows.has(preview.rowNumber) && (
                  <tr className="bg-subtle">
                    <td colSpan={8} className="px-sm py-md">
                      <CSVValidationRowEditor
                        preview={preview}
                        existingFormations={existingFormations}
                        existingPlayNames={existingPlayNames}
                        existingPersonnel={existingPersonnel}
                        onUpdate={onUpdatePreview}
                        onAcceptSuggestion={onUpdatePreview}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PreviewStep: React.FC<PreviewStepProps> = ({
  parseResult,
  expandedRows,
  onToggleRowExpansion,
  onUpdatePreview,
  onBack,
  onImport,
  importIntent = "import_new",
  onChangeImportIntent,
  rowDecisions,
  onApproveUpdate,
  onSetRowMode,
  onApproveAllUpdates,
}) => {
  const { previews, summary } = parseResult;

  const validPreviews = previews.filter((p) => p.isValid);
  const decisions = rowDecisions || {};

  const counts = validPreviews.reduce(
    (acc, p) => {
      const d = decisions[p.rowNumber];
      const mode = d?.mode || "create";
      if (mode === "skip") {
        acc.skip += 1;
        return acc;
      }

      if (mode === "update") {
        acc.update += 1;
        if (d?.approved) acc.updateApproved += 1;
        else acc.updatePending += 1;
        return acc;
      }

      acc.create += 1;
      return acc;
    },
    {
      create: 0,
      update: 0,
      updateApproved: 0,
      updatePending: 0,
      skip: 0,
    }
  );

  const hasUpdateSuggestions = counts.update > 0;
  const hasActionableWork = counts.create > 0 || counts.updateApproved > 0;

  const existingFormations = (parseResult.existingPlays || [])
    .map((p) => p.formation)
    .filter((f): f is string => !!f);
  const existingPlayNames = (parseResult.existingPlays || [])
    .map((p) => p.play_name)
    .filter((n): n is string => !!n);
  const existingPersonnel = (parseResult.existingPlays || [])
    .map((p) => p.personnel)
    .filter((p): p is string => !!p);

  return (
    <div className="space-y-lg">
      <div className="text-center">
        <Typography
          variant="headline-sm"
          as="h3"
          className="text-primary mb-xs"
        >
          Review Your Plays
        </Typography>
        <p className="text-sm text-secondary">
          Verify the imported data before adding to your playbook
        </p>
      </div>

      {onChangeImportIntent && (
        <div className="bg-subtle border border-muted rounded-lg p-md">
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-primary mb-sm tracking-tight"
          >
            Intent
          </Typography>
          <div className="flex flex-wrap gap-sm">
            <Button
              onClick={() => onChangeImportIntent("update_existing")}
              variant={importIntent === "update_existing" ? "secondary" : "ghost"}
              size="sm"
            >
              Update Existing Plays
            </Button>
            <Button
              onClick={() => onChangeImportIntent("import_new")}
              variant={importIntent === "import_new" ? "secondary" : "ghost"}
              size="sm"
            >
              Import New Plays
            </Button>
          </div>
          <p className="text-sm text-secondary mt-sm">
            {importIntent === "update_existing"
              ? "Best for re-uploading the same CSV: only approved updates will apply; unmatched rows will be skipped by default."
              : "Best for adding plays: new rows will be created; rows that look like duplicates may be skipped by default."}
          </p>
        </div>
      )}

      <PreviewSummaryStats summary={summary} />

      <PreviewColumnMappingInfo suggestedMappings={summary.suggestedMappings} />

      <PreviewPlaysTable
        previews={previews}
        expandedRows={expandedRows}
        onToggleRowExpansion={onToggleRowExpansion}
        onUpdatePreview={onUpdatePreview}
        existingFormations={existingFormations}
        existingPlayNames={existingPlayNames}
        existingPersonnel={existingPersonnel}
        rowDecisions={rowDecisions}
        onApproveUpdate={onApproveUpdate}
        onSetRowMode={onSetRowMode}
      />

      {(counts.update > 0 || counts.skip > 0) && (
        <div className="bg-subtle border border-muted rounded-lg p-md">
          <Typography
            variant="body-sm"
            as="h4"
            className="font-medium text-primary mb-xs tracking-tight"
          >
            What will happen when you apply this CSV
          </Typography>
          <div className="text-sm text-secondary space-y-xs">
            <p>
              Create: <span className="text-primary">{counts.create}</span>
              {"  "}• Update: <span className="text-primary">{counts.update}</span>
              {counts.update > 0 && (
                <>
                  {" "}(
                  <span className="text-primary">{counts.updateApproved}</span>
                  {" approved, "}
                  <span className="text-primary">{counts.updatePending}</span>
                  {" pending approval"})
                </>
              )}
              {"  "}• Skip: <span className="text-primary">{counts.skip}</span>
            </p>
            {hasUpdateSuggestions && counts.updatePending > 0 && (
              <p>
                Pending updates will be skipped until approved.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between gap-sm">
        <Button onClick={onBack} variant="ghost" size="sm">
          Back
        </Button>

        {onApproveAllUpdates && hasUpdateSuggestions && (
          <Button onClick={onApproveAllUpdates} variant="secondary" size="sm">
            Approve All Updates
          </Button>
        )}

        <Button
          onClick={onImport}
          disabled={summary.validPlays === 0 || !hasActionableWork}
          variant="primary"
          size="sm"
        >
          {importIntent === "update_existing"
            ? `Apply Approved Updates (${counts.updateApproved})`
            : hasUpdateSuggestions
              ? `Apply Approved Changes (${counts.create + counts.updateApproved})`
              : `Import ${summary.validPlays} Valid Plays`}
        </Button>
      </div>
    </div>
  );
};
