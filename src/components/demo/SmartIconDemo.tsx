import React, { useState } from "react";
import { Icon, SmartIconSystem } from "../ui/Icon/Icon";
import type { IconName } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import { Card } from "../ui";
/**
 * SmartIconDemo - Demonstrates the SmartIconSystem in action
 *
 * Shows how the system intelligently selects icons based on content
 */
export const SmartIconDemo: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconName>("star");
  const [suggestions, setSuggestions] = useState<IconName[]>([]);
  const handleTextChange = (text: string) => {
    setInputText(text);
    if (text.trim()) {
      const smartIcon = SmartIconSystem.getSmartIcon(text);
      const iconSuggestions = SmartIconSystem.getIconSuggestions(text, 5);
      setSelectedIcon(smartIcon);
      setSuggestions(iconSuggestions);
    } else {
      setSelectedIcon("star");
      setSuggestions([]);
    }
  };
  const demoTexts = [
    "Team Captain Achievement",
    "Weekly Practice Schedule",
    "Championship Trophy Winner",
    "Player Performance Analytics",
    "Coach Message Notification",
    "Game Strategy Meeting",
    "Health and Fitness Update",
    "Weather Alert for Practice",
    "New Team Member Added",
    "Equipment Maintenance Required",
  ];
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <Typography variant="headline-lg" className="mb-2">
            SmartIconSystem Demo
          </Typography>
          <Typography variant="body-md" color="muted">
            Watch how the system intelligently selects icons based on content
          </Typography>
        </div>
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter any text to see smart icon selection:
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type something like 'team meeting' or 'trophy winner'..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade-500"
            />
          </div>
          {/* Selected Icon Display */}
          {inputText && (
            <div className="flex items-center gap-4 p-4 bg-jade-50 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm">
                <Icon name={selectedIcon} size={24} className="text-jade-600" />
              </div>
              <div>
                <Typography variant="body-sm" className="font-semibold">
                  Selected Icon: {selectedIcon}
                </Typography>
                <Typography variant="caption" color="muted">
                  Automatically chosen for: "{inputText}"
                </Typography>
              </div>
            </div>
          )}
          {/* Icon Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Typography variant="body-sm" className="font-medium">
                Other Suggestions:
              </Typography>
              <div className="flex gap-2 flex-wrap">
                {suggestions.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      selectedIcon === iconName
                        ? "bg-jade-100 border-jade-300 text-jade-800"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Icon name={iconName} size={16} />
                    <Typography variant="caption">{iconName}</Typography>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Demo Examples */}
        <div className="space-y-4">
          <Typography variant="body-md" className="font-medium">
            Try these examples:
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoTexts.map((text, index) => (
              <button
                key={index}
                onClick={() => handleTextChange(text)}
                className="flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon
                  name={SmartIconSystem.getSmartIcon(text)}
                  size={16}
                  className="text-gray-600 flex-shrink-0"
                />
                <Typography variant="caption" className="truncate">
                  {text}
                </Typography>
              </button>
            ))}
          </div>
        </div>
        {/* Context Examples */}
        <div className="space-y-4">
          <Typography variant="body-md" className="font-medium">
            Context-Aware Selection:
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            {["feed", "calendar", "achievement", "message"].map((context) => (
              <div key={context} className="p-3 bg-gray-50 rounded-lg">
                <Typography
                  variant="caption"
                  className="font-medium block mb-2 capitalize"
                >
                  {context} Context:
                </Typography>
                <div className="flex items-center gap-2">
                  <Icon
                    name={SmartIconSystem.getContextualIcon(
                      inputText || "team meeting",
                      context as
                        | "feed"
                        | "calendar"
                        | "achievement"
                        | "message"
                        | "team"
                        | "general"
                    )}
                    size={16}
                    className="text-gray-600"
                  />
                  <Typography variant="caption" color="muted">
                    {SmartIconSystem.getContextualIcon(
                      inputText || "team meeting",
                      context as
                        | "feed"
                        | "calendar"
                        | "achievement"
                        | "message"
                        | "team"
                        | "general"
                    )}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
export default SmartIconDemo;
