import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

interface PlayTypeSectionProps {
  playType: string;
  onPlayTypeChange: (playType: string) => void;
}

const PLAY_TYPE_OPTIONS = ["Run", "Pass", "RPO", "Screen", "Boot"];

export const PlayTypeSection: React.FC<PlayTypeSectionProps> = ({
  playType,
  onPlayTypeChange,
}) => {
  const handleAddNewType = () => {
    // TODO: Add new play type
    alert("Add new play type functionality");
  };

  return (
    <div>
      <Typography variant="label-md" className="block mb-spacing-sm">
        Play Type
      </Typography>
      <div className="flex flex-wrap gap-spacing-xs">
        {PLAY_TYPE_OPTIONS.map((type) => (
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddNewType}
          className="border-dashed"
        >
          <Icon name="plus" className="h-4 w-4 mr-spacing-xs" />
          Add New
        </Button>
      </div>
    </div>
  );
};
