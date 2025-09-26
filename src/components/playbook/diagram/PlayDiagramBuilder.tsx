import React, { useEffect } from "react";
import { DiagramEditorProvider } from "./context/DiagramEditorProvider";
import { ModernToolPalette } from "./components/ModernToolPalette";
import { FootballFieldCanvas } from "./components/FootballFieldCanvas";
import { ShapeManipulator } from "./components/ShapeManipulator";
import { useDiagramEditor } from "./context/useDiagramEditor";
import type { DiagramPlayer } from "./types/types";
import type { Play } from "../../../types/play";

interface PlayDiagramBuilderProps {
  play?: Play;
  onClose?: () => void;
}

const PlayDiagramContent: React.FC<{ play?: Play }> = ({ play }) => {
  const { dispatch } = useDiagramEditor();

  // Parse personnel string (e.g., "11 Personnel") and create DiagramPlayer objects
  const generatePersonnelFromPlay = (playData: Play): DiagramPlayer[] => {
    const personnel: DiagramPlayer[] = [];

    // Always add QB
    personnel.push({
      id: "QB",
      label: "QB",
      role: "QB",
      side: "O",
      x: 50, // Center of field
      y: 30, // Back of formation
      color: "#047857",
    });

    // Parse personnel string (e.g., "11 Personnel" = 1 RB, 1 TE, 3 WR)
    if (playData.personnel) {
      const personnelMatch = playData.personnel.match(/^(\d)(\d)/);
      if (personnelMatch) {
        const rbCount = parseInt(personnelMatch[1]);
        const teCount = parseInt(personnelMatch[2]);
        const wrCount = 5 - rbCount - teCount; // Total 5 skill players

        // Add RBs
        for (let i = 0; i < rbCount; i++) {
          personnel.push({
            id: `RB${i + 1}`,
            label: rbCount === 1 ? "RB" : `RB${i + 1}`,
            role: "RB",
            side: "O",
            x: 45 + i * 5, // Spread out behind QB
            y: 35,
            color: "#1e3a8a",
          });
        }

        // Add TEs
        for (let i = 0; i < teCount; i++) {
          personnel.push({
            id: `TE${i + 1}`,
            label: teCount === 1 ? "TE" : `TE${i + 1}`,
            role: "TE",
            side: "O",
            x: 40 + i * 10,
            y: 25,
            color: "#7c3aed",
          });
        }

        // Add WRs (X, Y, Z, A, B positions)
        const wrPositions = [
          { id: "X", x: 80, y: 20 },
          { id: "Y", x: 70, y: 25 },
          { id: "Z", x: 20, y: 25 },
          { id: "A", x: 85, y: 15 },
          { id: "B", x: 15, y: 15 },
        ];

        for (let i = 0; i < wrCount && i < wrPositions.length; i++) {
          personnel.push({
            id: wrPositions[i].id,
            label: wrPositions[i].id,
            role: "WR",
            side: "O",
            x: wrPositions[i].x,
            y: wrPositions[i].y,
            color: "#dc2626",
          });
        }
      }
    }

    // Add offensive line (always 5)
    const olPositions = [
      { id: "LT", label: "LT", x: 35, y: 30 },
      { id: "LG", label: "LG", x: 40, y: 30 },
      { id: "C", label: "C", x: 50, y: 30 },
      { id: "RG", label: "RG", x: 60, y: 30 },
      { id: "RT", label: "RT", x: 65, y: 30 },
    ];

    olPositions.forEach((pos) => {
      personnel.push({
        id: pos.id,
        label: pos.label,
        role: "OL",
        side: "O",
        x: pos.x,
        y: pos.y,
        color: "#059669",
      });
    });

    return personnel;
  };

  // Automatically populate personnel when play data is available
  useEffect(() => {
    if (play) {
      const personnel = generatePersonnelFromPlay(play);

      // Add each player to the diagram
      personnel.forEach((player) => {
        dispatch({ type: "ADD_PLAYER", player });
      });
    }
  }, [play, dispatch]);

  return (
    <div className="flex h-screen bg-surface-primary">
      {/* Left Sidebar - Tools (narrow) */}
      <div className="w-16 bg-surface-card border-r border-border">
        <ModernToolPalette />
      </div>

      {/* Main Canvas Area - Takes up majority of space */}
      <div className="flex-1 flex flex-col">
        <ShapeManipulator zoom={1} panX={0} panY={0} snapToGrid={true}>
          <FootballFieldCanvas />
        </ShapeManipulator>
      </div>
    </div>
  );
};

export const PlayDiagramBuilder: React.FC<PlayDiagramBuilderProps> = ({
  play,
  onClose: _onClose,
}) => {
  return (
    <DiagramEditorProvider>
      <PlayDiagramContent play={play} />
    </DiagramEditorProvider>
  );
};
