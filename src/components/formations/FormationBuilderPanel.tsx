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
import { useBulkSelection } from "./BulkSelectionContext";
import { supabase } from "../../lib/supabase";
import { error as logError } from "../../utils/logger";
import { useSaveState } from "../../contexts/SaveStateContext";
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
          <div className="flex items-center justify-center py-spacing-xl">
            <Typography variant="body-md" className="text-text-muted">
              Loading formations...
            </Typography>
          </div>
        );
      }

      return (
        <div
          className={`flex flex-col gap-spacing-md ${isMobile ? "p-spacing-sm" : "p-spacing-sm max-w-3xl mx-auto"} relative`}
        >
          {/* Loading Skeleton - Show only on initial load (no formations yet) */}
          {loading && allFormations.length === 0 ? (
            <div className="space-y-spacing-lg animate-pulse">
              {/* Skeleton Header */}
              {showHeader && (
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-surface-subtle rounded w-48"></div>
                  <div className="h-10 w-32 bg-surface-subtle rounded"></div>
                </div>
              )}

              {/* Skeleton Tabs */}
              {!hideSubTabs && (
                <div className="flex gap-spacing-xs border-b border-border-primary">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-32 bg-surface-subtle rounded-t"
                    ></div>
                  ))}
                </div>
              )}

              {/* Skeleton Content */}
              <div className="space-y-spacing-md">
                <div className="h-12 bg-surface-subtle rounded"></div>
                <div className="h-64 bg-surface-subtle rounded"></div>
                <div className="h-32 bg-surface-subtle rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Loading Overlay - Show when refetching data */}
              {loading && allFormations.length > 0 && (
                <div className="absolute inset-0 bg-surface-primary/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                  <div className="bg-surface-primary border border-border-primary rounded-lg p-spacing-lg shadow-lg flex flex-col items-center gap-spacing-md">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <Typography
                      variant="body-sm"
                      className="text-text-secondary"
                    >
                      Loading formations...
                    </Typography>
                  </div>
                </div>
              )}

              {/* Header - Conditional based on showHeader prop */}
              {showHeader && (
                <div className="flex items-center justify-between">
                  <Typography
                    variant="headline-md"
                    className="text-text-primary"
                  >
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
                  className={`flex ${isMobile ? "gap-0" : "gap-spacing-xs"} border-b border-border-primary`}
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                  flex items-center gap-spacing-xs ${isMobile ? "px-spacing-lg py-spacing-md flex-1 justify-center" : "px-spacing-md py-spacing-sm"}
                  text-sm font-medium transition-colors border-b-2
                  ${
                    isActive
                      ? "border-primary-500 text-primary-700 bg-primary-50"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted"
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
                <div className="flex flex-col gap-spacing-md">
                  {/* Formation Details Content (original content) */}

                  {/* Formation Selector with Bulk Selection */}
                  <div className="flex flex-col gap-spacing-xs">
                    <div className="flex items-center justify-between">
                      <Typography
                        variant="body-md"
                        className="text-text-primary font-medium"
                      >
                        Select Formation
                      </Typography>
                      {visibleFormations.length > 0 && (
                        <div className="flex items-center gap-spacing-xs">
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
                            className={`text-xs text-primary-600 hover:underline ${isMobile ? "px-spacing-sm py-spacing-xs min-h-[44px] flex items-center" : "px-spacing-xs"}`}
                            type="button"
                          >
                            Select All
                          </button>
                          <span className="text-text-muted">•</span>
                          <button
                            onClick={clearSelection}
                            className={`text-xs text-text-muted hover:underline ${isMobile ? "px-spacing-sm py-spacing-xs min-h-[44px] flex items-center" : "px-spacing-xs"}`}
                            type="button"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {loading ? (
                      <div className="p-spacing-md text-center text-text-muted">
                        Loading formations...
                      </div>
                    ) : visibleFormations.length === 0 ? (
                      <div className="p-spacing-md bg-surface-muted rounded border border-border-secondary text-center">
                        <Typography
                          variant="body-sm"
                          className="text-text-muted"
                        >
                          No formations found. Create formations by adding plays
                          with formation names first.
                        </Typography>
                      </div>
                    ) : (
                      <div className="space-y-spacing-xs max-h-96 overflow-y-auto">
                        {visibleFormations.map((formation) => {
                          const selected = isSelected(formation.id);
                          const isCurrentlyEditing =
                            selectedFormation?.id === formation.id;

                          return (
                            <div
                              key={formation.id}
                              className={`flex items-center gap-spacing-sm ${isMobile ? "p-spacing-md" : "p-spacing-sm"} rounded border transition-all ${
                                isCurrentlyEditing
                                  ? "bg-success-50 border-success-300 shadow-sm"
                                  : selected
                                    ? "bg-primary-50 border-primary-300"
                                    : "bg-surface-primary border-border-subtle hover:border-border-primary hover:shadow-sm"
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
                                <div className="flex items-center justify-between gap-spacing-sm">
                                  <span className="text-sm font-medium text-text-primary truncate">
                                    {formation.name}
                                  </span>
                                  <div className="flex items-center gap-spacing-xs flex-shrink-0">
                                    {isCurrentlyEditing && (
                                      <span className="text-xs bg-success-100 text-success-700 px-spacing-xs py-0.5 rounded font-medium">
                                        Editing
                                      </span>
                                    )}
                                    {formation.direction && (
                                      <span className="text-xs bg-surface-muted text-text-muted px-spacing-xs py-0.5 rounded">
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
                                  <span className="text-xs text-text-muted">
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
                      <div className="mt-spacing-xs p-spacing-sm bg-surface-secondary rounded border border-border-primary">
                        <FormationBadge
                          formationId={selectedFormation.id}
                          direction={selectedFormation.direction}
                        />
                        {linkedFormation && (
                          <div className="mt-spacing-xs flex items-center gap-spacing-xs p-spacing-xs bg-primary-50 border border-primary-200 rounded text-xs">
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
                    <div className="p-spacing-lg bg-surface-secondary rounded-lg border border-border-primary">
                      <div className="space-y-spacing-md">
                        <div>
                          <Typography
                            variant="headline-sm"
                            className="text-text-primary mb-spacing-xs"
                          >
                            Create New Formation
                          </Typography>
                          <Typography
                            variant="body-sm"
                            className="text-text-muted"
                          >
                            Enter formation details to create a new formation.
                            You can add player positions on the "Draw Formation"
                            tab.
                          </Typography>
                        </div>

                        {/* Formation Name */}
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-spacing-xs">
                            Formation Name *
                          </label>
                          <input
                            type="text"
                            value={newFormationName}
                            onChange={(e) =>
                              setNewFormationName(e.target.value)
                            }
                            placeholder="e.g., Trips Right, I Formation, Shotgun Spread"
                            className="w-full px-spacing-md py-spacing-sm border border-border-primary rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>

                        {/* Personnel Package */}
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-spacing-xs">
                            Personnel Package *
                          </label>
                          <select
                            value={newFormationPersonnelId}
                            onChange={(e) =>
                              setNewFormationPersonnelId(e.target.value)
                            }
                            className="w-full px-spacing-md py-spacing-sm border border-border-primary rounded-md bg-surface-primary text-text-primary"
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
                          <label className="block text-sm font-medium text-text-primary mb-spacing-xs">
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) =>
                              setCategory(e.target.value as FormationCategory)
                            }
                            className="w-full px-spacing-md py-spacing-sm border border-border-primary rounded-md bg-surface-primary text-text-primary"
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
                          <Save className="w-4 h-4 mr-spacing-xs" />
                          {saving ? "Creating..." : "Create Formation"}
                        </Button>

                        <Typography
                          variant="caption"
                          className="text-text-muted text-center block"
                        >
                          💡 Tip: After creating, switch to "Draw Formation" to
                          add player positions
                        </Typography>
                      </div>
                    </div>
                  )}

                  {selectedFormation && (
                    <>
                      {/* Personnel Packages */}
                      <div className="p-spacing-sm bg-surface-secondary rounded border border-border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-text-primary font-medium mb-spacing-xs"
                        >
                          Personnel Packages
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-text-secondary mb-spacing-sm"
                        >
                          Select which personnel packages can run this
                          formation:
                        </Typography>

                        {availablePersonnel.length === 0 ? (
                          <div className="p-spacing-sm bg-surface-muted rounded border border-border-secondary text-center">
                            <Typography
                              variant="caption"
                              className="text-text-muted"
                            >
                              No personnel configurations found. Create
                              personnel packages first.
                            </Typography>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-spacing-xs">
                              {availablePersonnel.map((personnel) => (
                                <button
                                  key={personnel.id}
                                  onClick={() => togglePersonnel(personnel.id)}
                                  className={`
                        px-spacing-sm py-spacing-xs rounded border transition-colors text-sm
                        ${
                          selectedPersonnelIds.includes(personnel.id)
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-border-primary bg-surface-primary text-text-secondary hover:border-primary-300"
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
                              <div className="mt-spacing-xs p-spacing-xs bg-primary-50 border border-primary-200 rounded">
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
                      <div className="p-spacing-sm bg-surface-secondary rounded border border-border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-text-primary font-medium mb-spacing-xs"
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
                            className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-spacing-lg"
                          >
                            <option value="">No category</option>
                            {FORMATION_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-spacing-sm top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>
                      </div>

                      {/* Formation Type */}
                      <div className="p-spacing-sm bg-surface-secondary rounded border border-border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-text-primary font-medium mb-spacing-xs"
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
                            className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-spacing-lg"
                          >
                            <option value="">No type specified</option>
                            {FORMATION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-spacing-sm top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>
                      </div>

                      {/* Run Strength */}
                      <div className="p-spacing-sm bg-surface-secondary rounded border border-border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-text-primary font-medium mb-spacing-xs"
                        >
                          Run Strength
                        </Typography>

                        <div className="flex gap-spacing-xs">
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
                    flex-1 px-spacing-sm py-spacing-xs rounded border transition-colors
                    font-medium text-center text-sm cursor-pointer
                    ${
                      runStrength === option.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-border-primary bg-surface-primary text-text-secondary hover:border-primary-300 hover:bg-surface-muted"
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
                      <div className="p-spacing-sm bg-surface-secondary rounded border border-border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-text-primary font-medium mb-spacing-xs"
                        >
                          Pass Strength
                        </Typography>

                        <div className="flex gap-spacing-xs">
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
                    flex-1 px-spacing-sm py-spacing-xs rounded border transition-colors
                    font-medium text-center text-sm cursor-pointer
                    ${
                      passStrength === option.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-border-primary bg-surface-primary text-text-secondary hover:border-primary-300 hover:bg-surface-muted"
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
                      <div className="p-spacing-sm bg-surface-secondary rounded border border-border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-text-primary font-medium mb-spacing-xs"
                        >
                          Tags
                        </Typography>

                        <input
                          type="text"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="twins, compressed, unbalanced"
                          className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      {/* Description */}
                      <div className="p-spacing-sm bg-surface-secondary rounded border border-border-primary">
                        <Typography
                          variant="body-sm"
                          className="text-text-primary font-medium mb-spacing-xs"
                        >
                          Description
                        </Typography>

                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional notes about this formation..."
                          rows={2}
                          className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                        />
                      </div>

                      {/* Manual Save Button and Opposite Formation Creation */}
                      <div className="flex justify-between items-center pt-spacing-xs border-t border-border-primary">
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
                              className="gap-spacing-xs"
                            >
                              ↔️ Create Opposite Formation
                            </Button>
                          )}

                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          variant="secondary"
                          size="sm"
                          className="gap-spacing-xs ml-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Now
                        </Button>
                      </div>
                    </>
                  )}

                  {!selectedFormation && (
                    <div className="p-spacing-lg bg-surface-muted rounded border border-border-secondary text-center">
                      <Typography variant="body-sm" className="text-text-muted">
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
                <div className="p-spacing-lg bg-surface-muted rounded border border-border-secondary text-center">
                  <Typography variant="body-sm" className="text-text-muted">
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
