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

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { FormationBadge } from "../playbook/FormationBadge";
import { FormationService } from "../../services/formationService";
import { PersonnelService } from "../../services/personnelService";
import type { Formation, FormationCategory } from "../../types/formation";
import type { PersonnelConfiguration } from "../../types/personnel";
import { Save, ChevronDown } from "lucide-react";

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

export const FormationBuilderPanel: React.FC<FormationBuilderPanelProps> = ({
  playbookId,
  onSuccess,
}) => {
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
  const [tags, setTags] = useState<string>("");
  const [description, setDescription] = useState<string>("");

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
      setTags(selectedFormation.tags?.join(", ") || "");
      setDescription(selectedFormation.description || "");
    } else {
      setSelectedPersonnelIds([]);
      setCategory("");
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
  };

  const handleSave = async () => {
    if (!selectedFormation) {
      alert("Please select a formation");
      return;
    }

    setSaving(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await FormationService.updateFormation(selectedFormation.id, {
        personnel_packages: selectedPersonnelIds,
        category: category || undefined,
        tags: tagsArray,
        description: description || undefined,
      });

      alert("Formation updated successfully!");
      await loadData();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save formation:", error);
      alert("Failed to save formation. Please try again.");
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

  return (
    <div className="flex flex-col gap-spacing-lg p-spacing-md max-w-4xl mx-auto">
      {/* Formation Selector */}
      <div className="flex flex-col gap-spacing-sm">
        <Typography variant="headline-md" className="text-text-primary">
          Select Formation
        </Typography>

        {loading ? (
          <div className="p-spacing-md text-center text-text-muted">
            Loading formations...
          </div>
        ) : allFormations.length === 0 ? (
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
                const formation = allFormations.find(
                  (f) => f.id === e.target.value
                );
                console.log("📝 Formation selected:", formation);
                setSelectedFormation(formation || null);
              }}
              className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-spacing-lg"
            >
              <option value="">
                Choose a formation to edit... ({allFormations.length} available)
              </option>
              {allFormations.map((formation) => (
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
          <div className="mt-spacing-sm p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
            <FormationBadge
              formationId={selectedFormation.id}
              direction={selectedFormation.direction}
            />
          </div>
        )}
      </div>

      {selectedFormation && (
        <>
          {/* Personnel Packages */}
          <div className="p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
            <Typography
              variant="headline-sm"
              className="text-text-primary mb-spacing-sm"
            >
              Personnel Packages
            </Typography>
            <Typography
              variant="caption"
              className="text-text-secondary mb-spacing-md"
            >
              Select which personnel packages can run this formation:
            </Typography>

            {availablePersonnel.length === 0 ? (
              <div className="p-spacing-md bg-surface-muted rounded border border-border-secondary text-center">
                <Typography variant="body-sm" className="text-text-muted">
                  No personnel configurations found. Create personnel packages
                  first.
                </Typography>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-spacing-sm">
                  {availablePersonnel.map((personnel) => (
                    <button
                      key={personnel.id}
                      onClick={() => togglePersonnel(personnel.id)}
                      className={`
                        px-spacing-md py-spacing-sm rounded-lg border-2 transition-all
                        ${
                          selectedPersonnelIds.includes(personnel.id)
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-border-primary bg-surface-primary text-text-secondary hover:border-primary-300"
                        }
                      `}
                    >
                      <Typography variant="body-sm" className="font-medium">
                        {selectedPersonnelIds.includes(personnel.id)
                          ? "✓ "
                          : ""}
                        {personnel.name}
                      </Typography>
                    </button>
                  ))}
                </div>

                {selectedPersonnelIds.length > 0 && (
                  <div className="mt-spacing-sm p-spacing-sm bg-primary-50 border border-primary-200 rounded">
                    <Typography variant="caption" className="text-primary-700">
                      ✓ {selectedPersonnelIds.length} personnel package
                      {selectedPersonnelIds.length > 1 ? "s" : ""} selected
                    </Typography>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Category */}
          <div className="p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
            <Typography
              variant="headline-sm"
              className="text-text-primary mb-spacing-sm"
            >
              Formation Category
            </Typography>

            <div className="relative">
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as FormationCategory | "")
                }
                className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-spacing-lg"
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

          {/* Tags */}
          <div className="p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
            <Typography
              variant="headline-sm"
              className="text-text-primary mb-spacing-sm"
            >
              Tags
            </Typography>
            <Typography
              variant="caption"
              className="text-text-secondary mb-spacing-sm"
            >
              Comma-separated tags for filtering (e.g., "twins, compressed,
              stack")
            </Typography>

            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="twins, compressed, unbalanced"
              className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Description */}
          <div className="p-spacing-md bg-surface-secondary rounded-lg border border-border-primary">
            <Typography
              variant="headline-sm"
              className="text-text-primary mb-spacing-sm"
            >
              Description
            </Typography>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this formation..."
              rows={3}
              className="w-full px-spacing-sm py-spacing-xs border border-border-primary rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              size="lg"
              className="gap-spacing-xs"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Formation"}
            </Button>
          </div>
        </>
      )}

      {!selectedFormation && (
        <div className="p-spacing-xl bg-surface-muted rounded-lg border border-border-secondary text-center">
          <Typography variant="body-lg" className="text-text-muted">
            👆 Select a formation above to edit its details
          </Typography>
        </div>
      )}
    </div>
  );
};
