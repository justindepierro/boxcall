/**
 * usePlayAssignmentsHandlers Hook
 *
 * Manages all state and handlers for PlayAssignmentsModal
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { fromAny } from "../../../data/supabase/db";
import { useAuth } from "../../../app/auth-store";
import { useToast } from "../../../hooks/useToast";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { logError } from "../../../utils/logger";
import type { Play } from "../../../types/play";
import type { PersonnelConfiguration } from "../../../types/personnel";
import type { AssignmentData } from "./types";
import { DEFAULT_PERSONNEL_POSITIONS, SAVE_SUCCESS_TIMEOUT } from "./constants";

function reorderList<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
) {
  const next = Array.from(items);
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function getSelectedPersonnelConfig({
  selectedPersonnelId,
  personnelConfigurations,
  playPersonnel,
}: {
  selectedPersonnelId: string | null;
  personnelConfigurations: PersonnelConfiguration[];
  playPersonnel: string | null | undefined;
}) {
  if (selectedPersonnelId) {
    return (
      personnelConfigurations.find((pc) => pc.id === selectedPersonnelId) ||
      null
    );
  }

  if (playPersonnel && personnelConfigurations.length > 0) {
    const lower = playPersonnel.toLowerCase();
    return (
      personnelConfigurations.find((pc) =>
        pc.name.toLowerCase().includes(lower)
      ) || null
    );
  }

  return null;
}

function buildDefaultPositions({
  selectedPersonnel,
  playPersonnel,
}: {
  selectedPersonnel: PersonnelConfiguration | null;
  playPersonnel: string | null | undefined;
}): string[] {
  if (selectedPersonnel?.players) {
    const skillLabels = selectedPersonnel.players
      .filter((p) => p.player_position !== "QB" || p.sort_order === 0)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => p.label);

    const linePositions = ["TE", "LT", "LG", "C", "RG", "RT"];
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

  if (!playPersonnel) {
    return DEFAULT_PERSONNEL_POSITIONS["11"];
  }

  const personnelCode = playPersonnel.match(/\d+/)?.[0] || "11";
  return (
    DEFAULT_PERSONNEL_POSITIONS[personnelCode] ||
    DEFAULT_PERSONNEL_POSITIONS["11"]
  );
}

function mapDbRowsToState(data: any[] | null | undefined) {
  const assignmentMap = new Map<string, AssignmentData>();
  data?.forEach((assignment: any) => {
    assignmentMap.set(assignment.position, {
      id: assignment.id,
      position: assignment.position,
      assignment_text: assignment.assignment_text || "",
    });
  });

  const firstAssignment = data?.[0] as any;
  return {
    assignmentMap,
    playNotes: (firstAssignment?.play_notes as string | undefined) || "",
  };
}

function renameAssignmentKey(
  prev: Map<string, AssignmentData>,
  oldLabel: string,
  newLabel: string
) {
  const next = new Map(prev);
  const oldData = next.get(oldLabel);
  if (!oldData) return next;

  next.delete(oldLabel);
  next.set(newLabel, { ...oldData, position: newLabel });
  return next;
}

function buildAssignmentsUpsertPayload({
  assignments,
  playId,
  playbookId,
  playNotes,
  userId,
}: {
  assignments: Map<string, AssignmentData>;
  playId: string;
  playbookId: string;
  playNotes: string;
  userId: string;
}) {
  return Array.from(assignments.values())
    .filter((a) => a.assignment_text.trim())
    .map((a) => ({
      play_id: playId,
      playbook_id: playbookId,
      position: a.position,
      assignment_text: a.assignment_text,
      player_tags: [],
      hashtags: [],
      play_notes: playNotes,
      created_by: userId,
      updated_by: userId,
    }));
}

interface UsePlayAssignmentsHandlersProps {
  play: Play;
  isOpen: boolean;
  userRole?: "coach" | "player";
  personnelConfigurations?: PersonnelConfiguration[];
}

export function usePlayAssignmentsHandlers({
  play,
  isOpen,
  userRole = "coach",
  personnelConfigurations = [],
}: UsePlayAssignmentsHandlersProps) {
  const { user } = useAuth();
  const toast = useToast();

  // Core state
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
  const canEdit = isCoach && viewMode === "coach";

  // Find the selected personnel configuration or default to play's personnel
  const selectedPersonnel = useMemo(() => {
    return getSelectedPersonnelConfig({
      selectedPersonnelId,
      personnelConfigurations,
      playPersonnel: play.personnel,
    });
  }, [selectedPersonnelId, personnelConfigurations, play.personnel]);

  // Generate positions from personnel configuration or defaults
  const defaultPositions = useMemo(() => {
    return buildDefaultPositions({
      selectedPersonnel,
      playPersonnel: play.personnel,
    });
  }, [play.personnel, selectedPersonnel]);

  const positions =
    customPositions.length > 0 ? customPositions : defaultPositions;

  // Load assignments
  const loadAssignments = useCallback(async () => {
    if (!play.id) return;

    setLoading(true);

    try {
      // play_assignments table not yet in generated Database types
      const { data, error } = await fromAny("play_assignments")
        .select("*")
        .eq("play_id", play.id);

      if (error) {
        logError("Error loading assignments:", error);
        return;
      }

      const mapped = mapDbRowsToState(data);
      setAssignments(mapped.assignmentMap);
      setPlayNotes(mapped.playNotes);
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

      triggerHapticFeedback("medium");

      setCustomPositions(
        reorderList(positions, result.source.index, result.destination.index)
      );
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

      const nextLabel = newLabel.trim();

      setCustomPositions((prev) => {
        const currentPositions = prev.length > 0 ? prev : defaultPositions;
        return currentPositions.map((pos) =>
          pos === oldLabel ? nextLabel : pos
        );
      });

      setAssignments((prev) => {
        return renameAssignmentKey(prev, oldLabel, nextLabel);
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
  const updateAssignment = useCallback((position: string, text: string) => {
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
  }, []);

  // Update play notes
  const updatePlayNotes = useCallback((notes: string) => {
    setPlayNotes(notes);
    setHasChanges(true);
  }, []);

  // Save assignments
  const handleSave = useCallback(async () => {
    if (!canEdit || !user) return;

    triggerHapticFeedback("medium");
    setSaving(true);

    try {
      const assignmentsToSave = buildAssignmentsUpsertPayload({
        assignments,
        playId: play.id,
        playbookId: play.playbook_id,
        playNotes,
        userId: user.id,
      });

      // play_assignments table not yet in generated Database types
      const { error } = await fromAny("play_assignments").upsert(
        assignmentsToSave as any,
        {
          onConflict: "play_id,position",
        }
      );

      if (error) {
        logError("Error saving assignments:", error);
        toast.error("Failed to save assignments. Please try again.");
        return;
      }

      setHasChanges(false);
      setJustSaved(true);

      setTimeout(() => {
        setJustSaved(false);
      }, SAVE_SUCCESS_TIMEOUT);
    } finally {
      setSaving(false);
    }
  }, [canEdit, user, assignments, play.id, play.playbook_id, playNotes, toast]);

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "coach" ? "player" : "coach"));
  }, []);

  // Toggle editing positions
  const toggleEditingPositions = useCallback(() => {
    setIsEditingPositions((prev) => !prev);
  }, []);

  // Select personnel
  const selectPersonnel = useCallback((id: string | null) => {
    setSelectedPersonnelId(id);
    setHasChanges(true);
  }, []);

  return {
    // State
    assignments,
    playNotes,
    loading,
    saving,
    hasChanges,
    justSaved,
    selectedPersonnelId,
    selectedPersonnel,
    customPositions,
    isEditingPositions,
    editingLabel,
    viewMode,
    previewPosition,
    positions,
    isCoach,
    canEdit,

    // Setters
    setCustomPositions,
    setEditingLabel,
    setPreviewPosition,

    // Handlers
    handlePositionDragEnd,
    handleRenamePosition,
    resetToDefaults,
    updateAssignment,
    updatePlayNotes,
    handleSave,
    toggleViewMode,
    toggleEditingPositions,
    selectPersonnel,
  };
}
