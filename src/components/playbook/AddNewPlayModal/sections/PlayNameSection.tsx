import React, { useMemo } from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { ValidatedInput } from "../../ValidatedInput";
import type { Play } from "../../../../types/play";

interface PlayNameSectionProps {
  playName: string;
  playDir: string;
  playShowInName: boolean;
  existingPlays?: Play[];
  onPlayNameChange: (playName: string) => void;
  onPlayDirChange: (dir: string) => void;
  onPlayShowInNameChange: (show: boolean) => void;
  onNextField?: () => void;
}

export const PlayNameSection: React.FC<PlayNameSectionProps> = ({
  playName,
  playDir,
  playShowInName,
  existingPlays = [],
  onPlayNameChange,
  onPlayDirChange,
  onPlayShowInNameChange,
  onNextField,
}) => {
  // Extract unique play names from existing plays
  const existingPlayNames = useMemo(() => {
    return [
      ...new Set(existingPlays.map((play) => play.play_name).filter(Boolean)),
    ];
  }, [existingPlays]);

  return (
    <div className="flex gap-sm items-end">
      <ValidatedInput
        label="Play"
        value={playName}
        onChange={(e) => onPlayNameChange(e.target.value)}
        placeholder="e.g., Power Read, Slant Route, Zone Blitz"
        required
        type="playName"
        existingValues={existingPlayNames}
        onEnterPress={onNextField}
        className="flex-1"
      />

      <div className="flex gap-xs">
        <Button
          type="button"
          variant={playDir === "Left" ? "primary" : "outline"}
          size="sm"
          onClick={() => onPlayDirChange(playDir === "Left" ? "" : "Left")}
          className="px-sm"
        >
          Left
        </Button>
        <Button
          type="button"
          variant={playDir === "Right" ? "primary" : "outline"}
          size="sm"
          onClick={() => onPlayDirChange(playDir === "Right" ? "" : "Right")}
          className="px-sm"
        >
          Right
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onPlayShowInNameChange(!playShowInName)}
          className={`p-xs ${playShowInName ? "text-info" : "text-muted"}`}
        >
          <Icon name="eye" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
