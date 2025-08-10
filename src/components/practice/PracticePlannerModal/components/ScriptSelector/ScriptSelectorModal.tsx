import React from "react";
import { Typography } from "../../../../design-system";
import { Button } from "../../../../../components/ui";
import { Icon } from "../../../../../components/ui/Icon/Icon";

interface ScriptSelectorModalProps {
  isOpen: boolean;
  selectedBlockId: string | null;
  selectedGroupId: string | null;
  onClose: () => void;
  onScriptSelect: (scriptId: string, scriptTitle: string) => void;
}

// Mock script data - would come from actual script service
const MOCK_SCRIPTS = [
  {
    id: "script_1",
    title: "Offensive Line Warm-up",
    description: "Basic footwork and stance drills",
    duration: 10,
    category: "offense",
  },
  {
    id: "script_2",
    title: "Defensive Back Coverage",
    description: "Man and zone coverage techniques",
    duration: 15,
    category: "defense",
  },
  {
    id: "script_3",
    title: "Special Teams Kickoff",
    description: "Kickoff return and coverage",
    duration: 12,
    category: "special-teams",
  },
  {
    id: "script_4",
    title: "Team Meeting - Game Plan",
    description: "Review opponent tendencies",
    duration: 8,
    category: "meeting",
  },
];

export const ScriptSelectorModal: React.FC<ScriptSelectorModalProps> = ({
  isOpen,
  selectedBlockId,
  selectedGroupId,
  onClose,
  onScriptSelect,
}) => {
  if (!isOpen) return null;

  const handleScriptSelect = (script: (typeof MOCK_SCRIPTS)[0]) => {
    onScriptSelect(script.id, script.title);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto mx-4">
        <div className="bc-card-padding">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Typography variant="headline-lg" className="text-navy-900">
                Select Practice Script
              </Typography>
              <Typography variant="body-md" color="muted" className="mt-1">
                {selectedGroupId
                  ? `Adding script to group in block ${selectedBlockId}`
                  : `Adding script to block ${selectedBlockId}`}
              </Typography>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon name="close" size="lg" />
            </Button>
          </div>

          <div className="space-y-4">
            {MOCK_SCRIPTS.map((script) => (
              <div
                key={script.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleScriptSelect(script)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Typography variant="body-md" className="font-medium mb-1">
                      {script.title}
                    </Typography>
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mb-2"
                    >
                      {script.description}
                    </Typography>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-gray-600">
                        <Icon name="clock" size="xs" className="mr-1" />
                        {script.duration} min
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          script.category === "offense"
                            ? "bg-blue-100 text-blue-800"
                            : script.category === "defense"
                              ? "bg-red-100 text-red-800"
                              : script.category === "special-teams"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {script.category.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Icon name="plus" size="sm" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onClose}>
              <Icon name="plus" size="sm" className="mr-1" />
              Create New Script
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
