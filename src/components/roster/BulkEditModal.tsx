import { useState } from "react";
import { Modal, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onSave: (updates: BulkEditUpdates) => Promise<void>;
  hasInactiveOrAlumni: boolean;
}

export interface BulkEditUpdates {
  position?: string;
  grade_level?: string;
  height_inches?: number;
  weight_lbs?: number;
}

export function BulkEditModal({
  isOpen,
  onClose,
  selectedCount,
  onSave,
  hasInactiveOrAlumni,
}: BulkEditModalProps) {
  const [saving, setSaving] = useState(false);

  // Field values
  const [position, setPosition] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");

  // Apply checkboxes
  const [applyPosition, setApplyPosition] = useState(false);
  const [applyGradeLevel, setApplyGradeLevel] = useState(false);
  const [applyHeight, setApplyHeight] = useState(false);
  const [applyWeight, setApplyWeight] = useState(false);

  const positionOptions = [
    { value: "", label: "Select position..." },
    { value: "QB", label: "QB - Quarterback" },
    { value: "RB", label: "RB - Running Back" },
    { value: "WR", label: "WR - Wide Receiver" },
    { value: "TE", label: "TE - Tight End" },
    { value: "OL", label: "OL - Offensive Line" },
    { value: "DL", label: "DL - Defensive Line" },
    { value: "LB", label: "LB - Linebacker" },
    { value: "CB", label: "CB - Cornerback" },
    { value: "S", label: "S - Safety" },
    { value: "K", label: "K - Kicker" },
    { value: "P", label: "P - Punter" },
  ];

  const gradeLevelOptions = [
    { value: "", label: "Select grade..." },
    { value: "9", label: "9th Grade (Freshman)" },
    { value: "10", label: "10th Grade (Sophomore)" },
    { value: "11", label: "11th Grade (Junior)" },
    { value: "12", label: "12th Grade (Senior)" },
  ];

  const handleSave = async () => {
    // Build updates object with only checked fields
    const updates: BulkEditUpdates = {};

    if (applyPosition && position) {
      updates.position = position;
    }

    if (applyGradeLevel && gradeLevel) {
      updates.grade_level = gradeLevel;
    }

    if (applyHeight && heightFeet && heightInches) {
      const totalInches = parseInt(heightFeet) * 12 + parseInt(heightInches);
      if (!isNaN(totalInches) && totalInches > 0) {
        updates.height_inches = totalInches;
      }
    }

    if (applyWeight && weight) {
      const weightNum = parseInt(weight);
      if (!isNaN(weightNum) && weightNum > 0) {
        updates.weight_lbs = weightNum;
      }
    }

    // Check if any updates were selected
    if (Object.keys(updates).length === 0) {
      return;
    }

    setSaving(true);
    try {
      await onSave(updates);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Reset all fields
    setPosition("");
    setGradeLevel("");
    setHeightFeet("");
    setHeightInches("");
    setWeight("");
    setApplyPosition(false);
    setApplyGradeLevel(false);
    setApplyHeight(false);
    setApplyWeight(false);
    onClose();
  };

  const hasAnyFieldSelected =
    applyPosition || applyGradeLevel || applyHeight || applyWeight;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Edit Players">
      <div className="space-y-spacing-md">
        <Typography variant="body-sm" className="text-secondary">
          You are about to edit <strong>{selectedCount}</strong> player
          {selectedCount !== 1 ? "s" : ""}. Only fields you check will be
          updated.
        </Typography>

        {hasInactiveOrAlumni && (
          <div className="bg-warning-bg border border-warning rounded-lg p-spacing-sm">
            <div className="flex gap-spacing-xs">
              <Icon
                name="info"
                className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm text-warning-foreground">
                <strong>Note:</strong> Your selection includes inactive or
                alumni players. Their information will be updated as well.
              </div>
            </div>
          </div>
        )}

        <div className="space-y-spacing-lg pt-spacing-sm">
          {/* Position Field */}
          <div className="flex items-start gap-spacing-sm">
            <input
              type="checkbox"
              checked={applyPosition}
              onChange={(e) => setApplyPosition(e.target.checked)}
              className="mt-2 h-4 w-4 rounded border-surface-secondary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <div className="flex-1">
              <label
                htmlFor="bulk-position"
                className="block text-sm font-medium text-primary mb-2"
              >
                Position
              </label>
              <select
                id="bulk-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                disabled={!applyPosition}
                className="w-full px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-muted disabled:text-muted disabled:cursor-not-allowed"
              >
                {positionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grade Level Field */}
          <div className="flex items-start gap-spacing-sm">
            <input
              type="checkbox"
              checked={applyGradeLevel}
              onChange={(e) => setApplyGradeLevel(e.target.checked)}
              className="mt-2 h-4 w-4 rounded border-surface-secondary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <div className="flex-1">
              <label
                htmlFor="bulk-grade"
                className="block text-sm font-medium text-primary mb-2"
              >
                Grade Level
              </label>
              <select
                id="bulk-grade"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                disabled={!applyGradeLevel}
                className="w-full px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-muted disabled:text-muted disabled:cursor-not-allowed"
              >
                {gradeLevelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Height Field */}
          <div className="flex items-start gap-spacing-sm">
            <input
              type="checkbox"
              checked={applyHeight}
              onChange={(e) => setApplyHeight(e.target.checked)}
              className="mt-2 h-4 w-4 rounded border-surface-secondary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-primary mb-2">
                Height
              </label>
              <div className="flex gap-spacing-sm">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Feet"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    disabled={!applyHeight}
                    min="3"
                    max="8"
                    className="w-full px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-muted disabled:text-muted disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Inches"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    disabled={!applyHeight}
                    min="0"
                    max="11"
                    className="w-full px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-muted disabled:text-muted disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weight Field */}
          <div className="flex items-start gap-spacing-sm">
            <input
              type="checkbox"
              checked={applyWeight}
              onChange={(e) => setApplyWeight(e.target.checked)}
              className="mt-2 h-4 w-4 rounded border-surface-secondary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <div className="flex-1">
              <label
                htmlFor="bulk-weight"
                className="block text-sm font-medium text-primary mb-2"
              >
                Weight (lbs)
              </label>
              <input
                id="bulk-weight"
                type="number"
                placeholder="Weight in pounds"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={!applyWeight}
                min="50"
                max="500"
                className="w-full px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-muted disabled:text-muted disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-spacing-sm pt-spacing-md border-t border-surface-secondary">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasAnyFieldSelected}
            className="bg-primary hover:bg-primary/90"
          >
            {saving
              ? "Updating..."
              : `Update ${selectedCount} Player${selectedCount !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
