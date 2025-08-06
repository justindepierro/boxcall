import React from "react";
import { Typography } from "../../../../../components/design-system";
import { Button } from "../../../../../components/ui";
import { Icon } from "../../../../../components/ui/Icon/Icon";
import { CategorySelector } from "./CategorySelector";
import { TimelineContainer } from "./TimelineContainer";
import { TimelineSlider } from "./TimelineSlider";
import { TimelineLegend } from "./TimelineLegend";
import type {
  PracticeBlock,
  TimelineAllocation,
  SelectedBlock,
} from "../../types";

interface PracticeTimelineProps {
  // Timeline state
  timelineAllocation: TimelineAllocation;
  selectedCategory: PracticeBlock["category"] | null;
  selectedBlock: SelectedBlock | null;
  sliderValue: number;
  scheduledDuration: number;

  // Event handlers
  onCategorySelect: (category: PracticeBlock["category"]) => void;
  onTimelineClick: (minute: number) => void;
  onMouseDown: (minute: number) => void;
  onMouseEnter: (minute: number) => void;
  onMouseUp: () => void;
  onSliderChange: (value: number) => void;
  onSaveBlock: () => void;
  onCancelBlock: () => void;
  onSaveTimeAllocation: () => void;
  onCancelScaffold: () => void;

  // Utils
  getCategoryColor: (category: PracticeBlock["category"]) => string;
}

export const PracticeTimeline: React.FC<PracticeTimelineProps> = ({
  timelineAllocation,
  selectedCategory,
  selectedBlock,
  sliderValue,
  scheduledDuration,
  onCategorySelect,
  onTimelineClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onSliderChange,
  onSaveBlock,
  onCancelBlock,
  onSaveTimeAllocation,
  onCancelScaffold,
  getCategoryColor,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="headline-md" className="flex items-center gap-2">
            <Icon name="clock" size="md" />
            Allocate Practice Time
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            Select a category below, then click and drag on the timeline to
            allocate time blocks
          </Typography>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onCancelScaffold}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onSaveTimeAllocation}>
            Save Time Allocation
          </Button>
        </div>
      </div>

      {/* Category Selector */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
        getCategoryColor={getCategoryColor}
      />

      {/* Timeline */}
      <TimelineContainer
        scheduledDuration={scheduledDuration}
        timelineAllocation={timelineAllocation}
        selectedBlock={selectedBlock}
        getCategoryColor={getCategoryColor}
        onTimelineClick={onTimelineClick}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
      />

      {/* Timeline Slider for resizing blocks */}
      {selectedBlock && (
        <TimelineSlider
          selectedBlock={selectedBlock}
          sliderValue={sliderValue}
          scheduledDuration={scheduledDuration}
          onSliderChange={onSliderChange}
          onSaveBlock={onSaveBlock}
          onCancelBlock={onCancelBlock}
        />
      )}

      {/* Legend */}
      <TimelineLegend
        timelineAllocation={timelineAllocation}
        getCategoryColor={getCategoryColor}
      />
    </div>
  );
};
