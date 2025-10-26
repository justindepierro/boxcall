/**
 * PersonnelManager Component
 *
 * Handles loading and positioning personnel configurations in the diagram editor.
 * Extracted from the monolithic DiagramEditor component for better maintainability.
 */

import { useEffect } from "react";
import { useDiagramStore } from "../stores/diagramStore";
import type { Player } from "../types/Player";
import type { PersonnelPlayer } from "../../../../types/personnel";

interface PersonnelManagerProps {
  personnelConfig?: {
    players: PersonnelPlayer[];
    description?: string;
  } | null;
}

export const PersonnelManager: React.FC<PersonnelManagerProps> = ({
  personnelConfig,
}) => {
  // Load personnel players into diagram when config is available
  useEffect(() => {
    // Get store actions
    const { addPlayer, clearPlayers } = useDiagramStore.getState();

    // Clear existing players before adding personnel
    clearPlayers();

    // If no personnel config found, create a default formation
    if (
      !personnelConfig ||
      !personnelConfig.players ||
      personnelConfig.players.length === 0
    ) {
      // Create default formation (QB, RB, TE, 2 WR)
      const defaultPersonnel = [
        { position: "QB", label: "Q", x: 26.67, y: 12 },
        { position: "RB", label: "R", x: 31, y: 10 },
        { position: "TE", label: "T", x: 21, y: 17.5 },
        { position: "WR", label: "X", x: 10, y: 17.5 },
        { position: "WR", label: "Y", x: 43, y: 17.5 },
      ];

      defaultPersonnel.forEach((player, index) => {
        const diagramPlayer: Player = {
          id: `default-${player.position}-${index}`,
          x: player.x,
          y: player.y,
          jerseyNumber: player.label,
          team: "offense" as const,
          role: player.position,
          position: player.position === "QB" ? "center" : "regular",
        };
        addPlayer(diagramPlayer);
      });

      return;
    }

    // Position mapping: Define where each position type should be placed on field
    // Field is 53.333 yards wide x 35 yards tall (0,0 is top-left)
    // Center of field is at x: 26.67, typical line of scrimmage around y: 17.5
    const POSITION_COORDS: Record<string, { x: number; y: number }> = {
      QB: { x: 26.67, y: 12 }, // Behind center (5.5 yards back)
      RB: { x: 31, y: 10 }, // In backfield, offset right
      TE: { x: 21, y: 17.5 }, // On line, tight to tackle
      WR: { x: 10, y: 17.5 }, // Split out left (will be adjusted by sort_order)
    };

    // Create diagram players from personnel configuration
    personnelConfig.players.forEach(
      (personnelPlayer: PersonnelPlayer, index: number) => {
        const position = personnelPlayer.player_position;
        let baseCoords = POSITION_COORDS[position] || { x: 26.67, y: 17.5 };

        // Adjust WR positions based on sort_order to spread them out
        if (position === "WR") {
          const wrIndex = personnelConfig.players
            .filter((p: PersonnelPlayer) => p.player_position === "WR")
            .findIndex((p: PersonnelPlayer) => p.id === personnelPlayer.id);

          // Spread WRs across field: X (left), Y (slot left), Z (slot right), etc.
          const positions = [
            { x: 10, y: 17.5 }, // X - far left
            { x: 18, y: 17.5 }, // Y - slot left
            { x: 35, y: 17.5 }, // Z - slot right
            { x: 43, y: 17.5 }, // Additional WR - far right
          ];
          baseCoords = positions[wrIndex] || positions[0];
        }

        // Adjust RB positions if multiple RBs
        if (position === "RB") {
          const rbIndex = personnelConfig.players
            .filter((p: PersonnelPlayer) => p.player_position === "RB")
            .findIndex((p: PersonnelPlayer) => p.id === personnelPlayer.id);

          // Spread RBs in backfield
          if (rbIndex === 0) {
            baseCoords = { x: 31, y: 10 }; // Right side
          } else if (rbIndex === 1) {
            baseCoords = { x: 22, y: 10 }; // Left side
          }
        }

        // Adjust TE positions if multiple TEs
        if (position === "TE") {
          const teIndex = personnelConfig.players
            .filter((p: PersonnelPlayer) => p.player_position === "TE")
            .findIndex((p: PersonnelPlayer) => p.id === personnelPlayer.id);

          // Spread TEs on line
          if (teIndex === 0) {
            baseCoords = { x: 21, y: 17.5 }; // Left side
          } else if (teIndex === 1) {
            baseCoords = { x: 32, y: 17.5 }; // Right side
          }
        }

        // Create the diagram player
        const diagramPlayer: Player = {
          id: `personnel-${personnelPlayer.id}-${index}`,
          x: baseCoords.x,
          y: baseCoords.y,
          jerseyNumber: personnelPlayer.label,
          team: "offense" as const,
          role: position,
          position: position === "QB" ? "center" : "regular", // QB gets square, others get circles
        };

        addPlayer(diagramPlayer);
      }
    );
  }, [personnelConfig]);

  // This component doesn't render anything - it just manages personnel loading
  return null;
};
