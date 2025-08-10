import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Button } from "../../../../components/ui";
import { Icon } from "../../../../components/ui/Icon/Icon";
import type { CalendarEvent } from "../../../../domain/calendar/types";
import { PDFExportTrigger } from "../../LazyPDFExport";
import type {
  PracticeBlock,
  TimelineAllocation,
  SelectedBlock,
  EventData,
} from "../types";

interface PracticePlannerHeaderProps {
  event: CalendarEvent;
  userRole: "head_coach" | "position_coach";
  timeAllocationMode: boolean;
  scaffoldMode: boolean;
  practiceBlocks: PracticeBlock[];
  totalDuration: number;
  onClose: () => void;
  onTimeAllocationModeToggle: () => void;
  onScaffoldModeToggle: () => void;
  onPracticeBlocksChange: (blocks: PracticeBlock[]) => void;
  onOriginalBlocksChange: (blocks: PracticeBlock[]) => void;
  onTimelineAllocationChange: (allocation: TimelineAllocation) => void;
  onSelectedCategoryChange: (
    category: PracticeBlock["category"] | null
  ) => void;
  onSelectedBlockChange: (block: SelectedBlock | null) => void;
  eventData?: EventData;
}

export const PracticePlannerHeader: React.FC<PracticePlannerHeaderProps> = ({
  event,
  userRole,
  timeAllocationMode,
  scaffoldMode,
  practiceBlocks,
  totalDuration,
  onClose,
  onTimeAllocationModeToggle,
  onScaffoldModeToggle,
  onPracticeBlocksChange,
  onOriginalBlocksChange,
  onTimelineAllocationChange,
  onSelectedCategoryChange,
  onSelectedBlockChange,
  eventData,
}) => {
  const recalculateBlockTimes = (blocks: PracticeBlock[]): PracticeBlock[] => {
    return blocks.map((block, index) => {
      const previousBlocks = blocks.slice(0, index);
      const totalPreviousDuration = previousBlocks.reduce(
        (sum, prevBlock) => sum + prevBlock.duration,
        0
      );

      const eventStart = new Date(event.start);
      const blockStart = new Date(
        eventStart.getTime() + totalPreviousDuration * 60000
      );
      const blockEnd = new Date(blockStart.getTime() + block.duration * 60000);

      return {
        ...block,
        startTime: blockStart.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: blockEnd.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  };

  const handleScaffoldModeToggle = () => {
    if (!scaffoldMode) {
      // Entering scaffold mode - store original blocks and convert to timeline allocation
      let blocksToConvert = practiceBlocks;
      console.log(
        "Entering scaffold mode with current blocks:",
        practiceBlocks
      );

      // Store current blocks as backup for cancel functionality
      onOriginalBlocksChange([...practiceBlocks]);

      // If we don't have current blocks, try to load from localStorage first
      if (practiceBlocks.length === 0) {
        console.log("No current blocks, trying to load from localStorage...");
        const savedPracticeKey = `practice_plan_${event.id || "default"}`;
        const savedPractice = localStorage.getItem(savedPracticeKey);

        if (savedPractice) {
          try {
            const savedBlocks = JSON.parse(savedPractice);
            const blocksWithTimes = recalculateBlockTimes(savedBlocks);
            console.log(
              "Loaded saved blocks for scaffold mode:",
              blocksWithTimes
            );
            onPracticeBlocksChange(blocksWithTimes);
            onOriginalBlocksChange([...blocksWithTimes]);
            blocksToConvert = blocksWithTimes;
          } catch (error) {
            console.error(
              "Error loading saved practice plan for scaffold mode:",
              error
            );
          }
        } else {
          console.log("No saved practice data found in localStorage");
        }
      }

      // Convert blocks to timeline allocation
      const allocation: TimelineAllocation = {};
      let currentMinute = 0;
      blocksToConvert.forEach((block) => {
        for (let i = 0; i < block.duration; i++) {
          allocation[currentMinute + i] = {
            category: block.category,
            assignedCoach: block.assignedCoach,
            title: block.title,
          };
        }
        currentMinute += block.duration;
      });
      console.log("Created timeline allocation:", allocation);
      onTimelineAllocationChange(allocation);
    } else {
      // Exiting scaffold mode - clear timeline allocation
      onTimelineAllocationChange({});
      onSelectedCategoryChange(null);
      onSelectedBlockChange(null);
      onOriginalBlocksChange([]);
    }
    onScaffoldModeToggle();
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Typography
          variant="headline-lg"
          className="text-navy-900 flex items-center"
        >
          <Icon name="file" size="lg" className="mr-2" color="navy" />
          Practice Planner
        </Typography>
        <Typography variant="body-md" color="muted" className="mt-1">
          {event.title} - {new Date(event.start).toLocaleDateString()}
        </Typography>
        <div className="mt-2 flex items-center space-x-4">
          <span
            className={`px-2 py-1 rounded text-xs font-medium flex items-center ${
              userRole === "head_coach"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {userRole === "head_coach" ? (
              <>
                <Icon name="crown" size="xs" className="mr-1" />
                Head Coach
              </>
            ) : (
              <>
                <Icon name="user" size="xs" className="mr-1" />
                Position Coach
              </>
            )}
          </span>
          <Typography variant="body-sm" color="muted">
            {userRole === "head_coach"
              ? "Allocate time blocks and assign position coaches"
              : "Fill in detailed drills for your assigned time blocks"}
          </Typography>
          {userRole === "head_coach" && (
            <div className="flex space-x-2">
              <Button
                onClick={onTimeAllocationModeToggle}
                variant={timeAllocationMode ? "primary" : "secondary"}
                size="sm"
                className="flex items-center"
              >
                <Icon name="bar-chart" size="xs" className="mr-1" />
                {timeAllocationMode
                  ? "Time Allocation Mode"
                  : "Enable Time Allocation"}
              </Button>
              <Button
                onClick={handleScaffoldModeToggle}
                variant={scaffoldMode ? "primary" : "secondary"}
                size="sm"
                className="flex items-center"
              >
                <Icon
                  name={scaffoldMode ? "file" : "target"}
                  size="xs"
                  className="mr-1"
                />
                {scaffoldMode ? "Scaffold Mode" : "Enable Practice Scaffold"}
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {/* PDF Export Button - Lazy Loading */}
        <PDFExportTrigger
          practiceData={{
            blocks: practiceBlocks,
            title: eventData?.title || "Practice Plan",
            date: eventData?.date || new Date().toISOString(),
            duration: totalDuration,
          }}
          buttonClassName="bg-jade-600 hover:bg-jade-700 text-white font-medium flex items-center"
          buttonText="Print Practice to PDF"
          iconName="pdf"
        />

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-600"
        >
          <Icon name="close" size="lg" />
        </Button>
      </div>
    </div>
  );
};
