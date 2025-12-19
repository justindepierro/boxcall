import React, { useState, useRef } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import { Button } from "../ui/Button/Button";
import { Card } from "../ui";
import { logError } from "../../utils/logger";

interface RosterCSVData {
  firstName: string;
  lastName: string;
  jerseyNumber?: string;
  position?: string;
  grade?: string;
  height?: string;
  weight?: string;
  email?: string;
}

interface RosterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (players: RosterCSVData[]) => Promise<void>;
}

type RosterImportStep = "upload" | "preview" | "importing";

const RosterImportModalHeader: React.FC<{
  onRequestClose: () => void;
}> = ({ onRequestClose }) => (
  <div className="p-lg">
    <div className="flex items-center justify-between">
      <Typography variant="headline-lg">Import Team Roster</Typography>
      <button
        onClick={onRequestClose}
        className="p-xs hover:bg-muted rounded-lg"
      >
        <Icon name="close" className="h-5 w-5" />
      </button>
    </div>
    <Typography variant="body-md" color="muted" className="mt-xs">
      Upload a CSV file in MaxPreps format to import your team roster
    </Typography>
  </div>
);

const RosterImportUploadStep: React.FC<{
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ fileInputRef, onFileSelect }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-info/20 rounded-full flex items-center justify-center mb-lg">
      <Icon name="upload" className="h-12 w-12 text-info" />
    </div>
    <Typography variant="headline-md" className="mb-md">
      Upload Roster CSV
    </Typography>
    <Typography
      variant="body-lg"
      color="muted"
      className="mb-lg content-narrow"
    >
      Select a CSV file exported from MaxPreps or in the standard roster format.
      The file should include player names, jersey numbers, and positions.
    </Typography>

    <div className="space-y-md">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={onFileSelect}
        className="hidden"
        id="roster-csv-upload"
      />
      <label htmlFor="roster-csv-upload">
        <Button
          variant="primary"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon name="upload" className="h-5 w-5 mr-xs" />
          Choose CSV File
        </Button>
      </label>

      <div className="text-sm text-secondary">
        <p className="mb-xs">Expected CSV format:</p>
        <div className="bg-secondary p-sm rounded-lg text-left font-mono text-xs">
          First Name,Last Name,Jersey Number,Position,Grade,Height,Weight,Email
          <br />
          John,Doe,12,QB,12,6'2",185,john.doe@email.com
          <br />
          Jane,Smith,25,WR,11,5'8",145,jane.smith@email.com
        </div>
      </div>
    </div>
  </div>
);

