/**
 * IntuitiveFormationBuilder - Simple, Guided Formation Drawing
 *
 * A complete redesign of formation drawing that's actually fun and intuitive:
 * - Step-by-step wizard interface
 * - Visual formation templates to start from
 * - Drag & drop player positioning
 * - Smart suggestions and validation
 * - Progressive disclosure of advanced features
 */

import React, { useState, useCallback } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { useToast } from "../../../hooks/useToast";
import type { FormationPlayerPosition } from "../../../types/formation";

interface IntuitiveFormationBuilderProps {
  playbookId: string;
  onSave: (players: FormationPlayerPosition[], personnel: string) => void;
  onCancel: () => void;
}

type FormationStep = "welcome" | "template" | "position" | "refine" | "save";

interface FormationTemplate {
  id: string;
  name: string;
  description: string;
  personnel: string;
  players: FormationPlayerPosition[];
  preview: string; // emoji representation
}

const FORMATION_TEMPLATES: FormationTemplate[] = [
  {
    id: "empty",
    name: "Start from Scratch",
    description: "Build your formation from the ground up",
    personnel: "11",
    players: [],
    preview: "⚪",
  },
  {
    id: "i-formation",
    name: "I-Formation",
    description: "Classic power running formation",
    personnel: "21",
    players: [
      { position: "QB", role: "QB", x: 15, y: 17.5, depth: 0 },
      { position: "FB", role: "FB", x: 12, y: 17.5, depth: 0 },
      { position: "LT", role: "LT", x: 8, y: 12, depth: 0 },
      { position: "LG", role: "LG", x: 8, y: 15, depth: 0 },
      { position: "C", role: "C", x: 8, y: 17.5, depth: 0 },
      { position: "RG", role: "RG", x: 8, y: 20, depth: 0 },
      { position: "RT", role: "RT", x: 8, y: 23, depth: 0 },
      { position: "TE", role: "TE", x: 10, y: 25, depth: 0 },
      { position: "WR1", role: "WR", x: 10, y: 10, depth: 0 },
      { position: "WR2", role: "WR", x: 10, y: 27, depth: 0 },
      { position: "WR3", role: "WR", x: 12, y: 8, depth: 0 },
    ],
    preview: "🏈",
  },
  {
    id: "spread",
    name: "Spread Formation",
    description: "Modern spread offense with 4 receivers",
    personnel: "11",
    players: [
      { position: "QB", role: "QB", x: 15, y: 17.5, depth: 0 },
      { position: "LT", role: "LT", x: 8, y: 12, depth: 0 },
      { position: "LG", role: "LG", x: 8, y: 15, depth: 0 },
      { position: "C", role: "C", x: 8, y: 17.5, depth: 0 },
      { position: "RG", role: "RG", x: 8, y: 20, depth: 0 },
      { position: "RT", role: "RT", x: 8, y: 23, depth: 0 },
      { position: "WR1", role: "WR", x: 10, y: 8, depth: 0 },
      { position: "WR2", role: "WR", x: 10, y: 27, depth: 0 },
      { position: "WR3", role: "WR", x: 12, y: 5, depth: 0 },
      { position: "WR4", role: "WR", x: 12, y: 30, depth: 0 },
      { position: "RB", role: "RB", x: 12, y: 17.5, depth: 0 },
    ],
    preview: "🏃‍♂️",
  },
  {
    id: "shotgun",
    name: "Shotgun",
    description: "Shotgun formation with QB under center",
    personnel: "11",
    players: [
      { position: "QB", role: "QB", x: 20, y: 17.5, depth: 0 },
      { position: "LT", role: "LT", x: 8, y: 12, depth: 0 },
      { position: "LG", role: "LG", x: 8, y: 15, depth: 0 },
      { position: "C", role: "C", x: 8, y: 17.5, depth: 0 },
      { position: "RG", role: "RG", x: 8, y: 20, depth: 0 },
      { position: "RT", role: "RT", x: 8, y: 23, depth: 0 },
      { position: "WR1", role: "WR", x: 10, y: 8, depth: 0 },
      { position: "WR2", role: "WR", x: 10, y: 27, depth: 0 },
      { position: "WR3", role: "WR", x: 12, y: 5, depth: 0 },
      { position: "WR4", role: "WR", x: 12, y: 30, depth: 0 },
      { position: "RB", role: "RB", x: 15, y: 17.5, depth: 0 },
    ],
    preview: "🎯",
  },
];

