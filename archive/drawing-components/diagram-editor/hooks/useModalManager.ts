/**
 * useModalManager Hook
 *
 * Manages modal state and provides helper functions for showing alerts and confirmations.
 * Extracted from the monolithic DiagramEditor component for better maintainability.
 */

import { useState, useCallback } from "react";

export const useModalManager = () => {
  // Modal states
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertType, setAlertType] = useState<"info" | "warning" | "error">(
    "info"
  );

  // Confirm modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Formation picker state
  const [showFormationPicker, setShowFormationPicker] = useState(false);

  // Unsaved changes state
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

  // Helper to show alert modal
  const showAlertModal = useCallback(
    (
      title: string,
      message: string,
      type: "info" | "warning" | "error" = "info"
    ) => {
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertType(type);
      setShowAlert(true);
    },
    []
  );

  // Helper to show confirm modal
  const showConfirmModal = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmTitle(title);
      setConfirmMessage(message);
      setConfirmAction(() => onConfirm);
      setShowConfirm(true);
    },
    []
  );

  // Modal action handlers
  const handleAlertClose = useCallback(() => {
    setShowAlert(false);
  }, []);

  const handleConfirmClose = useCallback(() => {
    setShowConfirm(false);
    setConfirmAction(() => {});
  }, []);

  const handleConfirmConfirm = useCallback(() => {
    if (confirmAction) {
      confirmAction();
    }
    handleConfirmClose();
  }, [confirmAction, handleConfirmClose]);

  const handleSaveDialogClose = useCallback(() => {
    setShowSaveDialog(false);
  }, []);

  const handleFormationPickerClose = useCallback(() => {
    setShowFormationPicker(false);
  }, []);

  const handleUnsavedChangesClose = useCallback(() => {
    setShowUnsavedChanges(false);
  }, []);

  return {
    // State
    showAlert,
    alertTitle,
    alertMessage,
    alertType,
    showConfirm,
    confirmTitle,
    confirmMessage,
    showSaveDialog,
    showFormationPicker,
    showUnsavedChanges,

    // Setters
    setShowSaveDialog,
    setShowFormationPicker,
    setShowUnsavedChanges,

    // Helper functions
    showAlertModal,
    showConfirmModal,

    // Action handlers
    handleAlertClose,
    handleConfirmClose,
    handleConfirmConfirm,
    handleSaveDialogClose,
    handleFormationPickerClose,
    handleUnsavedChangesClose,
  };
};
