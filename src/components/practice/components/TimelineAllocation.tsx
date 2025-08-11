import { Typography } from "../../design-system";
/**
 * TimelineAllocation Component (Scaffold Mode)
 *
 * Interactive timeline interface for practice time allocation with:
 * - Category selector buttons
 * - Visual timeline with clickable blocks
 * - Duration slider for block resizing
 * - Real-time allocation summary
 * - Save/Cancel functionality
 *
 * @component
 * @example
 * <TimelineAllocation
 *   scheduledDuration={120}
 *   timelineAllocation={timelineAllocation}
 *   selectedCategory={selectedCategory}
 *   selectedBlock={selectedBlock}
 *   sliderValue={sliderValue}
 *   isSelecting={isSelecting}
 *   selectionStart={selectionStart}
 *   onCategorySelect={setSelectedCategory}
 *   onTimelineClick={handleTimelineClick}
 *   onBlockClick={handleBlockClick}
 *   onSliderChange={setSliderValue}
 *   onUpdateBlockDuration={updateSelectedBlockDuration}
 *   onClearSelected={() => setSelectedBlock(null)}
 *   onClearAll={() => setTimelineAllocation({})}
 *   onRemoveEmpty={removeEmptyTime}
 *   onCancel={handleCancelScaffold}
 *   onSave={saveTimeAllocation}
 * />
 */

import React from "react";
import { Button, Card } from "../../ui";
import { getCategoryColor } from "../utils";
import { Icon, type IconName } from "../../ui/Icon/Icon";
import type {
  PracticeBlock,
  TimelineAllocation as TimelineAllocationType,
  SelectedBlock,
} from "../types";

