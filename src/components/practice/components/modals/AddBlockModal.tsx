import React, { useState, useEffect } from "react";

import { Typography } from "../../../design-system";
/**
 * AddBlockModal Component
 *
 * Modal for adding new practice blocks with:
 * - Block details (title, category, location, notes)
 * - Time allocation (start time, duration)
 * - Coach assignment
 * - Form validation
 *
 * @component
 * @example
 * <AddBlockModal
 *   isOpen={showAddBlockModal}
 *   onClose={() => setShowAddBlockModal(false)}
 *   onAddBlock={handleAddBlock}
 *   userRole="head_coach"
 *   timeAllocationMode={true}
 *   selectedBlock={selectedBlock}
 * />
 */
import { Button } from "../../../ui/Button";
import Icon from "../../../ui/Icon/Icon";
import { getCategoryColor } from "../../utils";

import type { PracticeBlock, SelectedBlock, UserRole } from "../../types";

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (block: Omit<PracticeBlock, "id">) => void;
  userRole: UserRole;
  timeAllocationMode: boolean;
  selectedBlock?: SelectedBlock | null;
}
export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  isOpen,
  onClose,
  onAddBlock,
  userRole,
  timeAllocationMode,
  selectedBlock,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "offense" as PracticeBlock["category"],
    location: "",
    notes: "",
    assignedCoach: "",
    startTime: "15:00",
    duration: 15,
  });
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedBlock) {
        setFormData((prev) => ({
          ...prev,
          category: selectedBlock.category,
          startTime: `${Math.floor(selectedBlock.start / 60)
            .toString()
            .padStart(
              2,
              "0"
            )}:${(selectedBlock.start % 60).toString().padStart(2, "0")}`,
          duration: selectedBlock.duration,
        }));
      } else {
        setFormData({
          title: "",
          category: "offense",
          location: "",
          notes: "",
          assignedCoach: "",
          startTime: "15:00",
          duration: 15,
        });
      }
    }
  }, [isOpen, selectedBlock]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = formData.startTime.split(":").map(Number);
    const startTimeInMinutes = hours * 60 + minutes;
    const newBlock: Omit<PracticeBlock, "id"> = {
      startTime: formData.startTime,
      endTime: `${Math.floor((startTimeInMinutes + formData.duration) / 60)
        .toString()
        .padStart(
          2,
          "0"
        )}:${((startTimeInMinutes + formData.duration) % 60).toString().padStart(2, "0")}`,
      duration: formData.duration,
      category: formData.category,
      title: formData.title,
      location: formData.location,
      notes: formData.notes,
      assignedCoach: formData.assignedCoach || undefined,
      isHeadCoachBlock: userRole === "head_coach",
      groups: [],
    };
    onAddBlock(newBlock);
    onClose();
  };
  const categoryOptions: Array<{
    value: PracticeBlock["category"];
    label: string;
    icon: string;
  }> = [
    { value: "offense", label: "Offense", icon: "target" },
    { value: "defense", label: "Defense", icon: "shield" },
    { value: "special-teams", label: "Special Teams", icon: "zap" },
    { value: "meeting", label: "Meeting", icon: "file" },
    { value: "weight-room", label: "Weight Room", icon: "activity" },
    { value: "transition", label: "Transition", icon: "arrow-right" },
    { value: "break", label: "Break", icon: "pause" },
  ];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="surface-card elevation-modal rounded-lg bc-card-padding w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="plus" size="lg" className="text-jade-600" />
            <Typography variant="headline-sm" className="text-navy-900">
              Add Practice Block
            </Typography>
          </div>
          <Button
            variant="link"
            size="xs"
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary h-auto"
            aria-label="Close add block modal"
          >
            <Icon name="close" size="lg" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-primary mb-1"
            >
              Block Title *
            </Typography>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              placeholder="e.g., Offensive Line Drills"
              required
            />
          </div>
          {/* Category */}
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-primary mb-1"
            >
              Category *
            </Typography>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as PracticeBlock["category"],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              required
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div
              className={`mt-1 inline-block px-2 py-1 rounded text-xs ${getCategoryColor(formData.category)}`}
            >
              Preview: {formData.category.replace("-", " ").toUpperCase()}
            </div>
          </div>
          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-text-primary mb-1"
              >
                Start Time
              </Typography>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
                disabled={timeAllocationMode && !!selectedBlock}
              />
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-text-primary mb-1"
              >
                Duration (minutes)
              </Typography>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
                min="5"
                max="180"
                step="5"
                disabled={timeAllocationMode && !!selectedBlock}
              />
            </div>
          </div>
          {/* Location */}
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-primary mb-1"
            >
              Location
            </Typography>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              placeholder="e.g., Practice Field A"
            />
          </div>
          {/* Assigned Coach */}
          {userRole === "head_coach" && (
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-text-primary mb-1"
              >
                Assigned Coach
              </Typography>
              <input
                type="text"
                value={formData.assignedCoach}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assignedCoach: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
                placeholder="e.g., Coach Johnson"
              />
            </div>
          )}
          {/* Notes */}
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-primary mb-1"
            >
              Notes
            </Typography>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jade-500"
              rows={3}
              placeholder="Additional notes or instructions..."
            />
          </div>
          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1"
            >
              Add Block
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