const RosterImportPreviewStep: React.FC<{
  csvData: RosterCSVData[];
  errors: string[];
  warnings: string[];
  onBack: () => void;
}> = ({ csvData, errors, warnings, onBack }) => (
  <div className="space-y-lg">
    <div className="flex items-center justify-between">
      <Typography variant="headline-md">
        Preview Import ({csvData.length} players)
      </Typography>
      <Button variant="secondary" size="sm" onClick={onBack}>
        <Icon name="arrow-left" className="h-4 w-4 mr-xs" />
        Back to Upload
      </Button>
    </div>

    {errors.length > 0 && (
      <Card className="border-error bg-surface-error">
        <div className="flex items-start space-x-sm">
          <Icon name="alert" className="h-5 w-5 text-error mt-0.5" />
          <div>
            <Typography variant="body-sm" className="text-error font-medium">
              Import Errors ({errors.length})
            </Typography>
            <ul className="mt-xs text-sm text-error-hover space-y-1">
              {errors.map((message, index) => (
                <li key={index}>• {message}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    )}

    {warnings.length > 0 && (
      <Card className="border-warning bg-warning/20">
        <div className="flex items-start space-x-sm">
          <Icon name="alert" className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <Typography
              variant="body-sm"
              className="text-warning-hover font-medium"
            >
              Warnings ({warnings.length})
            </Typography>
            <ul className="mt-xs text-sm text-warning-hover space-y-1">
              {warnings.map((message, index) => (
                <li key={index}>• {message}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    )}

    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-lg py-sm text-left text-xs font-medium text-muted uppercase tracking-wider">
                Name
              </th>
              <th className="px-lg py-sm text-left text-xs font-medium text-muted uppercase tracking-wider">
                Jersey
              </th>
              <th className="px-lg py-sm text-left text-xs font-medium text-muted uppercase tracking-wider">
                Position
              </th>
              <th className="px-lg py-sm text-left text-xs font-medium text-muted uppercase tracking-wider">
                Grade
              </th>
              <th className="px-lg py-sm text-left text-xs font-medium text-muted uppercase tracking-wider">
                Height
              </th>
              <th className="px-lg py-sm text-left text-xs font-medium text-muted uppercase tracking-wider">
                Weight
              </th>
            </tr>
          </thead>
          <tbody className="bg-primary divide-y divide-border">
            {csvData.slice(0, 10).map((player, index) => (
              <tr key={index}>
                <td className="px-lg py-md whitespace-nowrap text-sm font-medium text-primary">
                  {player.firstName} {player.lastName}
                </td>
                <td className="px-lg py-md whitespace-nowrap text-sm text-muted">
                  {player.jerseyNumber || "-"}
                </td>
                <td className="px-lg py-md whitespace-nowrap text-sm text-muted">
                  {player.position || "-"}
                </td>
                <td className="px-lg py-md whitespace-nowrap text-sm text-muted">
                  {player.grade || "-"}
                </td>
                <td className="px-lg py-md whitespace-nowrap text-sm text-muted">
                  {player.height || "-"}
                </td>
                <td className="px-lg py-md whitespace-nowrap text-sm text-muted">
                  {player.weight || "-"}
                </td>
              </tr>
            ))}
            {csvData.length > 10 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-lg py-md text-center text-sm text-muted"
                >
                  ... and {csvData.length - 10} more players
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const RosterImportImportingStep: React.FC<{ playerCount: number }> = ({
  playerCount,
}) => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-info mx-auto mb-md"></div>
    <Typography variant="headline-md" className="mb-xs">
      Importing Roster...
    </Typography>
    <Typography variant="body-md" color="muted">
      Please wait while we add {playerCount} players to your team.
    </Typography>
  </div>
);

const RosterImportPreviewFooter: React.FC<{
  onCancel: () => void;
  onImport: () => void;
  playerCount: number;
  disableImport: boolean;
}> = ({ onCancel, onImport, playerCount, disableImport }) => (
  <div className="p-lg bg-secondary">
    <div className="flex justify-end space-x-sm">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onImport} disabled={disableImport}>
        <Icon name="upload" className="h-4 w-4 mr-xs" />
        Import {playerCount} Players
      </Button>
    </div>
  </div>
);

export const RosterImportModal: React.FC<RosterImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [step, setStep] = useState<RosterImportStep>("upload");
  const [csvData, setCsvData] = useState<RosterCSVData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedData = parseMaxPrepsCSV(text);
      setCsvData(parsedData.players);
      setErrors(parsedData.errors);
      setWarnings(parsedData.warnings);
      setStep("preview");
    } catch {
      setErrors(["Failed to parse CSV file. Please check the format."]);
    }
  };

  const handleImport = async () => {
    setStep("importing");
    try {
      await onImport(csvData);
      onClose();
      // Reset state
      setStep("upload");
      setCsvData([]);
      setErrors([]);
      setWarnings([]);
    } catch {
      setErrors(["Failed to import roster. Please try again."]);
      setStep("preview");
    }
  };

  const resetModal = () => {
    setStep("upload");
    setCsvData([]);
    setErrors([]);
    setWarnings([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay-modal flex items-center justify-center z-modal p-md">
      <div className="bg-primary rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <RosterImportModalHeader
          onRequestClose={() => {
            resetModal();
            onClose();
          }}
        />

        {/* Content */}
        <div className="p-lg overflow-y-auto max-h-[60vh]">
          {step === "upload" && (
            <RosterImportUploadStep
              fileInputRef={fileInputRef}
              onFileSelect={handleFileSelect}
            />
          )}

          {step === "preview" && (
            <RosterImportPreviewStep
              csvData={csvData}
              errors={errors}
              warnings={warnings}
              onBack={() => setStep("upload")}
            />
          )}

          {step === "importing" && (
            <RosterImportImportingStep playerCount={csvData.length} />
          )}
        </div>

        {/* Footer */}
        {step === "preview" && (
          <RosterImportPreviewFooter
            onCancel={() => {
              resetModal();
              onClose();
            }}
            onImport={handleImport}
            playerCount={csvData.length}
            disableImport={errors.length > 0}
          />
        )}
      </div>
    </div>
  );
};

// CSV parsing logic for MaxPreps format
function parseMaxPrepsCSV(csvText: string): {
  players: RosterCSVData[];
  errors: string[];
  warnings: string[];
} {
  const players: RosterCSVData[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      errors.push(
        "CSV file must contain at least a header row and one data row"
      );
      return { players, errors, warnings };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    // Map common header variations
    const headerMap: { [key: string]: keyof RosterCSVData } = {
      "first name": "firstName",
      firstname: "firstName",
      first: "firstName",
      "last name": "lastName",
      lastname: "lastName",
      last: "lastName",
      "jersey number": "jerseyNumber",
      jersey: "jerseyNumber",
      number: "jerseyNumber",
      position: "position",
      pos: "position",
      grade: "grade",
      class: "grade",
      year: "grade",
      height: "height",
      weight: "weight",
      email: "email",
      "e-mail": "email",
    };

    const mappedHeaders = headers.map((h) => headerMap[h] || h);

    // Check for required fields
    if (
      !mappedHeaders.includes("firstName") ||
      !mappedHeaders.includes("lastName")
    ) {
      errors.push("CSV must include 'First Name' and 'Last Name' columns");
      return { players, errors, warnings };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length === 0 || values.every((v) => v === "")) continue;

      const player: RosterCSVData = {
        firstName: "",
        lastName: "",
      };

      mappedHeaders.forEach((field, index) => {
        const value = values[index];
        if (value && field in player) {
          (player as any)[field] = value;
        }
      });

      // Validate required fields
      if (!player.firstName || !player.lastName) {
        errors.push(`Row ${i + 1}: Missing first name or last name`);
        continue;
      }

      players.push(player);
    }

    if (players.length === 0) {
      errors.push("No valid player data found in CSV");
    }

    // Add warnings for missing optional data
    const missingJersey = players.filter((p) => !p.jerseyNumber).length;
    const missingPosition = players.filter((p) => !p.position).length;

    if (missingJersey > 0) {
      warnings.push(`${missingJersey} players missing jersey numbers`);
    }
    if (missingPosition > 0) {
      warnings.push(`${missingPosition} players missing positions`);
    }
  } catch (error) {
    logError("CSV parsing error:", error);
    errors.push(
      "Failed to parse CSV file. Please check the format and try again."
    );
  }

  return { players, errors, warnings };
}
