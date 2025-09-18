import React from "react";

import { Card, Button } from "../../../../../components/ui";
import { Icon, type IconName } from "../../../../../components/ui/Icon";
import { Typography } from "../../../../design-system";

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
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.key;
          return (
            <Button
              key={category.key}
              onClick={() =>
                onCategorySelect(category.key as PracticeBlock["category"])
              }
              variant={isActive ? "primary" : "ghost"}
              size="sm"
              className={`flex flex-col items-center py-3 ${getCategoryColor(category.key as PracticeBlock["category"])} ${isActive ? "shadow-md" : ""}`}
              icon={
                <Icon
                  name={category.icon as IconName}
                  size="sm"
                  color="current"
                />
              }
            >
              <span className="text-[10px] font-medium leading-tight">
                {category.label}
              </span>
            </Button>
          );
        })}
      </div>
      {selectedCategory && (
        <div className="mt-3 p-2 surface-subtle rounded-lg">
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
