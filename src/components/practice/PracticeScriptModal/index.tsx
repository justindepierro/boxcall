import React, { useState } from "react";
import { Button } from "../../ui/Button/Button";
import { PracticeScriptForm } from "./components/PracticeScriptForm";
import { PracticeScriptPlayList } from "./components/PracticeScriptPlayList";

import type {
  PracticeScript,
  PracticeScriptFormData,
  PracticeScriptPlay,
} from "./types";

interface PracticeScriptModalProps {
  onClose: () => void;
  onSave: (script: PracticeScript) => void;
  initialScript?: Partial<PracticeScript>;
}

export const PracticeScriptModal: React.FC<PracticeScriptModalProps> = ({
  onClose,
  onSave,
  initialScript,
}) => {
  const [scriptData, setScriptData] = useState<PracticeScriptFormData>({
    name: initialScript?.name || "",
    date: initialScript?.date,
    opponent: initialScript?.opponent,
  });

  const [plays, setPlays] = useState<PracticeScriptPlay[]>(
    initialScript?.plays || []
  );

  const handleSave = () => {
    if (!scriptData.name.trim()) {
      // TODO: Show validation error
      return;
    }

    const script: PracticeScript = {
      id: initialScript?.id || crypto.randomUUID(),
      name: scriptData.name,
      date: scriptData.date,
      opponent: scriptData.opponent,
      plays,
      createdAt: initialScript?.createdAt || new Date(),
      updatedAt: new Date(),
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
            <h2 className="text-xl font-semibold">Create Practice Script</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Script Form */}
          <PracticeScriptForm data={scriptData} onChange={setScriptData} />

          {/* Play List */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Practice Plays</h3>
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
              Save Script
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
