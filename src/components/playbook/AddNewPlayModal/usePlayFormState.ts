import { useState, useCallback } from "react";
import type { Play } from "../../../types/play";

export interface PlayFormData {
  // Basic fields
  formation: string;
  formation_id: string | null; // NEW: Formation database ID
  formation_direction: "base" | "left" | "right" | null; // NEW: Formation variant direction
  formationShowInName: boolean;
  playName: string;
  playShowInName: boolean;
  personnel: string;
  playType: string;

  // Formation details
  formationType: string;
  formationDir: string;
  backAlign: string;
  backLeftOfQb: boolean; // NEW: Back position modifier
  backRightOfQb: boolean; // NEW: Back position modifier
  shift: string;
  motion: string;
  formationTags: string;
  runStrength: string;
  passStrength: string;

  // Play details
  playDir: string;
  protection: string;
  checkInto: string; // NEW: Audible/check play
  playTags: string;

  // Preferences
  prefDown: string;
  prefDistance: string;
  prefHash: string;
  prefCoverage: string;
  prefFront: string;
  prefFieldPos: string; // NEW: Custom field position (Red Zone, Goal Line, etc.)
  prefSituation: string; // NEW: Custom situation (2-Minute, Backed Up, etc.)

  // Other
  confidence: number;
  oneWordPlay: string;
  wristbandNumber: string;
  description: string;

  // Play diagram upload (NEW - November 27, 2025)
  diagram_image_url: string | null;

  // Tags & Roles (LEGACY - for backwards compatibility)
  positions: string[];
  players: string[];
  flags: string[];
  newPosition: string;
  newPlayer: string;
  newFlag: string;

  // NEW: Play Metadata Arrays (October 17, 2025)
  tags: string[]; // Unlimited play variations (replaces playTags)
  key_positions: string[]; // Personnel position mappings
  key_players: string[]; // Roster player UUIDs
}

interface UsePlayFormStateOptions {
  existingPlay?: Play | null;
}

const DEFAULT_FORM_DATA: PlayFormData = {
  // Basic fields
  formation: "",
  formation_id: null,
  formation_direction: null,
  formationShowInName: false,
  playName: "",
  playShowInName: false,
  personnel: "",
  playType: "",

  // Formation details
  formationType: "",
  formationDir: "",
  backAlign: "",
  backLeftOfQb: false,
  backRightOfQb: false,
  shift: "",
  motion: "",
  formationTags: "",
  runStrength: "",
  passStrength: "",

  // Play details
  playDir: "",
  protection: "",
  checkInto: "",
  playTags: "",

  // Preferences
  prefDown: "",
  prefDistance: "",
  prefHash: "",
  prefCoverage: "",
  prefFront: "",
  prefFieldPos: "",
  prefSituation: "",

  // Other
  confidence: 75,
  oneWordPlay: "",
  wristbandNumber: "",
  description: "",

  // Play diagram upload
  diagram_image_url: null,

  // Tags & Roles (LEGACY)
  positions: [],
  players: [],
  flags: [],
  newPosition: "",
  newPlayer: "",
  newFlag: "",

  // NEW: Play Metadata Arrays
  tags: [],
  key_positions: [],
  key_players: [],
};

function buildBasicFields(play: Play): Partial<PlayFormData> {
  return {
    formation: play.formation ?? "",
    formation_id: play.formation_id ?? null,
    formation_direction: play.formation_direction ?? null,
    playName: play.play_name ?? "",
    personnel: play.personnel ?? "",
    playType: play.p_type ?? "",
  };
}

function buildFormationDetails(play: Play): Partial<PlayFormData> {
  return {
    formationType: play.f_type ?? "",
    formationDir: play.f_dir ?? "",
    backAlign: play.back_align ?? "",
    backLeftOfQb: play.back_left_of_qb ?? false,
    backRightOfQb: play.back_right_of_qb ?? false,
    shift: play.shift ?? "",
    motion: play.motion ?? "",
    formationTags: [play.ftag1, play.ftag2].filter(Boolean).join(", ") || "",
    runStrength: play.r_str ?? "",
    passStrength: play.p_str ?? "",
  };
}

function buildPlayDetails(play: Play): Partial<PlayFormData> {
  return {
    playDir: play.p_dir ?? "",
    protection: play.protection ?? "",
    checkInto: play.check_into ?? "",
    playTags: [play.p_tag1, play.p_tag2].filter(Boolean).join(", ") || "",
  };
}

function buildPreferences(play: Play): Partial<PlayFormData> {
  return {
    prefDown: play.pref_down ?? "",
    prefDistance: play.pref_dis ?? "",
    prefHash: play.pref_hash ?? "",
    prefCoverage: play.pref_cov ?? "",
    prefFront: play.pref_front ?? "",
    prefFieldPos: play.pref_field_pos ?? "",
    prefSituation: play.pref_situation ?? "",
  };
}

function buildOtherFields(play: Play): Partial<PlayFormData> {
  return {
    confidence: play.confidence_base ?? 75,
    oneWordPlay: play.one_word_play ?? "",
    wristbandNumber: play.wristband_number ?? "",
    description: play.notes ?? "",
    diagram_image_url: play.diagram_image_url ?? null,
  };
}

function buildMetadataArrays(play: Play): Partial<PlayFormData> {
  return {
    tags: play.tags ?? [],
    key_positions: play.key_positions ?? [],
    key_players: play.key_players ?? [],
  };
}

function buildInitialFormData(existingPlay?: Play | null): PlayFormData {
  if (!existingPlay) {
    return { ...DEFAULT_FORM_DATA };
  }

  return {
    ...DEFAULT_FORM_DATA,
    ...buildBasicFields(existingPlay),
    ...buildFormationDetails(existingPlay),
    ...buildPlayDetails(existingPlay),
    ...buildPreferences(existingPlay),
    ...buildOtherFields(existingPlay),
    ...buildMetadataArrays(existingPlay),
  };
}

/**
 * Custom hook for managing play form state
 * Extracted from AddNewPlayModal to reduce file complexity
 */
export const usePlayFormState = (options: UsePlayFormStateOptions = {}) => {
  const { existingPlay } = options;

  // Initialize form data from existing play or defaults
  const [formData, setFormData] = useState<PlayFormData>(() =>
    buildInitialFormData(existingPlay)
  );

  // Update specific form field
  const updateField = useCallback(
    <K extends keyof PlayFormData>(field: K, value: PlayFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<PlayFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form to defaults
  const resetForm = useCallback(() => {
    setFormData({ ...DEFAULT_FORM_DATA });
  }, []);

  // Validation helpers
  const isValid = useCallback(() => {
    // Defensive checks to ensure values are strings before calling trim()
    const formation =
      typeof formData.formation === "string" ? formData.formation : "";
    const playName =
      typeof formData.playName === "string" ? formData.playName : "";
    return formation.trim() !== "" && playName.trim() !== "";
  }, [formData.formation, formData.playName]);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    isValid,
  };
};
