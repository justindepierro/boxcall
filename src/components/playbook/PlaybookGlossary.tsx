import React, { useState } from "react";
import { Button } from "../ui/Button/Button";
import { Tag } from "../ui/Tag";
import {
  Book,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Target,
  Zap,
  Clock,
  MapPin,
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  {
    id: "runs",
    name: "Runs",
    icon: Target,
    color: "bg-blue-100 text-blue-700 border-subtle",
    subcategories: [
      "Power",
      "Inside Zone",
      "Outside Zone",
      "Sweeps",
      "Draws",
      "Counters",
    ],
  },
  {
    id: "passes",
    name: "Passes",
    icon: Zap,
    color: "bg-jade-100 text-jade-700 border-subtle",
    subcategories: [
      "Quick Game",
      "Intermediate",
      "Deep Shots",
      "Screens",
      "Crossing Routes",
    ],
  },
  {
    id: "rpos",
    name: "RPOs",
    icon: Book,
    color: "bg-purple-100 text-purple-700 border-subtle",
    subcategories: [
      "Bubble",
      "Stick",
      "Slant/Flat",
      "Speed Option",
      "Quick Slants",
    ],
  },
  {
    id: "play-action",
    name: "Play Action",
    icon: MapPin,
    color: "bg-orange-100 text-orange-700 border-subtle",
    subcategories: [
      "Boot",
      "Rollout",
      "Deep Shots",
      "Crossing Routes",
      "Tight End Seams",
    ],
  },
  {
    id: "situational",
    name: "Situational",
    icon: Clock,
    color: "bg-red-100 text-red-700 border-subtle",
    subcategories: [
      "Red Zone",
      "Goal Line",
      "2-Minute",
      "3rd Down",
      "4th Down",
    ],
  },
] as const;

interface PlaybookGlossaryProps {
  onCategorySelect: (categoryId: string, subcategory?: string) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
  playCounts?: Record<string, number>;
}

export const PlaybookGlossary: React.FC<PlaybookGlossaryProps> = ({
  onCategorySelect,
  selectedCategory,
  selectedSubcategory,
  playCounts = {},
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["runs", "passes"])
  );
  const [_customCategories] = useState<
    Array<(typeof DEFAULT_CATEGORIES)[number]>
  >([]);

  const toggleCategory = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setExpandedCategories(next);
  };

  const allCategories = [...DEFAULT_CATEGORIES, ..._customCategories];

  return (
  <div className="surface-card rounded-lg shadow-sm border border-subtle">
      <div className="p-3 border-b border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Book className="h-4 w-4 text-slate-500 mr-2" />
            <h3 className="font-medium text-slate-900">Playbook</h3>
          </div>
          <Button
            size="xs"
            variant="neutralLink"
            className="p-1 h-auto w-auto"
            title="Manage Categories"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Organize plays by football concepts
        </p>
      </div>
      <div className="p-2">
        {allCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const isSelected = selectedCategory === category.id;
          const playCount = playCounts[category.id] || 0;
          const IconComponent = category.icon;
          return (
            <div key={category.id} className="mb-1">
              <div className="flex items-center group">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => toggleCategory(category.id)}
                  className="p-0.5 h-auto w-auto mr-1"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-500" />
                  )}
                </Button>
                <Button
                  size="xs"
                  variant={isSelected ? "primary" : "ghost"}
                  onClick={() => onCategorySelect(category.id)}
                  className="flex-1 justify-start px-2 py-1.5 h-auto font-medium"
                >
                  <IconComponent className="h-3 w-3 mr-2" />
                  <span className="flex-1 text-left">{category.name}</span>
                  {playCount > 0 && (
                    <Tag
                      size="sm"
                      variant={isSelected ? "accent" : "neutral"}
                      className="ml-2"
                    >
                      {playCount}
                    </Tag>
                  )}
                </Button>
              </div>
              {isExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {category.subcategories.map((subcategory) => {
                    const isSubSelected =
                      selectedCategory === category.id &&
                      selectedSubcategory === subcategory;
                    const subPlayCount =
                      playCounts[
                        `${category.id}-${subcategory.toLowerCase()}`
                      ] || 0;
                    return (
                      <Button
                        key={subcategory}
                        size="xs"
                        variant={isSubSelected ? "secondary" : "ghost"}
                        onClick={() =>
                          onCategorySelect(category.id, subcategory)
                        }
                        className="w-full justify-between px-2 py-1 h-auto text-xs"
                      >
                        <span>{subcategory}</span>
                        {subPlayCount > 0 && (
                          <Tag size="sm" variant="neutral">
                            {subPlayCount}
                          </Tag>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <Button
          size="xs"
          variant="ghost"
          className="w-full flex items-center justify-start px-2 py-1.5 mt-3 h-auto text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Custom Category
        </Button>
      </div>
      <div className="px-3 py-2 border-t border-subtle surface-subtle rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {Object.values(playCounts).reduce((sum, count) => sum + count, 0)}{" "}
            plays total
          </span>
          <span className="flex items-center">
            <div className="w-1.5 h-1.5 bg-jade-400 rounded-full mr-1"></div>
            Active
          </span>
        </div>
      </div>
    </div>
  );
};
