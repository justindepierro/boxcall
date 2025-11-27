import React from "react";

import { Button } from "../../../../../components/ui/Button";
import { Icon } from "../../../../../components/ui/Icon/Icon";
import { Typography } from "../../../../design-system";

import type { SelectedBlock } from "../../types";

interface TimelineSliderProps {
  selectedBlock: SelectedBlock;
  sliderValue: number;
  scheduledDuration: number;
  onSliderChange: (value: number) => void;
  onSaveBlock: () => void;
  onCancelBlock: () => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  selectedBlock,
  sliderValue,
  scheduledDuration,
  onSliderChange,
  onSaveBlock,
  onCancelBlock,
}) => {
  const maxDuration = Math.min(50, scheduledDuration - selectedBlock.start);

  return (
    <div className="mt-4 p-4 surface-subtle rounded-lg border-2 border-subtle">
      <div className="flex items-center justify-between mb-3">
        <div>
          <Typography
            variant="body-md"
            className="font-medium text-info flex items-center"
          >
            <Icon name="target" size="sm" className="mr-2" />
            Resize Block:{" "}
            {selectedBlock.category
              .replace("-", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Typography>
          <Typography variant="body-sm" className="text-info">
            Block starts at minute {selectedBlock.start}, currently{" "}
            {selectedBlock.duration} minutes
          </Typography>
          <Typography
            variant="body-xs"
            className="text-info mt-1 flex items-center"
          >
            <Icon name="info" size="xs" className="mr-1" />
            Press Space/Enter to save, Esc to cancel
          </Typography>
        </div>
        <Button
          variant="neutralLink"
          size="xs"
          onClick={onCancelBlock}
          className="p-1 h-auto"
          aria-label="Cancel resize"
        >
          <Icon name="close" size="sm" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-info mb-2"
          >
            Duration: {sliderValue} minutes
          </Typography>
          <input
            type="range"
            min="1"
            max={maxDuration}
            value={sliderValue}
            onChange={(e) => onSliderChange(parseInt(e.target.value))}
            className="w-full h-3 bg-surface-info rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, var(--color-text-info) 0%, var(--color-text-info) ${(sliderValue / maxDuration) * 100}%, var(--color-border) ${(sliderValue / maxDuration) * 100}%, var(--color-border) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-info mt-1">
            <span>1 min</span>
            <span>{maxDuration} min max</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={onSaveBlock}
            variant="primary"
            size="sm"
            className="flex-1 flex items-center justify-center"
            icon={<Icon name="check" size="sm" />}
            iconPosition="left"
          >
            Save Block
          </Button>
          <Button
            onClick={onCancelBlock}
            variant="ghost"
            size="sm"
            className="flex-1 flex items-center justify-center"
            icon={<Icon name="close" size="sm" />}
            iconPosition="left"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
