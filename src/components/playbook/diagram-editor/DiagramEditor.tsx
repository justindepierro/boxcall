import React, { useState } from "react";
import { Button } from "@components/ui/Button";

/**
 * Simple diagram editor starting fresh
 * Focus on basic functionality without complex canvas libraries
 */
interface DiagramEditorProps {
  onClose: () => void;
  play: any; // TODO: Use proper Play type
  mode: "edit" | "quick-play";
  onQuickPlaySave: (diagramData: any) => Promise<void>;
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({
  onClose,
  play,
  mode,
  onQuickPlaySave,
}) => {
  const [players, setPlayers] = useState<any[]>(play?.diagram_data || []);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null
  );

  const handleSave = async () => {
    if (mode === "quick-play") {
      await onQuickPlaySave(players);
    }
    onClose();
  };

  const handleFieldClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 120; // Convert to yards
    const y = ((event.clientY - rect.top) / rect.height) * 53.3; // Convert to yards

    if (selectedPlayerIndex !== null) {
      // Move selected player
      const updatedPlayers = [...players];
      updatedPlayers[selectedPlayerIndex] = {
        ...updatedPlayers[selectedPlayerIndex],
        x,
        y,
      };
      setPlayers(updatedPlayers);
    }
  };

  const selectPlayer = (index: number) => {
    setSelectedPlayerIndex(index);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-divider">
        <h2 className="text-lg font-semibold text-primary">Diagram Editor</h2>
        <div className="flex space-x-2">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex">
        {/* Field */}
        <div className="flex-1 p-4">
          <div
            className="w-full aspect-[12/5.33] bg-success-bg border-2 border-success rounded-lg cursor-crosshair relative"
            onClick={handleFieldClick}
          >
            {/* Field markings (simplified) */}
            <div className="absolute inset-0 border-l-2 border-r-2 border-white opacity-20"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-20 transform -translate-x-1/2"></div>

            {/* Players */}
            {players.map((player, index) => (
              <div
                key={index}
                className={`absolute w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                  selectedPlayerIndex === index
                    ? "bg-primary border-primary-text scale-125"
                    : "bg-primary-text border-primary hover:scale-110"
                }`}
                style={{
                  left: `${(player.x / 120) * 100}%`,
                  top: `${(player.y / 53.3) * 100}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectPlayer(index);
                }}
              >
                <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap">
                  {player.position}
                </span>
              </div>
            ))}

            {/* Instructions */}
            <div className="absolute bottom-2 left-2 text-xs text-primary opacity-75">
              Click to move selected player • Click player to select
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-divider p-4">
          <h3 className="text-sm font-medium text-primary mb-3">Players</h3>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={index}
                className={`p-2 rounded border cursor-pointer transition-colors ${
                  selectedPlayerIndex === index
                    ? "bg-primary-bg border-primary"
                    : "bg-surface border-divider hover:bg-surface-hover"
                }`}
                onClick={() => selectPlayer(index)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    {player.position}
                  </span>
                  <span className="text-xs text-secondary">
                    ({player.role})
                  </span>
                </div>
                <div className="text-xs text-secondary mt-1">
                  {player.x.toFixed(1)}, {player.y.toFixed(1)}
                </div>
              </div>
            ))}
          </div>

          {selectedPlayerIndex !== null && (
            <div className="mt-4 p-3 bg-primary-bg rounded border border-primary">
              <h4 className="text-sm font-medium text-primary mb-2">
                Edit {players[selectedPlayerIndex].position}
              </h4>
              <div className="space-y-2 text-xs">
                <div>Position: {players[selectedPlayerIndex].position}</div>
                <div>Role: {players[selectedPlayerIndex].role}</div>
                <div>
                  Coordinates: {players[selectedPlayerIndex].x.toFixed(1)},{" "}
                  {players[selectedPlayerIndex].y.toFixed(1)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
