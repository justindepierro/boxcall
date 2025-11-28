/**
 * FormationLinkConfirmationModal
 *
 * Confirms formation linking and explains direction field updates.
 * Shows different messages for:
 * 1. Same formation (will duplicate with Lt/Rt directions)
 * 2. Different formations (will update directions to Left/Right)
 */

import React from "react";
import { Modal } from "../ui/Modal/Modal";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { AlertCircle, Link2 } from "lucide-react";
import type { Formation } from "../../types/formation";

interface FormationLinkConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  leftFormation: Formation;
  rightFormation: Formation;
  isSameFormation: boolean;
}

export const FormationLinkConfirmationModal: React.FC<
  FormationLinkConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  leftFormation,
  rightFormation,
  isSameFormation,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Formation Link"
      size="md"
    >
      <div className="space-y-lg">
        {/* Info Alert */}
        <div className="flex gap-sm p-md bg-info-50 border border-info-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <Typography variant="label-md" className="text-info-900">
              {isSameFormation
                ? "Creating Left/Right Variants"
                : "Linking as Left/Right"}
            </Typography>
            <Typography variant="body-sm" className="text-info-700 mt-xs">
              {isSameFormation ? (
                <>
                  Since you selected the same formation for both sides, we'll
                  create a duplicate with <strong>formation_dir</strong> set to{" "}
                  <strong>Lt</strong> and <strong>Rt</strong>. This is how we
                  handle formations like "Twins Lt" and "Twins Rt" (same name,
                  different directions).
                </>
              ) : (
                <>
                  We'll update the <strong>formation_dir</strong> column to{" "}
                  <strong>Left</strong> and <strong>Right</strong>. This works
                  for formations with different names like "Rip" (Left) and
                  "Liz" (Right).
                </>
              )}
            </Typography>
          </div>
        </div>

        {/* Formation Display */}
        <div className="grid grid-cols-3 gap-md items-center">
          {/* Left Formation */}
          <div className="p-md bg-secondary rounded-lg border border-primary">
            <Typography
              variant="caption"
              className="text-muted uppercase tracking-wide"
            >
              Left Side
            </Typography>
            <Typography variant="label-md" className="text-primary mt-xs">
              {leftFormation.name}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Personnel: {leftFormation.personnel_name || "Not set"}
            </Typography>
            <div className="mt-sm p-xs bg-success-50 border border-success-200 rounded">
              <Typography
                variant="caption"
                className="text-success-700 font-medium"
              >
                direction → {isSameFormation ? "Lt" : "Left"}
              </Typography>
            </div>
          </div>

          {/* Link Icon */}
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <Link2 className="w-6 h-6 text-primary-600" />
            </div>
          </div>

          {/* Right Formation */}
          <div className="p-md bg-secondary rounded-lg border border-primary">
            <Typography
              variant="caption"
              className="text-muted uppercase tracking-wide"
            >
              Right Side
            </Typography>
            <Typography variant="label-md" className="text-primary mt-xs">
              {rightFormation.name}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              Personnel: {rightFormation.personnel_name || "Not set"}
            </Typography>
            <div className="mt-sm p-xs bg-success-50 border border-success-200 rounded">
              <Typography
                variant="caption"
                className="text-success-700 font-medium"
              >
                direction → {isSameFormation ? "Rt" : "Right"}
              </Typography>
            </div>
          </div>
        </div>

        {/* Technical Note */}
        <div className="p-sm bg-muted rounded text-center">
          <Typography variant="caption" className="text-muted">
            💡 This ensures all linked formations have consistent direction
            fields, no matter how they're named.
          </Typography>
        </div>

        {/* Actions */}
        <div className="flex gap-md justify-end pt-md border-t border-primary">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="primary">
            Confirm Link
          </Button>
        </div>
      </div>
    </Modal>
  );
};
