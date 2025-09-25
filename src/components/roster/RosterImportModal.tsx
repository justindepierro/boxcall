import React, { useState, useRef } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import { Button } from "../ui/Button/Button";
import { Card } from "../ui";

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

export const RosterImportModal: React.FC<RosterImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [step, setStep] = useState<"upload" | "preview" | "importing">(
    "upload"
  );
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-primary rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Typography variant="headline-lg">Import Team Roster</Typography>
            <button
              onClick={() => {
                resetModal();
                onClose();
              }}
              className="p-2 hover:bg-surface-muted rounded-lg"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
          <Typography variant="body-md" color="muted" className="mt-2">
            Upload a CSV file in MaxPreps format to import your team roster
          </Typography>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === "upload" && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Icon name="upload" className="h-12 w-12 text-blue-600" />
              </div>
              <Typography variant="headline-md" className="mb-4">
                Upload Roster CSV
              </Typography>
              <Typography
                variant="body-lg"
                color="muted"
                className="mb-6 max-w-md mx-auto"
              >
                Select a CSV file exported from MaxPreps or in the standard
                roster format. The file should include player names, jersey
                numbers, and positions.
              </Typography>

              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="roster-csv-upload"
                />
                <label htmlFor="roster-csv-upload">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="upload" className="h-5 w-5 mr-2" />
                    Choose CSV File
                  </Button>
                </label>

                <div className="text-sm text-text-secondary">
                  <p className="mb-2">Expected CSV format:</p>
                  <div className="bg-surface-secondary p-3 rounded text-left font-mono text-xs">
                    First Name,Last Name,Jersey
                    Number,Position,Grade,Height,Weight,Email
                    <br />
                    John,Doe,12,QB,12,6'2",185,john.doe@email.com
                    <br />
                    Jane,Smith,25,WR,11,5'8",145,jane.smith@email.com
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Typography variant="headline-md">
                  Preview Import ({csvData.length} players)
                </Typography>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep("upload")}
                >
                  <Icon name="arrow-left" className="h-4 w-4 mr-2" />
                  Back to Upload
                </Button>
              </div>

              {/* Errors and Warnings */}
              {errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <div className="flex items-start space-x-3">
                    <Icon
                      name="alert"
                      className="h-5 w-5 text-red-600 mt-0.5"
                    />
                    <div>
                      <Typography
                        variant="body-sm"
                        className="text-red-800 font-medium"
                      >
                        Import Errors ({errors.length})
                      </Typography>
                      <ul className="mt-2 text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {warnings.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <div className="flex items-start space-x-3">
                    <Icon
                      name="alert"
                      className="h-5 w-5 text-yellow-600 mt-0.5"
                    />
                    <div>
                      <Typography
                        variant="body-sm"
                        className="text-yellow-800 font-medium"
                      >
                        Warnings ({warnings.length})
                      </Typography>
                      <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Preview Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-surface-secondary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                          Jersey
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                          Height
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-primary divide-y divide-gray-200">
                      {csvData.slice(0, 10).map((player, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                            {player.firstName} {player.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                            {player.jerseyNumber || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                            {player.position || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                            {player.grade || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                            {player.height || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                            {player.weight || "-"}
                          </td>
                        </tr>
                      ))}
                      {csvData.length > 10 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-sm text-text-muted"
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
          )}

          {step === "importing" && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <Typography variant="headline-md" className="mb-2">
                Importing Roster...
              </Typography>
              <Typography variant="body-md" color="muted">
                Please wait while we add {csvData.length} players to your team.
              </Typography>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "preview" && (
          <div className="p-6 bg-surface-secondary">
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  resetModal();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={errors.length > 0}
              >
                <Icon name="upload" className="h-4 w-4 mr-2" />
                Import {csvData.length} Players
              </Button>
            </div>
          </div>
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
    console.error("CSV parsing error:", error);
    errors.push(
      "Failed to parse CSV file. Please check the format and try again."
    );
  }

  return { players, errors, warnings };
}
