import React from "react";

import { Icon } from "../../../../../components/ui/Icon/Icon";
import { Typography } from "../../../../design-system";

import type { TimelineAllocation, PracticeBlock } from "../../types";

interface TimelineLegendProps {
  timelineAllocation: TimelineAllocation;
  getCategoryColor: (category: PracticeBlock["category"]) => string;
}

export const TimelineLegend: React.FC<TimelineLegendProps> = ({
  timelineAllocation,
  getCategoryColor,
}) => {
  // Group consecutive minutes into blocks by category
  const categoryBlocks = Object.values(timelineAllocation).reduce(
    (acc, allocation) => {
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
      let currentBlock: { start: number; duration: number } | null = null;

      minutes.forEach((minute) => {
        if (
          !currentBlock ||
          minute !== currentBlock.start + currentBlock.duration
        ) {
          // Start new block
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = { start: minute, duration: 1 };
        } else {
          // Extend current block
          currentBlock.duration += 1;
        }
      });

      if (currentBlock) {
        blocks.push(currentBlock);
      }

      acc[key].blocks = blocks;
      return acc;
    },
    {} as Record<
      string,
      { count: number; blocks: { start: number; duration: number }[] }
    >
  );

  if (Object.keys(categoryBlocks).length === 0) {
    return (
      <div className="mt-4 p-4 surface-subtle rounded-lg text-center">
        <Typography variant="body-sm" color="muted">
          No time blocks allocated yet. Select a category above and click on the
          timeline to start.
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <Typography variant="body-sm" className="font-medium">
          Current Allocation (Click time to edit):
        </Typography>
        <Typography
          variant="body-xs"
          color="muted"
          className="flex items-center"
        >
          <Icon name="info" size="xs" className="mr-1" />
          Click minutes to adjust, press Enter to save
        </Typography>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(categoryBlocks).map(([category, data]) => {
          const typedData = data as {
            count: number;
            blocks: Array<{ start: number; duration: number }>;
          };
          return (
            <div
              key={category}
              className={`px-3 py-2 rounded-lg border-2 ${getCategoryColor(category as PracticeBlock["category"])} flex items-center space-x-2`}
            >
              <div className="flex items-center space-x-1">
                <Icon name="clock" size="xs" />
                <Typography variant="body-sm" as="span" className="font-medium">
                  {category
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Typography>
              </div>
              <div className="text-xs opacity-75">{typedData.count}min</div>
              <div className="text-xs opacity-60">
                ({typedData.blocks.length} block
                {typedData.blocks.length !== 1 ? "s" : ""})
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-muted">
        Total allocated: {Object.keys(timelineAllocation).length} minutes
      </div>
    </div>
  );
};
