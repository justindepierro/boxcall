import React, { useState, useEffect } from "react";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon";
import { Typography } from "../../design-system/Typography";
import { PracticeScriptForm } from "./components/PracticeScriptForm";
import { PracticeScriptPlayList } from "./components/PracticeScriptPlayList";
import {
  validateScript,
  hasValidationErrors,
  getFirstError,
} from "./validation";

import type { PracticeScript } from "../../../services/practiceService";
import type { PracticeScriptPlay as ServicePracticeScriptPlay } from "../../../services/practiceService";
import type { PracticeScriptFormData, PracticeScriptPlay } from "./types";
import type { Play } from "../../../types/play";

interface PracticeScriptModalProps {
  onClose: () => void;
  onSave: (script: Partial<PracticeScript>) => void;
  editingScript?: PracticeScript; // From PracticeService
}

export const PracticeScriptModal: React.FC<PracticeScriptModalProps> = ({
  onClose,
  onSave,
  editingScript,
}) => {
  console.log("🎬 PracticeScriptModal rendering", { editingScript });
  const isEditMode = !!editingScript;

  const [scriptData, setScriptData] = useState<PracticeScriptFormData>({
    name: "",
    date: undefined,
    opponent: "",
  });

  const [plays, setPlays] = useState<PracticeScriptPlay[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-populate form when editing
  useEffect(() => {
    if (editingScript) {
      setScriptData({
        name: editingScript.title || editingScript.name || "",
        date: editingScript.createdAt
          ? new Date(editingScript.createdAt).toISOString().split("T")[0]
          : undefined,
        opponent: editingScript.description || "",
      });

      // Convert service plays to modal plays
      const modalPlays: PracticeScriptPlay[] = (editingScript.plays || []).map(
        (play) => ({
          id: play.id,
          playId: play.playId,
          playName: play.play?.play_name || "Unknown Play",
          personnel: play.play?.personnel,
          notes: play.notes || "",
          defenseFront: play.defensiveFront || "",
          defensiveCoverage: play.coverage || "",
          blitz: play.blitz || "",
          stunt: "", // Not in service type
          hash: play.hash || "",
          situation: play.downDistance || "",
        })
      );

      setPlays(modalPlays);
      setTags(editingScript.tags || []);
    }
  }, [editingScript]);

  const handleSave = () => {
    // Clear previous errors
    setValidationError(null);

    // Validate script
    const errors = validateScript(scriptData, plays);

    if (hasValidationErrors(errors)) {
      const firstError = getFirstError(errors);
      setValidationError(firstError || "Please fix validation errors");
      console.warn("Validation errors:", errors);
      return;
    }

    setIsSaving(true);

    const servicePlays: ServicePracticeScriptPlay[] = plays
      .filter((p) => typeof p.playId === "string" && p.playId.trim() !== "")
      .map((p, index) => {
        const hash =
          p.hash === "left" || p.hash === "middle" || p.hash === "right"
            ? p.hash
            : undefined;

        const coverage =
          p.defensiveCoverage === "cover_0" ||
          p.defensiveCoverage === "cover_1" ||
          p.defensiveCoverage === "cover_2" ||
          p.defensiveCoverage === "cover_3" ||
          p.defensiveCoverage === "cover_4" ||
          p.defensiveCoverage === "cover_6" ||
          p.defensiveCoverage === "quarters" ||
          p.defensiveCoverage === "man"
            ? p.defensiveCoverage
            : undefined;

        const defensiveFront =
          p.defenseFront === "base" ||
          p.defenseFront === "4-3" ||
          p.defenseFront === "3-4" ||
          p.defenseFront === "nickel" ||
          p.defenseFront === "dime" ||
          p.defenseFront === "bear" ||
          p.defenseFront === "tite"
            ? p.defenseFront
            : undefined;

        const blitz =
          p.blitz === "none" ||
          p.blitz === "edge" ||
          p.blitz === "a_gap" ||
          p.blitz === "b_gap" ||
          p.blitz === "sim_pressure" ||
          p.blitz === "zone_blitz" ||
          p.blitz === "all_out"
            ? p.blitz
            : undefined;

        const minimalPlay = {
          id: p.playId!,
          play_name: p.playName,
          personnel: p.personnel || null,
        } as unknown as Play;

        return {
          id: p.id,
          playId: p.playId!,
          play: minimalPlay,
          order: index,
          notes: p.notes || undefined,
          repetitions: 1,
          hash,
          downDistance: p.situation || undefined,
          defensiveFront,
          coverage,
          blitz,
          addedAt: new Date(),
        };
      });

    const script: Partial<PracticeScript> = {
      id: editingScript?.id,
      title: scriptData.name,
      name: scriptData.name,
      description: scriptData.opponent || undefined,
      tags: tags.length > 0 ? tags : undefined,
      plays: servicePlays, // Normalize to service type for downstream save
    };

    console.log("💾 Saving script with plays:", {
      script,
      playCount: plays.length,
    });

    try {
      onSave(script);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPlay = (play: PracticeScriptPlay) => {
    setPlays((prev) => [...prev, play]);
  };

  const handleUpdatePlay = (index: number, play: PracticeScriptPlay) => {
    setPlays((prev) => prev.map((p, i) => (i === index ? play : p)));
  };

  const handleDeletePlay = (index: number) => {
    setPlays((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-neutral-200 dark:border-navy-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200 dark:border-navy-700">
            <Typography variant="headline-lg" className="text-primary">
              {isEditMode ? "Edit Practice Script" : "Create Practice Script"}
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-neutral-100 dark:hover:bg-navy-800"
            >
              <Icon name="close" className="h-5 w-5" />
            </Button>
          </div>

          {/* Script Form */}
          <div className="bg-neutral-50 dark:bg-navy-800 p-4 rounded-lg">
            <PracticeScriptForm
              data={scriptData}
              onChange={setScriptData}
              tags={tags}
              onTagsChange={setTags}
            />
          </div>

          {/* Play List */}
          <div className="mt-6 bg-neutral-50 dark:bg-navy-800 p-4 rounded-lg">
            <Typography
              variant="headline-md"
              className="mb-4 text-navy-900 dark:text-white"
            >
              Practice Plays
            </Typography>
            <PracticeScriptPlayList
              plays={plays}
              onAddPlay={handleAddPlay}
              onUpdatePlay={handleUpdatePlay}
              onDeletePlay={handleDeletePlay}
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mt-4 p-3 bg-error-bg border border-error rounded-lg">
              <div className="flex items-start gap-2">
                <Icon
                  name="alert-circle"
                  className="h-5 w-5 text-error mt-0.5"
                />
                <Typography variant="body-sm" className="text-error">
                  {validationError}
                </Typography>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-navy-700 mt-6">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Icon
                    name="loader-2"
                    className="animate-spin mr-2"
                    size={16}
                  />
                  Saving...
                </>
              ) : (
                <>{isEditMode ? "Update Script" : "Create Script"}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
