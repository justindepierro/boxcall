/**
 * FormationBuilderModal - Simplified 3-Tab Interface
 *
 * Focused formation workflow with three essential tabs:
 * - Tab 1: Create/Edit - Formation details (name, personnel, type)
 * - Tab 2: Draw - Visual canvas for positioning players on field
 * - Tab 3: Link Variants - Connect left/right formation pairs
 *
 * Clean, purpose-driven interface for coaches to manage formations.
 */

import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal/Modal";
import { Link2, Pencil, Save } from "lucide-react";
import { Typography } from "../../design-system/Typography";
import { FormationBadge } from "../FormationBadge";
import { FormationLinkingPanel } from "../../formations/FormationLinkingPanel";
import { FormationBuilderPanel } from "../../formations/FormationBuilderPanel";
import { BulkSelectionProvider } from "../../formations/BulkSelectionContext";
import { BulkActionToolbar } from "../../formations/BulkActionToolbar";
import { DrawFormationTab } from "./DrawFormationTab";
import { FormationService } from "../../../services/formationService";
import { useToast } from "../../../hooks/useToast";
import type {
  FormationPlayerPosition,
  Formation,
  FormationCreationSource,
} from "../../../types/formation";

interface FormationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  formationId?: string; // For editing existing formation
  onSaved?: (formation?: Formation) => void;
}

type TabType = "edit" | "draw" | "link";

