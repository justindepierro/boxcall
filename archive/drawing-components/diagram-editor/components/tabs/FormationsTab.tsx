import { useState } from "react";
import { useDiagramStore } from "../../stores/diagramStore";
import type { Player } from "../../types/Player";
import type { ProfessionalPixiEngine } from "../../core/ProfessionalPixiEngine";
import { FormationPicker } from "../FormationPicker";
import { useToast } from "../../../../../hooks/useToast";
import { haptics } from "../../../../../utils/haptics";

interface FormationsTabProps {
  app: ProfessionalPixiEngine | null;
  selectedAlignment: "left" | "middle" | "right";
}

/**
 * FormationsTab - Mobile-optimized formation picker
 *
 * Features:
 * - Visual formation grid with SVG icons
 * - Quick formation insertion
 * - Toast notifications on insert
 */
export const FormationsTab: React.FC<FormationsTabProps> = ({
  app,
  selectedAlignment,
}) => {
  const { players, addPlayer } = useDiagramStore();
  const [selectedFormation, setSelectedFormation] = useState<
    string | undefined
  >();
  const toast = useToast();

  // Helper to get center X based on alignment
  const getCenterXForAlignment = (
    alignment: "left" | "middle" | "right"
  ): number => {
    if (!app) return 26.666;

    const fieldWidth = app.coordinates.fieldWidth;
    const thirdWidth = fieldWidth / 3;

    switch (alignment) {
      case "left":
        return thirdWidth / 2;
      case "right":
        return fieldWidth - thirdWidth / 2;
      case "middle":
      default:
        return fieldWidth / 2;
    }
  };

  // Helper to add formation
  const addFormation = (formationType: string) => {
    const offensePlayers = players.filter((p) => p.team === "offense");
    if (offensePlayers.length > 0) {
      const confirmed = window.confirm(
        `This will replace your current ${offensePlayers.length} offensive players. Continue?`
      );
      if (!confirmed) return;

      // Clear existing offense
      offensePlayers.forEach((p) =>
        useDiagramStore.getState().removePlayer(p.id)
      );
    }

    const centerX = getCenterXForAlignment(selectedAlignment);
    const newPlayers: Player[] = [];

    // Spread 2x2 Formation
    if (formationType === "spread2x2") {
      newPlayers.push(
        {
          id: `player-${Date.now()}-1`,
          x: centerX,
          y: 17.5,
          jerseyNumber: "7",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-2`,
          x: centerX - 3,
          y: 18,
          jerseyNumber: "5",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-3`,
          x: centerX + 3,
          y: 18,
          jerseyNumber: "6",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-4`,
          x: centerX - 1,
          y: 20,
          jerseyNumber: "2",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-5`,
          x: centerX,
          y: 20,
          jerseyNumber: "3",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-6`,
          x: centerX + 1,
          y: 20,
          jerseyNumber: "4",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-7`,
          x: centerX - 8,
          y: 15.5,
          jerseyNumber: "11",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-8`,
          x: centerX - 4,
          y: 15.5,
          jerseyNumber: "10",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-9`,
          x: centerX + 4,
          y: 15.5,
          jerseyNumber: "8",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-10`,
          x: centerX + 8,
          y: 15.5,
          jerseyNumber: "9",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-11`,
          x: centerX,
          y: 12,
          jerseyNumber: "1",
          team: "offense",
        }
      );
    }
    // Spread 3x1 Right
    else if (formationType === "spread3x1Right") {
      newPlayers.push(
        {
          id: `player-${Date.now()}-1`,
          x: centerX,
          y: 17.5,
          jerseyNumber: "7",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-2`,
          x: centerX - 3,
          y: 18,
          jerseyNumber: "5",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-3`,
          x: centerX + 3,
          y: 18,
          jerseyNumber: "6",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-4`,
          x: centerX - 1,
          y: 20,
          jerseyNumber: "2",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-5`,
          x: centerX,
          y: 20,
          jerseyNumber: "3",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-6`,
          x: centerX + 1,
          y: 20,
          jerseyNumber: "4",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-7`,
          x: centerX - 8,
          y: 15.5,
          jerseyNumber: "11",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-8`,
          x: centerX + 3,
          y: 15.5,
          jerseyNumber: "10",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-9`,
          x: centerX + 6,
          y: 15.5,
          jerseyNumber: "8",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-10`,
          x: centerX + 9,
          y: 15.5,
          jerseyNumber: "9",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-11`,
          x: centerX,
          y: 12,
          jerseyNumber: "1",
          team: "offense",
        }
      );
    }
    // Spread 3x1 Left
    else if (formationType === "spread3x1Left") {
      newPlayers.push(
        {
          id: `player-${Date.now()}-1`,
          x: centerX,
          y: 17.5,
          jerseyNumber: "7",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-2`,
          x: centerX - 3,
          y: 18,
          jerseyNumber: "5",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-3`,
          x: centerX + 3,
          y: 18,
          jerseyNumber: "6",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-4`,
          x: centerX - 1,
          y: 20,
          jerseyNumber: "2",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-5`,
          x: centerX,
          y: 20,
          jerseyNumber: "3",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-6`,
          x: centerX + 1,
          y: 20,
          jerseyNumber: "4",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-7`,
          x: centerX - 9,
          y: 15.5,
          jerseyNumber: "11",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-8`,
          x: centerX - 6,
          y: 15.5,
          jerseyNumber: "10",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-9`,
          x: centerX - 3,
          y: 15.5,
          jerseyNumber: "8",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-10`,
          x: centerX + 8,
          y: 15.5,
          jerseyNumber: "9",
          team: "offense",
        },
        {
          id: `player-${Date.now()}-11`,
          x: centerX,
          y: 12,
          jerseyNumber: "1",
          team: "offense",
        }
      );
    }

    // Add all players
    newPlayers.forEach((player) => addPlayer(player));
  };

  const handleFormationSelect = (formationId: string) => {
    haptics.heavy(); // Heavy feedback for major action (formation insert)

    setSelectedFormation(formationId);
    addFormation(formationId);

    // Get formation name for toast
    const formationNames: Record<string, string> = {
      spread2x2: "Spread 2x2",
      spread3x1Right: "Spread 3x1 Right",
      spread3x1Left: "Spread 3x1 Left",
      pro: "Pro Set",
      pistol: "Pistol",
      trips: "Trips Right",
    };

    toast.success(`${formationNames[formationId]} inserted!`);
  };

  return (
    <div className="space-y-4">
      {/* Formation Grid */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">
          Offensive Formations
        </h3>
        <FormationPicker
          selectedFormation={selectedFormation}
          onSelect={handleFormationSelect}
        />
      </div>

      {/* Alignment Info */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
        <p className="text-xs text-purple-900 dark:text-purple-100">
          📍 <strong>Alignment:</strong>{" "}
          {selectedAlignment.charAt(0).toUpperCase() +
            selectedAlignment.slice(1)}{" "}
          hash
        </p>
        <p className="text-xs text-purple-900 dark:text-purple-100 mt-1">
          Change alignment in the "Align" tab or use the header selector.
        </p>
      </div>
    </div>
  );
};
