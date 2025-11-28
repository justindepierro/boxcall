/**
 * FormationBuilderPanel
 *
 * Dedicated panel for editing formation metadata:
 * - Personnel packages that can run this formation
 * - Formation category (spread, pro, power, etc.)
 * - Tags for filtering/organization
 * - Description
 *
 * This is separate from drawing (canvas) and linking (left/right variants)
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useMemo,
} from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { FormationBadge } from "../playbook/FormationBadge";
import { FormationService } from "../../services/formationService";
import { PersonnelService } from "../../services/personnelService";
import { CreateOppositeFormationModal } from "./CreateOppositeFormationModal";
import { FormationDirectionReviewPanel } from "./FormationDirectionReviewPanel";
import { FormationDataDiagnostic } from "./FormationDataDiagnostic";
import { FormationTemplateSelector } from "./FormationTemplateSelector";
import { useBulkSelection } from "./BulkSelectionContext";
import type { FormationTemplate } from "../../data/formationTemplates";
import { supabase } from "../../lib/supabase";
import { error as logError } from "../../utils/logger";
import { useSaveState } from "../../hooks/useSaveState";
import type {
  Formation,
  FormationCategory,
  FormationType,
  StrengthType,
} from "../../types/formation";
import type { PersonnelConfiguration } from "../../types/personnel";
import { Save, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";
import { ToastContext } from "../../contexts/ToastContext";
import { useIsMobile } from "../../hooks/useBreakpoint";

interface FormationBuilderPanelProps {
  playbookId: string;
  onFormationCreated?: (formation: Formation) => void;
  onFormationUpdated?: (formation: Formation) => void;
  showHeader?: boolean; // Control header display (hide when in modal)
  hideSubTabs?: boolean; // Hide internal tabs when parent modal has unified tabs
}

const FORMATION_CATEGORIES: { value: FormationCategory; label: string }[] = [
  { value: "spread", label: "Spread" },
  { value: "pro", label: "Pro Style" },
  { value: "power", label: "Power" },
  { value: "special", label: "Special Teams" },
  { value: "goal_line", label: "Goal Line" },
  { value: "short_yardage", label: "Short Yardage" },
];

const FORMATION_TYPES: { value: FormationType; label: string }[] = [
  { value: "I Formation", label: "I Formation" },
  { value: "Singleback", label: "Singleback" },
  { value: "Pistol", label: "Pistol" },
  { value: "Shotgun", label: "Shotgun" },
  { value: "Empty", label: "Empty" },
  { value: "Trips", label: "Trips" },
  { value: "Bunch", label: "Bunch" },
  { value: "Stack", label: "Stack" },
  { value: "Wing", label: "Wing" },
  { value: "Other", label: "Other" },
];

const STRENGTH_OPTIONS: { value: StrengthType; label: string; icon: string }[] =
  [
    { value: "left", label: "Left", icon: "←" },
    { value: "balanced", label: "Balanced", icon: "⚖️" },
    { value: "right", label: "Right", icon: "→" },
  ];

export const FormationBuilderPanel: React.FC<FormationBuilderPanelProps> =
  React.memo(
    ({
      playbookId,
      onFormationCreated: _onFormationCreated, // Reserved for future CREATE operation
      onFormationUpdated,
      showHeader = true, // Default to true for backwards compat
      hideSubTabs = false, // Default to false - show tabs by default
    }) => {
      const toast = useContext(ToastContext);
      const {
        startSaving,
        finishSaving,
        isSaving: globalSaving,
      } = useSaveState();
      const isMobile = useIsMobile();
      const {
        isSelected,
        toggleSelection,
        selectAll,
        clearSelection,
        selectionCount,
        hasSelection,
      } = useBulkSelection();

      const [activeTab, setActiveTab] = useState<
        "details" | "diagnostic" | "review" | "incomplete"
      >("details");
      const [loading, setLoading] = useState(false);
      const [saving, setSaving] = useState(false);
      const [allFormations, setAllFormations] = useState<Formation[]>([]);
      const [availablePersonnel, setAvailablePersonnel] = useState<
        PersonnelConfiguration[]
      >([]);

      const [selectedFormation, setSelectedFormation] =
        useState<Formation | null>(null);
      const [showOppositeModal, setShowOppositeModal] = useState(false);
      const [formationForOpposite, setFormationForOpposite] =
        useState<Formation | null>(null);
      const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<
        string[]
      >([]);
      const [category, setCategory] = useState<FormationCategory | "">("");
      const [formationType, setFormationType] = useState<FormationType | null>(
        null
      );
      const [runStrength, setRunStrength] = useState<StrengthType>("balanced");
      const [passStrength, setPassStrength] =
        useState<StrengthType>("balanced");
      const [tags, setTags] = useState<string>("");
      const [description, setDescription] = useState<string>("");
      const [applyToBothSides, setApplyToBothSides] = useState<boolean>(true); // Default to true

      // New formation creation states
      const [newFormationName, setNewFormationName] = useState<string>("");
      const [newFormationPersonnelId, setNewFormationPersonnelId] =
        useState<string>("");

      // Use refs for form data to stabilize autoSave dependencies
      const formDataRef = useRef({
        selectedPersonnelIds,
        category,
        formationType,
        runStrength,
        passStrength,
        tags,
        description,
        applyToBothSides,
      });

      // Track if we're populating fields from a formation selection (to prevent auto-save)
      const isPopulatingFieldsRef = useRef(false);

      // Update ref on every render (doesn't cause re-renders)
      useEffect(() => {
        formDataRef.current = {
          selectedPersonnelIds,
          category,
          formationType,
          runStrength,
          passStrength,
          tags,
          description,
          applyToBothSides,
        };
      });

      const loadData = useCallback(async () => {
        setLoading(true);
        try {
          // Optimize query - only select columns we need for the dropdown
          const { data: formations, error: formationsError } = await supabase
            .from("formations")
            .select(
              "id, name, category, personnel_name, direction, usage_count, opposite_formation_id, personnel_packages, formation_type, run_strength, pass_strength, tags, description, player_positions"
            )
            .eq("playbook_id", playbookId)
            .order("name", { ascending: true });

          if (formationsError) {
            throw formationsError;
          }

          const personnel =
            await PersonnelService.getPersonnelConfigurations(playbookId);

          setAllFormations((formations as Formation[]) || []);
          setAvailablePersonnel(personnel);
        } catch (error) {
          logError("[FormationBuilderPanel] Failed to load data:", error);
          if (toast) {
            toast.error("Failed to load formations");
          }
        } finally {
          setLoading(false);
        }
      }, [playbookId, toast]);

      useEffect(() => {
        if (playbookId) {
          loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [playbookId]);

      // Populate fields when formation is selected
      useEffect(() => {
        isPopulatingFieldsRef.current = true;

        if (selectedFormation) {
          setSelectedPersonnelIds(selectedFormation.personnel_packages || []);
          setCategory(selectedFormation.category || "");
          setFormationType(selectedFormation.formation_type || null);
          setRunStrength(selectedFormation.run_strength || "balanced");
          setPassStrength(selectedFormation.pass_strength || "balanced");
          setTags(selectedFormation.tags?.join(", ") || "");
          setDescription(selectedFormation.description || "");
        } else {
          setSelectedPersonnelIds([]);
          setCategory("");
          setFormationType(null);
          setRunStrength("balanced");
          setPassStrength("balanced");
          setTags("");
          setDescription("");
        }

        // Allow auto-save after a short delay (fields are populated)
        setTimeout(() => {
          isPopulatingFieldsRef.current = false;
        }, 100);
      }, [selectedFormation]);

      const togglePersonnel = useCallback((personnelId: string) => {
        setSelectedPersonnelIds((prev) =>
          prev.includes(personnelId)
            ? prev.filter((id) => id !== personnelId)
            : [...prev, personnelId]
        );
      }, []);

      // Check if selected formation has a linked variant (left/right pair)
      // Memoize to prevent unnecessary re-renders
      const linkedFormation = React.useMemo((): Formation | null => {
        if (!selectedFormation || !selectedFormation.opposite_formation_id)
          return null;

        // Find the opposite formation using opposite_formation_id
        return (
          allFormations.find(
            (f) => f.id === selectedFormation.opposite_formation_id
          ) || null
        );
      }, [selectedFormation, allFormations]);

      // Helper function to mirror strength for linked formations
      const getMirroredStrength = (strength: StrengthType): StrengthType => {
        if (strength === "balanced") return "balanced";
        if (strength === "left") return "right";
        if (strength === "right") return "left";
        return strength;
      };

      // Auto-save function (debounced) - Optimized with stable dependencies
      const autoSave = useCallback(async () => {
        if (!selectedFormation) return;

        // Guard: Don't start new save if already saving
        if (globalSaving) {
          return;
        }

        startSaving();

        // Read form data from ref (stable, doesn't trigger re-renders)
        const data = formDataRef.current;
        const tagsArray = data.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);

        const updateData = {
          personnel_packages: data.selectedPersonnelIds,
          category: data.category || undefined,
          formation_type: data.formationType || undefined,
          run_strength: data.runStrength,
          pass_strength: data.passStrength,
          tags: tagsArray,
          description: data.description || undefined,
        };

        try {
          // Update the selected formation
          await FormationService.updateFormation(
            selectedFormation.id,
            updateData
          );

          // If "Apply to both sides" is checked and there's a linked formation, update it too
          if (data.applyToBothSides && linkedFormation) {
            const linkedUpdateData = {
              ...updateData,
              run_strength: getMirroredStrength(data.runStrength),
              pass_strength: getMirroredStrength(data.passStrength),
            };

            await FormationService.updateFormation(
              linkedFormation.id,
              linkedUpdateData
            );
          }

          // Reload data to get fresh state - call directly without depending on the callback
          const [formations, personnel] = await Promise.all([
            FormationService.getFormationsByPlaybook(playbookId),
            PersonnelService.getPersonnelConfigurations(playbookId),
          ]);
          setAllFormations(formations);
          setAvailablePersonnel(personnel);

          // Finish with success (green flash)
          finishSaving("success");
        } catch (error) {
          logError(
            "[FormationBuilderPanel] Failed to auto-save formation:",
            error
          );
          toast?.error("Failed to save changes", "Auto-save Failed");
          finishSaving("error");
        }
      }, [
        selectedFormation,
        linkedFormation,
        globalSaving,
        startSaving,
        finishSaving,
        playbookId,
        toast,
      ]);

      // Debounce auto-save (wait 500ms after last change)
      // Trigger on form field changes, not on autoSave function changes
      useEffect(() => {
        if (!selectedFormation) return;

        // Don't auto-save while we're populating fields from a selection
        if (isPopulatingFieldsRef.current) return;

        const timeoutId = setTimeout(() => {
          // Call autoSave directly here to avoid dependency issues
          const saveFormation = async () => {
            if (globalSaving) {
              return;
            }

            startSaving();

            const data = formDataRef.current;
            const tagsArray = data.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t.length > 0);

            const updateData = {
              personnel_packages: data.selectedPersonnelIds,
              category: data.category || undefined,
              formation_type: data.formationType || undefined,
              run_strength: data.runStrength,
              pass_strength: data.passStrength,
              tags: tagsArray,
              description: data.description || undefined,
            };

            try {
              await FormationService.updateFormation(
                selectedFormation.id,
                updateData
              );

              if (data.applyToBothSides && linkedFormation) {
                const linkedUpdateData = {
                  ...updateData,
                  run_strength: getMirroredStrength(data.runStrength),
                  pass_strength: getMirroredStrength(data.passStrength),
                };

                await FormationService.updateFormation(
                  linkedFormation.id,
                  linkedUpdateData
                );
              }

              // Reload data
              const [formations, personnel] = await Promise.all([
                FormationService.getFormationsByPlaybook(playbookId),
                PersonnelService.getPersonnelConfigurations(playbookId),
              ]);
              setAllFormations(formations);
              setAvailablePersonnel(personnel);

              finishSaving("success");
            } catch (error) {
              logError(
                "[FormationBuilderPanel] Failed to auto-save formation:",
                error
              );
              toast?.error("Failed to save changes", "Auto-save Failed");
              finishSaving("error");
            }
          };

          saveFormation();
        }, 500);

        return () => clearTimeout(timeoutId);
      }, [
        selectedFormation,
        selectedPersonnelIds,
        category,
        formationType,
        runStrength,
        passStrength,
        tags,
        description,
        applyToBothSides,
        linkedFormation,
        playbookId,
        globalSaving,
        startSaving,
        finishSaving,
        toast,
      ]);

      /**
       * Handle creating a new formation from a template
       */
      const handleCreateFromTemplate = useCallback(
        async (template: FormationTemplate) => {
          setSaving(true);
          try {
            // Create formation name from template
            const formationName = template.name;

            // Convert template player positions to formation format
            const playerPositions = template.playerPositions.map((pos) => ({
              position: pos.position,
              x: pos.x,
              y: pos.y,
              label: pos.label,
              role: pos.role,
              jerseyNumber: pos.jerseyNumber,
            }));

            // Create the formation
            const newFormation = await FormationService.createFormation({
              playbook_id: playbookId,
              name: formationName,
              description: template.description,
              category: template.category as FormationCategory,
              formation_type: template.name.includes("Shotgun")
                ? "Shotgun"
                : template.name.includes("Pistol")
                  ? "Pistol"
                  : template.name.includes("I")
                    ? "I Formation"
                    : "Other",
              player_positions: playerPositions,
              run_strength: "balanced",
              pass_strength: "balanced",
              direction: null,
              personnel_id: undefined, // Will be set by user after creation
              tags: [template.personnel, template.category],
            });

            toast?.success(
              `Created "${formationName}" from template!`,
              "Formation Created"
            );

            // Reload formations
            const formations =
              await FormationService.getFormationsByPlaybook(playbookId);
            setAllFormations(formations);

            // Select the new formation
            setSelectedFormation(newFormation);

            // Fill in the form fields
            setCategory(newFormation.category || "spread");
            setFormationType(newFormation.formation_type || "Other");
            setRunStrength(newFormation.run_strength);
            setPassStrength(newFormation.pass_strength);
            setTags((newFormation.tags || []).join(", "));
            setDescription(newFormation.description || "");
            setSelectedPersonnelIds(
              [newFormation.personnel_id].filter(Boolean) as string[]
            );

            if (onFormationUpdated) {
              onFormationUpdated(newFormation);
            }
          } catch (err) {
            logError("Failed to create formation from template", err);
            toast?.error("Failed to create formation from template");
          } finally {
            setSaving(false);
          }
        },
        [playbookId, toast, onFormationUpdated]
      );

      const handleSave = useCallback(async () => {
        if (!selectedFormation) {
          toast?.error("Please select a formation");
          return;
        }

        setSaving(true);
        try {
          const tagsArray = tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

          const updateData = {
            personnel_packages: selectedPersonnelIds,
            category: category || undefined,
            formation_type: formationType || undefined,
            run_strength: runStrength,
            pass_strength: passStrength,
            tags: tagsArray,
            description: description || undefined,
          };

          // Update the selected formation
          await FormationService.updateFormation(
            selectedFormation.id,
            updateData
          );

          // If "Apply to both sides" is checked and there's a linked formation, update it too
          if (applyToBothSides && linkedFormation) {
            // Mirror the strengths for the linked formation
            const linkedUpdateData = {
              ...updateData,
              run_strength: getMirroredStrength(runStrength),
              pass_strength: getMirroredStrength(passStrength),
            };

            await FormationService.updateFormation(
              linkedFormation.id,
              linkedUpdateData
            );

            toast?.success(
              `Formation updated successfully! Changes applied to both ${selectedFormation.direction} and ${linkedFormation.direction} variants.`,
              "Formations Saved"
            );
          } else {
            toast?.success(
              "Formation updated successfully!",
              "Formation Saved"
            );
          }

          // Reload data to get fresh state
          const [formations, personnel] = await Promise.all([
            FormationService.getFormationsByPlaybook(playbookId),
            PersonnelService.getPersonnelConfigurations(playbookId),
          ]);
          setAllFormations(formations);
          setAvailablePersonnel(personnel);

          // ✨ NEW: Check if opposite formation exists
          // Only prompt if formation has positions (is drawn) and doesn't have opposite
          // Note: direction can be null for new formations - we'll still prompt
          if (selectedFormation.player_positions.length > 1) {
            // Require at least 2 positions (more than just the default center)
            const hasOpposite = await FormationService.hasOppositeFormation(
              selectedFormation.id
            );

            if (!hasOpposite) {
              // Get updated formation data and show modal
              const updatedFormation = await FormationService.getFormationById(
                selectedFormation.id
              );
              setFormationForOpposite(updatedFormation);
              setShowOppositeModal(true);
            }
          }

          if (onFormationUpdated) {
            onFormationUpdated(selectedFormation);
          }
        } catch (error) {
          logError("[FormationBuilderPanel] Failed to save formation:", error);
          toast?.error(
            "Failed to save formation. Please try again.",
            "Save Failed"
          );
        } finally {
          setSaving(false);
        }
      }, [
        selectedFormation,
        tags,
        selectedPersonnelIds,
        category,
        formationType,
        runStrength,
        passStrength,
        description,
        applyToBothSides,
        linkedFormation,
        playbookId,
        toast,
        onFormationUpdated,
      ]);

      // Show all formations (no filtering needed in new simplified system)
      const visibleFormations = useMemo(() => allFormations, [allFormations]);

      const tabs = useMemo(
        () => [
          { id: "details" as const, label: "Formation Details", icon: Save },
          {
            id: "diagnostic" as const,
            label: "Data Diagnostic",
            icon: AlertCircle,
          },
          {
            id: "review" as const,
            label: "Direction Review",
            icon: AlertCircle,
          },
          {
            id: "incomplete" as const,
            label: "Incomplete Formations",
            icon: CheckCircle,
          },
        ],
        []
      );

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
        <div
          className={`flex flex-col gap-md ${isMobile ? "p-sm" : "p-sm max-w-3xl mx-auto"} relative`}
        >
          {/* Loading Skeleton - Show only on initial load (no formations yet) */}
          {loading && allFormations.length === 0 ? (
            <div className="space-y-lg animate-pulse">
              {/* Skeleton Header */}
              {showHeader && (
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-subtle rounded w-48"></div>
                  <div className="h-10 w-32 bg-subtle rounded"></div>
                </div>
              )}

              {/* Skeleton Tabs */}
              {!hideSubTabs && (
                <div className="flex gap-xs border-b border-primary">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-32 bg-subtle rounded-t"
                    ></div>
                  ))}
                </div>
              )}

              {/* Skeleton Content */}
              <div className="space-y-md">
                <div className="h-12 bg-subtle rounded"></div>
                <div className="h-64 bg-subtle rounded"></div>
                <div className="h-32 bg-subtle rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Loading Overlay - Show when refetching data */}
              {loading && allFormations.length > 0 && (
                <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                  <div className="bg-primary border border-primary rounded-lg p-lg shadow-lg flex flex-col items-center gap-md">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <Typography variant="body-sm" className="text-secondary">
                      Loading formations...
                    </Typography>
                  </div>
                </div>
              )}

              {/* Header - Conditional based on showHeader prop */}
              {showHeader && (
                <div className="flex items-center justify-between">
                  <Typography variant="headline-md" className="text-primary">
                    Formation Manager
                  </Typography>
                  {activeTab === "details" && (
                    <Button
                      onClick={() => {
                        // Clear selection and form to create new formation
                        setSelectedFormation(null);
                        setSelectedPersonnelIds([]);
                        setCategory("");
                        setFormationType(null);
                        setRunStrength("balanced");
                        setPassStrength("balanced");
                        setTags("");
                        setDescription("");
                        setApplyToBothSides(true);
                      }}
                      variant="primary"
                      size="sm"
                    >
                      + New Formation
                    </Button>
                  )}
                </div>
              )}

              {/* Tab Navigation - Hide if parent modal has unified tabs */}
              {!hideSubTabs && (
                <div
                  className={`flex ${isMobile ? "gap-0" : "gap-xs"} border-b border-primary`}
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                  flex items-center gap-xs ${isMobile ? "px-lg py-md flex-1 justify-center" : "px-md py-sm"}
                  text-sm font-medium transition-colors border-b-2
                  ${
                    isActive
                      ? "border-primary-500 text-primary-700 bg-primary-50"
                      : "border-transparent text-secondary hover:text-primary hover:bg-muted"
                  }
                `}
                      >
                        <Icon
                          className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                        />
                        <span className={isMobile ? "text-xs" : ""}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tab Content */}
              {activeTab === "details" && (
                <div className="flex flex-col gap-md">
                  {/* Quick Start: Insert NFL Template */}
                  <div className="flex flex-col gap-xs">
                    <Typography
                      variant="body-md"
                      className="text-primary font-medium"
                    >
                      Quick Start
                    </Typography>
                    <FormationTemplateSelector
                      onSelectTemplate={(template) => {
                        // Create new formation from template
                        handleCreateFromTemplate(template);
                      }}
                      disabled={loading}
                    />
                    <Typography variant="caption" className="text-muted">
                      Start with a professional NFL formation template, or
                      select an existing formation below to edit.
                    </Typography>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-secondary"></div>

                  {/* Formation Details Content (original content) */}

                  {/* Formation Selector with Bulk Selection */}
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between">
                      <Typography
                        variant="body-md"
                        className="text-primary font-medium"
                      >
                        Select Formation
                      </Typography>
                      {visibleFormations.length > 0 && (
                        <div className="flex items-center gap-xs">
                          {hasSelection && (
                            <Typography
                              variant="caption"
                              className="text-primary-600 font-medium"
                            >
                              {selectionCount} selected
                            </Typography>
                          )}
                          <button
                            onClick={() =>
                              selectAll(visibleFormations.map((f) => f.id))
                            }
                            className={`text-xs text-primary-600 hover:underline ${isMobile ? "px-sm py-xs min-h-[44px] flex items-center" : "px-xs"}`}
                            type="button"
                          >
                            Select All
                          </button>
                          <span className="text-muted">•</span>
                          <button
                            onClick={clearSelection}
                            className={`text-xs text-muted hover:underline ${isMobile ? "px-sm py-xs min-h-[44px] flex items-center" : "px-xs"}`}
                            type="button"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {loading ? (
                      <div className="p-md text-center text-muted">
                        Loading formations...
                      </div>
                    ) : visibleFormations.length === 0 ? (
                      <div className="p-md bg-muted rounded border border-secondary text-center">
                        <Typography variant="body-sm" className="text-muted">
                          No formations found. Create formations by adding plays
                          with formation names first.
                        </Typography>
                      </div>
                    ) : (
                      <div className="space-y-xs max-h-96 overflow-y-auto">
                        {visibleFormations.map((formation) => {
                          const selected = isSelected(formation.id);
                          const isCurrentlyEditing =
                            selectedFormation?.id === formation.id;

                          return (
                            <div
                              key={formation.id}
                              className={`flex items-center gap-sm ${isMobile ? "p-md" : "p-sm"} rounded border transition-all ${
                                isCurrentlyEditing
                                  ? "bg-success-50 border-success-300 shadow-sm"
                                  : selected
                                    ? "bg-primary-50 border-primary-300"
                                    : "bg-primary border-muted hover:border-primary hover:shadow-sm"
                              }`}
                            >
                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSelection(formation.id)}
                                onClick={(e) => e.stopPropagation()}
                                className={`${isMobile ? "w-5 h-5" : "w-4 h-4"} text-primary-600 rounded focus:ring-primary-500 flex-shrink-0`}
                              />

                              {/* Formation Details - Clickable to edit */}
                              <button
                                onClick={() => setSelectedFormation(formation)}
                                type="button"
                                className="flex-1 text-left min-w-0"
                              >
                                <div className="flex items-center justify-between gap-sm">
                                  <span className="text-sm font-medium text-primary truncate">
                                    {formation.name}
                                  </span>
                                  <div className="flex items-center gap-xs flex-shrink-0">
                                    {isCurrentlyEditing && (
                                      <span className="text-xs bg-success-100 text-success-700 px-xs py-0.5 rounded font-medium">
                                        Editing
                                      </span>
                                    )}
                                    {formation.direction && (
                                      <span className="text-xs bg-muted text-muted px-xs py-0.5 rounded">
                                        {formation.direction === "left"
                                          ? "← Left"
                                          : "→ Right"}
                                      </span>
                                    )}
                                    {formation.opposite_formation_id && (
                                      <span
                                        className="text-xs text-primary-600"
                                        title="Has opposite formation"
                                      >
                                        ↔️
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {formation.personnel_name && (
                                  <span className="text-xs text-muted">
                                    {formation.personnel_name}
                                  </span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedFormation && (
                      <div className="mt-xs p-sm bg-secondary rounded border border-primary">
                        <FormationBadge
                          formationId={selectedFormation.id}
                          direction={selectedFormation.direction}
                        />
                        {linkedFormation && (
                          <div className="mt-xs flex items-center gap-xs p-xs bg-primary-50 border border-primary-200 rounded text-xs">
                            <input
                              type="checkbox"
                              id="applyToBothSides"
                              checked={applyToBothSides}
                              onChange={(e) =>
                                setApplyToBothSides(e.target.checked)
                              }
                              className="w-3.5 h-3.5 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <label
                              htmlFor="applyToBothSides"
                              className="text-primary-700 font-medium cursor-pointer"
                            >
                              Apply to both {selectedFormation.direction} and{" "}
                              {linkedFormation.direction} variants
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* New Formation Form - Shows when no formation selected */}
                  {!selectedFormation && (
                    <div className="p-lg bg-secondary rounded-lg border border-primary">
                      <div className="space-y-md">
                        <div>
                          <Typography
                            variant="headline-sm"
                            className="text-primary mb-xs"
                          >
                            Create New Formation
                          </Typography>
                          <Typography variant="body-sm" className="text-muted">
                            Enter formation details to create a new formation.
                            You can add player positions on the "Draw Formation"
                            tab.
                          </Typography>
                        </div>

                        {/* Formation Name */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-xs">
                            Formation Name *
                          </label>
                          <input
                            type="text"
                            value={newFormationName}
                            onChange={(e) =>
                              setNewFormationName(e.target.value)
                            }
                            placeholder="e.g., Trips Right, I Formation, Shotgun Spread"
                            className="w-full px-md py-sm border border-primary rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>

                        {/* Personnel Package */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-xs">
                            Personnel Package *
                          </label>
                          <select
                            value={newFormationPersonnelId}
                            onChange={(e) =>
                              setNewFormationPersonnelId(e.target.value)
                            }
                            className="w-full px-md py-sm border border-primary rounded-md bg-primary text-primary"
                          >
                            <option value="">Select personnel...</option>
                            {availablePersonnel.map((personnel) => (
                              <option key={personnel.id} value={personnel.id}>
                                {personnel.name} - {personnel.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-xs">
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) =>
                              setCategory(e.target.value as FormationCategory)
                            }
                            className="w-full px-md py-sm border border-primary rounded-md bg-primary text-primary"
                          >
                            <option value="">Select category...</option>
                            {FORMATION_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Save Button */}
                        <Button
                          onClick={async () => {
                            if (!newFormationName.trim()) {
                              toast?.error?.("Please enter a formation name");
                              return;
                            }
                            if (!newFormationPersonnelId) {
                              toast?.error?.(
                                "Please select a personnel package"
                              );
                              return;
                            }

                            setSaving(true);
                            try {
                              // Find the selected personnel to get the name
                              const selectedPersonnel = availablePersonnel.find(
                                (p) => p.id === newFormationPersonnelId
                              );

                              // Create the formation with a minimal default position
                              // User will add more positions in "Draw Formation" tab
                              const newFormation =
                                await FormationService.createFormation({
                                  playbook_id: playbookId,
                                  name: newFormationName.trim(),
                                  personnel_id: newFormationPersonnelId,
                                  personnel_name:
                                    selectedPersonnel?.name || undefined,
                                  category: category || undefined,
                                  description: undefined,
                                  direction: null,
                                  creation_source: "formation_builder",
                                  creation_context: {
                                    created_via: "formation_manager_panel",
                                  },
                                  // Provide minimal default position (Center at snap point)
                                  // This satisfies validation while allowing user to customize
                                  player_positions: [
                                    {
                                      position: "C",
                                      x: 26.65, // Center of field
                                      y: 0, // Line of scrimmage
                                      label: undefined,
                                    },
                                  ],
                                });

                              toast?.success?.(
                                `Formation "${newFormationName}" created!`
                              );

                              // Reload all formations
                              await loadData();

                              // Select the newly created formation for editing
                              setSelectedFormation(newFormation);

                              // Clear the form
                              setNewFormationName("");
                              setNewFormationPersonnelId("");
                              setCategory("");
                            } catch (error) {
                              logError("Failed to create formation:", error);
                              toast?.error?.(
                                error instanceof Error
                                  ? error.message
                                  : "Failed to create formation"
                              );
                            } finally {
                              setSaving(false);
                            }
                          }}
                          variant="primary"
                          className="w-full"
                          disabled={
                            saving ||
                            !newFormationName.trim() ||
                            !newFormationPersonnelId
                          }
                        >
                          <Save className="w-4 h-4 mr-xs" />
                          {saving ? "Creating..." : "Create Formation"}
                        </Button>

                        <Typography
                          variant="caption"
                          className="text-muted text-center block"
                        >
                          💡 Tip: After creating, switch to "Draw Formation" to
                          add player positions
                        </Typography>
                      </div>
                    </div>
                  )}

                  {selectedFormation && (
                    <>
                      {/* Health Warning Banner */}
                      {selectedPersonnelIds.length === 0 && (
                        <div className="p-md bg-warning-50 border-2 border-warning-300 rounded-lg mb-md">
                          <div className="flex items-start gap-sm">
                            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <Typography
                                variant="body-sm"
                                className="text-warning-800 font-semibold mb-xs"
                              >
                                {availablePersonnel.length === 0
                                  ? "⚠️ Create Personnel First"
                                  : "⚠️ Link Personnel for Better Experience"}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-warning-700"
                              >
                                {availablePersonnel.length === 0
                                  ? "No personnel packages found. Create your default personnel in the Personnel Builder for a better experience."
                                  : "Select at least one personnel package below to optimize this formation for your playbook."}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Personnel Packages */}
                      <div className="p-sm bg-secondary rounded border border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-primary font-medium mb-xs"
                        >
                          Personnel Packages
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-secondary mb-sm"
                        >
                          Select which personnel packages can run this
                          formation:
                        </Typography>

                        {availablePersonnel.length === 0 ? (
                          <div className="p-sm bg-muted rounded border border-secondary text-center">
                            <Typography
                              variant="caption"
                              className="text-muted"
                            >
                              No personnel configurations found. Create
                              personnel packages first.
                            </Typography>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-xs">
                              {availablePersonnel.map((personnel) => (
                                <button
                                  key={personnel.id}
                                  onClick={() => togglePersonnel(personnel.id)}
                                  className={`
                        px-sm py-xs rounded border transition-colors text-sm
                        ${
                          selectedPersonnelIds.includes(personnel.id)
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-primary bg-primary text-secondary hover:border-primary-300"
                        }
                      `}
                                >
                                  <Typography
                                    variant="caption"
                                    className="font-medium"
                                  >
                                    {selectedPersonnelIds.includes(personnel.id)
                                      ? "✓ "
                                      : ""}
                                    {personnel.name}
                                  </Typography>
                                </button>
                              ))}
                            </div>

                            {selectedPersonnelIds.length > 0 && (
                              <div className="mt-xs p-xs bg-primary-50 border border-primary-200 rounded">
                                <Typography
                                  variant="caption"
                                  className="text-primary-700 text-xs"
                                >
                                  ✓ {selectedPersonnelIds.length} personnel
                                  package
                                  {selectedPersonnelIds.length > 1
                                    ? "s"
                                    : ""}{" "}
                                  selected
                                </Typography>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Category */}
                      <div className="p-sm bg-secondary rounded border border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-primary font-medium mb-xs"
                        >
                          Formation Category
                        </Typography>

                        <div className="relative">
                          <select
                            value={category}
                            onChange={(e) =>
                              setCategory(
                                e.target.value as FormationCategory | ""
                              )
                            }
                            className="w-full px-sm py-xs border border-primary rounded bg-primary text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-lg"
                          >
                            <option value="">No category</option>
                            {FORMATION_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        </div>
                      </div>

                      {/* Formation Type */}
                      <div className="p-sm bg-secondary rounded border border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-primary font-medium mb-xs"
                        >
                          Formation Type
                        </Typography>

                        <div className="relative">
                          <select
                            value={formationType || ""}
                            onChange={(e) =>
                              setFormationType(
                                e.target.value
                                  ? (e.target.value as FormationType)
                                  : null
                              )
                            }
                            className="w-full px-sm py-xs border border-primary rounded bg-primary text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-lg"
                          >
                            <option value="">No type specified</option>
                            {FORMATION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        </div>
                      </div>

                      {/* Run Strength */}
                      <div className="p-sm bg-secondary rounded border border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-primary font-medium mb-xs"
                        >
                          Run Strength
                        </Typography>

                        <div className="flex gap-xs">
                          {STRENGTH_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setRunStrength(option.value);
                                // Instant save for button clicks (no debounce)
                                setTimeout(() => autoSave(), 0);
                              }}
                              className={`
                    flex-1 px-sm py-xs rounded border transition-colors
                    font-medium text-center text-sm cursor-pointer
                    ${
                      runStrength === option.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-primary bg-primary text-secondary hover:border-primary-300 hover:bg-muted"
                    }
                  `}
                            >
                              <div className="text-base">{option.icon}</div>
                              <Typography
                                variant="caption"
                                className="font-medium"
                              >
                                {option.label}
                              </Typography>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pass Strength */}
                      <div className="p-sm bg-secondary rounded border border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-primary font-medium mb-xs"
                        >
                          Pass Strength
                        </Typography>

                        <div className="flex gap-xs">
                          {STRENGTH_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setPassStrength(option.value);
                                // Instant save for button clicks (no debounce)
                                setTimeout(() => autoSave(), 0);
                              }}
                              className={`
                    flex-1 px-sm py-xs rounded border transition-colors
                    font-medium text-center text-sm cursor-pointer
                    ${
                      passStrength === option.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-primary bg-primary text-secondary hover:border-primary-300 hover:bg-muted"
                    }
                  `}
                            >
                              <div className="text-base">{option.icon}</div>
                              <Typography
                                variant="caption"
                                className="font-medium"
                              >
                                {option.label}
                              </Typography>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="p-sm bg-secondary rounded border border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-primary font-medium mb-xs"
                        >
                          Tags
                        </Typography>

                        <input
                          type="text"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="twins, compressed, unbalanced"
                          className="w-full px-sm py-xs border border-primary rounded bg-primary text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      {/* Description */}
                      <div className="p-sm bg-secondary rounded border border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-primary font-medium mb-xs"
                        >
                          Description
                        </Typography>

                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional notes about this formation..."
                          rows={2}
                          className="w-full px-sm py-xs border border-primary rounded bg-primary text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                        />
                      </div>

                      {/* Manual Save Button and Opposite Formation Creation */}
                      <div className="flex justify-between items-center pt-xs border-t border-primary">
                        {/* Create Opposite Button - Only show if formation doesn't have one */}
                        {selectedFormation &&
                          !selectedFormation.opposite_formation_id && (
                            <Button
                              onClick={async () => {
                                // Get fresh formation data and show modal
                                const fresh =
                                  await FormationService.getFormationById(
                                    selectedFormation.id
                                  );
                                setFormationForOpposite(fresh);
                                setShowOppositeModal(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="gap-xs"
                            >
                              ↔️ Create Opposite Formation
                            </Button>
                          )}

                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          variant="secondary"
                          size="sm"
                          className="gap-xs ml-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Now
                        </Button>
                      </div>
                    </>
                  )}

                  {!selectedFormation && (
                    <div className="p-lg bg-muted rounded border border-secondary text-center">
                      <Typography variant="body-sm" className="text-muted">
                        👆 Select a formation above to edit its details
                      </Typography>
                    </div>
                  )}

                  {/* ✨ Automatic Opposite Formation Prompt */}
                  {formationForOpposite && (
                    <CreateOppositeFormationModal
                      isOpen={showOppositeModal}
                      onClose={() => {
                        setShowOppositeModal(false);
                        setFormationForOpposite(null);
                      }}
                      originalFormation={formationForOpposite}
                      onOppositeCreated={async (oppositeFormation) => {
                        toast?.success(
                          `Created ${oppositeFormation.direction}-side formation!`,
                          "Opposite Formation Created"
                        );
                        // Reload formations to show the new opposite
                        await loadData();
                        setShowOppositeModal(false);
                        setFormationForOpposite(null);
                      }}
                      onMarkedAsStandalone={async () => {
                        toast?.success(
                          "Formation marked as standalone (no opposite needed)",
                          "Formation Updated"
                        );
                        // Reload formations to refresh
                        await loadData();
                        setShowOppositeModal(false);
                        setFormationForOpposite(null);
                      }}
                    />
                  )}
                </div>
              )}

              {/* Data Diagnostic Tab - Hide if parent modal has unified tabs */}
              {!hideSubTabs && activeTab === "diagnostic" && (
                <FormationDataDiagnostic playbookId={playbookId} />
              )}

              {/* Direction Review Tab - Hide if parent modal has unified tabs */}
              {!hideSubTabs && activeTab === "review" && (
                <FormationDirectionReviewPanel
                  playbookId={playbookId}
                  onFixComplete={async () => {
                    // Reload formations to reflect changes
                    await loadData();
                  }}
                  onBack={() => setActiveTab("details")}
                />
              )}

              {/* Incomplete Formations Tab (Placeholder for Phase 2) - Hide if parent modal has unified tabs */}
              {!hideSubTabs && activeTab === "incomplete" && (
                <div className="p-lg bg-muted rounded border border-secondary text-center">
                  <Typography variant="body-sm" className="text-muted">
                    Incomplete Formations panel coming in Phase 2...
                  </Typography>
                </div>
              )}
            </>
          )}
        </div>
      );
    }
  );
