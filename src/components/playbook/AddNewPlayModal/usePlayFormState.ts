import { useState, useCallback } from "react";
import type { Play } from "../../../types/play";

export interface PlayFormData {
  // Basic fields
  formation: string;
  formationShowInName: boolean;
  playName: string;
  playShowInName: boolean;
  personnel: string;
  playType: string;

  // Formation details
  formationType: string;
  formationDir: string;
  backAlign: string;
  shift: string;
  motion: string;
  formationTags: string;
  runStrength: string;
  passStrength: string;

  // Play details
  playDir: string;
  protection: string;
  playTags: string;

  // Preferences
  prefDown: string;
  prefDistance: string;
  prefHash: string;
  prefCoverage: string;
  prefFront: string;

  // Other
  confidence: number;
  oneWordPlay: string;
  description: string;

  // Tags & Roles
  positions: string[];
  players: string[];
  flags: string[];
  newPosition: string;
  newPlayer: string;
  newFlag: string;
}

interface UsePlayFormStateOptions {
  existingPlay?: Play | null;
}

/**
 * Custom hook for managing play form state
 * Extracted from AddNewPlayModal to reduce file complexity
 */
export const usePlayFormState = (options: UsePlayFormStateOptions = {}) => {
  const { existingPlay } = options;

  // Initialize form data from existing play or defaults
  const [formData, setFormData] = useState<PlayFormData>(() => ({
    // Basic fields
    formation: existingPlay?.formation || "",
    formationShowInName: false,
    playName: existingPlay?.play_name || "",
    playShowInName: false,
    personnel: existingPlay?.personnel || "",
    playType: existingPlay?.p_type || "",

    // Formation details
    formationType: existingPlay?.f_type || "",
    formationDir: existingPlay?.f_dir || "",
    backAlign: existingPlay?.back_align || "",
    shift: existingPlay?.shift || "",
    motion: existingPlay?.motion || "",
    formationTags:
      [existingPlay?.ftag1, existingPlay?.ftag2].filter(Boolean).join(", ") ||
      "",
    runStrength: existingPlay?.r_str || "",
    passStrength: existingPlay?.p_str || "",

    // Play details
    playDir: existingPlay?.p_dir || "",
    protection: existingPlay?.protection || "",
    playTags:
      [existingPlay?.p_tag1, existingPlay?.p_tag2].filter(Boolean).join(", ") ||
      "",

    // Preferences
    prefDown: existingPlay?.pref_down || "",
    prefDistance: existingPlay?.pref_dis || "",
    prefHash: existingPlay?.pref_hash || "",
    prefCoverage: existingPlay?.pref_cov || "",
    prefFront: existingPlay?.pref_front || "",

    // Other
    confidence: existingPlay?.confidence_base || 75,
    oneWordPlay: existingPlay?.one_word_play || "",
    description: existingPlay?.notes || "",

    // Tags & Roles
    positions: [],
    players: [],
    flags: [],
    newPosition: "",
    newPlayer: "",
    newFlag: "",
  }));

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
    setFormData({
      formation: "",
      formationShowInName: false,
      playName: "",
      playShowInName: false,
      personnel: "",
      playType: "",
      formationType: "",
      formationDir: "",
      backAlign: "",
      shift: "",
      motion: "",
      formationTags: "",
      runStrength: "",
      passStrength: "",
      playDir: "",
      protection: "",
      playTags: "",
      prefDown: "",
      prefDistance: "",
      prefHash: "",
      prefCoverage: "",
      prefFront: "",
      confidence: 75,
      oneWordPlay: "",
      description: "",
      positions: [],
      players: [],
      flags: [],
      newPosition: "",
      newPlayer: "",
      newFlag: "",
    });
  }, []);

  // Validation helpers
  const isValid = useCallback(() => {
    return formData.formation.trim() !== "" && formData.playName.trim() !== "";
  }, [formData.formation, formData.playName]);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    isValid,
  };
};
