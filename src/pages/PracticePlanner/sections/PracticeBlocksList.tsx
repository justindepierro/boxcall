import React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Typography } from "../../../components/design-system/Typography";
import { Button } from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import Icon from "../../../components/ui/Icon/Icon";
import type { PracticeBlock } from "../../../types/practice";
import { PracticeBlockItem } from "./PracticeBlockItem";

interface PracticeBlocksListProps {
  blocks: PracticeBlock[];
  practiceStarted: boolean;
  lockedSchedule: boolean;
  teamRole: string | null | undefined;
  teamId: string;
  onDragEnd: (result: DropResult) => void;
  onDeleteBlock: (blockId: string) => void;
  onPDFExport: () => void;
  onNavigateToSchedule: () => void;
  onStartPractice: () => void;
  onStopPractice: () => void;
  onUnlockSchedule: () => void;
  formatTime: (seconds: number) => string;
  getTimeRemaining: (endTime: Date | string) => number;
}

export const PracticeBlocksList: React.FC<PracticeBlocksListProps> = ({
  blocks,
  practiceStarted,
  lockedSchedule,
  teamRole,
  onDragEnd,
  onDeleteBlock,
  onPDFExport,
  onNavigateToSchedule,
  onStartPractice,
  onStopPractice,
  onUnlockSchedule,
  formatTime,
  getTimeRemaining,
}) => {
  return (
    <div className="lg:col-span-3" id="practice-schedule-blocks">
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="headline-md" className="text-primary">
              Practice Blocks
            </Typography>
            <PracticeControls
              practiceStarted={practiceStarted}
              lockedSchedule={lockedSchedule}
              teamRole={teamRole}
              blocksCount={blocks.length}
              onPDFExport={onPDFExport}
              onNavigateToSchedule={onNavigateToSchedule}
              onStartPractice={onStartPractice}
              onStopPractice={onStopPractice}
              onUnlockSchedule={onUnlockSchedule}
            />
          </div>

          {/* Practice Schedule Timeline */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="practice-blocks" direction="vertical">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-48 p-4 rounded-lg placeholder-zone transition-colors ${
                    snapshot.isDraggingOver
                      ? "border-component-badge-primary bg-subtle"
                      : "border-muted bg-subtle"
                  }`}
                >
                  {blocks.length === 0 ? (
                    <EmptyBlocksState />
                  ) : (
                    blocks.map((block, index) => (
                      <Draggable
                        key={block.id}
                        draggableId={block.id}
                        index={index}
                        isDragDisabled={lockedSchedule}
                      >
                        {(provided, snapshot) => (
                          <PracticeBlockItem
                            block={block}
                            provided={provided}
                            snapshot={snapshot}
                            lockedSchedule={lockedSchedule}
                            practiceStarted={practiceStarted}
                            formatTime={formatTime}
                            getTimeRemaining={getTimeRemaining}
                            onDelete={() => onDeleteBlock(block.id)}
                          />
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </Card>
    </div>
  );
};

interface PracticeControlsProps {
  practiceStarted: boolean;
  lockedSchedule: boolean;
  teamRole: string | null | undefined;
  blocksCount: number;
  onPDFExport: () => void;
  onNavigateToSchedule: () => void;
  onStartPractice: () => void;
  onStopPractice: () => void;
  onUnlockSchedule: () => void;
}

const PracticeControls: React.FC<PracticeControlsProps> = ({
  practiceStarted,
  lockedSchedule,
  teamRole,
  blocksCount,
  onPDFExport,
  onNavigateToSchedule,
  onStartPractice,
  onStopPractice,
  onUnlockSchedule,
}) => (
  <div className="flex items-center space-x-4" id="practice-controls">
    {/* PDF Export Button */}
    <Button
      onClick={onPDFExport}
      variant="secondary"
      className="bg-primary border-muted text-secondary hover:text-primary hover:bg-muted flex items-center gap-2"
      disabled={blocksCount === 0}
    >
      <Icon name="pdf" size="sm" />
      Print Practice to PDF
    </Button>

    {/* Add/Edit Season Schedule Button - Team Owners Only */}
    {teamRole === "head_coach" && (
      <Button
        onClick={onNavigateToSchedule}
        variant="secondary"
        className="bg-primary border-muted text-secondary hover:text-primary hover:bg-muted flex items-center gap-2"
      >
        <Icon name="plus-circle" size="sm" />
        Add/Edit Season Schedule
      </Button>
    )}

    {/* Practice Controls */}
    {!practiceStarted ? (
      <Button
        onClick={onStartPractice}
        variant="primary"
        className="flex items-center gap-2"
        disabled={blocksCount === 0}
      >
        <Icon name="play" size="sm" className="text-primary" />
        Start Practice
      </Button>
    ) : (
      <div className="flex items-center space-x-2">
        <Button
          onClick={onStopPractice}
          variant="danger"
          className="flex items-center gap-2"
        >
          <Icon name="power" size="sm" className="text-error" />
          End Practice
        </Button>
        {lockedSchedule && (
          <Button
            onClick={onUnlockSchedule}
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1"
          >
            <Icon name="unlock" size="xs" />
            Unlock Schedule
          </Button>
        )}
      </div>
    )}
  </div>
);

const EmptyBlocksState: React.FC = () => (
  <div className="text-center py-8">
    <Typography variant="body-lg" className="text-muted mb-4">
      No practice blocks yet
    </Typography>
    <Typography variant="body-sm" className="text-muted">
      Add blocks using the quick actions or create custom blocks
    </Typography>
  </div>
);

PracticeBlocksList.displayName = "PracticeBlocksList";
