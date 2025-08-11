import React from "react";
import { Tag } from "../../../ui/Tag";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Typography } from "../../../design-system";
import { Button, Card } from "../../../../components/ui";
import { Icon, type IconName } from "../../../../components/ui/Icon/Icon";
import type { PracticeBlock } from "../types";

interface PracticeBlockListProps {
  practiceBlocks: PracticeBlock[];
  totalDuration: number;
  scheduledDuration: number;
  userRole: "head_coach" | "position_coach";
  onDragEnd: (result: DropResult) => void;
  onEditBlock: (block: PracticeBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddGroup: (blockId: string) => void;
  getCategoryColor: (category: PracticeBlock["category"]) => string;
  getCategoryIcon: (category: PracticeBlock["category"]) => string;
}

export const PracticeBlockList: React.FC<PracticeBlockListProps> = ({
  practiceBlocks,
  totalDuration,
  scheduledDuration,
  userRole,
  onDragEnd,
  onEditBlock,
  onDeleteBlock,
  onAddGroup,
  getCategoryColor,
  getCategoryIcon,
}) => {
  const isOvertime = totalDuration > scheduledDuration;

  return (
    <div className="space-y-4">
      {/* Duration Summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Typography variant="body-md" className="font-medium">
            Practice Blocks Overview
          </Typography>
          <Typography variant="body-sm" color="muted">
            Drag to reorder • Click to edit •{" "}
            {userRole === "head_coach" ? "Full control" : "Position coach view"}
          </Typography>
        </div>
        <div className="text-right">
          <div
            className={`text-lg font-bold ${
              isOvertime ? "text-red-600" : "text-green-600"
            }`}
          >
            {totalDuration} / {scheduledDuration} min
          </div>
          {isOvertime && (
            <div className="text-sm text-red-500 flex items-center">
              <Icon name="alert-triangle" size="xs" className="mr-1" />
              {totalDuration - scheduledDuration} min overtime
            </div>
          )}
        </div>
      </div>

      {/* Practice Blocks List */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="practice-blocks">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 min-h-[200px] p-4 rounded-lg placeholder-zone transition-colors ${
                snapshot.isDraggingOver
                  ? "border-blue-400 surface-subtle"
                  : "border-gray-300 surface-subtle"
              }`}
            >
              {practiceBlocks.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    name="plus-circle"
                    size="lg"
                    className="mx-auto mb-2 text-gray-400"
                  />
                  <Typography variant="body-md" color="muted">
                    No practice blocks yet
                  </Typography>
                  <Typography variant="body-sm" color="muted" className="mt-1">
                    Add your first block to get started
                  </Typography>
                </div>
              ) : (
                practiceBlocks.map((block, index) => (
                  <Draggable
                    key={block.id}
                    draggableId={block.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 transition-all ${
                          snapshot.isDragging
                            ? "shadow-lg rotate-2 scale-105"
                            : "hover:shadow-md"
                        } ${getCategoryColor(block.category)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/5"
                              >
                                <Icon
                                  name="menu"
                                  size="sm"
                                  className="text-gray-400"
                                />
                              </div>

                              {/* Category Icon */}
                              <div className="flex items-center space-x-2">
                                <Icon
                                  name={
                                    getCategoryIcon(block.category) as IconName
                                  }
                                  size="md"
                                />
                                <div>
                                  <Typography
                                    variant="body-md"
                                    className="font-medium"
                                  >
                                    {block.title ||
                                      block.category
                                        .replace("-", " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                  </Typography>
                                  <Typography variant="body-sm" color="muted">
                                    {block.startTime} - {block.endTime} (
                                    {block.duration} min)
                                  </Typography>
                                </div>
                              </div>
                            </div>

                            {/* Block Details */}
                            {(block.location || block.notes) && (
                              <div className="ml-10 space-y-1">
                                {block.location && (
                                  <div className="flex items-center text-sm text-text-secondary">
                                    <Icon
                                      name="map"
                                      size="xs"
                                      className="mr-1"
                                    />
                                    {block.location}
                                  </div>
                                )}
                                {block.notes && (
                                  <div className="flex items-start text-sm text-text-secondary">
                                    <Icon
                                      name="message"
                                      size="xs"
                                      className="mr-1 mt-0.5"
                                    />
                                    <span>{block.notes}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Assigned Coach */}
                            {block.assignedCoach && (
                              <div className="ml-10 mt-2">
                                <Tag variant="info" size="sm">
                                  <Icon
                                    name="user"
                                    size="xs"
                                    className="mr-1"
                                  />
                                  {block.assignedCoach}
                                </Tag>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {userRole === "head_coach" && (
                              <Button
                                variant="neutralLink"
                                size="sm"
                                onClick={() => onAddGroup(block.id)}
                              >
                                <Icon name="plus" size="sm" />
                              </Button>
                            )}

                            <Button
                              variant="neutralLink"
                              size="sm"
                              onClick={() => onEditBlock(block)}
                            >
                              <Icon name="edit" size="sm" />
                            </Button>

                            <Button
                              variant="dangerLink"
                              size="sm"
                              onClick={() => onDeleteBlock(block.id)}
                            >
                              <Icon name="close" size="sm" />
                            </Button>
                          </div>
                        </div>

                        {/* Groups within block */}
                        {block.groups && block.groups.length > 0 && (
                          <div className="ml-10 mt-3 pl-4 border-l-2 border-subtle">
                            <Typography
                              variant="body-sm"
                              className="font-medium mb-2"
                            >
                              Groups ({block.groups.length}):
                            </Typography>
                            <div className="space-y-2">
                              {block.groups.map((group) => (
                                <div
                                  key={group.id}
                                  className="flex items-center justify-between p-2 bg-white/50 rounded"
                                >
                                  <div className="flex-1">
                                    <Typography
                                      variant="body-sm"
                                      className="font-medium"
                                    >
                                      {group.name}
                                    </Typography>
                                    {group.location && (
                                      <Typography
                                        variant="body-xs"
                                        color="muted"
                                      >
                                        {group.location}
                                      </Typography>
                                    )}
                                  </div>
                                  <Button
                                    variant="neutralLink"
                                    size="sm"
                                  >
                                    <Icon name="edit" size="xs" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
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
  );
};
