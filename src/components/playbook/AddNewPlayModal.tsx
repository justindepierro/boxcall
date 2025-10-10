import React, { useState } from "react";
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
import { POSITION_OPTIONS } from "../../utils/localPlayFlags";
import { usePlayFormState } from "./AddNewPlayModal/usePlayFormState";
import { usePlaySuggestions } from "./AddNewPlayModal/usePlaySuggestions";
import {
  FormationSection,
  PlayNameSection,
  PersonnelSection,
  PlayTypeSection,
  PreferencesSection,
  AdvancedOptionsSection,
} from "./AddNewPlayModal/sections";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Use extracted hooks
  const { formData, updateField, updateFields, resetForm, isValid } =
    usePlayFormState({ existingPlay });

  const {
    suggestions,
    showSuggestions,
    hideSuggestions,
    isSuggestionsVisible,
  } = usePlaySuggestions();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid()) {
      alert("Please enter formation and play name");
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
      resetForm();
      setIsAdvancedOpen(false);
      onClose();
    } catch (error) {
      console.error("Failed to create play:", error);
      alert("Failed to create play. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for advanced section
  const handleAddPosition = () => {
    if (!formData.newPosition) return;
    if (!formData.positions.includes(formData.newPosition)) {
      updateFields({
        positions: [...formData.positions, formData.newPosition],
        newPosition: "",
      });
    }
  };

  const handleAddPlayer = () => {
    if (!formData.newPlayer.trim()) return;
    const player = formData.newPlayer.trim();
    if (!formData.players.includes(player)) {
      updateFields({
        players: [...formData.players, player],
        newPlayer: "",
      });
    }
  };

  const handleAddFlag = () => {
    if (!formData.newFlag.trim()) return;
    const flag = formData.newFlag.trim();
    if (!formData.flags.includes(flag)) {
      updateFields({
        flags: [...formData.flags, flag],
        newFlag: "",
      });
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
            disabled={isSubmitting || !isValid()}
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

        <form onSubmit={handleSubmit} className="space-y-spacing-lg">
          {/* Formation Section */}
          <FormationSection
            formation={formData.formation}
            formationDir={formData.formationDir}
            formationShowInName={formData.formationShowInName}
            onFormationChange={(value) => updateField("formation", value)}
            onFormationDirChange={(value) => updateField("formationDir", value)}
            onFormationShowInNameChange={(value) =>
              updateField("formationShowInName", value)
            }
            suggestions={suggestions.formations}
            showSuggestions={isSuggestionsVisible("formation")}
            onShowSuggestionsChange={(show) =>
              show ? showSuggestions("formation") : hideSuggestions("formation")
            }
          />

          {/* Play Name Section */}
          <PlayNameSection
            playName={formData.playName}
            playDir={formData.playDir}
            playShowInName={formData.playShowInName}
            onPlayNameChange={(value) => updateField("playName", value)}
            onPlayDirChange={(value) => updateField("playDir", value)}
            onPlayShowInNameChange={(value) =>
              updateField("playShowInName", value)
            }
            suggestions={suggestions.playNames}
            showSuggestions={isSuggestionsVisible("playName")}
            onShowSuggestionsChange={(show) =>
              show ? showSuggestions("playName") : hideSuggestions("playName")
            }
          />

          {/* Personnel Section */}
          <PersonnelSection
            personnel={formData.personnel}
            onPersonnelChange={(value) => updateField("personnel", value)}
            suggestions={suggestions.personnel}
            showSuggestions={isSuggestionsVisible("personnel")}
            onShowSuggestionsChange={(show) =>
              show ? showSuggestions("personnel") : hideSuggestions("personnel")
            }
          />

          {/* Play Type Section */}
          <PlayTypeSection
            playType={formData.playType}
            onPlayTypeChange={(value) => updateField("playType", value)}
          />

          {/* Preferences Section */}
          <PreferencesSection
            prefDown={formData.prefDown}
            prefDistance={formData.prefDistance}
            prefHash={formData.prefHash}
            prefCoverage={formData.prefCoverage}
            prefFront={formData.prefFront}
            onPrefDownChange={(value) => updateField("prefDown", value)}
            onPrefDistanceChange={(value) => updateField("prefDistance", value)}
            onPrefHashChange={(value) => updateField("prefHash", value)}
            onPrefCoverageChange={(value) => updateField("prefCoverage", value)}
            onPrefFrontChange={(value) => updateField("prefFront", value)}
            downOptions={DOWN_OPTIONS}
            distanceOptions={DISTANCE_OPTIONS}
            hashOptions={HASH_OPTIONS}
          />

          {/* Advanced Options Section */}
          <AdvancedOptionsSection
            isOpen={isAdvancedOpen}
            onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
            // Formation details
            formationType={formData.formationType}
            formationDir={formData.formationDir}
            backAlign={formData.backAlign}
            shift={formData.shift}
            motion={formData.motion}
            formationTags={formData.formationTags}
            runStrength={formData.runStrength}
            passStrength={formData.passStrength}
            onFormationTypeChange={(value) =>
              updateField("formationType", value)
            }
            onFormationDirChange={(value) => updateField("formationDir", value)}
            onBackAlignChange={(value) => updateField("backAlign", value)}
            onShiftChange={(value) => updateField("shift", value)}
            onMotionChange={(value) => updateField("motion", value)}
            onFormationTagsChange={(value) =>
              updateField("formationTags", value)
            }
            onRunStrengthChange={(value) => updateField("runStrength", value)}
            onPassStrengthChange={(value) => updateField("passStrength", value)}
            // Play details
            playDir={formData.playDir}
            protection={formData.protection}
            playTags={formData.playTags}
            onPlayDirChange={(value) => updateField("playDir", value)}
            onProtectionChange={(value) => updateField("protection", value)}
            onPlayTagsChange={(value) => updateField("playTags", value)}
            // Confidence
            confidence={formData.confidence}
            onConfidenceChange={(value) => updateField("confidence", value)}
            // Tags & Roles
            positions={formData.positions}
            players={formData.players}
            flags={formData.flags}
            newPosition={formData.newPosition}
            newPlayer={formData.newPlayer}
            newFlag={formData.newFlag}
            onNewPositionChange={(value) => updateField("newPosition", value)}
            onNewPlayerChange={(value) => updateField("newPlayer", value)}
            onNewFlagChange={(value) => updateField("newFlag", value)}
            onAddPosition={handleAddPosition}
            onAddPlayer={handleAddPlayer}
            onAddFlag={handleAddFlag}
            // Additional info
            oneWordPlay={formData.oneWordPlay}
            description={formData.description}
            onOneWordPlayChange={(value) => updateField("oneWordPlay", value)}
            onDescriptionChange={(value) => updateField("description", value)}
            // Constants
            directionOptions={DIRECTION_OPTIONS}
            positionOptions={POSITION_OPTIONS}
          />
        </form>
      </div>
    </Modal>
  );
};
