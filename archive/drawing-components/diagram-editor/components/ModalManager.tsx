/**
 * Modal Manager Component
 *
 * Centralizes modal state management for the diagram editor.
 * Currently unused but prepared for future modal implementations.
 */

import React, { useState, useCallback } from "react";
import { Icon } from "../../../components/ui/Icon/Icon";

interface ModalManagerProps {
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  playName: string;
  setPlayName: (name: string) => void;
  performSave: (name: string) => Promise<void>;
  handleClearWhiteboard: () => void;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  showSaveDialog,
  setShowSaveDialog,
  playName,
  setPlayName,
  performSave,
  handleClearWhiteboard,
}) => {
  // Modal states
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [_alertTitle, _setAlertTitle] = useState<string>("");
  const [_alertMessage, _setAlertMessage] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [_confirmTitle, _setConfirmTitle] = useState<string>("");
  const [_confirmMessage, _setConfirmMessage] = useState<string>("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState<boolean>(false);

  const handleSaveAndClose = useCallback(() => {
    if (!playName.trim()) {
      setShowSaveDialog(true);
      setShowUnsavedChanges(false);
      return;
    }
    performSave(playName);
    setShowUnsavedChanges(false);
    // Note: onClose logic should be handled by parent
  }, [playName, performSave, setShowSaveDialog]);

  const handleCloseWithoutSaving = useCallback(() => {
    handleClearWhiteboard();
    setShowUnsavedChanges(false);
    // Note: onClose logic should be handled by parent
  }, [handleClearWhiteboard]);

  return (
    <>
      {/* Save Dialog Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-surface-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
                <Icon name="save" size="lg" />
                Save Play
              </h2>
              <p className="text-content-secondary mb-4">
                Give your play a name to save it:
              </p>
              <input
                type="text"
                value={playName}
                onChange={(e) => setPlayName(e.target.value)}
                placeholder="e.g., 4 Verts, Sluggo, Spider 2 Y Banana"
                className="w-full px-4 py-2 rounded-md bg-surface-secondary border border-border text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playName.trim()) {
                    performSave(playName);
                  }
                  if (e.key === "Escape") {
                    setShowSaveDialog(false);
                  }
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => performSave(playName || "Untitled Play")}
                  disabled={!playName.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    playName.trim()
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-surface-secondary text-content-tertiary cursor-not-allowed"
                  }`}
                >
                  <Icon name="save" size="sm" />
                  Save
                </button>
                <button
                  onClick={handleClearWhiteboard}
                  className="flex-1 px-4 py-2 rounded-lg bg-error-600 hover:bg-error-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="delete" size="sm" />
                  Clear Whiteboard
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-medium transition-colors flex items-center gap-2"
                >
                  <Icon name="close" size="sm" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-info-100 flex items-center justify-center">
                <span className="text-3xl">
                  {_alertTitle.includes("✅")
                    ? "✅"
                    : _alertTitle.includes("❌")
                      ? "❌"
                      : "ℹ️"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-content-primary mb-2">
                  {_alertTitle.replace(/✅|❌|⚠️|ℹ️/gu, "").trim()}
                </h2>
                <p className="text-base text-content-secondary whitespace-pre-line leading-relaxed">
                  {_alertMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-content-primary mb-2">
                  {_confirmTitle}
                </h2>
                <p className="text-base text-content-secondary whitespace-pre-line leading-relaxed">
                  {_confirmMessage}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmAction) {
                    confirmAction();
                  }
                  setShowConfirm(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150"
              >
                Yes, Continue
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {showUnsavedChanges && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-info-100 flex items-center justify-center">
                <span className="text-3xl">💾</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-content-primary mb-2">
                  Unsaved Changes
                </h2>
                <p className="text-base text-content-secondary leading-relaxed">
                  You have unsaved changes. What would you like to do?
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveAndClose}
                className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150 flex items-center justify-center gap-2"
              >
                <span>💾</span> Save and Close
              </button>
              <button
                onClick={handleCloseWithoutSaving}
                className="w-full px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
              >
                Close without Saving
              </button>
              <button
                onClick={() => setShowUnsavedChanges(false)}
                className="w-full px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-secondary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
