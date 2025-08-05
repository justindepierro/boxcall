/**
 * CSV Import Confirmation Dialog Component
 *
 * Handles confirmation dialogs for CSV import with "don't ask me again" functionality
 */

import React, { useState } from "react";
import { UserPreferencesService } from "../../services/userPreferencesService";

interface CSVImportConfirmationProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: "missingFields" | "qualityWarning";
}

export const CSVImportConfirmation: React.FC<CSVImportConfirmationProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  type,
}) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (dontAskAgain) {
      if (type === "missingFields") {
        UserPreferencesService.setSkipCSVMissingFieldsConfirmation(true);
      } else if (type === "qualityWarning") {
        UserPreferencesService.setSkipCSVQualityWarnings(true);
      }
    }
    onConfirm();
  };

  const getTitle = () => {
    switch (type) {
      case "missingFields":
        return "Missing Required Fields";
      case "qualityWarning":
        return "Import Quality Notice";
      default:
        return "Confirm Import";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {getTitle()}
          </h3>

          <p className="text-gray-700 mb-6">{message}</p>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="dontAskAgain"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="dontAskAgain"
              className="ml-2 text-sm text-gray-600"
            >
              Don't ask me again
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportConfirmation;
