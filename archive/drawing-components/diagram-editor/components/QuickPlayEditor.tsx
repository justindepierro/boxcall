import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../../ui/Button/Button";
import { Input } from "../../../ui/Input";
import { Icon } from "../../../ui/Icon";
import { Typography } from "../../../design-system/Typography";
import { PLAY_TYPE_OPTIONS } from "../../../../types/play";
import type { PlayCombo } from "../../../../hooks/useRecentPlayCombos";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../../../../utils/playFieldValidation";
import { FormationSelector } from "../../FormationSelector";
import type { Formation } from "../../../../types/formation";
import type { UnifiedDiagramData } from "../types/UnifiedDiagramTypes";
import { PixiDiagramCanvas } from "./PixiDiagramCanvas";
import { useToast } from "../../../../hooks/useToast";

interface QuickPlayEditorProps {
  playbookId: string;
  onSave: (data: UnifiedDiagramData) => Promise<void>;
  onCancel: () => void;
  suggestions: {
    formations: string[];
    personnel: string[];
    playNames: string[];
    playTypes?: string[];
  };
  recentCombos: PlayCombo[];
}

const QUICK_PLAY_TYPES = PLAY_TYPE_OPTIONS.slice(0, 4);

export const QuickPlayEditor: React.FC<QuickPlayEditorProps> = ({
  playbookId,
  onSave,
  onCancel,
  suggestions,
  recentCombos,
}) => {
  const toast = useToast();

  // Form state
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(
    null
  );
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [availableFormations, setAvailableFormations] = useState<Formation[]>(
    []
  );
  const [personnel, setPersonnel] = useState("");
  const [playName, setPlayName] = useState("");
  const [playType, setPlayType] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Diagram state
  const [diagramData, setDiagramData] = useState<UnifiedDiagramData | null>(
    null
  );

  // Reset form when component mounts
  useEffect(() => {
    setPlayName("");
    setSelectedFormationId(null);
    setSelectedFormation(null);
    setPersonnel("");
    setPlayType(undefined);
    setError(null);
    setDiagramData(null);
  }, []);

  const comboButtons = useMemo(() => {
    return recentCombos.slice(0, 6);
  }, [recentCombos]);

  const handleCreatePlay = async () => {
    if (!selectedFormationId || !selectedFormation) {
      setError("Select a formation from the list (or create one).");
      return;
    }

    if (!playName.trim()) {
      setError("Play name is required.");
      return;
    }

    const formationValidation = validateFormationName(selectedFormation.name);
    if (!formationValidation.isValid) {
      setError(
        formationValidation.error ||
          'Formation looks invalid. Use names like "Trips Right" or "Shotgun".'
      );
      return;
    }

    const personnelValidation = validatePersonnelValue(personnel);
    if (!personnelValidation.isValid) {
      setError(
        personnelValidation.error ||
          'Personnel looks invalid. Use packages like "11" or "Blue".'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create unified diagram data for the play
      const playDiagramData: UnifiedDiagramData = {
        id: `play-${Date.now()}`,
        type: "play",
        name: playName.trim(),
        pixiData: {
          version: 2,
          players: [], // Will be populated from formation
          routes: [],
          meta: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        metadata: {
          play_name: playName.trim(),
          formation: selectedFormation?.name || "",
          p_type: playType,
          personnel: personnel.trim() || undefined,
          pref_front: "",
          formation_id: selectedFormationId || undefined,
        },
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "",
      };

      // TODO: Convert formation players to diagram players
      // For now, create empty diagram that can be edited

      setDiagramData(playDiagramData);

      toast.success(`Play "${playName}" created successfully!`);
    } catch (createError) {
      console.error("[QuickPlayEditor] Failed to create play:", createError);
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create play. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDiagram = async () => {
    if (!diagramData) return;

    setIsSubmitting(true);
    try {
      await onSave(diagramData);
      toast.success("Play saved successfully!");
    } catch (error) {
      console.error("[QuickPlayEditor] Failed to save diagram:", error);
      toast.error("Failed to save play. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiagramChange = (data: UnifiedDiagramData) => {
    setDiagramData(data);
  };

  if (diagramData) {
    // Show diagram editor mode
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Typography variant="headline-md" className="font-semibold">
            Edit Play: {diagramData.name}
          </Typography>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setDiagramData(null)}
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
            <Button
              onClick={handleSaveDiagram}
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon name="loader" className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="save" className="h-4 w-4 mr-2" />
                  Save Play
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 relative">
          <PixiDiagramCanvas
            data={diagramData}
            mode="edit"
            onChange={handleDiagramChange}
            showControls={true}
            interactive={true}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  // Show quick create form
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Typography variant="headline-md" className="font-semibold">
          Quick Create Play
        </Typography>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          disabled={isSubmitting}
        >
          <Icon name="close" className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {comboButtons.length > 0 && (
          <div>
            <Typography
              variant="label-md"
              className="mb-2 text-text-secondary uppercase tracking-wide"
            >
              Recent combos
            </Typography>
            <div className="flex flex-wrap gap-2">
              {comboButtons.map((combo) => (
                <button
                  key={`${combo.formation}-${combo.personnel || "none"}-${combo.playType || "any"}`}
                  onClick={() => {
                    const match = availableFormations.find(
                      (formationItem) =>
                        formationItem.name.trim().toLowerCase() ===
                        combo.formation.trim().toLowerCase()
                    );
                    if (match) {
                      setSelectedFormationId(match.id);
                      setSelectedFormation(match);
                      if (match.personnel_name) {
                        setPersonnel(match.personnel_name);
                      } else if (combo.personnel) {
                        setPersonnel(combo.personnel);
                      } else {
                        setPersonnel("");
                      }
                      setError(null);
                    } else {
                      setSelectedFormationId(null);
                      setSelectedFormation(null);
                      setError(
                        `Formation "${combo.formation}" isn't in your library yet. Select it from the dropdown or create it.`
                      );
                      if (combo.personnel) {
                        setPersonnel(combo.personnel);
                      }
                    }
                    setPlayType(combo.playType);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-secondary px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors"
                >
                  <Icon name="zap" className="h-4 w-4 text-text-primary" />
                  <span className="truncate max-w-40">
                    {combo.formation}
                    {combo.personnel ? ` • ${combo.personnel}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <FormationSelector
            playbookId={playbookId}
            value={selectedFormationId}
            onChange={(
              formationId: string | null,
              formation: Formation | null
            ) => {
              setSelectedFormationId(formationId);
              setSelectedFormation(formation);
              if (formation?.personnel_name) {
                setPersonnel(formation.personnel_name);
              }
              setError(null);
            }}
            onCreateNew={() => {
              // TODO: Open formation builder modal
              toast.info("Formation builder integration coming soon!");
            }}
            onFormationsLoaded={setAvailableFormations}
          />

          <div>
            <label className="text-sm font-semibold text-text-secondary mb-1 block">
              Play Name
            </label>
            <Input
              value={playName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPlayName(e.target.value)
              }
              placeholder="Name this play"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-text-secondary mb-1 block">
              Personnel (optional)
            </label>
            <Input
              value={personnel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPersonnel(e.target.value)
              }
              placeholder={suggestions.personnel[0] || "11, 12, Blue, Empty..."}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-text-secondary mb-2 block">
              Play Type
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PLAY_TYPES.map(
                (option: { value: string; label: string }) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setPlayType((current) =>
                        current === option.value ? undefined : option.value
                      )
                    }
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
                      playType === option.value
                        ? "border-brand-jade bg-brand-jade/10 text-brand-jade"
                        : "border-border text-text-secondary hover:border-border-hover"
                    }`}
                  >
                    {option.label}
                  </button>
                )
              )}
              <button
                onClick={() => setPlayType(undefined)}
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-text-muted hover:border-border-hover"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
            <Icon name="alert-triangle" className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleCreatePlay}
            variant="primary"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icon name="loader" className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Icon name="plus" className="mr-2 h-5 w-5" />
                Create and Diagram
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
