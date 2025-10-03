import React, { useState, useEffect } from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import type { DiagramPlayer } from "../types/types";

interface PersonnelSelectorProps {
  onPersonnelSelect: (personnel: DiagramPlayer[]) => void;
  selectedPersonnel: DiagramPlayer[];
}

export const PersonnelSelector: React.FC<PersonnelSelectorProps> = ({
  onPersonnelSelect,
  selectedPersonnel,
}) => {
  const { state: _state, dispatch } = useDiagramEditor();
  const [availablePersonnel, setAvailablePersonnel] = useState<DiagramPlayer[]>(
    []
  );

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockPersonnel: DiagramPlayer[] = [
      {
        id: "QB",
        label: "QB",
        role: "QB",
        side: "O",
        x: 50,
        y: 30,
        color: "#047857",
      },
      {
        id: "RB",
        label: "RB",
        role: "RB",
        side: "O",
        x: 50,
        y: 40,
        color: "#1e3a8a",
      },
      {
        id: "X",
        label: "X",
        role: "WR",
        side: "O",
        x: 80,
        y: 20,
        color: "#dc2626",
      },
      {
        id: "Y",
        label: "Y",
        role: "WR",
        side: "O",
        x: 70,
        y: 25,
        color: "#dc2626",
      },
      {
        id: "Z",
        label: "Z",
        role: "WR",
        side: "O",
        x: 20,
        y: 25,
        color: "#dc2626",
      },
    ];

    setAvailablePersonnel(mockPersonnel);
  }, []);

  const handlePersonnelToggle = (personnel: DiagramPlayer) => {
    const isSelected = selectedPersonnel.some((p) => p.id === personnel.id);
    if (isSelected) {
      onPersonnelSelect(selectedPersonnel.filter((p) => p.id !== personnel.id));
    } else {
      onPersonnelSelect([...selectedPersonnel, personnel]);
    }
  };

  const handleAddToDiagram = (personnel: DiagramPlayer) => {
    dispatch({ type: "ADD_PLAYER", player: personnel });
  };

  const groupPersonnelByPosition = (personnel: DiagramPlayer[]) => {
    return personnel.reduce(
      (groups, player) => {
        const position = player.role || "Unknown";
        if (!groups[position]) {
          groups[position] = [];
        }
        groups[position].push(player);
        return groups;
      },
      {} as Record<string, DiagramPlayer[]>
    );
  };

  const groupedPersonnel = groupPersonnelByPosition(availablePersonnel);

  return (
    <div className="w-80 bg-surface-card border-r border-border p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">
        Personnel
      </h3>

      {/* Personnel by Position */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-text-secondary">
          Available Players
        </h4>
        <div className="space-y-4">
          {Object.entries(groupedPersonnel).map(([position, players]) => (
            <div key={position}>
              <h5 className="text-sm font-medium text-text-primary mb-2">
                {position}
              </h5>
              <div className="space-y-1">
                {players.map((player) => {
                  const isSelected = selectedPersonnel.some(
                    (p) => p.id === player.id
                  );
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between"
                    >
                      <button
                        onClick={() => handlePersonnelToggle(player)}
                        className={`flex-1 text-left p-2 rounded border transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-surface-secondary text-text-primary"
                        }`}
                      >
                        <div className="font-medium">{player.label}</div>
                        <div className="text-sm text-text-secondary">
                          {player.role}
                        </div>
                      </button>
                      <button
                        onClick={() => handleAddToDiagram(player)}
                        className="ml-2 px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Count */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-sm text-text-secondary">
          Selected: {selectedPersonnel.length} players
        </div>
      </div>
    </div>
  );
};
