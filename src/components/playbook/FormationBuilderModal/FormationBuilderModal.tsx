import React, { useState } from "react";
import { Button } from "@components/ui/Button";
import { Modal } from "@components/ui/Modal";
import type { FormationPlayerPosition } from "../../../types/formation";

/**
 * Simple formation builder starting fresh
 * Focus on intuitive, touch-friendly interface
 */
interface FormationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  onSaved: () => void;
}

export const FormationBuilderModal: React.FC<FormationBuilderModalProps> = ({
  isOpen,
  onClose,
  playbookId,
  onSaved,
}) => {
  const [formationName, setFormationName] = useState("");
  const [players, setPlayers] = useState<FormationPlayerPosition[]>([]);

  const handleSave = () => {
    if (formationName.trim()) {
      // TODO: Save formation to database using playbookId
      console.log("Saving formation:", {
        name: formationName,
        players,
        playbookId,
      });
      onSaved();
      onClose();
    }
  };

  const addPlayer = () => {
    const newPlayer: FormationPlayerPosition = {
      position: `P${players.length + 1}`,
      x: 60, // Center of field
      y: 25, // Center of field
      role: "WR", // Default role
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Formation">
      <div className="space-y-6">
        {/* Formation Name */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Formation Name
          </label>
          <input
            type="text"
            value={formationName}
            onChange={(e) => setFormationName(e.target.value)}
            className="input-primary w-full"
            placeholder="e.g., I-Formation, Spread, Shotgun"
          />
        </div>

        {/* Simple Field Preview */}
        <div className="border-2 border-divider rounded-lg p-4 bg-surface-muted">
          <h3 className="text-sm font-medium text-primary mb-3">
            Field Preview
          </h3>
          <div className="bg-success-bg border border-success rounded aspect-[12/5.33] relative">
            {/* Simple field representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-success-text text-xs">Field Preview</span>
            </div>

            {/* Player dots */}
            {players.map((player, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 bg-primary rounded-full border border-primary-text transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${(player.x / 120) * 100}%`,
                  top: `${(player.y / 53.3) * 100}%`,
                }}
              >
                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-primary">
                  {player.position}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Player Management */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-primary">
              Players ({players.length})
            </h3>
            <Button onClick={addPlayer} size="sm" variant="secondary">
              Add Player
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-surface rounded border"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-primary">
                    {player.position}
                  </span>
                  <span className="text-xs text-secondary">
                    ({player.role})
                  </span>
                </div>
                <Button
                  onClick={() => removePlayer(index)}
                  size="sm"
                  variant="danger"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-divider">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formationName.trim()}>
            Save Formation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
