/**
 * PracticeBlocksList Component (Regular Mode)
 *
 * Draggable list of practice blocks with:
 * - Drag and drop reordering
 * - Block editing and deletion
 * - Group management within blocks
 * - Script assignment functionality
 * - Coach assignment (head coach mode)
 * - Auto-assign coaches feature
 *
 * @component
 * @example
 * <PracticeBlocksList
 *   practiceBlocks={practiceBlocks}
 *   userRole="head_coach"
 *   scaffoldMode={false}
 *   onDragEnd={handleDragEnd}
 *   onEditBlock={handleEditBlock}
 *   onRemoveBlock={handleRemoveBlock}
 *   onAddGroup={handleAddGroup}
 *   onEditGroup={handleEditGroup}
 *   onRemoveGroup={handleRemoveGroup}
 *   onAddScriptToBlock={handleAddScriptToBlock}
 *   onAddScriptToGroup={handleAddScriptToGroup}
 *   onRemoveScriptFromGroup={handleRemoveScriptFromGroup}
 *   onAddBlock={() => setShowAddBlock(true)}
 *   onScaffoldMode={() => setScaffoldMode(true)}
 *   onAutoAssignCoaches={handleAutoAssignCoaches}
 * />
 */
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Typography } from "../../design-system";
import { Button, Card } from "../../ui";
import { getCategoryColor } from "../utils";
import type { PracticeBlock, PracticeGroup, UserRole } from "../types";
import Icon from "../../ui/Icon/Icon";
interface PracticeBlocksListProps {
  practiceBlocks: PracticeBlock[];
  userRole: UserRole;
  scaffoldMode: boolean;
  onDragEnd: (result: DropResult) => void;
  onEditBlock: (block: PracticeBlock) => void;
  onRemoveBlock: (id: string) => void;
  onAddGroup: (blockId: string) => void;
  onEditGroup: (blockId: string, group: PracticeGroup) => void;
  onRemoveGroup: (blockId: string, groupId: string) => void;
  onAddScriptToBlock: (blockId: string) => void;
  onAddScriptToGroup: (blockId: string, groupId: string) => void;
  onRemoveScriptFromGroup: (blockId: string, groupId: string) => void;
  onAddBlock: () => void;
  onScaffoldMode: () => void;
  onAutoAssignCoaches: () => void;
}
export const PracticeBlocksList: React.FC<PracticeBlocksListProps> = ({
  practiceBlocks,
  userRole,
  scaffoldMode: _scaffoldMode,
  onDragEnd,
  onEditBlock,
  onRemoveBlock,
  onAddGroup,
  onEditGroup,
  onRemoveGroup,
  onAddScriptToBlock,
  onAddScriptToGroup,
  onRemoveScriptFromGroup,
  onAddBlock,
  onScaffoldMode,
  onAutoAssignCoaches,
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Typography variant="headline-md">Practice Schedule</Typography>
          {practiceBlocks.length > 0 && (
            <Typography variant="body-sm" color="muted" className="mt-1">
              💡 Drag the ⋮⋮ handle to reorder practice blocks
            </Typography>
          )}
        </div>
        <div className="flex space-x-2">
          {userRole === "head_coach" && (
            <Button variant="outline" size="sm" onClick={onScaffoldMode}>
              <Icon name="clock" size="sm" className="mr-1" />
              Allocate Practice Time
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onAddBlock}>
            + Add Block
          </Button>
          {userRole === "head_coach" && practiceBlocks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoAssignCoaches}
              className="ml-2"
            >
              👥 Auto-Assign Coaches
            </Button>
          )}
        </div>
      </div>
      {/* Empty State */}
      {practiceBlocks.length === 0 ? (
        <Card className="bc-card-padding text-center">
          <div className="mb-4 flex justify-center">
            <Icon name="clock" size="lg" className="text-gray-400" />
          </div>
          <Typography variant="body-lg" color="muted">
            No practice blocks planned yet
          </Typography>
          <Typography variant="body-md" color="muted" className="mt-2">
            Click "Add Block" to start planning your practice
          </Typography>
        </Card>
      ) : (
        /* Draggable Blocks List */
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="practice-blocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {practiceBlocks.map((block, index) => (
                  <Draggable
                    key={block.id}
                    draggableId={block.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative transition-all ${
                          snapshot.isDragging ? "shadow-lg scale-105" : ""
                        }`}
                      >
                        <div className="p-4">
                          {/* Block Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3 flex-1">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-1"
                              >
                                ⋮⋮
                              </div>
                              {/* Block Info */}
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Typography
                                    variant="headline-sm"
                                    className="text-navy-900"
                                  >
                                    {block.title}
                                  </Typography>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                                      block.category
                                    )}`}
                                  >
                                    {block.category
                                      .replace("-", " ")
                                      .toUpperCase()}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {block.startTime} - {block.endTime} (
                                    {block.duration}m)
                                  </span>
                                </div>
                                {/* Location & Coach */}
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  {block.location && (
                                    <div className="flex items-center gap-1">
                                      <Icon
                                        name="target"
                                        size="sm"
                                        className="text-gray-500"
                                      />
                                      <span>{block.location}</span>
                                    </div>
                                  )}
                                  {block.assignedCoach && (
                                    <div className="flex items-center gap-1">
                                      <Icon
                                        name="check-circle"
                                        size="sm"
                                        className="text-gray-500"
                                      />
                                      <span>{block.assignedCoach}</span>
                                    </div>
                                  )}
                                </div>
                                {/* Notes */}
                                {block.notes && (
                                  <Typography
                                    variant="body-sm"
                                    color="muted"
                                    className="mt-2"
                                  >
                                    {block.notes}
                                  </Typography>
                                )}
                                {/* Block Script */}
                                {block.scriptId && (
                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        name="file"
                                        size="sm"
                                        className="text-blue-600"
                                      />
                                      <Typography
                                        variant="body-sm"
                                        className="text-blue-800"
                                      >
                                        Block Script:{" "}
                                        {block.scriptTitle ||
                                          `Script ${block.scriptId}`}
                                      </Typography>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Block Actions */}
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => onEditBlock(block)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit block"
                              >
                                <Icon name="edit" size="sm" />
                              </button>
                              <button
                                onClick={() => onAddScriptToBlock(block.id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Add script to block"
                              >
                                <Icon name="file" size="sm" />
                              </button>
                              <button
                                onClick={() => onRemoveBlock(block.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete block"
                              >
                                <Icon name="delete" size="sm" />
                              </button>
                            </div>
                          </div>
                          {/* Groups Section */}
                          {block.groups && block.groups.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <Typography
                                  variant="body-md"
                                  className="font-medium text-gray-700"
                                >
                                  👥 Groups ({block.groups.length})
                                </Typography>
                                <button
                                  onClick={() => onAddGroup(block.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  + Add Group
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {block.groups.map((group) => (
                                  <div
                                    key={group.id}
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <Typography
                                          variant="body-sm"
                                          className="font-medium text-gray-900"
                                        >
                                          {group.name}
                                        </Typography>
                                        {group.location && (
                                          <div className="flex items-center gap-1">
                                            <Icon
                                              name="target"
                                              size="sm"
                                              className="text-gray-400"
                                            />
                                            <Typography
                                              variant="body-xs"
                                              color="muted"
                                            >
                                              {group.location}
                                            </Typography>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex space-x-1 ml-2">
                                        <button
                                          onClick={() =>
                                            onEditGroup(block.id, group)
                                          }
                                          className="text-blue-600 hover:text-blue-800 p-1"
                                          title="Edit group"
                                        >
                                          <Icon name="edit" size="sm" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            onAddScriptToGroup(
                                              block.id,
                                              group.id
                                            )
                                          }
                                          className="text-green-600 hover:text-green-800 p-1"
                                          title="Add script to group"
                                        >
                                          <Icon name="file" size="sm" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            onRemoveGroup(block.id, group.id)
                                          }
                                          className="text-red-600 hover:text-red-800 p-1"
                                          title="Remove group"
                                        >
                                          <Icon name="delete" size="sm" />
                                        </button>
                                      </div>
                                    </div>
                                    {/* Group Notes */}
                                    {group.notes && (
                                      <Typography
                                        variant="body-xs"
                                        color="muted"
                                        className="mb-2"
                                      >
                                        {group.notes}
                                      </Typography>
                                    )}
                                    {/* Group Script */}
                                    {group.scriptId ? (
                                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                                        <Typography
                                          variant="body-xs"
                                          className="text-green-800"
                                        >
                                          📋{" "}
                                          {group.scriptTitle ||
                                            `Script ${group.scriptId}`}
                                        </Typography>
                                        <button
                                          onClick={() =>
                                            onRemoveScriptFromGroup(
                                              block.id,
                                              group.id
                                            )
                                          }
                                          className="text-green-600 hover:text-green-800 text-xs"
                                          title="Remove script"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          onAddScriptToGroup(block.id, group.id)
                                        }
                                        className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-gray-400 hover:text-gray-600 text-xs"
                                      >
                                        + Add Script to Group
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Add Group Button (when no groups exist) */}
                          {(!block.groups || block.groups.length === 0) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => onAddGroup(block.id)}
                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                              >
                                👥 Add Groups to This Block
                              </button>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};
