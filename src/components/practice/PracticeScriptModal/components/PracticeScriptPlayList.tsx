import React, { useState } from "react";
import { Button } from "../../../ui/Button/Button";
import { Typography } from "../../../design-system/Typography";
import { PracticeScriptPlayForm } from "./PracticeScriptPlayForm";

import type { PracticeScriptPlay } from "../types";

interface PracticeScriptPlayListProps {
  plays: PracticeScriptPlay[];
  onAddPlay: (play: PracticeScriptPlay) => void;
  onUpdatePlay: (index: number, play: PracticeScriptPlay) => void;
  onDeletePlay: (index: number) => void;
}

export const PracticeScriptPlayList: React.FC<PracticeScriptPlayListProps> = ({
  plays,
  onAddPlay,
  onUpdatePlay,
  onDeletePlay,
}) => {
  const [isAddingPlay, setIsAddingPlay] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddPlay = (playData: Omit<PracticeScriptPlay, "id">) => {
    const newPlay: PracticeScriptPlay = {
      ...playData,
      id: crypto.randomUUID(),
    };
    onAddPlay(newPlay);
    setIsAddingPlay(false);
  };

  const handleUpdatePlay = (playData: Omit<PracticeScriptPlay, "id">) => {
    if (editingIndex !== null) {
      const updatedPlay: PracticeScriptPlay = {
        ...playData,
        id: plays[editingIndex].id,
      };
      onUpdatePlay(editingIndex, updatedPlay);
      setEditingIndex(null);
    }
  };

  const handleCancel = () => {
    setIsAddingPlay(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Play List */}
      {plays.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          No plays added yet. Click "Add Play" to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {plays.map((play, index) => (
            <div key={play.id} className="border border-subtle rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{play.playName}</h4>
                  {play.personnel && (
                    <Typography variant="body-sm" color="muted">
                      Personnel: {play.personnel}
                    </Typography>
                  )}
                  {play.notes && (
                    <Typography variant="body-sm" color="muted">
                      Notes: {play.notes}
                    </Typography>
                  )}
                  {(play.defenseFront ||
                    play.defensiveCoverage ||
                    play.blitz ||
                    play.stunt) && (
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mt-2"
                    >
                      <span>Defense: </span>
                      {play.defenseFront && (
                        <span>Front: {play.defenseFront} </span>
                      )}
                      {play.defensiveCoverage && (
                        <span>Coverage: {play.defensiveCoverage} </span>
                      )}
                      {play.blitz && <span>Blitz: {play.blitz} </span>}
                      {play.stunt && <span>Stunt: {play.stunt}</span>}
                    </Typography>
                  )}
                  {(play.hash || play.situation) && (
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mt-1"
                    >
                      {play.hash && <span>Hash: {play.hash} </span>}
                      {play.situation && (
                        <span>Situation: {play.situation}</span>
                      )}
                    </Typography>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIndex(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeletePlay(index)}
                    className="text-text-error hover:text-text-error"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Play Button */}
      {!isAddingPlay && editingIndex === null && (
        <div className="pt-4">
          <Button variant="primary" onClick={() => setIsAddingPlay(true)}>
            Add Play
          </Button>
        </div>
      )}

      {/* Add/Edit Play Form */}
      {(isAddingPlay || editingIndex !== null) && (
        <div className="border border-subtle rounded-lg p-4 bg-surface-secondary">
          <h4 className="font-medium mb-4">
            {isAddingPlay ? "Add New Play" : "Edit Play"}
          </h4>
          <PracticeScriptPlayForm
            initialData={
              editingIndex !== null ? plays[editingIndex] : undefined
            }
            onSubmit={isAddingPlay ? handleAddPlay : handleUpdatePlay}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
};