export const IntuitiveFormationBuilder: React.FC<IntuitiveFormationBuilderProps> = ({
  playbookId: _playbookId,
  onSave,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<FormationStep>("welcome");
  const [_selectedTemplate, setSelectedTemplate] = useState<FormationTemplate | null>(null);
  const [players, setPlayers] = useState<FormationPlayerPosition[]>([]);
  const [personnel, setPersonnel] = useState("11");
  const toast = useToast();

  const handleTemplateSelect = useCallback((template: FormationTemplate) => {
    setSelectedTemplate(template);
    setPlayers(template.players);
    setPersonnel(template.personnel);
    setCurrentStep("position");
  }, []);

  const handlePlayerMove = useCallback((playerPosition: string, x: number, y: number) => {
    setPlayers(prev => prev.map(p =>
      p.position === playerPosition ? { ...p, x, y } : p
    ));
  }, []);

  const handleAddPlayer = useCallback((role: string) => {
    const newPlayer: FormationPlayerPosition = {
      position: `${role}${players.filter(p => p.role === role).length + 1}`,
      role,
      x: 25, // Center of field
      y: 17.5, // Middle of field
    };
    setPlayers(prev => [...prev, newPlayer]);
  }, [players]);

  const handleSave = useCallback(() => {
    if (players.length === 0) {
      toast.error("Add at least one player to your formation");
      return;
    }
    onSave(players, personnel);
  }, [players, personnel, onSave, toast]);

  const renderWelcomeStep = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="max-w-md">
        <Icon name="grid" size="lg" className="mx-auto mb-6 text-primary-500" />
        <Typography variant="headline-lg" className="mb-4">
          Let's Draw a Formation!
        </Typography>
        <Typography variant="body-md" className="text-text-muted mb-8">
          We'll guide you through creating your formation step by step.
          Start with a template or build from scratch.
        </Typography>
        <Button
          onClick={() => setCurrentStep("template")}
          className="w-full"
        >
          <Icon name="play" size="sm" className="mr-2" />
          Get Started
        </Button>
      </div>
    </div>
  );

  const renderTemplateStep = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="headline-md">Choose a Starting Point</Typography>
            <Typography variant="body-sm" className="text-text-muted">
              Pick a formation template or start fresh
            </Typography>
          </div>
          <Button variant="ghost" onClick={() => setCurrentStep("welcome")}>
            <Icon name="arrow-left" size="sm" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {FORMATION_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="p-6 border border-border rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group"
            >
              <div className="text-4xl mb-3">{template.preview}</div>
              <Typography variant="body-lg" className="font-medium mb-1">
                {template.name}
              </Typography>
              <Typography variant="body-sm" className="text-text-muted">
                {template.description}
              </Typography>
              <div className="mt-3 text-xs text-primary-600 font-medium">
                {template.personnel} Personnel
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPositionStep = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="headline-md">Position Your Players</Typography>
            <Typography variant="body-sm" className="text-text-muted">
              Drag players to their positions on the field
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCurrentStep("template")}>
              <Icon name="arrow-left" size="sm" />
            </Button>
            <Button onClick={() => setCurrentStep("refine")}>
              Next
              <Icon name="arrow-right" size="sm" className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Field Canvas */}
        <div className="flex-1 bg-field relative">
          <SimpleFieldCanvas
            players={players}
            onPlayerMove={handlePlayerMove}
            className="w-full h-full"
          />

          {/* Player Count Badge */}
          <div className="absolute top-4 left-4 bg-surface-card px-3 py-1 rounded-full text-sm font-medium">
            {players.length} players
          </div>
        </div>

        {/* Player Toolbar */}
        <div className="w-64 border-l border-border p-4">
          <Typography variant="body-md" className="font-medium mb-4">
            Add Players
          </Typography>
          <div className="space-y-2">
            {["QB", "RB", "FB", "WR", "TE", "LT", "LG", "C", "RG", "RT"].map((role) => (
              <Button
                key={role}
                variant="outline"
                size="sm"
                onClick={() => handleAddPlayer(role)}
                className="w-full justify-start"
              >
                <Icon name="plus-circle" size="sm" className="mr-2" />
                {role}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRefineStep = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="headline-md">Refine & Validate</Typography>
            <Typography variant="body-sm" className="text-text-muted">
              Check your formation and make final adjustments
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCurrentStep("position")}>
              <Icon name="arrow-left" size="sm" />
            </Button>
            <Button onClick={() => setCurrentStep("save")}>
              Next
              <Icon name="arrow-right" size="sm" className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Formation Preview */}
          <div className="bg-field rounded-lg p-4">
            <SimpleFieldCanvas
              players={players}
              onPlayerMove={handlePlayerMove}
              readonly
              className="w-full h-64"
            />
          </div>

          {/* Validation Messages */}
          <div className="space-y-3">
            {players.length === 0 && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <Typography variant="body-sm" className="text-error-700">
                  ⚠️ Add at least one player to your formation
                </Typography>
              </div>
            )}
            {players.length > 11 && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <Typography variant="body-sm" className="text-error-700">
                  ⚠️ Too many players! Maximum 11 players allowed
                </Typography>
              </div>
            )}
            {!players.some(p => p.role === "QB") && (
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <Typography variant="body-sm" className="text-warning-700">
                  💡 Consider adding a QB to your formation
                </Typography>
              </div>
            )}
            {players.length >= 5 && players.length <= 11 && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <Typography variant="body-sm" className="text-success-700">
                  ✅ Formation looks good!
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSaveStep = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <Typography variant="headline-lg" className="mb-4">
          Ready to Save!
        </Typography>
        <Typography variant="body-md" className="text-text-muted mb-8">
          Your formation with {players.length} players is ready to save.
          You can always edit it later.
        </Typography>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Icon name="save" size="sm" className="mr-2" />
            Save Formation
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome": return renderWelcomeStep();
      case "template": return renderTemplateStep();
      case "position": return renderPositionStep();
      case "refine": return renderRefineStep();
      case "save": return renderSaveStep();
      default: return renderWelcomeStep();
    }
  };

  return (
    <div className="h-full bg-surface-primary">
      {renderCurrentStep()}
    </div>
  );
};

