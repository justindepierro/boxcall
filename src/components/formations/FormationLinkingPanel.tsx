/**
 * FormationLinkingPanel
 *
 * Reusable panel for linking left/right formation variants.
 * Can be used standalone in a modal or embedded in a tabbed interface.
 *
 * Supports two linking modes:
 * 1. Same formation (e.g., "Twins") → Creates duplicate with Lt/Rt directions
 * 2. Different formations (e.g., "Rip"/"Liz") → Updates directions to Left/Right
 */

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { FormationBadge } from "../playbook/FormationBadge";
import { FormationService } from "../../services/formationService";
import { PersonnelService } from "../../services/personnelService";
import { FormationLinkConfirmationModal } from "./FormationLinkConfirmationModal";
import { supabase } from "../../lib/supabase";
import type { Formation } from "../../types/formation";
import type { PersonnelConfiguration } from "../../types/personnel";
import { Link2, ChevronDown } from "lucide-react";
import { debug, info, error as logError } from "../../utils/logger";
import { useToast } from "../../hooks/useToast";
import { useIsMobile } from "../../hooks/useBreakpoint";

interface FormationLinkingPanelProps {
  playbookId: string;
  onSuccess?: () => void;
  initialLeftFormation?: Formation | null;
  initialRightFormation?: Formation | null;
}

