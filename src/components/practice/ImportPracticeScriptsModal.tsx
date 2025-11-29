import { useState, useRef } from "react";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import {
  parseJSONFile,
  type ExportedPracticeScript,
} from "../../utils/practiceScriptExport";

interface ImportPracticeScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ExportedPracticeScript) => Promise<void>;
}

export function ImportPracticeScriptsModal({
  isOpen,
  onClose,
  onImport,
}: ImportPracticeScriptsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ExportedPracticeScript | null>(
    null
  );
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationError(null);
    setParsedData(null);

    // Read and validate the file
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseJSONFile(content);

      if (!result.valid) {
        setValidationError(result.error || "Invalid file format");
        setSelectedFile(null);
      } else if (result.data) {
        setParsedData(result.data);
      }
    };

    reader.onerror = () => {
      setValidationError("Failed to read file");
      setSelectedFile(null);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setImporting(true);
    try {
      await onImport(parsedData);
      handleClose();
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Import failed"
      );
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidationError(null);
    setParsedData(null);
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-backdrop backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-border bg-primary p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Typography variant="headline-sm" className="text-primary">
            Import Practice Scripts
          </Typography>
          <button
            onClick={handleClose}
            disabled={importing}
            className="text-secondary hover:text-primary transition-colors disabled:opacity-50"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-primary">
              Select JSON File
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={importing}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="sm"
                disabled={importing}
                className="flex-1"
              >
                <Icon name="upload" className="mr-2 h-4 w-4" />
                {selectedFile ? "Change File" : "Choose File"}
              </Button>
            </div>

            {selectedFile && !validationError && (
              <div className="mt-2 flex items-center gap-2 rounded-md bg-success-bg p-3">
                <Icon
                  name="check-circle"
                  className="h-5 w-5 text-success-600"
                />
                <div className="flex-1">
                  <Typography variant="body-sm" className="text-primary">
                    {selectedFile.name}
                  </Typography>
                  {parsedData && (
                    <Typography variant="body-xs" className="text-secondary">
                      {parsedData.scripts.length} script
                      {parsedData.scripts.length !== 1 ? "s" : ""} found
                    </Typography>
                  )}
                </div>
              </div>
            )}

            {validationError && (
              <div className="mt-2 flex items-center gap-2 rounded-md bg-error-bg p-3">
                <Icon name="alert-circle" className="h-5 w-5 text-error-600" />
                <Typography variant="body-sm" className="text-primary">
                  {validationError}
                </Typography>
              </div>
            )}
          </div>

          {/* Import Details */}
          {parsedData && !validationError && (
            <div className="rounded-md border border-border bg-secondary p-4">
              <Typography
                variant="body-sm"
                className="mb-3 font-medium text-primary"
              >
                Import Summary
              </Typography>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Scripts to import:</span>
                  <span className="font-medium text-primary">
                    {parsedData.scripts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Total plays:</span>
                  <span className="font-medium text-primary">
                    {parsedData.scripts.reduce(
                      (sum, s) => sum + s.plays.length,
                      0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Exported:</span>
                  <span className="font-medium text-primary">
                    {new Date(parsedData.exportedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          {parsedData && !validationError && (
            <div className="rounded-md bg-warning-bg p-3">
              <div className="flex gap-2">
                <Icon
                  name="alert-triangle"
                  className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <Typography
                    variant="body-sm"
                    className="text-primary font-medium"
                  >
                    Import Note
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary mt-1">
                    Scripts will be imported as new items. Existing scripts will
                    not be modified.
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={handleClose}
            variant="secondary"
            size="sm"
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="primary"
            size="sm"
            disabled={!parsedData || importing}
          >
            {importing ? (
              <>
                <Icon name="loader" className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Icon name="download" className="mr-2 h-4 w-4" />
                Import Scripts
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
