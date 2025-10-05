import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Modal } from "../ui/Modal/Modal";
import type { Play } from "../../types/play";
import {
  DIRECTION_OPTIONS,
  DOWN_OPTIONS,
  DISTANCE_OPTIONS,
  HASH_OPTIONS,
} from "./play-card/constants";
import { PlaysService } from "../../services/playsService";
import { POSITION_OPTIONS } from "../../utils/localPlayFlags";

interface AddNewPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlay?: (playData: Partial<Play>) => void;
  existingPlay?: Play | null;
}

export const AddNewPlayModal: React.FC<AddNewPlayModalProps> = ({
  isOpen,
  onClose,
  onCreatePlay,
  existingPlay,
}) => {
  // Consolidated form state
  const [formData, setFormData] = useState(() => ({
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
    positions: [] as string[],
    players: [] as string[],
    flags: [] as string[],
    newPosition: "",
    newPlayer: "",
    newFlag: "",
  }));

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Fuzzy search suggestions
  const [formationSuggestions, setFormationSuggestions] = useState<string[]>(
    []
  );
  const [playNameSuggestions, setPlayNameSuggestions] = useState<string[]>([]);
  const [personnelSuggestions, setPersonnelSuggestions] = useState<string[]>(
    []
  );

  // Fuzzy search state
  const [showFormationSuggestions, setShowFormationSuggestions] =
    useState(false);
  const [showPlayNameSuggestions, setShowPlayNameSuggestions] = useState(false);
  const [showPersonnelSuggestions, setShowPersonnelSuggestions] =
    useState(false);

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [formations, playNames, personnel] = await Promise.all([
          PlaysService.getUniqueFormations(),
          PlaysService.getUniquePlayNames(),
          PlaysService.getUniquePersonnel(),
        ]);
        setFormationSuggestions(formations);
        setPlayNameSuggestions(playNames);
        setPersonnelSuggestions(personnel);
      } catch (error) {
        console.error("Failed to load suggestions:", error);
      }
    };
    loadSuggestions();
  }, []);

  // Helper to filter suggestions
  const filterSuggestions = (
    suggestions: string[],
    input: string,
    maxResults = 5
  ) => {
    if (!input.trim()) return [];
    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(input.toLowerCase())
    );
    return filtered.slice(0, maxResults);
  };

  // Initialize form when existingPlay changes
  useEffect(() => {
    if (existingPlay) {
      setFormData({
        formation: existingPlay.formation || "",
        formationShowInName: false,
        playName: existingPlay.play_name || "",
        playShowInName: false,
        personnel: existingPlay.personnel || "",
        playType: existingPlay.p_type || "",
        formationType: existingPlay.f_type || "",
        formationDir: existingPlay.f_dir || "",
        backAlign: existingPlay.back_align || "",
        shift: existingPlay.shift || "",
        motion: existingPlay.motion || "",
        formationTags:
          [existingPlay.ftag1, existingPlay.ftag2].filter(Boolean).join(", ") ||
          "",
        runStrength: existingPlay.r_str || "",
        passStrength: existingPlay.p_str || "",
        playDir: existingPlay.p_dir || "",
        protection: existingPlay.protection || "",
        playTags:
          [existingPlay.p_tag1, existingPlay.p_tag2]
            .filter(Boolean)
            .join(", ") || "",
        prefDown: existingPlay.pref_down || "",
        prefDistance: existingPlay.pref_dis || "",
        prefHash: existingPlay.pref_hash || "",
        prefCoverage: existingPlay.pref_cov || "",
        prefFront: existingPlay.pref_front || "",
        confidence: existingPlay.confidence_base || 75,
        oneWordPlay: existingPlay.one_word_play || "",
        description: existingPlay.notes || "",
        positions: [],
        players: [],
        flags: [],
        newPosition: "",
        newPlayer: "",
        newFlag: "",
      });
    } else {
      // Reset form for new play
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
      setIsAdvancedOpen(false);
    }
  }, [existingPlay]);

  // Helper to update form data
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.formation.trim()) {
      alert("Please enter a formation");
      return;
    }

    if (!formData.playName.trim()) {
      alert("Please enter a play name");
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse formation tags
      const fTags = formData.formationTags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      // Parse play tags
      const pTags = formData.playTags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      const playData = {
        formation: formData.formation.trim(),
        play_name: formData.playName.trim(),
        p_type: formData.playType || undefined,
        personnel: formData.personnel.trim() || undefined,

        // Formation fields
        f_type: formData.formationType.trim() || undefined,
        f_dir: formData.formationDir || undefined,
        back_align: formData.backAlign.trim() || undefined,
        shift: formData.shift.trim() || undefined,
        motion: formData.motion.trim() || undefined,
        ftag1: fTags[0] || undefined,
        ftag2: fTags[1] || undefined,
        r_str: formData.runStrength.trim() || undefined,
        p_str: formData.passStrength.trim() || undefined,

        // Play details fields
        p_dir: formData.playDir || undefined,
        protection: formData.protection.trim() || undefined,
        p_tag1: pTags[0] || undefined,
        p_tag2: pTags[1] || undefined,

        // Preferences
        pref_down: formData.prefDown || undefined,
        pref_dis: formData.prefDistance || undefined,
        pref_hash: formData.prefHash || undefined,
        pref_cov: formData.prefCoverage.trim() || undefined,
        pref_front: formData.prefFront.trim() || undefined,

        // Other
        confidence_base: formData.confidence,
        one_word_play: formData.oneWordPlay.trim() || undefined,
        notes: formData.description.trim() || undefined,

        // Tags & Roles
        positions: formData.positions,
        players: formData.players,
        flags: formData.flags,
      };

      await onCreatePlay?.(playData);

      // Reset form
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
      setIsAdvancedOpen(false);

      onClose();
    } catch (error) {
      console.error("Failed to create play:", error);
      alert("Failed to create play. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingPlay ? "Edit Play" : "Create New Play"}
      size="lg"
      footer={
        <div className="flex justify-end gap-spacing-sm">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              isSubmitting ||
              !formData.formation.trim() ||
              !formData.playName.trim()
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>{existingPlay ? "Updating..." : "Creating..."}</>
            ) : (
              <>
                <Icon
                  name={existingPlay ? "edit" : "plus"}
                  className="h-4 w-4 mr-spacing-xs"
                />
                {existingPlay ? "Update Play" : "Create Play"}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-spacing-lg">
        <div className="flex items-center gap-spacing-sm mb-spacing-lg">
          <div className="p-spacing-xs bg-surface-secondary rounded-lg">
            <Icon name="plus" className="h-6 w-6 text-text-primary" />
          </div>
          <div>
            <Typography variant="body-lg" className="text-text-secondary">
              {existingPlay
                ? "Update play details"
                : "Add a new play to your playbook"}
            </Typography>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formation */}
          <div>
            <Typography variant="label-md" className="block mb-3">
              Formation *
            </Typography>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.formation}
                  onChange={(e) =>
                    updateFormData({ formation: e.target.value })
                  }
                  onFocus={() => setShowFormationSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowFormationSuggestions(false), 200)
                  }
                  placeholder="e.g., Shotgun, Empty, Pistol"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  required
                />
                {showFormationSuggestions &&
                  filterSuggestions(formationSuggestions, formData.formation)
                    .length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-surface-primary border border-border-medium rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {filterSuggestions(
                        formationSuggestions,
                        formData.formation
                      ).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            updateFormData({ formation: suggestion });
                            setShowFormationSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-surface-secondary/50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    formData.formationDir === "Left" ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateFormData({
                      formationDir:
                        formData.formationDir === "Left" ? "" : "Left",
                    })
                  }
                  className="px-3"
                >
                  Left
                </Button>
                <Button
                  type="button"
                  variant={
                    formData.formationDir === "Right" ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateFormData({
                      formationDir:
                        formData.formationDir === "Right" ? "" : "Right",
                    })
                  }
                  className="px-3"
                >
                  Right
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateFormData({
                      formationShowInName: !formData.formationShowInName,
                    })
                  }
                  className={`p-2 ${formData.formationShowInName ? "text-text-info" : "text-text-muted"}`}
                >
                  <Icon name="eye" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Play */}
          <div>
            <Typography variant="label-md" className="block mb-3">
              Play *
            </Typography>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.playName}
                  onChange={(e) => updateFormData({ playName: e.target.value })}
                  onFocus={() => setShowPlayNameSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowPlayNameSuggestions(false), 200)
                  }
                  placeholder="e.g., Power Read, Slant Route, Zone Blitz"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                  required
                />
                {showPlayNameSuggestions &&
                  filterSuggestions(playNameSuggestions, formData.playName)
                    .length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-surface-primary border border-border-medium rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {filterSuggestions(
                        playNameSuggestions,
                        formData.playName
                      ).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            updateFormData({ playName: suggestion });
                            setShowPlayNameSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-surface-secondary/50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.playDir === "Left" ? "primary" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateFormData({
                      playDir: formData.playDir === "Left" ? "" : "Left",
                    })
                  }
                  className="px-3"
                >
                  Left
                </Button>
                <Button
                  type="button"
                  variant={formData.playDir === "Right" ? "primary" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateFormData({
                      playDir: formData.playDir === "Right" ? "" : "Right",
                    })
                  }
                  className="px-3"
                >
                  Right
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateFormData({ playShowInName: !formData.playShowInName })
                  }
                  className={`p-2 ${formData.playShowInName ? "text-text-info" : "text-text-muted"}`}
                >
                  <Icon name="eye" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Personnel */}
          <div>
            <Typography variant="label-md" className="block mb-3">
              Personnel
            </Typography>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.personnel}
                  onChange={(e) =>
                    updateFormData({ personnel: e.target.value })
                  }
                  onFocus={() => setShowPersonnelSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowPersonnelSuggestions(false), 200)
                  }
                  placeholder="e.g., 11 Personnel, 12 Personnel"
                  className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                />
                {showPersonnelSuggestions &&
                  filterSuggestions(personnelSuggestions, formData.personnel)
                    .length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-surface-primary border border-border-medium rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {filterSuggestions(
                        personnelSuggestions,
                        formData.personnel
                      ).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            updateFormData({ personnel: suggestion });
                            setShowPersonnelSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-surface-secondary/50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "11 Personnel",
                "12 Personnel",
                "21 Personnel",
                "22 Personnel",
              ].map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={formData.personnel === p ? "primary" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateFormData({
                      personnel: formData.personnel === p ? "" : p,
                    })
                  }
                >
                  {p}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Navigate to settings to add new personnel
                  alert("Navigate to settings to add new personnel");
                }}
                className="border-dashed"
              >
                <Icon name="plus" className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
          </div>

          {/* Play Type */}
          <div>
            <Typography variant="label-md" className="block mb-spacing-sm">
              Play Type
            </Typography>
            <div className="flex flex-wrap gap-spacing-xs">
              {["Run", "Pass", "RPO", "Screen", "Boot"].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={formData.playType === type ? "primary" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateFormData({
                      playType: formData.playType === type ? "" : type,
                    })
                  }
                >
                  {type}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Add new play type
                  alert("Add new play type functionality");
                }}
                className="border-dashed"
              >
                <Icon name="plus" className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
          </div>

          {/* Advanced Section */}
          <div className="border-t border-border-medium pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full justify-between p-0 h-auto"
            >
              <Typography variant="label-md">Advanced Options</Typography>
              <Icon
                name={isAdvancedOpen ? "chevron-up" : "chevron-down"}
                className="h-5 w-5"
              />
            </Button>

            {isAdvancedOpen && (
              <div className="space-y-6 mt-6">
                {/* Formation Details */}
                <div className="bg-surface-secondary/30 rounded-lg p-4">
                  <Typography
                    variant="label-lg"
                    className="flex items-center mb-3 text-text-primary"
                  >
                    <Icon name="target" className="h-4 w-4 mr-2" />
                    Formation Details
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Formation Type
                      </Typography>
                      <input
                        type="text"
                        value={formData.formationType}
                        onChange={(e) =>
                          updateFormData({ formationType: e.target.value })
                        }
                        placeholder="e.g., Spread, Tight"
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      />
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Direction
                      </Typography>
                      <select
                        value={formData.formationDir}
                        onChange={(e) =>
                          updateFormData({ formationDir: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      >
                        <option value="">None</option>
                        {DIRECTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Backfield & Motion
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={formData.backAlign}
                          onChange={(e) =>
                            updateFormData({ backAlign: e.target.value })
                          }
                          placeholder="Backfield alignment"
                          className="px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                        />
                        <input
                          type="text"
                          value={formData.shift}
                          onChange={(e) =>
                            updateFormData({ shift: e.target.value })
                          }
                          placeholder="Pre-snap shift"
                          className="px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                        />
                        <input
                          type="text"
                          value={formData.motion}
                          onChange={(e) =>
                            updateFormData({ motion: e.target.value })
                          }
                          placeholder="Pre-snap motion"
                          className="px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                        />
                      </div>
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Formation Tags
                      </Typography>
                      <input
                        type="text"
                        value={formData.formationTags}
                        onChange={(e) =>
                          updateFormData({ formationTags: e.target.value })
                        }
                        placeholder="e.g., Nickel, Dime"
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      />
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Strength
                      </Typography>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formData.runStrength}
                          onChange={(e) =>
                            updateFormData({ runStrength: e.target.value })
                          }
                          placeholder="Run strength"
                          className="px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                        />
                        <input
                          type="text"
                          value={formData.passStrength}
                          onChange={(e) =>
                            updateFormData({ passStrength: e.target.value })
                          }
                          placeholder="Pass strength"
                          className="px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Play Details */}
                <div className="bg-surface-secondary/30 rounded-lg p-4">
                  <Typography
                    variant="label-lg"
                    className="flex items-center mb-3 text-text-primary"
                  >
                    <Icon name="hash" className="h-4 w-4 mr-2" />
                    Play Details
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Direction
                      </Typography>
                      <select
                        value={formData.playDir}
                        onChange={(e) =>
                          updateFormData({ playDir: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      >
                        <option value="">None</option>
                        {DIRECTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Pass Protection
                      </Typography>
                      <input
                        type="text"
                        value={formData.protection}
                        onChange={(e) =>
                          updateFormData({ protection: e.target.value })
                        }
                        placeholder="e.g., 5-man, Slide"
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Play Tags
                      </Typography>
                      <input
                        type="text"
                        value={formData.playTags}
                        onChange={(e) =>
                          updateFormData({ playTags: e.target.value })
                        }
                        placeholder="e.g., Red Zone, 3rd&Short"
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-surface-secondary/30 rounded-lg p-4">
                  <Typography
                    variant="label-lg"
                    className="block mb-3 text-text-primary"
                  >
                    Situational Preferences
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Down
                      </Typography>
                      <select
                        value={formData.prefDown}
                        onChange={(e) =>
                          updateFormData({ prefDown: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      >
                        <option value="">Any</option>
                        {DOWN_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Distance
                      </Typography>
                      <select
                        value={formData.prefDistance}
                        onChange={(e) =>
                          updateFormData({ prefDistance: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      >
                        <option value="">Any</option>
                        {DISTANCE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Hash
                      </Typography>
                      <select
                        value={formData.prefHash}
                        onChange={(e) =>
                          updateFormData({ prefHash: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      >
                        <option value="">Any</option>
                        {HASH_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Coverage
                      </Typography>
                      <input
                        type="text"
                        value={formData.prefCoverage}
                        onChange={(e) =>
                          updateFormData({ prefCoverage: e.target.value })
                        }
                        placeholder="e.g., Man, Zone"
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      />
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Defensive Front
                      </Typography>
                      <input
                        type="text"
                        value={formData.prefFront}
                        onChange={(e) =>
                          updateFormData({ prefFront: e.target.value })
                        }
                        placeholder="e.g., 4-3, 3-4"
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      />
                    </div>
                  </div>
                </div>

                {/* Confidence */}
                <div className="bg-surface-secondary/30 rounded-lg p-4">
                  <Typography
                    variant="label-lg"
                    className="block mb-3 text-text-primary"
                  >
                    Confidence Level
                  </Typography>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Typography
                        variant="body-sm"
                        className="text-text-secondary"
                      >
                        How confident are you in this play?
                      </Typography>
                      <span className="text-sm font-medium text-text-primary bg-surface-primary px-2 py-1 rounded">
                        {formData.confidence}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.confidence}
                      onChange={(e) =>
                        updateFormData({ confidence: Number(e.target.value) })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Roles */}
                <div className="bg-surface-secondary/30 rounded-lg p-4">
                  <Typography
                    variant="label-lg"
                    className="flex items-center mb-3 text-text-primary"
                  >
                    <Icon name="tag" className="h-4 w-4 mr-2" />
                    Tags & Roles
                  </Typography>
                  <div className="space-y-4">
                    {/* Positions */}
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-2 text-text-secondary"
                      >
                        Key Positions
                      </Typography>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.positions.map((pos: string) => (
                          <span
                            key={pos}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-text-info/10 text-text-info rounded-full"
                          >
                            {pos}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={formData.newPosition}
                          onChange={(e) =>
                            updateFormData({ newPosition: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!formData.newPosition) return;
                              if (
                                !formData.positions.includes(
                                  formData.newPosition
                                )
                              ) {
                                updateFormData({
                                  positions: [
                                    ...formData.positions,
                                    formData.newPosition,
                                  ],
                                });
                              }
                              updateFormData({ newPosition: "" });
                            } else if (e.key === "Escape") {
                              updateFormData({ newPosition: "" });
                            }
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                        >
                          <option value="">Add position...</option>
                          {POSITION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!formData.newPosition) return;
                            if (
                              !formData.positions.includes(formData.newPosition)
                            ) {
                              updateFormData({
                                positions: [
                                  ...formData.positions,
                                  formData.newPosition,
                                ],
                              });
                            }
                            updateFormData({ newPosition: "" });
                          }}
                          disabled={!formData.newPosition}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Players */}
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-2 text-text-secondary"
                      >
                        Key Players
                      </Typography>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.players.map((pl: string) => (
                          <span
                            key={pl}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-text-success/10 text-text-success rounded-full"
                          >
                            {pl}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={formData.newPlayer}
                          onChange={(e) =>
                            updateFormData({ newPlayer: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!formData.newPlayer.trim()) return;
                              const player = formData.newPlayer.trim();
                              if (!formData.players.includes(player)) {
                                updateFormData({
                                  players: [...formData.players, player],
                                });
                              }
                              updateFormData({ newPlayer: "" });
                            } else if (e.key === "Escape") {
                              updateFormData({ newPlayer: "" });
                            }
                          }}
                          placeholder="Add player (e.g., Z, WR1)"
                          className="flex-1 px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!formData.newPlayer.trim()) return;
                            const player = formData.newPlayer.trim();
                            if (!formData.players.includes(player)) {
                              updateFormData({
                                players: [...formData.players, player],
                              });
                            }
                            updateFormData({ newPlayer: "" });
                          }}
                          disabled={!formData.newPlayer.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Flags */}
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-2 text-text-secondary"
                      >
                        Special Tags
                      </Typography>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.flags.map((fl: string) => (
                          <span
                            key={fl}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-text-warning/10 text-text-warning rounded-full"
                          >
                            {fl}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={formData.newFlag}
                          onChange={(e) =>
                            updateFormData({ newFlag: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!formData.newFlag.trim()) return;
                              const flag = formData.newFlag.trim();
                              if (!formData.flags.includes(flag)) {
                                updateFormData({
                                  flags: [...formData.flags, flag],
                                });
                              }
                              updateFormData({ newFlag: "" });
                            } else if (e.key === "Escape") {
                              updateFormData({ newFlag: "" });
                            }
                          }}
                          placeholder="Add tag (e.g., Red Zone)"
                          className="flex-1 px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!formData.newFlag.trim()) return;
                            const flag = formData.newFlag.trim();
                            if (!formData.flags.includes(flag)) {
                              updateFormData({
                                flags: [...formData.flags, flag],
                              });
                            }
                            updateFormData({ newFlag: "" });
                          }}
                          disabled={!formData.newFlag.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-surface-secondary/30 rounded-lg p-4">
                  <Typography
                    variant="label-lg"
                    className="block mb-3 text-text-primary"
                  >
                    Additional Information
                  </Typography>
                  <div className="space-y-3">
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        One Word Call
                      </Typography>
                      <input
                        type="text"
                        value={formData.oneWordPlay}
                        onChange={(e) =>
                          updateFormData({ oneWordPlay: e.target.value })
                        }
                        placeholder="e.g., POWER, SLANT"
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
                      />
                    </div>
                    <div>
                      <Typography
                        variant="label-md"
                        className="block mb-1 text-text-secondary"
                      >
                        Description
                      </Typography>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          updateFormData({ description: e.target.value })
                        }
                        placeholder="Brief description of the play..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-border-medium rounded-md focus:ring-2 focus:ring-text-info focus:border-surface-primary/0 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
