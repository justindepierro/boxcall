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
} from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { FormationBadge } from "../playbook/FormationBadge";
import { FormationService } from "../../services/formationService";
import { PersonnelService } from "../../services/personnelService";
import type {
  Formation,
  FormationCategory,
  FormationType,
  StrengthType,
} from "../../types/formation";
import type { PersonnelConfiguration } from "../../types/personnel";
import { Save, ChevronDown } from "lucide-react";
import { ToastContext } from "../../contexts/ToastContext";
import { useSaveState } from "../../contexts/SaveStateContext";

interface FormationBuilderPanelProps {
  playbookId: string;
  onSuccess?: () => void;
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

export const FormationBuilderPanel: React.FC<FormationBuilderPanelProps> = ({
  playbookId,
  onSuccess,
}) => {
  const toast = useContext(ToastContext);
  const { startSaving, finishSaving, isSaving: globalSaving } = useSaveState();

  console.log(
    "🏗️ [FormationBuilderPanel] Component mounted/re-rendered with playbookId:",
    playbookId
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [availablePersonnel, setAvailablePersonnel] = useState<
    PersonnelConfiguration[]
  >([]);

  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(
    []
  );
  const [category, setCategory] = useState<FormationCategory | "">("");
  const [formationType, setFormationType] = useState<FormationType | null>(
    null
  );
  const [runStrength, setRunStrength] = useState<StrengthType>("balanced");
  const [passStrength, setPassStrength] = useState<StrengthType>("balanced");
  const [tags, setTags] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [applyToBothSides, setApplyToBothSides] = useState<boolean>(true); // Default to true

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
  console.log("🏗️ [FormationBuilderPanel] Current state:", {
    loading,
    formationsCount: allFormations.length,
    playbookId,
    formations: allFormations.map((f) => ({
      id: f.id,
      name: f.name,
      direction: f.direction,
    })),
  });

  const loadData = useCallback(async () => {
    console.log(
      "🔄 [FormationBuilderPanel] loadData() called with playbookId:",
      playbookId
    );
    setLoading(true);
    try {
      console.log(
        "📞 [FormationBuilderPanel] Calling FormationService.getFormationsByPlaybook..."
      );
      const [formations, personnel] = await Promise.all([
        FormationService.getFormationsByPlaybook(playbookId),
        PersonnelService.getPersonnelConfigurations(playbookId),
      ]);

      console.log("✅ [FormationBuilderPanel] Received data:", {
        formationsCount: formations.length,
        personnelCount: personnel.length,
        formations: formations.map((f) => ({
          id: f.id,
          name: f.name,
          direction: f.direction,
          playbook_id: f.playbook_id,
        })),
      });

      console.log("👥 [FormationBuilderPanel] Personnel configurations:", {
        count: personnel.length,
        personnel: personnel.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          playersCount: p.players?.length || 0,
        })),
      });

      setAllFormations(formations);
      setAvailablePersonnel(personnel);

      console.log(
        "✅ [FormationBuilderPanel] State updated with formations:",
        formations.length
      );
    } catch (error) {
      console.error("❌ [FormationBuilderPanel] Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [playbookId]);

  useEffect(() => {
    console.log(
      "⚡ [FormationBuilderPanel] useEffect triggered with playbookId:",
      playbookId
    );
    if (playbookId) {
      console.log(
        "✅ [FormationBuilderPanel] playbookId is valid, calling loadData()"
      );
      loadData();
    } else {
      console.log(
        "❌ [FormationBuilderPanel] playbookId is empty/undefined, skipping loadData()"
      );
    }
  }, [playbookId, loadData]);

  // Populate fields when formation is selected
  useEffect(() => {
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
  }, [selectedFormation]);

  const togglePersonnel = (personnelId: string) => {
    setSelectedPersonnelIds((prev) =>
      prev.includes(personnelId)
        ? prev.filter((id) => id !== personnelId)
        : [...prev, personnelId]
    );
    // Instant save for personnel toggle
    setTimeout(() => autoSave(), 0);
  };

  // Check if selected formation has a linked variant (left/right pair)
  const getLinkedFormation = (): Formation | null => {
    if (!selectedFormation) return null;

    // If this is a left formation, find the right one
    if (selectedFormation.direction === "left") {
      return (
        allFormations.find(
          (f) =>
            f.name === selectedFormation.name &&
            f.direction === "right" &&
            f.base_formation_id === selectedFormation.base_formation_id
        ) || null
      );
    }

    // If this is a right formation, find the left one
    if (selectedFormation.direction === "right") {
      return (
        allFormations.find(
          (f) =>
            f.name === selectedFormation.name &&
            f.direction === "left" &&
            f.base_formation_id === selectedFormation.base_formation_id
        ) || null
      );
    }

    return null;
  };

  const linkedFormation = getLinkedFormation();

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
      console.log("⏭️ Save already in progress, skipping...");
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
      await FormationService.updateFormation(selectedFormation.id, updateData);

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

      // Reload data to get fresh state
      await loadData();

      // Finish with success (green flash)
      finishSaving("success");
    } catch (error) {
      console.error("Failed to auto-save formation:", error);
      toast?.error("Failed to save changes", "Auto-save Failed");
      finishSaving("error");
    }
  }, [
    selectedFormation,
    linkedFormation,
    globalSaving,
    startSaving,
    finishSaving,
    loadData,
    toast,
  ]);