// Simple field canvas for drag & drop positioning
interface SimpleFieldCanvasProps {
  players: FormationPlayerPosition[];
  onPlayerMove: (playerId: string, x: number, y: number) => void;
  readonly?: boolean;
  className?: string;
}

const SimpleFieldCanvas: React.FC<SimpleFieldCanvasProps> = ({
  players,
  onPlayerMove,
  readonly = false,
  className = "",
}) => {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (playerPosition: string, event: React.MouseEvent) => {
    if (readonly) return;
    setDragging(playerPosition);
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragging || readonly) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left - dragOffset.x) / rect.width) * 53.333;
    const y = ((event.clientY - rect.top - dragOffset.y) / rect.height) * 35;

    // Constrain to field bounds
    const constrainedX = Math.max(0, Math.min(53.333, x));
    const constrainedY = Math.max(0, Math.min(35, y));

    onPlayerMove(dragging, constrainedX, constrainedY);
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  return (
    <div
      className={`relative bg-field border-2 border-white cursor-crosshair ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Field markings (simplified) */}
      <div className="absolute inset-0">
        {/* Yard lines */}
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            className="absolute w-px bg-white/50"
            style={{ left: `${(i / 10) * 100}%`, top: 0, bottom: 0 }}
          />
        ))}

        {/* Hash marks */}
        <div className="absolute w-full h-px bg-white/50 top-1/2 transform -translate-y-1/2 left-0 right-0" />
      </div>

      {/* Players */}
      {players.map((player) => (
        <div
          key={player.position}
          className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold cursor-move select-none transition-transform ${
            dragging === player.position ? "scale-110 z-10" : "hover:scale-105"
          } ${
            player.role === "QB" ? "bg-yellow-400 text-black" :
            ["LT", "LG", "C", "RG", "RT"].includes(player.role || "") ? "bg-orange-400 text-white" :
            player.role === "TE" ? "bg-red-400 text-white" :
            player.role === "WR" ? "bg-blue-400 text-white" :
            "bg-green-400 text-white"
          }`}
          style={{
            left: `${(player.x / 53.333) * 100}%`,
            top: `${(player.y / 35) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={(e) => handleMouseDown(player.position, e)}
        >
          {player.role}
        </div>
      ))}

      {/* Instructions */}
      {players.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/80">
            <Icon name="plus-circle" size="lg" className="mx-auto mb-2" />
            <Typography variant="body-sm">
              Click "Add Players" to get started
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};