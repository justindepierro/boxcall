import React, { useState } from "react";
import { Typography } from "../../components/design-system";
import { Button, Card } from "../../components/ui";
import Icon from "../../components/ui/Icon/Icon";
interface Script {
  id: string;
  title: string;
  category: "offense" | "defense" | "special-teams";
  description?: string;
  plays?: string[];
}
interface ScriptSelectorModalProps {
  onClose: () => void;
  onSelectScript: (script: Script) => void;
  onCreateNew: () => void;
}
export const ScriptSelectorModal: React.FC<ScriptSelectorModalProps> = ({
  onClose,
  onSelectScript,
  onCreateNew,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // Mock scripts data - would come from API
  const mockScripts: Script[] = [
    {
      id: "1",
      title: "Offensive Warm-up - 5 Plays",
      category: "offense",
      description: "Basic offensive warm-up routine with 5 core plays",
      plays: [
        "Play Action Pass",
        "Quick Slant",
        "Run Option",
        "Screen Pass",
        "Deep Post",
      ],
    },
    {
      id: "2",
      title: "Defensive Drills - Fundamentals",
      category: "defense",
      description: "Core defensive fundamentals and positioning drills",
      plays: ["Tackling Form", "Coverage Drill", "Pass Rush", "Run Stop"],
    },
    {
      id: "3",
      title: "Special Teams - Kickoff Coverage",
      category: "special-teams",
      description: "Kickoff coverage and return formations",
      plays: ["Kickoff Formation", "Coverage Lanes", "Return Block"],
    },
  ];
  const filteredScripts =
    selectedCategory === "all"
      ? mockScripts
      : mockScripts.filter((script) => script.category === selectedCategory);
  const getCategoryColor = (category: Script["category"]) => {
    switch (category) {
      case "offense":
        return "bg-blue-100 text-blue-800";
      case "defense":
        return "bg-red-100 text-red-800";
      case "special-teams":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="bc-card-padding">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Icon name="book" size="lg" className="text-navy-600" />
              <Typography variant="headline-lg" className="text-navy-900">
                Add Practice Script
              </Typography>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <Icon name="close" size="lg" />
            </button>
          </div>
          {/* Category Filter */}
          <div className="mb-6">
            <Typography variant="body-md" className="mb-3 font-medium">
              Filter by Category
            </Typography>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory("offense")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === "offense"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Offense
              </button>
              <button
                onClick={() => setSelectedCategory("defense")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === "defense"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Defense
              </button>
              <button
                onClick={() => setSelectedCategory("special-teams")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === "special-teams"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Special Teams
              </button>
            </div>
          </div>
          {/* Create New Script Option */}
          <Card className="p-4 mb-4 border-2 border-dashed border-blue-300 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <Typography
                  variant="body-md"
                  className="font-medium text-blue-900"
                >
                  Create New Script
                </Typography>
                <Typography variant="body-sm" className="text-blue-700 mt-1">
                  Build a custom script in the Playbook editor
                </Typography>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onCreateNew();
                  onClose();
                }}
              >
                Create New
              </Button>
            </div>
          </Card>
          {/* Existing Scripts */}
          <div className="space-y-3">
            <Typography variant="body-md" className="font-medium">
              Existing Scripts ({filteredScripts.length})
            </Typography>
            {filteredScripts.length === 0 ? (
              <Card className="bc-card-padding text-center">
                <div className="text-4xl mb-4">📚</div>
                <Typography variant="body-lg" color="muted">
                  No scripts found in this category
                </Typography>
                <Typography variant="body-md" color="muted" className="mt-2">
                  Create a new script to get started
                </Typography>
              </Card>
            ) : (
              filteredScripts.map((script) => (
                <Card
                  key={script.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(script.category)}`}
                        >
                          {script.category.replace("-", " ").toUpperCase()}
                        </span>
                        <Typography variant="body-md" className="font-medium">
                          {script.title}
                        </Typography>
                      </div>
                      {script.description && (
                        <Typography
                          variant="body-sm"
                          color="muted"
                          className="mb-2"
                        >
                          {script.description}
                        </Typography>
                      )}
                      {script.plays && script.plays.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {script.plays.slice(0, 3).map((play, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {play}
                            </span>
                          ))}
                          {script.plays.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{script.plays.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onSelectScript(script);
                        onClose();
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