  // Debounce auto-save (wait 500ms after last change)
  useEffect(() => {
    if (!selectedFormation) return;

    const timeoutId = setTimeout(() => {
      autoSave();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedFormation, autoSave]);

  const handleSave = async () => {
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
      await FormationService.updateFormation(selectedFormation.id, updateData);

      // If "Apply to both sides" is checked and there's a linked formation, update it too
      if (applyToBothSides && linkedFormation) {
        console.log(
          "📝 Applying changes to linked formation:",
          linkedFormation.name,
          linkedFormation.direction
        );

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
        toast?.success("Formation updated successfully!", "Formation Saved");
      }

      await loadData();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save formation:", error);
      toast?.error(
        "Failed to save formation. Please try again.",
        "Save Failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-spacing-xl">
        <Typography variant="body-md" className="text-text-muted">
          Loading formations...
        </Typography>
      </div>
    );
  }

  // Filter out base formations if they have left/right variants
  const visibleFormations = allFormations.filter((formation) => {
    // If direction is 'base', check if variants exist
    if (formation.direction === "base") {
      const hasVariants = allFormations.some(
        (f) =>
          f.name === formation.name &&
          f.direction !== "base" &&
          (f.direction === "left" || f.direction === "right")
      );
      // Only show base formation if no variants exist
      return !hasVariants;
    }
    // Show all non-base formations
    return true;
  });

  return (
    <div className="flex flex-col gap-spacing-md p-spacing-sm max-w-3xl mx-auto">
      {/* Formation Selector */}
      <div className="flex flex-col gap-spacing-xs">
        <Typography variant="body-md" className="text-text-primary font-medium">
          Select Formation
        </Typography>

        {loading ? (
          <div className="p-spacing-md text-center text-text-muted">
            Loading formations...
          </div>
        ) : visibleFormations.length === 0 ? (
          <div className="p-spacing-md bg-surface-muted rounded border border-border-secondary text-center">
            <Typography variant="body-sm" className="text-text-muted">
              No formations found. Create formations by adding plays with
              formation names first.
            </Typography>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedFormation?.id || ""}
              onChange={(e) => {
                const formation = visibleFormations.find(
                  (f) => f.id === e.target.value
                );
                console.log("📝 Formation selected:", formation);
                setSelectedFormation(formation || null);
              }}
              className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none pr-spacing-lg"
            >
              <option value="">
                Choose a formation to edit... ({visibleFormations.length}{" "}
                available)
              </option>
              {visibleFormations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.name}{" "}
                  {formation.direction !== "base" &&
                    `(${formation.direction === "left" ? "Left" : formation.direction === "right" ? "Right" : "Base"})`}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-spacing-sm top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
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
                  onChange={(e) => setApplyToBothSides(e.target.checked)}
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
              Select which personnel packages can run this formation:
            </Typography>

            {availablePersonnel.length === 0 ? (
              <div className="p-spacing-sm bg-surface-muted rounded border border-border-secondary text-center">
                <Typography variant="caption" className="text-text-muted">
                  No personnel configurations found. Create personnel packages
                  first.
                </Typography>
              </div>
            ) : (
              <>
                {console.log(
                  "🎨 [FormationBuilderPanel] Rendering personnel buttons:",
                  {
                    availableCount: availablePersonnel.length,
                    personnel: availablePersonnel.map((p) => ({
                      id: p.id,
                      name: p.name,
                      description: p.description,
                    })),
                    selectedIds: selectedPersonnelIds,
                  }
                )}
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
                      <Typography variant="caption" className="font-medium">
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
                      ✓ {selectedPersonnelIds.length} personnel package
                      {selectedPersonnelIds.length > 1 ? "s" : ""} selected
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
                  setCategory(e.target.value as FormationCategory | "")
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
                    e.target.value ? (e.target.value as FormationType) : null
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
                  <Typography variant="caption" className="font-medium">
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
                  <Typography variant="caption" className="font-medium">
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

          {/* Manual Save Button (Optional) */}
          <div className="flex justify-end items-center pt-spacing-xs border-t border-border-primary">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="secondary"
              size="sm"
              className="gap-spacing-xs"
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
    </div>
  );
};
