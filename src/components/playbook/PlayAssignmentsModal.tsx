/**
 * Play Assignments Modal
 *
 * Allows coaches to create and edit position-specific assignments for plays.
 * Players can view assignments with their position highlighted.
 *
 * Features:
 * - 11 dynamic position slots (based on personnel grouping)
 * - Text editing for each assignment
 * - Shared play notes section
 * - Role-based editing (coaches edit, players view)
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Typography } from "../design-system/Typography";
import { TextArea } from "../ui/TextArea";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon";
import { Input } from "../ui/Input";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../app/auth-store";
import type { Play } from "../../types/play";
import type { PersonnelConfiguration } from "../../types/personnel";

interface PlayAssignmentsModalProps {
  play: Play;
  isOpen: boolean;
  onClose: () => void;
  userRole?: "coach" | "player";
  currentPlayerPosition?: string;
  personnelConfigurations?: PersonnelConfiguration[];
}

interface AssignmentData {
  id?: string;
  position: string;
  assignment_text: string;
}

/**
 * Default personnel groupings for common formations
 * Interleaved for 2-column grid: [skill, line, skill, line...]
 * Left column: Skill players (QB, RB, WR, etc.)
 * Right column: Linemen and TE
 */
const DEFAULT_PERSONNEL_POSITIONS: Record<string, string[]> = {
  "11": ["QB", "TE", "RB", "LT", "X", "LG", "Y", "C", "Z", "RG", "H", "RT"],
  "12": ["QB", "TE1", "RB", "TE2", "X", "LT", "Y", "LG", "Z", "C", "H", "RG"],
  "21": ["QB", "TE", "RB1", "LT", "RB2", "LG", "X", "C", "Y", "RG", "H", "RT"],
  "10": ["QB", "TE", "RB", "LT", "X", "LG", "Y", "C", "Z", "RG", "H", "RT"],
};

