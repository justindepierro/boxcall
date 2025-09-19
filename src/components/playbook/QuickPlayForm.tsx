import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button/Button";
import { SmartSelect } from "../ui/SmartSelect";
import { TextArea } from "../ui/TextArea";
import { Form, FormField } from "../ui/Form";
import { Icon } from "../ui/Icon";
import { PlaysService } from "@services";
import type { Play } from "../../types/play";

interface QuickPlayFormProps {
  onSubmit: (playData: Partial<Play>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Play>;
  isLoading?: boolean;
}

export const QuickPlayForm: React.FC<QuickPlayFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Play>>({
    play_name: initialData.play_name || "",
    formation: initialData.formation || "",
    p_type: initialData.p_type || "Pass",
    one_word_play: initialData.one_word_play || "",
    personnel: initialData.personnel || "",
    notes: initialData.notes || "",
    // Add other fields as needed
    ...initialData,
  });

  const [suggestions, setSuggestions] = useState({
    formations: [] as string[],
    playNames: [] as string[],
    oneWordPlays: [] as string[],
    personnel: [] as string[],
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [formations, playNames, oneWordPlays, personnel] =
          await Promise.all([
            PlaysService.getDistinctFormations(),
            PlaysService.getDistinctPlayNames(),
            PlaysService.getDistinctOneWordPlays(),
            PlaysService.getDistinctPersonnel(),
          ]);

        setSuggestions({
          formations,
          playNames,
          oneWordPlays,
          personnel,
        });
      } catch (error) {
        console.error("Failed to load suggestions:", error);
      }
    };

    loadSuggestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setShowSuccess(true);
      // Hide success message after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (_error) {
      // Error handling is done in the parent component
    }
  };

  const handleChange = (
    field: keyof Play,
    value: string | number | (string | number)[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value as string }));
  };

  // Helper to create options from suggestions
  const createOptions = (values: string[]) => {
    return values.map((value) => ({ value, label: value }));
  };

  // Helper to find matching suggestions (case-insensitive)
  const findMatchingSuggestion = (
    input: string,
    suggestions: string[]
  ): string | null => {
    if (!input.trim()) return null;

    const normalizedInput = input.toLowerCase().trim();

    // Exact match first
    const exactMatch = suggestions.find(
      (s) => s.toLowerCase() === normalizedInput
    );
    if (exactMatch) return exactMatch;

    // Partial match
    const partialMatch = suggestions.find((s) =>
      s.toLowerCase().includes(normalizedInput)
    );
    if (partialMatch) return partialMatch;

    return null;
  };

  // Handle select changes with suggestion matching
  const handleSelectChange = (
    field: keyof Play,
    value: string | number | (string | number)[]
  ) => {
    const stringValue = String(value);

    // For formation and play_name, try to match existing suggestions
    if (field === "formation") {
      const match = findMatchingSuggestion(stringValue, suggestions.formations);
      setFormData((prev) => ({ ...prev, [field]: match || stringValue }));
    } else if (field === "play_name") {
      const match = findMatchingSuggestion(stringValue, suggestions.playNames);
      setFormData((prev) => ({ ...prev, [field]: match || stringValue }));
    } else if (field === "one_word_play") {
      const match = findMatchingSuggestion(
        stringValue,
        suggestions.oneWordPlays
      );
      setFormData((prev) => ({ ...prev, [field]: match || stringValue }));
    } else if (field === "personnel") {
      const match = findMatchingSuggestion(stringValue, suggestions.personnel);
      setFormData((prev) => ({ ...prev, [field]: match || stringValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: stringValue }));
    }
  };

  const formationOptions = createOptions(suggestions.formations);
  const playTypeOptions = [
    { value: "Pass", label: "Pass" },
    { value: "Run", label: "Run" },
    { value: "RPO", label: "RPO" },
    { value: "Play Action", label: "Play Action" },
  ];

  return (
    <Form onSubmit={handleSubmit} title="Create New Play" variant="modal">
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
          <Icon name="check-circle" className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 text-sm font-medium">
            Play created successfully!
          </span>
        </div>
      )}
      <div className="space-y-4">
        <FormField label="Play Name" required>
          <SmartSelect
            options={createOptions(suggestions.playNames)}
            value={formData.play_name || ""}
            onChange={(value) => handleSelectChange("play_name", value)}
            onCreateOption={(value) => handleSelectChange("play_name", value)}
            placeholder="e.g., Slant Left"
            searchable
            createOption
            caseNormalization="uppercase"
            enableFuzzyMatching
            fuzzyThreshold={0.6}
            required
          />
        </FormField>

        <FormField
          label="One Word Call"
          description="Short name for calling the play"
        >
          <SmartSelect
            options={createOptions(suggestions.oneWordPlays)}
            value={formData.one_word_play || ""}
            onChange={(value) => handleSelectChange("one_word_play", value)}
            onCreateOption={(value) =>
              handleSelectChange("one_word_play", value)
            }
            placeholder="e.g., Slant"
            searchable
            createOption
            caseNormalization="uppercase"
            enableFuzzyMatching
            fuzzyThreshold={0.6}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Formation" required>
            <SmartSelect
              options={formationOptions}
              value={formData.formation || ""}
              onChange={(value) => handleSelectChange("formation", value)}
              onCreateOption={(value) => handleSelectChange("formation", value)}
              placeholder="Select or type formation"
              searchable
              createOption
              caseNormalization="uppercase"
              enableFuzzyMatching
              fuzzyThreshold={0.6}
              required
            />
          </FormField>

          <FormField label="Play Type" required>
            <SmartSelect
              options={playTypeOptions}
              value={formData.p_type || "Pass"}
              onChange={(value) => handleSelectChange("p_type", value)}
              placeholder="Select Play Type"
              caseNormalization="none"
              required
            />
          </FormField>
        </div>

        <FormField
          label="Personnel"
          description="Personnel grouping (e.g., 11)"
        >
          <SmartSelect
            options={createOptions(suggestions.personnel)}
            value={formData.personnel || ""}
            onChange={(value) => handleSelectChange("personnel", value)}
            onCreateOption={(value) => handleSelectChange("personnel", value)}
            placeholder="e.g., 11"
            searchable
            createOption
            caseNormalization="uppercase"
            enableFuzzyMatching
            fuzzyThreshold={0.6}
          />
        </FormField>

        <FormField
          label="Notes"
          description="Additional play details or instructions"
        >
          <TextArea
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Play description, key reads, etc."
            rows={3}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={
            isLoading || !formData.play_name?.trim() || !formData.formation
          }
          className="relative"
        >
          {isLoading ? (
            <>
              <Icon name="refresh-cw" className="h-4 w-4 mr-2 animate-spin" />
              Creating Play...
            </>
          ) : showSuccess ? (
            <>
              <Icon name="check-circle" className="h-4 w-4 mr-2" />
              Created!
            </>
          ) : (
            <>
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Create Play
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};
