/**
 * CSV Quality Warning Component
 *
 * Shows a quality warning message with link to templates page
 */

import React from "react";
import { Link } from "react-router-dom";
import { UserPreferencesService } from "../../services/userPreferencesService";

interface CSVQualityWarningProps {
  message: string;
  onDismiss: () => void;
  showDontAskAgain?: boolean;
}

export const CSVQualityWarning: React.FC<CSVQualityWarningProps> = ({
  message,
  onDismiss,
  showDontAskAgain = true,
}) => {
  const handleDontAskAgain = () => {
    UserPreferencesService.setSkipCSVQualityWarnings(true);
    onDismiss();
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0">
          ⚠️
        </div>

        <div className="flex-1">
          <p className="text-sm text-amber-800">
            {message.split("templates page").map((part, index, array) => {
              if (index === array.length - 1) return part;

              return (
                <React.Fragment key={index}>
                  {part}
                  <Link
                    to="/templates"
                    className="font-medium text-amber-900 underline hover:text-amber-700"
                  >
                    templates page
                  </Link>
                </React.Fragment>
              );
            })}
          </p>

          {showDontAskAgain && (
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={handleDontAskAgain}
                className="text-xs text-amber-700 hover:text-amber-900 underline"
              >
                Don't show this again
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="ml-3 flex-shrink-0 text-amber-600 hover:text-amber-800"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CSVQualityWarning;
