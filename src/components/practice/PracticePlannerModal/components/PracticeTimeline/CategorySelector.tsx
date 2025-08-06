import React from "react";
import { Typography } from "../../../../../components/design-system";
import { Card } from "../../../../../components/ui";
import { Icon, type IconName } from "../../../../../components/ui/Icon/Icon";
import type { PracticeBlock } from "../../types";

interface CategorySelectorProps {
  selectedCategory: PracticeBlock["category"] | null;
  onCategorySelect: (category: PracticeBlock["category"]) => void;
  getCategoryColor: (category: PracticeBlock["category"]) => string;
}

const CATEGORIES = [
  { key: "meeting", label: "Meeting", icon: "file" },
  { key: "weight-room", label: "Weight Room", icon: "activity" },
  { key: "transition", label: "Transition", icon: "arrow-right" },
  { key: "offense", label: "Offense", icon: "target" },
  { key: "defense", label: "Defense", icon: "shield" },
  { key: "special-teams", label: "Special Teams", icon: "zap" },
  { key: "break", label: "Break", icon: "pause" },
] as const;

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  getCategoryColor,
}) => {
  return (
    <Card className="p-4 mb-4">
      <Typography variant="body-md" className="font-medium mb-3">
        Select Category to Allocate:
      </Typography>
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            onClick={() =>
              onCategorySelect(category.key as PracticeBlock["category"])
            }
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              selectedCategory === category.key
                ? `border-blue-500 ${getCategoryColor(category.key as PracticeBlock["category"])} shadow-md`
                : `border-gray-200 ${getCategoryColor(category.key as PracticeBlock["category"])} hover:border-gray-300`
            }`}
          >
            <div className="mb-1">
              <Icon name={category.icon as IconName} size="lg" />
            </div>
            <div className="text-xs font-medium">{category.label}</div>
          </button>
        ))}
      </div>
      {selectedCategory && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <Typography
            variant="body-sm"
            className="text-blue-800 flex items-center"
          >
            <Icon name="target" size="xs" className="mr-1" />
            Selected:{" "}
            {CATEGORIES.find((c) => c.key === selectedCategory)?.label}- Click
            and drag on the timeline to allocate
          </Typography>
        </div>
      )}
    </Card>
  );
};