export function FormationBuilderModal({
  isOpen,
  onClose,
  playbookId,
  formationId,
  onSaved,
}: FormationBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("edit"); // Default to edit (create formation first)
  const [formation, setFormation] = useState<Formation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormationId, setSelectedFormationId] = useState<
    string | undefined
  >(formationId);
  const toast = useToast();

  // Update selected formation when prop changes
  useEffect(() => {
    setSelectedFormationId(formationId);
  }, [formationId]);

  // Load formation when editing
  useEffect(() => {
    if (!selectedFormationId || !isOpen) {
      setFormation(null);
      return;
    }

    let mounted = true;

    const loadFormation = async () => {
      setIsLoading(true);
      try {
        const data =
          await FormationService.getFormationById(selectedFormationId);
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
  }, [selectedFormationId, isOpen, toast]);

  // Set initial tab when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // If editing existing formation, go to draw tab
    if (selectedFormationId) {
      setActiveTab("draw");
    } else {
      // If creating new formation, start with edit tab
      setActiveTab("edit");
    }
  }, [selectedFormationId, isOpen]);

  const handleSuccess = (savedFormation?: Formation) => {
    if (onSaved) {
      onSaved(savedFormation);
    }
    // Don't auto-close - let user continue working
  };

  // Handle save from canvas
  const handleCanvasSave = async (
    players: FormationPlayerPosition[],
    personnel: string,
    source?: FormationCreationSource
  ) => {
    try {
      let savedFormation: Formation;
      
      if (selectedFormationId && formation) {
        // Update existing formation
        savedFormation = await FormationService.updateFormation(selectedFormationId, {
          player_positions: players,
          personnel_name: personnel,
          creation_source: source,
          creation_context: {
            user_action: "formation_builder_save",
            source_version: "1.0.0",
            active_tab: "draw", // Track which tab was used
            feature: "canvas_builder",
          },
        });
        toast.success("Formation updated successfully!");
      } else {
        // Create new formation (placeholder - need form data)
        toast.info("Save new formation - integrate with creation form");
        return;
      }

      handleSuccess(savedFormation);
    } catch (error) {
      console.error("Failed to save formation:", error);
      toast.error("Failed to save formation");
    }
  };

  const handleCanvasCancel = () => {
    setActiveTab("link");
  };

  return (
    <BulkSelectionProvider>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Formation Manager"
        size="xl"
      >
        <div className="flex flex-col h-full">
          {/* Formation Header - Shows which formation is being edited */}
          {formation && (
            <div className="px-spacing-lg py-spacing-md bg-surface-secondary border-b border-border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-spacing-md">
                  <FormationBadge
                    formationId={formation.id}
                    direction={formation.direction}
                  />
                  <div>
                    <Typography
                      variant="headline-sm"
                      className="text-text-primary"
                    >
                      {formation.name}
                    </Typography>
                    <div className="flex items-center gap-spacing-sm mt-spacing-xxs">
                      {formation.personnel_name && (
                        <Typography
                          variant="caption"
                          className="text-text-muted"
                        >
                          {formation.personnel_name} Personnel
                        </Typography>
                      )}
                      {formation.category && (
                        <>
                          <span className="text-text-muted">•</span>
                          <Typography
                            variant="caption"
                            className="text-text-muted"
                          >
                            {formation.category.charAt(0).toUpperCase() +
                              formation.category.slice(1)}
                          </Typography>
                        </>
                      )}
                      {formation.formation_type && (
                        <>
                          <span className="text-text-muted">•</span>
                          <Typography
                            variant="caption"
                            className="text-text-muted"
                          >
                            {formation.formation_type}
                          </Typography>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {formation.usage_count > 0 && (
                  <Typography variant="caption" className="text-text-muted">
                    Used in {formation.usage_count}{" "}
                    {formation.usage_count === 1 ? "play" : "plays"}
                  </Typography>
                )}
              </div>
            </div>
          )}

          {!formation && selectedFormationId && isLoading && (
            <div className="px-spacing-lg py-spacing-md bg-surface-secondary border-b border-border-primary">
              <Typography variant="body" className="text-text-muted">
                Loading formation...
              </Typography>
            </div>
          )}

          {!formation && !selectedFormationId && (
            <div className="px-spacing-lg py-spacing-md bg-info-50 border-b border-info-200">
              <Typography variant="body-sm" className="text-info-700">
                💡 Creating new formation - Start by entering details or drawing
                on canvas
              </Typography>
            </div>
          )}

          {/* Tab Navigation - Focused 3-tab workflow */}
          <div className="flex border-b border-border-primary bg-surface-secondary">
            {/* Tab 1: Create/Edit Formation Details */}
            <button
              onClick={() => setActiveTab("edit")}
              className={`
              flex-1 px-spacing-lg py-spacing-md flex items-center justify-center gap-spacing-xs
              font-medium transition-colors
              ${
                activeTab === "edit"
                  ? "bg-surface-primary text-text-primary border-b-2 border-primary-500"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-muted"
              }
            `}
            >
              <Save className="w-5 h-5" />
              <span className="font-medium">Create/Edit</span>
            </button>

            {/* Tab 2: Draw Formation (Visual Canvas) */}
            <button
              onClick={() => setActiveTab("draw")}
              className={`
              flex-1 px-spacing-lg py-spacing-md flex items-center justify-center gap-spacing-xs
              font-medium transition-colors
              ${
                activeTab === "draw"
                  ? "bg-surface-primary text-text-primary border-b-2 border-primary-500"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-muted"
              }
            `}
            >
              <Pencil className="w-5 h-5" />
              <span className="font-medium">Draw</span>
            </button>

            {/* Tab 3: Link Left/Right Variants */}
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
              <span className="font-medium">Link Variants</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {/* Tab 1: Create/Edit Formation Details */}
            {activeTab === "edit" && (
              <FormationBuilderPanel
                playbookId={playbookId}
                onFormationUpdated={(formation) => handleSuccess(formation)}
                showHeader={false}
                hideSubTabs={true}
              />
            )}

            {/* Tab 2: Draw Formation (Visual Canvas) */}
            {activeTab === "draw" && (
              <DrawFormationTab
                playbookId={playbookId}
                formationId={selectedFormationId}
                formation={formation}
                isLoading={isLoading}
                onSave={handleCanvasSave}
                onCancel={handleCanvasCancel}
                onFormationSelected={(id) => {
                  setSelectedFormationId(id);
                  // Formation will auto-load via useEffect
                }}
              />
            )}

            {/* Tab 3: Link Left/Right Variants */}
            {activeTab === "link" && (
              <FormationLinkingPanel
                playbookId={playbookId}
                onSuccess={handleSuccess}
                initialLeftFormation={null}
                initialRightFormation={null}
              />
            )}
          </div>
        </div>

        {/* Bulk Action Toolbar - Shows when formations are selected */}
        <BulkActionToolbar playbookId={playbookId} />
      </Modal>
    </BulkSelectionProvider>
  );
}
