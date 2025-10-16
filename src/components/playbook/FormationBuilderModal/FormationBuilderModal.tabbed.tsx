/**
 * FormationBuilderModal - Tabbed Interface (Redesigned)
 *
 * Unified formation management with two modes:
 * - Tab 1: Link Formations - Connect left/right variants
 * - Tab 2: Draw Formation - Visual canvas builder
 *
 * This gives coaches one place to manage all formation workflows.
 */

import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal/Modal";
import { Typography } from "../../design-system/Typography";
import { Link2, Pencil } from "lucide-react";
import { FormationLinkingPanel } from "../../formations/FormationLinkingPanel";
import { FormationBuilderCanvas } from "./FormationBuilderCanvas";
import { FormationService } from "../../../services/formationService";
import { useToast } from "../../../hooks/useToast";
import type { FormationPlayerPosition, Formation } from "../../../types/formation";

interface FormationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  formationId?: string; // For editing existing formation
  onSaved?: () => void;
}

type TabType = "link" | "draw";

export function FormationBuilderModal({
  isOpen,
  onClose,
  playbookId,
  formationId,
  onSaved,
}: FormationBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("link");
  const [formation, setFormation] = useState<Formation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Load formation when editing
  useEffect(() => {
    if (!formationId || !isOpen) {
      setFormation(null);
      return;
    }

    let mounted = true;

    const loadFormation = async () => {
      setIsLoading(true);
      try {
        const data = await FormationService.getFormationById(formationId);
        if (mounted) {
          setFormation(data);
        }
      } catch (error) {
        console.error("Failed to load formation:", error);
        if (mounted) {
          toast.error("Failed to load formation");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadFormation();

    return () => {
      mounted = false;
    };
  }, [formationId, isOpen, toast]);

  // If we're editing a specific formation, default to draw tab
  React.useEffect(() => {
    if (formationId) {
      setActiveTab("draw");
    } else {
      setActiveTab("link");
    }
  }, [formationId, isOpen]);

  const handleSuccess = () => {
    if (onSaved) {
      onSaved();
    }
    // Don't auto-close - let user continue working
  };

  // Handle save from canvas
  const handleCanvasSave = async (
    players: FormationPlayerPosition[],
    personnel: string
  ) => {
    try {
      if (formationId && formation) {
        // Update existing formation
        await FormationService.updateFormation(formationId, {
          player_positions: players,
          personnel_name: personnel,
        });
        toast.success("Formation updated successfully!");
      } else {
        // Create new formation (placeholder - need form data)
        toast.info("Save new formation - integrate with creation form");
      }

      handleSuccess();
    } catch (error) {
      console.error("Failed to save formation:", error);
      toast.error("Failed to save formation");
    }
  };

  const handleCanvasCancel = () => {
    setActiveTab("link");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Formation Manager"
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-border-primary bg-surface-secondary">
          <button
            onClick={() => setActiveTab("link")}
            className={`
              flex-1 px-spacing-lg py-spacing-md flex items-center justify-center gap-spacing-xs
              font-medium transition-colors
              ${
                activeTab === "link"
                  ? "bg-surface-primary text-text-primary border-b-2 border-primary-500"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-muted"
              }
            `}
          >
            <Link2 className="w-5 h-5" />
            <span className="font-medium">Link Formations</span>
          </button>

          <button
            onClick={() => setActiveTab("draw")}
            className={`
              flex-1 px-spacing-lg py-spacing-md flex items-center justify-center gap-spacing-xs
              font-medium transition-colors relative
              ${
                activeTab === "draw"
                  ? "bg-surface-primary text-text-primary border-b-2 border-primary-500"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-muted"
              }
            `}
          >
            <Pencil className="w-5 h-5" />
            <span className="font-medium">Draw Formation</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "link" && (
            <FormationLinkingPanel
              playbookId={playbookId}
              onSuccess={handleSuccess}
              initialLeftFormation={null}
              initialRightFormation={null}
            />
          )}

          {activeTab === "draw" && (
            <div className="h-full">
              {formationId && isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Typography variant="body-md" className="text-text-muted">
                    Loading formation...
                  </Typography>
                </div>
              ) : (
                <FormationBuilderCanvas
                  playbookId={playbookId}
                  formationId={formationId}
                  formation={formation || null}
                  onSave={handleCanvasSave}
                  onCancel={handleCanvasCancel}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
