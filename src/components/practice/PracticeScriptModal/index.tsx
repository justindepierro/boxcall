import React, { useState, useEffect } from "react";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { PracticeScriptForm } from "./components/PracticeScriptForm";
import { PracticeScriptPlayList } from "./components/PracticeScriptPlayList";

import type { PracticeScript } from "../../../services/practiceService";
import type { PracticeScriptFormData, PracticeScriptPlay } from "./types";

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
  const isEditMode = !!editingScript;

  const [scriptData, setScriptData] = useState<PracticeScriptFormData>({
    name: "",
    date: undefined,
    opponent: "",
  });

  const [plays, setPlays] = useState<PracticeScriptPlay[]>([]);
  const [tags, setTags] = useState<string[]>([]);

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
    if (!scriptData.name.trim()) {
      // TODO: Show validation error
      return;
    }

    const script: Partial<PracticeScript> = {
      id: editingScript?.id,
      title: scriptData.name,
      name: scriptData.name,
      description: scriptData.opponent || undefined,
      tags: tags.length > 0 ? tags : undefined,
      // Note: plays will be handled separately via PracticeService.addPlayToScript
      // for now we're just saving the script metadata
    };

    onSave(script);
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
      className="fixed inset-0 bg-text-primary bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="surface-card elevation-modal rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bc-card-padding">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isEditMode ? "Edit Practice Script" : "Create Practice Script"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Script Form */}
          <PracticeScriptForm
            data={scriptData}
            onChange={setScriptData}
            tags={tags}
            onTagsChange={setTags}
          />

          {/* Play List */}
          <div className="mt-6">
            <Typography variant="headline-md" className="mb-4">
              Practice Plays
            </Typography>
            <PracticeScriptPlayList
              plays={plays}
              onAddPlay={handleAddPlay}
              onUpdatePlay={handleUpdatePlay}
              onDeletePlay={handleDeletePlay}
            />
          </div>

          {/* Action Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-subtle mt-6">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {isEditMode ? "Update Script" : "Create Script"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