export function PlayAssignmentsModal({
  play,
  isOpen,
  onClose,
  userRole = "coach",
  currentPlayerPosition,
  personnelConfigurations = [],
}: PlayAssignmentsModalProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Map<string, AssignmentData>>(
    new Map()
  );
  const [playNotes, setPlayNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Personnel selection state
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(
    null
  );

  // Position customization state
  const [customPositions, setCustomPositions] = useState<string[]>([]);
  const [isEditingPositions, setIsEditingPositions] = useState(false);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  // View toggle state (for coaches to preview player view)
  const [viewMode, setViewMode] = useState<"coach" | "player">("coach");
  const [previewPosition, setPreviewPosition] = useState<string | null>(null);

  const isCoach = userRole === "coach";
  const canEdit = isCoach && viewMode === "coach"; // Only allow editing in coach mode

  // Find the selected personnel configuration or default to play's personnel
  const selectedPersonnel = useMemo(() => {
    if (selectedPersonnelId) {
      return personnelConfigurations.find(
        (pc) => pc.id === selectedPersonnelId
      );
    }
    // Try to match by name from play.personnel
    if (play.personnel && personnelConfigurations.length > 0) {
      return personnelConfigurations.find((pc) =>
        pc.name.toLowerCase().includes(play.personnel?.toLowerCase() || "")
      );
    }
    return null;
  }, [selectedPersonnelId, personnelConfigurations, play.personnel]);

  // Generate positions from personnel configuration or defaults
  const defaultPositions = useMemo(() => {
    // If we have a personnel configuration selected, use its skill position labels
    if (selectedPersonnel && selectedPersonnel.players) {
      const skillLabels = selectedPersonnel.players
        .filter((p) => p.player_position !== "QB" || p.sort_order === 0) // Include QB and non-QB positions
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((p) => p.label);

      // Add offensive line positions (these are fixed)
      const linePositions = ["TE", "LT", "LG", "C", "RG", "RT"];

      // Interleave skill and line positions for 2-column grid display
      // Grid shows: [0,1] [2,3] [4,5]... so we want [skill, line, skill, line...]
      const interleaved: string[] = [];
      const maxLength = Math.max(skillLabels.length, linePositions.length);

      for (let i = 0; i < maxLength; i++) {
        if (i < skillLabels.length) {
          interleaved.push(skillLabels[i]);
        }
        if (i < linePositions.length) {
          interleaved.push(linePositions[i]);
        }
      }

      return interleaved;
    }

    // Fallback to default personnel groupings
    if (!play.personnel) {
      return DEFAULT_PERSONNEL_POSITIONS["11"];
    }

    const personnelCode = play.personnel.match(/\d+/)?.[0] || "11";
    return (
      DEFAULT_PERSONNEL_POSITIONS[personnelCode] ||
      DEFAULT_PERSONNEL_POSITIONS["11"]
    );
  }, [play.personnel, selectedPersonnel]);

  // Use custom positions if available, otherwise use defaults
  const positions =
    customPositions.length > 0 ? customPositions : defaultPositions;

  // Load assignments
  const loadAssignments = useCallback(async () => {
    if (!play.id) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("play_assignments")
        .select("*")
        .eq("play_id", play.id);

      if (error) {
        console.error("Error loading assignments:", error);
        return;
      }

      const assignmentMap = new Map<string, AssignmentData>();
      data?.forEach((assignment: any) => {
        assignmentMap.set(assignment.position, {
          id: assignment.id,
          position: assignment.position,
          assignment_text: assignment.assignment_text || "",
        });
      });

      setAssignments(assignmentMap);
      const firstAssignment = data?.[0] as any;
      setPlayNotes(firstAssignment?.play_notes || "");
      setHasChanges(false);
    } finally {
      setLoading(false);
    }
  }, [play.id]);

  useEffect(() => {
    if (isOpen) {
      loadAssignments();
    }
  }, [isOpen, loadAssignments]);

  // Handle drag end for reordering positions
  const handlePositionDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(positions);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setCustomPositions(items);
      setHasChanges(true);
    },
    [positions]
  );

  // Handle position label rename
  const handleRenamePosition = useCallback(
    (oldLabel: string, newLabel: string) => {
      if (!newLabel.trim() || oldLabel === newLabel) {
        setEditingLabel(null);
        return;
      }

      setCustomPositions((prev) => {
        const positions = prev.length > 0 ? prev : defaultPositions;
        return positions.map((pos) =>
          pos === oldLabel ? newLabel.trim() : pos
        );
      });

      // Update assignment map with new position key
      setAssignments((prev) => {
        const newMap = new Map(prev);
        const oldData = newMap.get(oldLabel);
        if (oldData) {
          newMap.delete(oldLabel);
          newMap.set(newLabel.trim(), {
            ...oldData,
            position: newLabel.trim(),
          });
        }
        return newMap;
      });

      setEditingLabel(null);
      setHasChanges(true);
    },
    [defaultPositions]
  );

  // Reset to default positions
  const resetToDefaults = useCallback(() => {
    setCustomPositions([]);
    setIsEditingPositions(false);
    setHasChanges(true);
  }, []);

  // Update assignment text
  function updateAssignment(position: string, text: string) {
    setAssignments((prev) => {
      const newMap = new Map(prev);
      newMap.set(position, {
        id: prev.get(position)?.id,
        position,
        assignment_text: text,
      });
      return newMap;
    });
    setHasChanges(true);
  }

  // Save assignments
  async function handleSave() {
    if (!canEdit || !user) return;

    setSaving(true);

    try {
      const assignmentsToSave = Array.from(assignments.values())
        .filter((a) => a.assignment_text.trim())
        .map((a) => ({
          play_id: play.id,
          playbook_id: play.playbook_id,
          position: a.position,
          assignment_text: a.assignment_text,
          player_tags: [],
          hashtags: [],
          play_notes: playNotes,
          created_by: user.id,
          updated_by: user.id,
        }));

      const { error } = await supabase
        .from("play_assignments")
        .upsert(assignmentsToSave as any, {
          onConflict: "play_id,position",
        });

      if (error) {
        console.error("Error saving assignments:", error);
        alert("Failed to save assignments. Please try again.");
        return;
      }

      setHasChanges(false);
      setJustSaved(true);

      // Remove the saved animation after 2 seconds
      setTimeout(() => {
        setJustSaved(false);
      }, 2000);
    } finally {
      setSaving(false);
    }
  }

  // Check if position is current player's (or previewed position for coaches)
  function isCurrentPlayerPosition(position: string): boolean {
    if (viewMode === "player" && isCoach && previewPosition) {
      return position === previewPosition;
    }
    return !!currentPlayerPosition && position === currentPlayerPosition;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${play.play_name} - Assignments`}
      size="xl"
      className={justSaved ? "save-success-flash" : ""}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="body-sm" className="text-text-secondary">
              {play.formation} • {play.personnel || "11 Personnel"}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            {isCoach ? (
              <button
                onClick={() =>
                  setViewMode(viewMode === "coach" ? "player" : "coach")
                }
                className="group"
                title={`Switch to ${viewMode === "coach" ? "Player" : "Coach"} View`}
              >
                <Badge
                  variant={viewMode === "coach" ? "accent" : "neutral"}
                  className="cursor-pointer transition-all hover:ring-2 hover:ring-accent-400"
                >
                  <Icon
                    name={viewMode === "coach" ? "eye" : "eye-off"}
                    className="h-3 w-3 mr-1 inline-block"
                  />
                  {viewMode === "coach" ? "Coach View" : "Player Preview"}
                </Badge>
              </button>
            ) : (
              <Badge variant="neutral">Player View</Badge>
            )}
            {hasChanges && canEdit && <Badge variant="warning">Unsaved</Badge>}
          </div>
        </div>

        {/* Player Preview Position Selector (Coach Only) */}
        {isCoach && viewMode === "player" && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
            <Icon name="user" className="text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <Typography
                variant="label-md"
                className="mb-1 text-blue-900 dark:text-blue-100"
              >
                Preview as Position
              </Typography>
              <select
                value={previewPosition || ""}
                onChange={(e) => setPreviewPosition(e.target.value || null)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a position...</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            <Typography
              variant="caption"
              className="text-blue-700 dark:text-blue-300"
            >
              The selected position will be highlighted as "Your Position"
            </Typography>
          </div>
        )}

        {/* Personnel Selector */}
        {personnelConfigurations.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg border border-border-primary">
            <Icon name="users" className="text-text-tertiary" />
            <div className="flex-1">
              <Typography variant="label-md" className="mb-1">
                Personnel Configuration
              </Typography>
              <select
                value={selectedPersonnelId || ""}
                onChange={(e) => {
                  setSelectedPersonnelId(e.target.value || null);
                  setHasChanges(true);
                }}
                disabled={!canEdit}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-primary bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
              >
                <option value="">
                  {play.personnel
                    ? `Default (${play.personnel})`
                    : "Default (11 Personnel)"}
                </option>
                {personnelConfigurations.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                    {config.description ? ` - ${config.description}` : ""}
                  </option>
                ))}
              </select>
            </div>
            {selectedPersonnel && (
              <div className="flex items-center gap-1">
                {selectedPersonnel.players
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((player) => (
                    <Badge key={player.id} variant="neutral" size="sm">
                      {player.label}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="activity" className="animate-pulse text-accent-600" />
            <Typography className="ml-2">Loading assignments...</Typography>
          </div>
        ) : (
          <>
            {/* Diagram Placeholder */}
            <div className="bg-surface-secondary rounded-lg p-4 border border-border-primary">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="image" className="text-text-tertiary" />
                <Typography variant="label-md">Play Diagram</Typography>
              </div>
              <div className="bg-surface-primary rounded border-2 border-dashed border-border-primary h-32 flex items-center justify-center">
                <Typography variant="body-sm" className="text-text-tertiary">
                  Diagram preview coming soon
                </Typography>
              </div>
            </div>

            {/* Position Assignments Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Typography variant="label-md">Position Assignments</Typography>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setIsEditingPositions(!isEditingPositions)}
                      title={
                        isEditingPositions
                          ? "Done editing"
                          : "Reorder & relabel positions"
                      }
                    >
                      <Icon
                        name={isEditingPositions ? "check" : "edit"}
                        className="h-3 w-3 mr-1"
                      />
                      {isEditingPositions ? "Done" : "Edit"}
                    </Button>
                    {customPositions.length > 0 && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={resetToDefaults}
                        title="Reset to default positions"
                      >
                        <Icon name="refresh-cw" className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <DragDropContext onDragEnd={handlePositionDragEnd}>
                <Droppable
                  droppableId="positions"
                  isDropDisabled={!isEditingPositions || !canEdit}
                >
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {positions.map((position, index) => {
                        const assignment = assignments.get(position);
                        const isCurrentPlayer =
                          isCurrentPlayerPosition(position);
                        const isEditing = editingLabel === position;

                        return (
                          <Draggable
                            key={position}
                            draggableId={position}
                            index={index}
                            isDragDisabled={!isEditingPositions || !canEdit}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`
                                  p-3 rounded-lg border-2 transition-all
                                  ${
                                    isCurrentPlayer
                                      ? "border-accent-500 bg-accent-50 ring-2 ring-accent-200"
                                      : "border-border-primary bg-surface-secondary"
                                  }
                                  ${snapshot.isDragging ? "shadow-lg ring-2 ring-accent-400" : ""}
                                `}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    {isEditingPositions && canEdit && (
                                      <div {...provided.dragHandleProps}>
                                        <Icon
                                          name="grip-vertical"
                                          className="h-4 w-4 text-text-tertiary cursor-grab active:cursor-grabbing"
                                        />
                                      </div>
                                    )}
                                    {isEditing ? (
                                      <Input
                                        value={position}
                                        onChange={(e) => {
                                          // Update in real-time for preview
                                          const newPositions = [...positions];
                                          newPositions[index] = e.target.value;
                                          setCustomPositions(newPositions);
                                        }}
                                        onBlur={(e) =>
                                          handleRenamePosition(
                                            position,
                                            e.target.value
                                          )
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleRenamePosition(
                                              position,
                                              e.currentTarget.value
                                            );
                                          } else if (e.key === "Escape") {
                                            setEditingLabel(null);
                                          }
                                        }}
                                        autoFocus
                                        className="h-6 text-sm px-2 py-0 w-24"
                                      />
                                    ) : (
                                      <Badge
                                        variant={
                                          isCurrentPlayer ? "accent" : "neutral"
                                        }
                                        size="sm"
                                        onClick={() => {
                                          if (isEditingPositions && canEdit) {
                                            setEditingLabel(position);
                                          }
                                        }}
                                        className={
                                          isEditingPositions && canEdit
                                            ? "cursor-pointer hover:bg-accent-100"
                                            : ""
                                        }
                                      >
                                        {position}
                                      </Badge>
                                    )}
                                  </div>
                                  {isCurrentPlayer && (
                                    <Badge variant="success" size="sm">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <TextArea
                                  value={assignment?.assignment_text || ""}
                                  onChange={(e) =>
                                    updateAssignment(position, e.target.value)
                                  }
                                  placeholder={
                                    canEdit
                                      ? `Assignment for ${position}...`
                                      : "No assignment yet"
                                  }
                                  disabled={!canEdit}
                                  rows={2}
                                  className="w-full text-sm"
                                />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Play Notes */}
            <div className="bg-surface-secondary rounded-lg p-3 border border-border-primary">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="file" className="text-text-tertiary" />
                <Typography variant="label-md">Play Notes</Typography>
                <Typography variant="caption" className="text-text-tertiary">
                  (shared with all positions)
                </Typography>
              </div>
              <TextArea
                value={playNotes}
                onChange={(e) => {
                  setPlayNotes(e.target.value);
                  setHasChanges(true);
                }}
                placeholder={
                  canEdit
                    ? "General notes about this play..."
                    : "No play notes yet"
                }
                disabled={!canEdit}
                rows={3}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border-primary">
          <div>
            {!canEdit && (
              <Typography variant="caption" className="text-text-tertiary">
                <Icon name="lock" size="sm" className="inline mr-1" />
                View-only mode
              </Typography>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              {hasChanges ? "Cancel" : "Close"}
            </Button>
            {canEdit && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? (
                  <>
                    <Icon name="activity" className="animate-pulse mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="save" className="mr-2" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
