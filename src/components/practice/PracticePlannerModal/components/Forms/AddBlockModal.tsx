import React from "react";

import { Button, Card, Dropdown } from "../../../../../components/ui";
import { Icon, type IconName } from "../../../../../components/ui/Icon/Icon";
import { Typography } from "../../../../design-system";

import type { PracticeBlock } from "../../types";

interface AddBlockModalProps {
  newBlock: Partial<PracticeBlock>;
  userRole: "head_coach" | "position_coach";
  onBlockChange: (block: Partial<PracticeBlock>) => void;
  onAddBlock: () => void;
  onCancel: () => void;
  onRoleSwitch: () => void;
}

const QUICK_TEMPLATES = [
  {
    title: "Team Meeting",
    category: "meeting" as const,
    duration: 5,
    location: "Room 1",
    notes: "Review practice plan and objectives",
    icon: "file" as IconName,
    color: "purple",
  },
  {
    title: "Weight Room",
    category: "weight-room" as const,
    duration: 25,
    location: "Weight Room",
    notes: "Bring sneakers and water bottles",
    icon: "activity" as IconName,
    color: "orange",
  },
  {
    title: "Transition to Field",
    category: "transition" as const,
    duration: 5,
    location: "Field",
    notes: "Bring helmets only",
    icon: "arrow-right" as IconName,
    color: "gray",
  },
  {
    title: "Offense - Warm up on air",
    category: "offense" as const,
    duration: 5,
    location: "Field",
    notes: "5 plays, no contact",
    icon: "target" as IconName,
    color: "blue",
  },
  {
    title: "Water Break",
    category: "break" as const,
    duration: 5,
    location: "Sideline",
    notes: "Hydration and equipment check",
    icon: "pause" as IconName,
    color: "yellow",
  },
  {
    title: "Equipment Change",
    category: "break" as const,
    duration: 10,
    location: "Locker Room",
    notes: "Change from weight room to field gear",
    icon: "pause" as IconName,
    color: "yellow",
  },
];

const CATEGORY_OPTIONS = [
  { value: "offense", label: "Offense" },
  { value: "defense", label: "Defense" },
  { value: "special-teams", label: "Special Teams" },
  { value: "meeting", label: "Meeting" },
  { value: "weight-room", label: "Weight Room" },
  { value: "transition", label: "Transition" },
  { value: "break", label: "Break" },
];

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  newBlock,
  userRole,
  onBlockChange,
  onAddBlock,
  onCancel,
  onRoleSwitch,
}) => {
  const handleTemplateSelect = (template: (typeof QUICK_TEMPLATES)[0]) => {
    onBlockChange({
      title: template.title,
      category: template.category,
      duration: template.duration,
      location: template.location,
      notes: template.notes,
    });
  };

  const resetForm = () => {
    onBlockChange({
      category: "meeting",
      location: "",
      notes: "",
      title: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Card className="p-4 mb-6 border-2 border-muted">
      <Typography variant="headline-md" className="mb-4">
        Add Practice Block
      </Typography>

      {/* Quick Templates */}
      <div className="mb-4">
        <Typography variant="body-sm" className="mb-2 font-medium text-primary">
          Quick Templates:
        </Typography>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template, index) => (
            <Button
              key={index}
              onClick={() => handleTemplateSelect(template)}
              variant="ghost"
              size="xs"
              className={`px-3 py-1 bg-${template.color}-100 text-${template.color}-800 hover:bg-${template.color}-200 flex items-center rounded-lg`}
              icon={<Icon name={template.icon} size="xs" className="mr-1" />}
            >
              {template.title.includes("Equipment") ? "🥿 " : ""}
              {template.title}
              {template.title !== "Equipment Change" &&
                ` (${template.duration} min)`}
            </Button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-1"
          >
            Title
          </Typography>
          <input
            type="text"
            value={newBlock.title || ""}
            onChange={(e) =>
              onBlockChange({ ...newBlock, title: e.target.value })
            }
            placeholder="e.g., Offensive line drills"
            className="w-full border border-secondary rounded-lg px-3 py-2 focus:ring-2 focus:ring-jade-500 focus:border-jade-600"
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-1"
          >
            Duration (minutes)
          </Typography>
          <input
            type="number"
            value={newBlock.duration || ""}
            onChange={(e) =>
              onBlockChange({
                ...newBlock,
                duration: parseInt(e.target.value) || 0,
              })
            }
            placeholder="15"
            min="1"
            className="w-full border border-secondary rounded-lg px-3 py-2 focus:ring-2 focus:ring-jade-500 focus:border-jade-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Dropdown
            label="Category"
            value={newBlock.category || ""}
            onChange={(value) =>
              onBlockChange({
                ...newBlock,
                category: value as PracticeBlock["category"],
              })
            }
            options={CATEGORY_OPTIONS}
            placeholder="Select category"
            size="md"
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-1"
          >
            Location
          </Typography>
          <input
            type="text"
            value={newBlock.location || ""}
            onChange={(e) =>
              onBlockChange({ ...newBlock, location: e.target.value })
            }
            placeholder="Field, Weight Room, etc."
            className="w-full border border-secondary rounded-lg px-3 py-2 focus:ring-2 focus:ring-jade-500 focus:border-jade-600"
          />
        </div>
      </div>

      <div className="mb-4">
        <Typography
          variant="body-sm"
          as="label"
          className="block font-medium text-primary mb-1"
        >
          Notes
        </Typography>
        <textarea
          value={newBlock.notes || ""}
          onChange={(e) =>
            onBlockChange({ ...newBlock, notes: e.target.value })
          }
          placeholder="Special instructions, equipment needed, etc."
          rows={2}
          className="w-full border border-secondary rounded-lg px-3 py-2 focus:ring-2 focus:ring-jade-500 focus:border-jade-600"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="primary" onClick={onAddBlock}>
          Add Block
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        {userRole === "head_coach" && (
          <Button
            variant="secondary"
            onClick={onRoleSwitch}
            className="text-xs"
          >
            <Icon name="eye" size="sm" className="mr-1" />
            Switch to Position Coach View
          </Button>
        )}
      </div>
    </Card>
  );
};