interface TimelineAllocationProps {
  scheduledDuration: number;
  timelineAllocation: TimelineAllocationType;
  selectedCategory: PracticeBlock["category"] | null;
  selectedBlock: SelectedBlock | null;
  sliderValue: number;
  isSelecting: boolean;
  selectionStart: number | null;
  onCategorySelect: (category: PracticeBlock["category"]) => void;
  onTimelineClick: (minute: number) => void;
  onBlockClick: (minute: number) => void;
  onSliderChange: (value: number) => void;
  onUpdateBlockDuration: (duration: number) => void;
  onClearSelected: () => void;
  onClearAll: () => void;
  onRemoveEmpty: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const TimelineAllocation: React.FC<TimelineAllocationProps> = ({
  scheduledDuration,
  timelineAllocation,
  selectedCategory,
  selectedBlock,
  sliderValue,
  isSelecting,
  selectionStart,
  onCategorySelect,
  onTimelineClick,
  onBlockClick,
  onSliderChange,
  onUpdateBlockDuration,
  onClearSelected,
  onClearAll,
  onRemoveEmpty,
  onCancel,
  onSave,
}) => {
  const updateBlockDuration = (
    category: string,
    _oldDuration: number,
    newDuration: number
  ) => {
    // This function would be passed down from parent or implemented here
    // Implementation details would depend on the parent component's state management
    console.log("updateBlockDuration", category, newDuration);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            Save Time Allocation
          </Button>
        </div>
      </div>

      {/* Category Selector */}
      <Card className="p-4 mb-4">
        <Typography variant="body-md" className="font-medium mb-3">
          Select Category to Allocate:
        </Typography>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {[
            { key: "meeting", label: "Meeting", icon: "book" },
            { key: "weight-room", label: "Weight Room", icon: "activity" },
            { key: "transition", label: "Transition", icon: "arrow-right" },
            { key: "offense", label: "Offense", icon: "target" },
            { key: "defense", label: "Defense", icon: "shield" },
            { key: "special-teams", label: "Special Teams", icon: "zap" },
            { key: "break", label: "Break", icon: "pause" },
          ].map((category) => {
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
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-1">
              <Icon name="target" size="sm" color="info" />
              <Typography variant="body-sm" className="text-blue-800">
                Selected:{" "}
                <strong>
                  {selectedCategory
                    .replace("-", " ")
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </strong>
                {isSelecting && " - Click to finish selection"}
                {!isSelecting &&
                  " - Click timeline to add 5-minute blocks (auto-aligned)"}
              </Typography>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Icon name="info" size="xs" color="info" />
              <Typography variant="body-xs" className="text-blue-600">
                Click empty areas to add 5-minute blocks. Click existing blocks
                to resize with slider.
              </Typography>
            </div>
          </div>
        )}
      </Card>

      {/* Timeline Visualization - Multiple Hour-Based Timelines */}
      <div className="relative">
        <Card className="p-4 ml-20">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="body-md" className="font-medium">
              Practice Timeline ({scheduledDuration} minutes)
            </Typography>
            <div className="flex space-x-2">
              <Button
                onClick={onRemoveEmpty}
                variant="ghost"
                size="xs"
                icon={<Icon name="activity" size="sm" color="current" />}
              >
                Remove Empty
              </Button>
              <Button
                onClick={onClearAll}
                variant="danger"
                size="xs"
                icon={<Icon name="delete" size="sm" color="current" />}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Multiple Timeline Sections - One per hour */}
            {Array.from(
              { length: Math.ceil(scheduledDuration / 60) },
              (_, hourIndex) => {
                const hourStart = hourIndex * 60;
                const hourEnd = Math.min(
                  (hourIndex + 1) * 60,
                  scheduledDuration
                );

                // Get dominant category for this hour for vertical label
                const hourCategories: { [key: string]: number } = {};
                for (let minute = hourStart; minute < hourEnd; minute++) {
                  const allocation = timelineAllocation[minute];
                  if (allocation) {
                    hourCategories[allocation.category] =
                      (hourCategories[allocation.category] || 0) + 1;
                  }
                }
                const dominantCategory =
                  Object.keys(hourCategories).length > 0
                    ? Object.keys(hourCategories).reduce((a, b) =>
                        hourCategories[a] > hourCategories[b] ? a : b
                      )
                    : "unallocated";

                return (
                  <div key={hourIndex} className="relative">
                    {/* Vertical Category Label */}
                    <div className="absolute -left-20 top-0 h-full flex items-center">
                      <div className="transform -rotate-90 origin-center whitespace-nowrap">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            dominantCategory !== "unallocated"
                              ? getCategoryColor(
                                  dominantCategory as PracticeBlock["category"]
                                )
                              : "surface-subtle text-text-secondary"
                          }`}
                        >
                          Hour {hourIndex + 1}
                          {dominantCategory !== "unallocated" && (
                            <span className="ml-1">
                              (
                              {dominantCategory
                                .replace("-", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                              )
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time markers for this hour - every 10 minutes */}
                    <div className="flex text-xs text-text-muted mb-2">
                      {Array.from({ length: 7 }, (_, i) => {
                        const totalMinute = hourStart + i * 10;
                        if (totalMinute > scheduledDuration) return null;
                        return (
                          <div
                            key={i}
                            className="flex-[10] text-center border-r border-subtle last:border-r-0"
                          >
                            {totalMinute}
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline blocks for this hour */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      {Array.from({ length: 60 }, (_, relativeMinute) => {
                        const absoluteMinute = hourStart + relativeMinute;

                        // If this minute is beyond the scheduled duration, show as disabled
                        if (absoluteMinute >= scheduledDuration) {
                          return (
                            <div
                              key={absoluteMinute}
                              className="flex-1 h-16 surface-subtle border-r border-gray-300 opacity-50"
                              style={{ minWidth: "8px" }}
                            />
                          );
                        }

                        const allocation = timelineAllocation[absoluteMinute];
                        const isSelected =
                          isSelecting &&
                          selectionStart !== null &&
                          Math.min(selectionStart, absoluteMinute) <=
                            absoluteMinute &&
                          absoluteMinute <=
                            Math.max(selectionStart, absoluteMinute);

                        // Add visual separators every 10 minutes
                        const is10MinuteBoundary =
                          relativeMinute % 10 === 0 && relativeMinute > 0;

                        return (
                          <div
                            key={absoluteMinute}
                            onClick={() => {
                              if (allocation) {
                                onBlockClick(absoluteMinute);
                              } else {
                                onTimelineClick(absoluteMinute);
                              }
                            }}
                            className={`flex-1 h-16 border-r border-subtle transition-all hover:scale-105 relative ${
                              selectedBlock &&
                              absoluteMinute >= selectedBlock.start &&
                              absoluteMinute <
                                selectedBlock.start + selectedBlock.duration
                                ? "ring-2 ring-jade-500 bg-blue-100 border-t-4 border-t-blue-600"
                                : allocation
                                  ? getCategoryColor(allocation.category)
                                      .replace("text-", "border-t-4 border-t-")
                                      .split(" ")[0] +
                                    " " +
                                    getCategoryColor(allocation.category)
                                  : isSelected
                                    ? "bg-blue-200 border-t-4 border-t-blue-500"
                                    : "surface-subtle surface-subtle-hover"
                            } ${is10MinuteBoundary ? "border-l-2 border-l-gray-400" : ""}`}
                            style={{ minWidth: "8px" }}
                            title={`Minute ${absoluteMinute}${allocation ? ` - ${allocation.category} (click to resize)` : " (click to add block)"}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (allocation) {
                                  onBlockClick(absoluteMinute);
                                } else {
                                  onTimelineClick(absoluteMinute);
                                }
                              }
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>
      </div>

      {/* Expandable Slider for Selected Block */}
      {selectedBlock && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Icon name="target" size="sm" color="info" />
                <Typography
                  variant="body-md"
                  className="font-medium text-blue-800"
                >
                  Resize Block:{" "}
                  {selectedBlock.category
                    .replace("-", " ")
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Typography>
              </div>
              <Typography variant="body-sm" className="text-blue-600">
                Block starts at minute {selectedBlock.start}, currently{" "}
                {selectedBlock.duration} minutes
              </Typography>
              <div className="flex items-center gap-1 mt-1">
                <Icon name="info" size="xs" color="info" />
                <Typography variant="body-xs" className="text-blue-500">
                  Press Space/Enter to save, Esc to cancel
                </Typography>
              </div>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearSelected}
              className="h-auto p-1 text-blue-600 hover:text-blue-800"
              aria-label="Clear selection"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-blue-700 mb-2"
              >
                Duration: {sliderValue} minutes
              </Typography>
              <input
                type="range"
                min="1"
                max={Math.min(50, scheduledDuration - selectedBlock.start)}
                value={sliderValue}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  onSliderChange(newValue);
                  onUpdateBlockDuration(newValue);
                }}
                className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(sliderValue / Math.min(50, scheduledDuration - selectedBlock.start)) * 100}%, #e5e7eb ${(sliderValue / Math.min(50, scheduledDuration - selectedBlock.start)) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-blue-600 mt-1">
                <span>1 min</span>
                <span>
                  {Math.min(50, scheduledDuration - selectedBlock.start)} min
                  max
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Allocation Summary */}
      <div className="mt-4 p-3 surface-subtle rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Typography
            variant="body-sm"
            className="font-medium text-text-primary"
          >
            Current Allocation (Click time to edit):
          </Typography>
          <div className="flex items-center gap-1">
            <Icon name="info" size="xs" color="secondary" />
            <Typography variant="body-xs" color="muted">
              Click minutes to adjust, press Enter to save
            </Typography>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(timelineAllocation).length > 0 &&
            Object.entries(
              Object.values(timelineAllocation).reduce(
                (
                  acc: Record<
                    string,
                    {
                      count: number;
                      blocks: { start: number; duration: number }[];
                    }
                  >,
                  allocation
                ) => {
                  const key = allocation.category;
                  if (!acc[key]) {
                    acc[key] = { count: 0, blocks: [] };
                  }
                  acc[key].count += 1;

                  // Group consecutive minutes into blocks
                  const minutes = Object.entries(timelineAllocation)
                    .filter(([_, a]) => a.category === allocation.category)
                    .map(([minute]) => parseInt(minute))
                    .sort((a, b) => a - b);

                  // Find block boundaries
                  const blocks: { start: number; duration: number }[] = [];
                  let currentBlock: { start: number; duration: number } | null =
                    null;

                  minutes.forEach((minute) => {
                    if (
                      !currentBlock ||
                      minute !== currentBlock.start + currentBlock.duration
                    ) {
                      if (currentBlock) blocks.push(currentBlock);
                      currentBlock = { start: minute, duration: 1 };
                    } else {
                      currentBlock.duration++;
                    }
                  });
                  if (currentBlock) blocks.push(currentBlock);

                  acc[key].blocks = blocks;
                  return acc;
                },
                {}
              )
            )
              .map(
                ([category, data]: [
                  string,
                  {
                    count: number;
                    blocks: { start: number; duration: number }[];
                  },
                ]) =>
                  data.blocks.map(
                    (
                      block: { start: number; duration: number },
                      blockIndex: number
                    ) => (
                      <div
                        key={`${category}-${blockIndex}`}
                        className={`px-3 py-2 rounded-lg border-2 ${getCategoryColor(category as PracticeBlock["category"])} border-opacity-50`}
                      >
                        <div className="flex items-center space-x-2">
                          <Typography
                            variant="body-sm"
                            as="span"
                            className="font-medium capitalize"
                          >
                            {category.replace("-", " ")}
                            {data.blocks.length > 1 && ` #${blockIndex + 1}`}
                          </Typography>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              value={block.duration}
                              onChange={(e) => {
                                const newDuration =
                                  parseInt(e.target.value) || 0;
                                updateBlockDuration(
                                  category,
                                  block.duration,
                                  newDuration
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded text-center"
                              min="1"
                              max={scheduledDuration}
                            />
                            <span className="text-xs">min</span>
                          </div>
                          <span className="text-xs text-text-secondary">
                            ({block.start}-{block.start + block.duration - 1})
                          </span>
                        </div>
                      </div>
                    )
                  )
              )
              .flat()}

          {/* Add new block button */}
          {selectedCategory && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                let nextSpot = 0;
                while (
                  timelineAllocation[nextSpot] &&
                  nextSpot < scheduledDuration
                ) {
                  nextSpot++;
                }
                console.log("Add new block at", nextSpot);
              }}
              className={`border-dashed ${getCategoryColor(selectedCategory)
                .replace("bg-", "border-")
                .replace("text-", "text-")}`}
            >
              <span className="text-lg leading-none mr-1">+</span>
              <span className="text-xs font-medium">
                Add {selectedCategory.replace("-", " ")}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
