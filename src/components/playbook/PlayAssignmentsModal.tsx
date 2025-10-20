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
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Typography } from "../design-system/Typography";
import { TextArea } from "../ui/TextArea";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../app/auth-store";
import type { Play } from "../../types/play";

interface PlayAssignmentsModalProps {
  play: Play;
  isOpen: boolean;
  onClose: () => void;
  userRole?: "coach" | "player";
  currentPlayerPosition?: string;
}

interface AssignmentData {
  id?: string;
  position: string;
  assignment_text: string;
}

/**
 * Default personnel groupings for common formations
 */
const DEFAULT_PERSONNEL_POSITIONS: Record<string, string[]> = {
  "11": ["QB", "RB", "X", "Y", "Z", "TE", "LT", "LG", "C", "RG", "RT"],
  "12": ["QB", "RB", "X", "Y", "TE1", "TE2", "LT", "LG", "C", "RG", "RT"],
  "21": ["QB", "RB1", "RB2", "X", "Y", "TE", "LT", "LG", "C", "RG", "RT"],
  "10": ["QB", "X", "Y", "Z", "H", "TE", "LT", "LG", "C", "RG", "RT"],
};

export function PlayAssignmentsModal({
  play,
  isOpen,
  onClose,
  userRole = "coach",
  currentPlayerPosition,
}: PlayAssignmentsModalProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Map<string, AssignmentData>>(new Map());
  const [playNotes, setPlayNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isCoach = userRole === "coach";
  const canEdit = isCoach;

  // Determine positions from personnel grouping
  const positions = useMemo(() => {
    if (!play.personnel) {
      return DEFAULT_PERSONNEL_POSITIONS["11"];
    }
    
    const personnelCode = play.personnel.match(/\d+/)?.[0] || "11";
    return DEFAULT_PERSONNEL_POSITIONS[personnelCode] || DEFAULT_PERSONNEL_POSITIONS["11"];
  }, [play.personnel]);

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
      alert("✅ Assignments saved successfully!");
    } finally {
      setSaving(false);
    }
  }

  // Check if position is current player's
  function isCurrentPlayerPosition(position: string): boolean {
    return !!currentPlayerPosition && position === currentPlayerPosition;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${play.play_name} - Assignments`}
      size="xl"
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
            <Badge variant={isCoach ? "accent" : "neutral"}>
              {isCoach ? "Coach View" : "Player View"}
            </Badge>
            {hasChanges && canEdit && (
              <Badge variant="warning">Unsaved</Badge>
            )}
          </div>
        </div>

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
              <Typography variant="label-md" className="mb-3">
                Position Assignments
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {positions.map((position) => {
                  const assignment = assignments.get(position);
                  const isCurrentPlayer = isCurrentPlayerPosition(position);
                  
                  return (
                    <div
                      key={position}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${
                          isCurrentPlayer
                            ? "border-accent-500 bg-accent-50 ring-2 ring-accent-200"
                            : "border-border-primary bg-surface-secondary"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={isCurrentPlayer ? "accent" : "neutral"}
                          size="sm"
                        >
                          {position}
                        </Badge>
                        {isCurrentPlayer && (
                          <Badge variant="success" size="sm">
                            You
                          </Badge>
                        )}
                      </div>
                      <TextArea
                        value={assignment?.assignment_text || ""}
                        onChange={(e) => updateAssignment(position, e.target.value)}
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
                  );
                })}
              </div>
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
