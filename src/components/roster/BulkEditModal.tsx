import { useState } from "react";
import { Modal, Button, FormSelect } from "../ui";
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

const POSITION_OPTIONS = [
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

const GRADE_LEVEL_OPTIONS = [
  { value: "", label: "Select grade..." },
  { value: "9", label: "9th Grade (Freshman)" },
  { value: "10", label: "10th Grade (Sophomore)" },
  { value: "11", label: "11th Grade (Junior)" },
  { value: "12", label: "12th Grade (Senior)" },
];

const SelectField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  applyChecked: boolean;
  onApplyChange: (checked: boolean) => void;
  options: { value: string; label: string }[];
}> = ({ id, label, value, onChange, applyChecked, onApplyChange, options }) => (
  <div className="flex items-start gap-sm">
    <input
      type="checkbox"
      checked={applyChecked}
      onChange={(e) => onApplyChange(e.target.checked)}
      className="mt-2 h-4 w-4 rounded border-bg-secondary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
    />
    <div className="flex-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-primary mb-2"
      >
        {label}
      </label>
      <FormSelect
        id={id}
        value={value}
        onChange={onChange}
        disabled={!applyChecked}
        placeholder={options[0]?.label || "Select..."}
        options={options.filter((opt) => opt.value !== "")}
      />
    </div>
  </div>
);

const HeightField: React.FC<{
  heightFeet: string;
  heightInches: string;
  onHeightFeetChange: (value: string) => void;
  onHeightInchesChange: (value: string) => void;
  applyChecked: boolean;
  onApplyChange: (checked: boolean) => void;
}> = ({
  heightFeet,
  heightInches,
  onHeightFeetChange,
  onHeightInchesChange,
  applyChecked,
  onApplyChange,
}) => (
  <div className="flex items-start gap-sm">
    <input
      type="checkbox"
      checked={applyChecked}
      onChange={(e) => onApplyChange(e.target.checked)}
      className="mt-2 h-4 w-4 rounded border-bg-secondary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
    />
    <div className="flex-1">
      <label className="block text-sm font-medium text-primary mb-2">
        Height
      </label>
      <div className="flex gap-sm">
        <div className="flex-1">
          <input
            type="number"
            placeholder="Feet"
            value={heightFeet}
            onChange={(e) => onHeightFeetChange(e.target.value)}
            disabled={!applyChecked}
            min="3"
            max="8"
            className="w-full px-sm py-xs border border-bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            placeholder="Inches"
            value={heightInches}
            onChange={(e) => onHeightInchesChange(e.target.value)}
            disabled={!applyChecked}
            min="0"
            max="11"
            className="w-full px-sm py-xs border border-bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  </div>
);

const WeightField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  applyChecked: boolean;
  onApplyChange: (checked: boolean) => void;
}> = ({ value, onChange, applyChecked, onApplyChange }) => (
  <div className="flex items-start gap-sm">
    <input
      type="checkbox"
      checked={applyChecked}
      onChange={(e) => onApplyChange(e.target.checked)}
      className="mt-2 h-4 w-4 rounded border-bg-secondary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!applyChecked}
        min="50"
        max="500"
        className="w-full px-sm py-xs border border-bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:text-muted disabled:cursor-not-allowed"
      />
    </div>
  </div>
);

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
      <div className="space-y-md">
        <Typography variant="body-sm" className="text-secondary">
          You are about to edit <strong>{selectedCount}</strong> player
          {selectedCount !== 1 ? "s" : ""}. Only fields you check will be
          updated.
        </Typography>

        {hasInactiveOrAlumni && (
          <div className="bg-warning-bg border border-warning rounded-lg p-sm">
            <div className="flex gap-xs">
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

        <div className="space-y-lg pt-sm">
          {/* Position Field */}
          <SelectField
            id="bulk-position"
            label="Position"
            value={position}
            onChange={setPosition}
            applyChecked={applyPosition}
            onApplyChange={setApplyPosition}
            options={POSITION_OPTIONS}
          />

          {/* Grade Level Field */}
          <SelectField
            id="bulk-grade"
            label="Grade Level"
            value={gradeLevel}
            onChange={setGradeLevel}
            applyChecked={applyGradeLevel}
            onApplyChange={setApplyGradeLevel}
            options={GRADE_LEVEL_OPTIONS}
          />

          {/* Height Field */}
          <HeightField
            heightFeet={heightFeet}
            heightInches={heightInches}
            onHeightFeetChange={setHeightFeet}
            onHeightInchesChange={setHeightInches}
            applyChecked={applyHeight}
            onApplyChange={setApplyHeight}
          />

          {/* Weight Field */}
          <WeightField
            value={weight}
            onChange={setWeight}
            applyChecked={applyWeight}
            onApplyChange={setApplyWeight}
          />
        </div>

        <div className="flex justify-end gap-sm pt-md border-t border-bg-secondary">
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
