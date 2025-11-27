import React, { useState } from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

interface PlayTypeSectionProps {
  playType: string;
  onPlayTypeChange: (playType: string) => void;
  suggestions?: string[]; // Dynamic suggestions from database
}

const DEFAULT_PLAY_TYPES = [
  "Run",
  "Pass",
  "Option",
  "RPO",
  "Screen",
  "Boot",
  "Play Action",
  "Draw",
];

export const PlayTypeSection: React.FC<PlayTypeSectionProps> = ({
  playType,
  onPlayTypeChange,
  suggestions = [],
}) => {
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // Combine default types, database suggestions, and custom types
  // Remove duplicates and sort
  const allTypes = [
    ...new Set([...DEFAULT_PLAY_TYPES, ...suggestions, ...customTypes]),
  ].sort();

  const handleAddNewType = () => {
    setIsAddingType(true);
  };

  const handleSaveNewType = () => {
    const trimmed = newTypeName.trim();

    // Validate
    if (!trimmed) {
      alert("Play type cannot be empty");
      return;
    }

    if (trimmed.length > 50) {
      alert("Play type must be 50 characters or less");
      return;
    }

    if (!/^[A-Za-z0-9\s-]+$/.test(trimmed)) {
      alert("Play type can only contain letters, numbers, spaces, and hyphens");
      return;
    }

    // Check if already exists
    if (allTypes.includes(trimmed)) {
      alert("This play type already exists");
      return;
    }

    // Add to custom types
    setCustomTypes([...customTypes, trimmed]);
    onPlayTypeChange(trimmed);

    // Reset
    setNewTypeName("");
    setIsAddingType(false);
  };

  const handleCancelNewType = () => {
    setNewTypeName("");
    setIsAddingType(false);
  };

  return (
    <div>
      <Typography variant="label-md" className="block mb-sm">
        Play Type
      </Typography>
      <div className="flex flex-wrap gap-xs">
        {allTypes.map((type) => (
          <Button
            key={type}
            type="button"
            variant={playType === type ? "primary" : "outline"}
            size="sm"
            onClick={() => onPlayTypeChange(playType === type ? "" : type)}
          >
            {type}
          </Button>
        ))}

        {isAddingType ? (
          <div className="flex items-center gap-xs">
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNewType();
                if (e.key === "Escape") handleCancelNewType();
              }}
              placeholder="Type name..."
              autoFocus
              className="px-sm py-1 text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0"
              maxLength={50}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveNewType}
            >
              <Icon name="check" className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelNewType}
            >
              <Icon name="close" className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNewType}
            className="border-dashed"
          >
            <Icon name="plus" className="h-4 w-4 mr-xs" />
            Add New
          </Button>
        )}
      </div>
    </div>
  );
};