export const FormationLinkingPanel: React.FC<FormationLinkingPanelProps> = ({
  playbookId,
  onSuccess,
  initialLeftFormation,
  initialRightFormation,
}) => {
  const toast = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [availablePersonnel, setAvailablePersonnel] = useState<
    PersonnelConfiguration[]
  >([]);
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(
    []
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [leftFormation, setLeftFormation] = useState<Formation | null>(
    initialLeftFormation || null
  );
  const [rightFormation, setRightFormation] = useState<Formation | null>(
    initialRightFormation || null
  );

  const loadFormations = useCallback(async () => {
    setLoading(true);
    setImportStatus(null);
    debug(
      "[FormationLinkingPanel] Loading formations for playbookId:",
      playbookId
    );
    try {
      // First, try to import any formations from plays
      const currentUser = await supabase.auth.getUser();
      debug("[FormationLinkingPanel] Current user:", currentUser.data.user?.id);
      if (currentUser.data.user) {
        try {
          debug(
            "[FormationLinkingPanel] Attempting to import formations from plays..."
          );
          const result = await FormationService.importFormationsFromPlays(
            playbookId,
            currentUser.data.user.id
          );

          debug("[FormationLinkingPanel] Import result:", result);

          if (result.created > 0) {
            setImportStatus(
              `✨ Imported ${result.created} formation${result.created > 1 ? "s" : ""} from your plays`
            );
          }

          // Use the imported formations
          info(
            "[FormationLinkingPanel] Setting formations:",
            result.formations.length,
            "formations"
          );
          setAllFormations(result.formations);
        } catch (importError) {
          logError(
            "[FormationLinkingPanel] Failed to import formations:",
            importError
          );
          // Continue with normal load even if import fails
          const formations =
            await FormationService.getFormationsByPlaybook(playbookId);
          info(
            "[FormationLinkingPanel] Loaded existing formations:",
            formations.length
          );
          setAllFormations(formations);
        }
      } else {
        // No user, just load existing formations
        debug("[FormationLinkingPanel] No user, loading existing formations");
        const formations =
          await FormationService.getFormationsByPlaybook(playbookId);
        info(
          "[FormationLinkingPanel] Loaded existing formations:",
          formations.length
        );
        setAllFormations(formations);
      }

      // Load available personnel configurations
      const personnel =
        await PersonnelService.getPersonnelConfigurations(playbookId);
      info(
        "[FormationLinkingPanel] Loaded personnel:",
        personnel.length,
        "configurations"
      );
      setAvailablePersonnel(personnel);
    } catch (error) {
      logError("[FormationLinkingPanel] Failed to load formations:", error);
    } finally {
      setLoading(false);
    }
  }, [playbookId]);

  useEffect(() => {
    if (playbookId) {
      loadFormations();
    }
  }, [playbookId, loadFormations]);

  const isLinked = (formation: Formation): boolean => {
    return (
      formation.opposite_formation_id !== null ||
      allFormations.some((f) => f.opposite_formation_id === formation.id)
    );
  };

  // Filter formations for left side: "left" direction or null (unlinked standalone)
  const leftSideFormations = allFormations.filter((f) => {
    // Exclude if already selected on right
    if (rightFormation?.id === f.id) return false;

    // Show "left" formations, or null (standalone) formations that aren't linked yet
    return f.direction === "left" || (f.direction === null && !isLinked(f));
  });

  // Filter formations for right side: "right" direction or null (unlinked standalone)
  const rightSideFormations = allFormations.filter((f) => {
    // Exclude if already selected on left
    if (leftFormation?.id === f.id) return false;

    // Show "right" formations, or null (standalone) formations that aren't linked yet
    return f.direction === "right" || (f.direction === null && !isLinked(f));
  });

  // Check if left and right formations have the same name (case-insensitive)
  const isSameFormationName = (): boolean => {
    if (!leftFormation || !rightFormation) return false;
    return (
      leftFormation.name.toLowerCase() === rightFormation.name.toLowerCase()
    );
  };

  // Toggle personnel selection
  const togglePersonnel = (personnelId: string) => {
    setSelectedPersonnelIds((prev) =>
      prev.includes(personnelId)
        ? prev.filter((id) => id !== personnelId)
        : [...prev, personnelId]
    );
  };

  const handleLink = async () => {
    if (!leftFormation || !rightFormation) {
      toast?.error?.("Please select both left and right formations");
      return;
    }

    // Prevent linking a formation to itself
    if (leftFormation.id === rightFormation.id) {
      toast?.error?.(
        "Cannot link a formation to itself. Please select different formations."
      );
      return;
    }

    // Show confirmation modal instead of simple confirm dialog
    setShowConfirmModal(true);
  };

  const confirmLink = async () => {
    if (!leftFormation || !rightFormation) return;

    setShowConfirmModal(false);
    setSaving(true);
    try {
      // Link the formations
      await FormationService.linkExistingFormations(
        leftFormation.id,
        rightFormation.id
      );

      // Update personnel packages for both formations if any were selected
      if (selectedPersonnelIds.length > 0) {
        await Promise.all([
          FormationService.updateFormation(leftFormation.id, {
            personnel_packages: selectedPersonnelIds,
          }),
          FormationService.updateFormation(rightFormation.id, {
            personnel_packages: selectedPersonnelIds,
          }),
        ]);
      }

      toast?.success?.("Formations linked successfully!");
      await loadFormations();

      // Clear personnel selection after successful link
      setSelectedPersonnelIds([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      logError("[FormationLinkingPanel] Failed to link formations:", error);
      toast?.error?.("Failed to link formations. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = (side: "left" | "right") => {
    toast?.info?.(
      `Create new ${side} formation - Switch to "Edit Details" tab!`
    );
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <Typography variant="body-md" className="text-muted">
          Loading formations...
        </Typography>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-lg p-md">
        {/* Import Status */}
        {importStatus && (
          <div className="p-sm bg-success-50 border border-success-200 rounded-lg">
            <Typography variant="caption" className="text-success-700">
              {importStatus}
            </Typography>
          </div>
        )}

        {/* Mirrored Dropdown Layout */}
        <div
          className={`${isMobile ? "flex flex-col gap-lg" : "grid grid-cols-[1fr_auto_1fr] gap-md items-start"}`}
        >
          {/* Left Formation Column */}
          <div className="flex flex-col gap-sm">
            <Typography variant="headline-md" className="text-primary">
              Left Side Formation
            </Typography>

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
                className="w-full px-sm py-xs border border-primary rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-lg"
              >
                <option value="">Select left formation...</option>
                {leftSideFormations.map(renderFormationOption)}
                <option value="CREATE_NEW">➕ Create New Formation</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>

            {leftFormation && (
              <div className="mt-md p-md bg-secondary rounded-lg border border-primary">
                <FormationBadge
                  formationId={leftFormation.id}
                  direction={leftFormation.direction}
                />
                <div className="mt-sm space-y-xs">
                  <Typography variant="caption" className="text-secondary">
                    <strong>Personnel:</strong>{" "}
                    {leftFormation.personnel_name || "Not set"}
                  </Typography>
                  <Typography variant="caption" className="text-secondary">
                    <strong>Category:</strong>{" "}
                    {leftFormation.category || "Not set"}
                  </Typography>
                  <Typography variant="caption" className="text-secondary">
                    <strong>Usage:</strong> {leftFormation.usage_count} plays
                  </Typography>
                  {leftFormation.description && (
                    <Typography variant="caption" className="text-muted italic">
                      {leftFormation.description}
                    </Typography>
                  )}
                </div>
              </div>
            )}

            {/* Same-name notification for left side */}
            {isSameFormationName() && leftFormation && (
              <div className="mt-sm p-sm bg-blue-50 border border-blue-200 rounded">
                <Typography variant="caption" className="text-blue-700">
                  ℹ️ <strong>{leftFormation.name} Left</strong> and{" "}
                  <strong>{leftFormation.name} Right</strong> variants will be
                  created
                </Typography>
              </div>
            )}
          </div>

          {/* Center Link Button */}
          <div className="flex flex-col items-center justify-center pt-xl">
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
              className="text-muted mt-xs text-center"
            >
              Click to
              <br />
              link
            </Typography>
          </div>

          {/* Right Formation Column */}
          <div className="flex flex-col gap-sm">
            <Typography variant="headline-md" className="text-primary">
              Right Side Formation
            </Typography>

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
                className="w-full px-sm py-xs border border-primary rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-lg"
              >
                <option value="">Select right formation...</option>
                {rightSideFormations.map(renderFormationOption)}
                <option value="CREATE_NEW">➕ Create New Formation</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>

            {rightFormation && (
              <div className="mt-md p-md bg-secondary rounded-lg border border-primary">
                <FormationBadge
                  formationId={rightFormation.id}
                  direction={rightFormation.direction}
                />
                <div className="mt-sm space-y-xs">
                  <Typography variant="caption" className="text-secondary">
                    <strong>Personnel:</strong>{" "}
                    {rightFormation.personnel_name || "Not set"}
                  </Typography>
                  <Typography variant="caption" className="text-secondary">
                    <strong>Category:</strong>{" "}
                    {rightFormation.category || "Not set"}
                  </Typography>
                  <Typography variant="caption" className="text-secondary">
                    <strong>Usage:</strong> {rightFormation.usage_count} plays
                  </Typography>
                  {rightFormation.description && (
                    <Typography variant="caption" className="text-muted italic">
                      {rightFormation.description}
                    </Typography>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Personnel Packages Selection */}
        {(leftFormation || rightFormation) && availablePersonnel.length > 0 && (
          <div className="mt-lg p-md bg-secondary rounded-lg border border-primary">
            <Typography variant="headline-sm" className="text-primary mb-sm">
              Personnel Packages
            </Typography>
            <Typography variant="caption" className="text-secondary mb-md">
              Select which personnel packages can be run from{" "}
              {isSameFormationName() ? "these formations" : "this formation"}:
            </Typography>

            <div className="flex flex-wrap gap-sm">
              {availablePersonnel.map((personnel) => (
                <button
                  key={personnel.id}
                  onClick={() => togglePersonnel(personnel.id)}
                  className={`
                  px-md py-sm rounded-lg border-2 transition-all
                  ${
                    selectedPersonnelIds.includes(personnel.id)
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-primary bg-primary text-secondary hover:border-primary-300"
                  }
                `}
                >
                  <Typography variant="body-sm" className="font-medium">
                    {selectedPersonnelIds.includes(personnel.id) ? "✓ " : ""}
                    {personnel.name}
                  </Typography>
                </button>
              ))}
            </div>

            {selectedPersonnelIds.length > 0 && (
              <div className="mt-sm p-sm bg-primary-50 border border-primary-200 rounded">
                <Typography variant="caption" className="text-primary-700">
                  ✓ {selectedPersonnelIds.length} personnel package
                  {selectedPersonnelIds.length > 1 ? "s" : ""} selected
                </Typography>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-md p-sm bg-muted rounded border border-secondary">
          <Typography variant="caption" className="text-muted">
            <strong>💡 How it works:</strong> Left dropdown shows formations
            with "Left" direction or unlinked standalone formations. Right
            dropdown shows formations with "Right" direction or unlinked
            standalone formations. Link them to create bi-directional
            relationships for duplicate + flip workflows.
          </Typography>
        </div>

        {/* Status Display */}
        {(leftFormation || rightFormation) && (
          <div className="flex items-center justify-center gap-sm text-secondary">
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
      </div>

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
