/**
 * Formation Linking Modal (Redesigned V2)
 *
 * Mirrored dropdown interface for linking left/right formation variants.
 * Users select formations from each side and click the center link button
 * to create bi-directional relationships.
 *
 * Features:
 * - Status icons: 🔗 (linked), 🔓 (unlinked)
 * - "Create New" option in dropdowns
 * - Bi-directional linking support
 * - Supports same-formation linking (creates duplicate with Lt/Rt)
 * - Confirmation modal explains direction field updates
 *
 * Phase 6 Redesign - October 12, 2025
 */

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "../ui/Modal/Modal";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { FormationBadge } from "../playbook/FormationBadge";
import { FormationService } from "../../services/formationService";
import { FormationLinkConfirmationModal } from "./FormationLinkConfirmationModal";
import type { Formation } from "../../types/formation";
import { Link2, ChevronDown } from "lucide-react";
import { error as logError } from "../../utils/logger";

interface FormationLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  onSuccess?: () => void;
  initialLeftFormation?: Formation | null;
  initialRightFormation?: Formation | null;
}

export const FormationMatchingModal: React.FC<FormationLinkingModalProps> = ({
  isOpen,
  onClose,
  playbookId,
  onSuccess,
  initialLeftFormation,
  initialRightFormation,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Selected formations
  const [leftFormation, setLeftFormation] = useState<Formation | null>(
    initialLeftFormation || null
  );
  const [rightFormation, setRightFormation] = useState<Formation | null>(
    initialRightFormation || null
  );

  // Load all formations for this playbook
  const loadFormations = useCallback(async () => {
    setLoading(true);
    try {
      const formations =
        await FormationService.getFormationsByPlaybook(playbookId);
      setAllFormations(formations);
    } catch (error) {
      logError("[FormationMatchingModal] Failed to load formations:", error);
    } finally {
      setLoading(false);
    }
  }, [playbookId]);

  useEffect(() => {
    if (isOpen && playbookId) {
      loadFormations();
    }
  }, [isOpen, playbookId, loadFormations]);

  // Check if formation is linked (has an opposite variant)
  const isLinked = (formation: Formation): boolean => {
    return (
      formation.opposite_formation_id !== null ||
      allFormations.some((f) => f.opposite_formation_id === formation.id)
    );
  };

  // Handle link button click
  const handleLink = async () => {
    if (!leftFormation || !rightFormation) {
      alert("Please select both left and right formations");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmLink = async () => {
    if (!leftFormation || !rightFormation) return;

    setShowConfirmModal(false);
    setSaving(true);
    try {
      // Create bi-directional link between formations
      await FormationService.linkExistingFormations(
        leftFormation.id,
        rightFormation.id
      );

      alert("Formations linked successfully!");

      // Reload formations
      await loadFormations();

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      logError("[FormationMatchingModal] Failed to link formations:", error);
      alert("Failed to link formations. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle create new formation
  const handleCreateNew = (side: "left" | "right") => {
    // TODO: Open FormationBuilderModal
    alert(`Create new ${side} formation - Coming soon with Phase 3!`);
  };

  // Render formation option in dropdown
  const renderFormationOption = (formation: Formation) => {
    const linked = isLinked(formation);

    // Format direction display
    let directionLabel = "";
    if (formation.direction === "left") {
      directionLabel = " (Left)";
    } else if (formation.direction === "right") {
      directionLabel = " (Right)";
    } else if (formation.direction === "base") {
      directionLabel = " (Base)";
    }

    return (
      <option key={formation.id} value={formation.id}>
        {linked ? "🔗" : "🔓"} {formation.name}
        {directionLabel}
      </option>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Link Formation Variants"
        size="xl"
      >
        <div className="flex flex-col gap-spacing-lg p-spacing-md">
          {loading && (
            <div className="text-center py-spacing-lg">
              <Typography variant="body" className="text-text-muted">
                Loading formations...
              </Typography>
            </div>
          )}

          {!loading && (
            <>
              {/* Mirrored Dropdown Layout */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-spacing-md items-start">
                {/* Left Formation Column */}
                <div className="flex flex-col gap-spacing-sm">
                  <Typography
                    variant="headline-md"
                    className="text-text-primary"
                  >
                    Left Side Formation
                  </Typography>

                  {/* Left Dropdown */}
                  <div className="relative">
                    <select
                      value={leftFormation?.id || ""}
                      onChange={(e) => {
                        if (e.target.value === "CREATE_NEW") {
                          handleCreateNew("left");
                        } else {
                          const formation = allFormations.find(
                            (f) => f.id === e.target.value
                          );
                          setLeftFormation(formation || null);
                        }
                      }}
                      className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-spacing-lg"
                    >
                      <option value="">Select left formation...</option>
                      {allFormations.map(renderFormationOption)}
                      <option value="CREATE_NEW">
                        ➕ Create New Formation
                      </option>
                    </select>
                    <ChevronDown className="absolute right-spacing-sm top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>

                  {/* Left Formation Preview */}
                  {leftFormation && (
                    <div className="mt-spacing-md p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
                      <FormationBadge
                        formationId={leftFormation.id}
                        direction={leftFormation.direction}
                      />
                      <div className="mt-spacing-sm space-y-spacing-xs">
                        <Typography
                          variant="caption"
                          className="text-text-secondary"
                        >
                          <strong>Personnel:</strong>{" "}
                          {leftFormation.personnel_name || "Not set"}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-text-secondary"
                        >
                          <strong>Category:</strong>{" "}
                          {leftFormation.category || "Not set"}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-text-secondary"
                        >
                          <strong>Usage:</strong> {leftFormation.usage_count}{" "}
                          plays
                        </Typography>
                        {leftFormation.description && (
                          <Typography
                            variant="caption"
                            className="text-text-muted italic"
                          >
                            {leftFormation.description}
                          </Typography>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Link Button */}
                <div className="flex flex-col items-center justify-center pt-spacing-xl">
                  <Button
                    onClick={handleLink}
                    disabled={!leftFormation || !rightFormation || saving}
                    variant="primary"
                    size="lg"
                    className="rounded-full w-16 h-16 flex items-center justify-center"
                  >
                    {saving ? (
                      <div className="animate-spin">⏳</div>
                    ) : (
                      <Link2 className="w-8 h-8" />
                    )}
                  </Button>
                  <Typography
                    variant="caption"
                    className="text-text-muted mt-spacing-xs text-center"
                  >
                    Click to
                    <br />
                    link
                  </Typography>
                </div>

                {/* Right Formation Column */}
                <div className="flex flex-col gap-spacing-sm">
                  <Typography
                    variant="headline-md"
                    className="text-text-primary"
                  >
                    Right Side Formation
                  </Typography>

                  {/* Right Dropdown */}
                  <div className="relative">
                    <select
                      value={rightFormation?.id || ""}
                      onChange={(e) => {
                        if (e.target.value === "CREATE_NEW") {
                          handleCreateNew("right");
                        } else {
                          const formation = allFormations.find(
                            (f) => f.id === e.target.value
                          );
                          setRightFormation(formation || null);
                        }
                      }}
                      className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-spacing-lg"
                    >
                      <option value="">Select right formation...</option>
                      {allFormations.map(renderFormationOption)}
                      <option value="CREATE_NEW">
                        ➕ Create New Formation
                      </option>
                    </select>
                    <ChevronDown className="absolute right-spacing-sm top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>

                  {/* Right Formation Preview */}
                  {rightFormation && (
                    <div className="mt-spacing-md p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
                      <FormationBadge
                        formationId={rightFormation.id}
                        direction={rightFormation.direction}
                      />
                      <div className="mt-spacing-sm space-y-spacing-xs">
                        <Typography
                          variant="caption"
                          className="text-text-secondary"
                        >
                          <strong>Personnel:</strong>{" "}
                          {rightFormation.personnel_name || "Not set"}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-text-secondary"
                        >
                          <strong>Category:</strong>{" "}
                          {rightFormation.category || "Not set"}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-text-secondary"
                        >
                          <strong>Usage:</strong> {rightFormation.usage_count}{" "}
                          plays
                        </Typography>
                        {rightFormation.description && (
                          <Typography
                            variant="caption"
                            className="text-text-muted italic"
                          >
                            {rightFormation.description}
                          </Typography>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-spacing-md p-spacing-sm bg-surface-muted rounded border border-border-secondary">
                <Typography variant="caption" className="text-text-muted">
                  <strong>💡 Tip:</strong> Select formations from both sides and
                  click the link button to create a bi-directional relationship.
                  Linked formations can be used in duplicate + flip workflows.
                </Typography>
              </div>

              {/* Status Display */}
              {(leftFormation || rightFormation) && (
                <div className="flex items-center justify-center gap-spacing-sm text-text-secondary">
                  {leftFormation && (
                    <Typography variant="caption">
                      {isLinked(leftFormation) ? "🔗 Linked" : "🔓 Unlinked"}
                    </Typography>
                  )}
                  {leftFormation && rightFormation && <span>↔</span>}
                  {rightFormation && (
                    <Typography variant="caption">
                      {isLinked(rightFormation) ? "🔗 Linked" : "🔓 Unlinked"}
                    </Typography>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-spacing-sm pt-spacing-md border-t border-border-primary">
            <Button onClick={onClose} variant="outline" disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      {showConfirmModal && leftFormation && rightFormation && (
        <FormationLinkConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmLink}
          leftFormation={leftFormation}
          rightFormation={rightFormation}
          isSameFormation={leftFormation.id === rightFormation.id}
        />
      )}
    </>
  );
};
