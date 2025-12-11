/**
 * ConfirmationModal Component
 *
 * A reusable confirmation dialog to replace native confirm() calls.
 * Provides consistent UX with customizable title, message, and button labels.
 */

import React from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { Icon, type IconName } from "../Icon";
import { Typography } from "../../design-system/Typography";

type ConfirmationVariant = "danger" | "warning" | "info";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  /** @deprecated Use confirmLabel instead */
  confirmText?: string;
  /** @deprecated Use cancelLabel instead */
  cancelText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
}

const variantConfig: Record<
  ConfirmationVariant,
  {
    icon: IconName;
    iconColor: string;
    confirmVariant: "danger" | "warning" | "primary";
  }
> = {
  danger: {
    icon: "alert-triangle",
    iconColor: "text-error-500",
    confirmVariant: "danger",
  },
  warning: {
    icon: "alert-circle",
    iconColor: "text-warning-500",
    confirmVariant: "warning",
  },
  info: {
    icon: "info",
    iconColor: "text-info-500",
    confirmVariant: "primary",
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  isLoading = false,
}) => {
  // Support both prop names for backwards compatibility
  const finalConfirmLabel = confirmLabel ?? confirmText ?? "Confirm";
  const finalCancelLabel = cancelLabel ?? cancelText ?? "Cancel";
  const config = variantConfig[variant];

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              variant === "danger"
                ? "bg-error-100 dark:bg-error-900/30"
                : variant === "warning"
                  ? "bg-warning-100 dark:bg-warning-900/30"
                  : "bg-info-100 dark:bg-info-900/30"
            }`}
          >
            <Icon
              name={config.icon}
              className={`h-5 w-5 ${config.iconColor}`}
            />
          </div>
          <div className="flex-1">
            <Typography variant="headline-sm" className="text-primary mb-2">
              {title}
            </Typography>
            <Typography variant="body-md" className="text-secondary">
              {message}
            </Typography>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {finalCancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon name="loader" className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              finalConfirmLabel
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
