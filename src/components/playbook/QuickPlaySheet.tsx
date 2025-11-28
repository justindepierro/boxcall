import React, { useEffect, useMemo, useState } from "react";
import { BottomSheet } from "../BottomSheet";
import { Button } from "../ui/Button/Button";
import { Input } from "../ui/Input";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import { PLAY_TYPE_OPTIONS } from "../../types/play";
import type { PlayCombo } from "../../hooks/useRecentPlayCombos";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../../utils/playFieldValidation";
import { FormationSelector } from "./FormationSelector";
import type { Formation } from "../../types/formation";

interface QuickPlaySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (playData: {
    formation_id: string;
    formation: string;
    play_name: string;
    personnel?: string;
    playType?: string;
  }) => Promise<void>;
  onOpenFullEditor: () => void;
  playbookId?: string;
  suggestions: {
    formations: string[];
    personnel: string[];
    playNames: string[];
    playTypes?: string[];
  };
  recentCombos: PlayCombo[];
}

const QUICK_PLAY_TYPES = PLAY_TYPE_OPTIONS.slice(0, 4);

export const QuickPlaySheet: React.FC<QuickPlaySheetProps> = ({
  isOpen,
  onClose,
  onCreate,
  onOpenFullEditor,
  playbookId,
  suggestions,
  recentCombos,
}) => {
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

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setError(null);
      setPlayName("");
      setSelectedFormationId(null);
      setSelectedFormation(null);
      setPersonnel("");
      setPlayType(undefined);
    }
  }, [isOpen]);

  const comboButtons = useMemo(() => {
    return recentCombos.slice(0, 6);
  }, [recentCombos]);

  const handleCreate = async () => {
    if (!playbookId) {
      setError("A playbook must be selected before creating a play.");
      return;
    }
    if (!selectedFormationId || !selectedFormation) {
      setError("Select a formation from the list (or create one). ");
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
      await onCreate({
        formation_id: selectedFormationId,
        formation: selectedFormation.name.trim(),
        play_name: playName.trim(),
        personnel: personnel.trim() || undefined,
        playType,
      });
      setPlayName("");
      onClose();
    } catch (createError) {
      console.error("[QuickPlaySheet] Failed to create play:", createError);
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create play. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      snapPoints={[0.9]}
      initialSnapPoint={0}
      showHandle
      zIndex={60}
    >
      <div className="px-4 pb-6 pt-3 space-y-6">
        <div className="flex items-center justify-between">
          <Typography variant="headline-md" className="font-semibold">
            Quick Create
          </Typography>
          <button
            type="button"
            onClick={() => {
              if (isSubmitting) return;
              setSelectedFormationId("");
              setPersonnel("");
              setPlayType(undefined);
              setPlayName("");
              setError(null);
              onClose();
            }}
            className="rounded-full p-2 text-muted hover:text-primary"
            disabled={isSubmitting}
            aria-label="Close quick create sheet"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {comboButtons.length > 0 && (
          <div>
            <Typography
              variant="label-md"
              className="mb-2 text-secondary uppercase tracking-wide"
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
                        `Formation "${combo.formation}" isn’t in your library yet. Select it from the dropdown or create it.`
                      );
                      if (combo.personnel) {
                        setPersonnel(combo.personnel);
                      }
                    }
                    setPlayType(combo.playType);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary hover:bg-muted transition-colors"
                >
                  <Icon name="zap" className="h-4 w-4 text-primary" />
                  <span className="truncate max-w-40">
                    {combo.formation}
                    {combo.personnel ? ` • ${combo.personnel}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {playbookId ? (
            <FormationSelector
              playbookId={playbookId}
              value={selectedFormationId || ""} // Now uses formation name (TEXT)
              onChange={(formationName) => {
                // Simple: just update the formation name
                setSelectedFormationId(formationName);
                setError(null);
              }}
              onCreateNew={() => {
                onClose();
                onOpenFullEditor();
              }}
            />
          ) : (
            <div className="rounded-lg border border-border bg-secondary/80 p-4 text-sm text-secondary">
              Select a playbook before creating quick plays.
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-secondary mb-1 block">
              Play Name
            </label>
            <Input
              value={playName}
              onChange={(e) => setPlayName(e.target.value)}
              placeholder="Name this play"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-secondary mb-1 block">
              Personnel (optional)
            </label>
            <Input
              value={personnel}
              onChange={(e) => setPersonnel(e.target.value)}
              placeholder={suggestions.personnel[0] || "11, 12, Blue, Empty..."}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-secondary mb-2 block">
              Play Type
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PLAY_TYPES.map((option) => (
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
                      : "border-border text-secondary hover:border-hover"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setPlayType(undefined)}
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted hover:border-hover"
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

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCreate}
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
          <Button
            onClick={onOpenFullEditor}
            variant="ghost"
            size="lg"
            disabled={isSubmitting}
          >
            Open full editor
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
