/**
 * Practice Block Editor
 *
 * Reusable component for editing individual practice blocks
 * Extracted from the massive PracticePlannerModal for better maintainability
 */
import React, { useState } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import Card from "../../ui/Card/Card";
import { Typography } from "../../design-system/Typography";
import type { PracticeBlock } from "../../../types/practice";

interface PracticeBlockEditorProps {
  block: PracticeBlock;
  onSave: (block: PracticeBlock) => void;
  onCancel: () => void;
  onDelete?: (blockId: string) => void;
}

const CATEGORY_OPTIONS = [
  {
    value: "offense",
    label: "Offense",
    color: "bg-green-500",
    icon: "football",
  },
  { value: "defense", label: "Defense", color: "bg-red-500", icon: "shield" },
  {
    value: "special-teams",
    label: "Special Teams",
    color: "bg-yellow-500",
    icon: "star",
  },
  { value: "meeting", label: "Meeting", color: "bg-jade-600", icon: "chat" },
  {
    value: "conditioning",
    label: "Conditioning",
    color: "bg-purple-500",
    icon: "activity",
  },
  {
    value: "individual",
    label: "Individual",
    color: "bg-indigo-500",
    icon: "user",
  },
  {
    value: "team-building",
    label: "Team Building",
    color: "bg-pink-500",
    icon: "users",
  },
  { value: "break", label: "Break", color: "bg-gray-400", icon: "coffee" },
] as const;

const INTENSITY_OPTIONS = [
  { value: "low", label: "Low", color: "text-green-600" },
  { value: "medium", label: "Medium", color: "text-yellow-600" },
  { value: "high", label: "High", color: "text-red-600" },
] as const;

export const PracticeBlockEditor: React.FC<PracticeBlockEditorProps> = ({
  block,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [editingBlock, setEditingBlock] = useState<PracticeBlock>(block);

  const handleSave = () => {
    onSave(editingBlock);
  };

  const updateField = <K extends keyof PracticeBlock>(
    field: K,
    value: PracticeBlock[K]
  ) => {
    setEditingBlock((prev) => ({ ...prev, [field]: value }));
  };

  const addFocusItem = () => {
    const focus = prompt("Add focus item:");
    if (focus) {
      updateField("focus", [...(editingBlock.focus || []), focus]);
    }
  };

  const removeFocusItem = (index: number) => {
    updateField(
      "focus",
      (editingBlock.focus || []).filter((_: string, i: number) => i !== index)
    );
  };

  const addEquipmentItem = () => {
    const equipment = prompt("Add equipment item:");
    if (equipment) {
      updateField("equipment", [...(editingBlock.equipment || []), equipment]);
    }
  };

  const removeEquipmentItem = (index: number) => {
    updateField(
      "equipment",
      (editingBlock.equipment || []).filter(
        (_: string, i: number) => i !== index
      )
    );
  };

  const selectedCategory = CATEGORY_OPTIONS.find(
    (cat) => cat.value === editingBlock.category
  );

  return (
    <Card className="bc-card-padding space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="headline-md" className="flex items-center gap-2">
          {selectedCategory && (
            <div className={`w-4 h-4 rounded-full ${selectedCategory.color}`} />
          )}
          Edit Practice Block
        </Typography>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(block.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Icon name="delete" size="sm" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={editingBlock.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              placeholder="Practice block title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={editingBlock.category}
              onChange={(e) =>
                updateField(
                  "category",
                  e.target.value as PracticeBlock["category"]
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={
                  editingBlock.startTime instanceof Date
                    ? editingBlock.startTime.toTimeString().slice(0, 5)
                    : editingBlock.startTime
                }
                onChange={(e) => {
                  const timeValue = e.target.value;
                  const date = new Date();
                  const [hours, minutes] = timeValue.split(":");
                  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                  updateField("startTime", date);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={
                  editingBlock.endTime instanceof Date
                    ? editingBlock.endTime.toTimeString().slice(0, 5)
                    : editingBlock.endTime
                }
                onChange={(e) => {
                  const timeValue = e.target.value;
                  const date = new Date();
                  const [hours, minutes] = timeValue.split(":");
                  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                  updateField("endTime", date);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={editingBlock.duration}
              onChange={(e) =>
                updateField("duration", parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              min="1"
              max="240"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editingBlock.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              placeholder="Describe the practice block..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={editingBlock.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              placeholder="Field location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intensity
            </label>
            <select
              value={editingBlock.intensity}
              onChange={(e) =>
                updateField(
                  "intensity",
                  e.target.value as PracticeBlock["intensity"]
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
            >
              {INTENSITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reps
              </label>
              <input
                type="number"
                value={editingBlock.reps || ""}
                onChange={(e) =>
                  updateField("reps", parseInt(e.target.value) || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
                min="1"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Time
              </label>
              <input
                type="number"
                value={editingBlock.totalTime || ""}
                onChange={(e) =>
                  updateField(
                    "totalTime",
                    parseInt(e.target.value) || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
                min="1"
                placeholder="Minutes"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Focus Items
          </label>
          <Button variant="ghost" size="sm" onClick={addFocusItem}>
            <Icon name="plus" size="sm" className="mr-1" />
            Add Focus
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(editingBlock.focus || []).map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
            >
              {item}
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => removeFocusItem(index)}
                aria-label={`Remove focus ${item}`}
                className="p-0 h-auto w-auto text-blue-600 hover:text-blue-800 bg-transparent"
              >
                <Icon name="close" size="xs" />
              </Button>
            </span>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Equipment
          </label>
          <Button variant="ghost" size="sm" onClick={addEquipmentItem}>
            <Icon name="plus" size="sm" className="mr-1" />
            Add Equipment
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(editingBlock.equipment || []).map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
            >
              {item}
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => removeEquipmentItem(index)}
                aria-label={`Remove equipment ${item}`}
                className="p-0 h-auto w-auto text-green-600 hover:text-green-800 bg-transparent"
              >
                <Icon name="close" size="xs" />
              </Button>
            </span>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={editingBlock.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
          placeholder="Additional notes for this block..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <Icon name="check" size="sm" className="mr-2" />
          Save Block
        </Button>
      </div>
    </Card>
  );
};
