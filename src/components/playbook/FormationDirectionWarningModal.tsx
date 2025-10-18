/**
 * FormationDirectionWarningModal
 *
 * Shows when user types direction keywords in formation name field.
 * Strongly encourages using the f_dir selector instead.
 */

import React from "react";
import { Modal } from "../ui/Modal/Modal";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { DirectionDetectionResult } from "../../utils/formationDirectionDetection";

interface FormationDirectionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  detection: DirectionDetectionResult;
  onAcceptSuggestion: (cleanName: string, direction: "R" | "L") => void;
  onKeepOriginal: () => void;
}

export const FormationDirectionWarningModal: React.FC<
  FormationDirectionWarningModalProps
> = ({ isOpen, onClose, detection, onAcceptSuggestion, onKeepOriginal }) => {
  if (!detection.hasDirection) return null;

  const directionLabel = detection.detectedDirection === "R" ? "Right" : "Left";
  const directionColor = detection.detectedDirection === "R" ? "blue" : "green";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Direction Detected in Formation Name"
      size="md"
    >
      <div className="space-y-spacing-lg">
        {/* Warning Icon */}
        <div className="flex items-start gap-spacing-md p-spacing-md bg-warning-50 border border-warning-200 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <Typography
              variant="body-md"
              className="text-warning-800 font-medium"
            >
              We noticed direction keywords in your formation name
            </Typography>
            <Typography
              variant="body-sm"
              className="text-warning-700 mt-spacing-xs"
            >
              This can cause issues with play organization and flip workflows.
            </Typography>
          </div>
        </div>

        {/* Current Input */}
        <div className="space-y-spacing-sm">
          <Typography variant="label" className="text-text-secondary">
            What you typed:
          </Typography>
          <div className="p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
            <Typography
              variant="body-lg"
              className="font-mono text-text-primary"
            >
              "{detection.originalInput}"
            </Typography>
            <Typography
              variant="caption"
              className="text-text-muted mt-spacing-xs"
            >
              Contains direction keyword: "{detection.directionKeyword}"
            </Typography>
          </div>
        </div>

        {/* Suggested Fix */}
        <div className="space-y-spacing-sm">
          <Typography variant="label" className="text-success-700 font-medium">
            ✅ Recommended (Best Practice):
          </Typography>
          <div className="p-spacing-md bg-success-50 rounded-lg border-2 border-success-300">
            <div className="flex items-center gap-spacing-md">
              <div className="flex-1">
                <Typography
                  variant="caption"
                  className="text-success-700 font-medium"
                >
                  Formation Name:
                </Typography>
                <Typography
                  variant="body-lg"
                  className="font-mono text-success-900 mt-spacing-xs"
                >
                  "{detection.suggestedFormationName}"
                </Typography>
              </div>
              <ArrowRight className="w-5 h-5 text-success-600" />
              <div className="flex-1">
                <Typography
                  variant="caption"
                  className="text-success-700 font-medium"
                >
                  Direction:
                </Typography>
                <div
                  className={`inline-block px-spacing-md py-spacing-xs rounded-full bg-${directionColor}-100 border border-${directionColor}-300 mt-spacing-xs`}
                >
                  <Typography
                    variant="body-md"
                    className={`text-${directionColor}-800 font-bold`}
                  >
                    {directionLabel}
                  </Typography>
                </div>
              </div>
            </div>
            <Typography
              variant="caption"
              className="text-success-700 mt-spacing-md"
            >
              💡 This keeps your data clean and makes duplicate + flip workflows
              work properly
            </Typography>
          </div>
        </div>

        {/* Why This Matters */}
        <div className="p-spacing-md bg-info-50 rounded-lg border border-info-200">
          <Typography
            variant="body-sm"
            className="text-info-800 font-medium mb-spacing-sm"
          >
            Why use separate direction field?
          </Typography>
          <ul className="space-y-spacing-xs text-info-700 text-sm">
            <li>✓ Easier to flip plays (Right → Left automatically)</li>
            <li>✓ Better formation organization and linking</li>
            <li>✓ Consistent with how other coaches structure playbooks</li>
            <li>
              ✓ Prevents duplicate formations ("Trips Right" vs "Trips Rt")
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-spacing-sm pt-spacing-md border-t border-border-primary">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              if (detection.detectedDirection) {
                onAcceptSuggestion(
                  detection.suggestedFormationName,
                  detection.detectedDirection
                );
              }
              onClose();
            }}
          >
            ✓ Use Recommended Format
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onKeepOriginal();
              onClose();
            }}
          >
            Keep As-Is
          </Button>
        </div>
      </div>
    </Modal>
  );
};
