import { useState, useEffect } from "react";
import { Button, Input, Modal } from "../ui";
import { useMobileModal } from "../../hooks/useMobileModal";
import { Typography } from "../design-system";
import { rosterService } from "../../services";
import type { RosterPlayerView } from "../../services/rosterService";
import { useToast } from "../../hooks/useToast";
import { error as logError } from "../../utils/logger";

interface EditPlayerModalProps {
  player: RosterPlayerView;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void | Promise<void>;
}

interface PlayerFormData {
  first_name: string;
  last_name: string;
  nickname: string;
  jersey_number: string;
  position: string;
  grade_level: string;
  heightFeet: string;
  heightInches: string;
  weight_lbs: string;
}

const positionOptions = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "C",
  "G",
  "T",
  "DL",
  "DE",
  "DT",
  "LB",
  "ILB",
  "OLB",
  "CB",
  "S",
  "FS",
  "SS",
  "K",
  "P",
];

const gradeOptions = [
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "College",
];

export default function EditPlayerModal({
  player,
  isOpen,
  onClose,
  onSave,
}: EditPlayerModalProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const modalSize = useMobileModal("lg");
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>({
    first_name: "",
    last_name: "",
    nickname: "",
    jersey_number: "",
    position: "",
    grade_level: "",
    heightFeet: "",
    heightInches: "",
    weight_lbs: "",
  });

  // Initialize form data from player prop
  useEffect(() => {
    if (player) {
      const heightFeet = player.height_inches
        ? Math.floor(player.height_inches / 12).toString()
        : "";
      const heightInches = player.height_inches
        ? (player.height_inches % 12).toString()
        : "";

      setFormData({
        first_name: player.first_name || "",
        last_name: player.last_name || "",
        nickname: player.nickname || "",
        jersey_number: player.jersey_number?.toString() || "",
        position: player.position || "",
        grade_level: player.grade_level || "",
        heightFeet,
        heightInches,
        weight_lbs: player.weight_lbs?.toString() || "",
      });
    }
  }, [player]);

  const handleFieldChange = (field: keyof PlayerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null); // Clear error when user makes changes
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setFormError("First name and last name are required");
      return;
    }

    if (!formData.position.trim()) {
      setFormError("At least one position is required");
      return;
    }

    // Validate height format
    if (formData.heightFeet.trim() || formData.heightInches.trim()) {
      const feet = parseInt(formData.heightFeet.trim() || "0", 10) || 0;
      const inches = parseInt(formData.heightInches.trim() || "0", 10) || 0;

      if (feet < 0 || inches < 0 || inches > 11) {
        setFormError("Invalid height format. Inches must be 0-11.");
        return;
      }
    }

    try {
      setSaving(true);
      setFormError(null);

      // Calculate total height in inches
      const heightFeet = parseInt(formData.heightFeet.trim() || "0", 10) || 0;
      const heightInches =
        parseInt(formData.heightInches.trim() || "0", 10) || 0;
      const totalHeightInches =
        heightFeet > 0 || heightInches > 0
          ? heightFeet * 12 + heightInches
          : undefined;

      // Prepare update data
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        nickname: formData.nickname.trim() || undefined,
        jersey_number: formData.jersey_number.trim()
          ? parseInt(formData.jersey_number.trim(), 10)
          : undefined,
        position: formData.position.trim(),
        grade_level: formData.grade_level.trim() || undefined,
        height_inches: totalHeightInches,
        weight_lbs: formData.weight_lbs.trim()
          ? parseFloat(formData.weight_lbs.trim())
          : undefined,
      };

      await rosterService.updatePlayer(player.id, updateData);

      toast.success(
        `Player ${formData.first_name} ${formData.last_name} updated successfully`
      );

      await onSave(); // Call parent's onSave callback
    } catch (error) {
      logError("[EditPlayerModal] Failed to update player:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update player. Please try again.";
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePositionToggle = (position: string) => {
    const currentPositions = formData.position
      ? formData.position.split(",").filter(Boolean)
      : [];

    if (currentPositions.includes(position)) {
      // Remove position
      const updatedPositions = currentPositions.filter((p) => p !== position);
      handleFieldChange("position", updatedPositions.join(","));
    } else {
      // Add position
      handleFieldChange("position", [...currentPositions, position].join(","));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Player"
      size={modalSize}
    >
      <div className="space-y-4 p-md">
        {formError && (
          <div className="p-sm bg-error-100 dark:bg-error-900/30 border border-error-500 rounded-lg">
            <Typography
              variant="body-sm"
              className="text-error-700 dark:text-error-300"
            >
              {formError}
            </Typography>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <Typography variant="headline-sm" className="text-primary">
            Basic Information
          </Typography>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => handleFieldChange("first_name", e.target.value)}
              required
              disabled={saving}
            />
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => handleFieldChange("last_name", e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <Input
            label="Nickname"
            value={formData.nickname}
            onChange={(e) => handleFieldChange("nickname", e.target.value)}
            placeholder="e.g., Johnny"
            disabled={saving}
          />
        </div>

        {/* Roster Information */}
        <div className="space-y-4">
          <Typography variant="headline-sm" className="text-primary">
            Roster Information
          </Typography>

          <div>
            <label className="block text-sm font-medium mb-2">
              Position(s) *
            </label>
            {/* Selected Positions Display */}
            {formData.position && (
              <div className="flex gap-2 flex-wrap mb-3">
                {formData.position
                  .split(",")
                  .filter(Boolean)
                  .map((pos) => (
                    <span
                      key={pos}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                    >
                      {pos}
                      <button
                        type="button"
                        onClick={() => handlePositionToggle(pos)}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
            {/* Position Selector */}
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handlePositionToggle(e.target.value);
                }
              }}
              disabled={saving}
              className="w-full px-3 py-2 border border-bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-primary dark:bg-secondary"
            >
              <option value="">+ Add Position</option>
              {positionOptions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary mt-1">
              Select multiple positions if player plays more than one
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jersey Number"
              type="number"
              value={formData.jersey_number}
              onChange={(e) =>
                handleFieldChange("jersey_number", e.target.value)
              }
              disabled={saving}
            />
            <div>
              <label className="block text-sm font-medium mb-1">
                Grade Level
              </label>
              <select
                value={formData.grade_level}
                onChange={(e) =>
                  handleFieldChange("grade_level", e.target.value)
                }
                disabled={saving}
                className="w-full px-3 py-2 border border-bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-primary dark:bg-secondary"
              >
                <option value="">Select Grade</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Physical Information */}
        <div className="space-y-4">
          <Typography variant="headline-sm" className="text-primary">
            Physical Information
          </Typography>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Height (Feet)"
              type="number"
              value={formData.heightFeet}
              onChange={(e) => handleFieldChange("heightFeet", e.target.value)}
              placeholder="5"
              disabled={saving}
            />
            <Input
              label="Height (Inches)"
              type="number"
              value={formData.heightInches}
              onChange={(e) =>
                handleFieldChange("heightInches", e.target.value)
              }
              placeholder="10"
              disabled={saving}
            />
            <Input
              label="Weight (lbs)"
              type="number"
              value={formData.weight_lbs}
              onChange={(e) => handleFieldChange("weight_lbs", e.target.value)}
              placeholder="165"
              disabled={saving}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-sm pt-4 border-t border-bg-secondary">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
