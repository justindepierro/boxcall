import React, { useMemo } from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { ValidatedInput } from "../../ValidatedInput";
import type { Play } from "../../../../types/play";

interface FormationSectionProps {
  formation: string;
  formationId: string | null;
  formationDir: string;
  formationShowInName: boolean;
  playbookId?: string;
  existingPlays?: Play[]; // NEW: For validation
  onCreateFormation?: () => void;
  onFormationChange: (formation: string) => void;
  onFormationIdChange: (
    formationId: string | null,
    formation: any | null
  ) => void;
  onFormationDirChange: (dir: string) => void;
  onFormationShowInNameChange: (show: boolean) => void;
  onNextField?: () => void; // NEW: Move to next field on Enter
}

export const FormationSection: React.FC<FormationSectionProps> = ({
  formation,
  formationDir,
  formationShowInName,
  existingPlays = [],
  onFormationChange,
  onFormationDirChange,
  onFormationShowInNameChange,
  onNextField,
}) => {
  // Extract unique formation names from existing plays
  const existingFormations = useMemo(() => {
    return [
      ...new Set(existingPlays.map((play) => play.formation).filter(Boolean)),
    ];
  }, [existingPlays]);

  return (
    <div className="flex gap-sm items-end">
      <ValidatedInput
        label="Formation"
        value={formation}
        onChange={(e) => onFormationChange(e.target.value)}
        placeholder="e.g., Shotgun, Empty, Pistol"
        required
        type="formation"
        existingValues={existingFormations}
        onEnterPress={onNextField}
        className="flex-1"
      />

      <div className="flex gap-xs">
        <Button
          type="button"
          variant={formationDir ? "primary" : "outline"}
          size="sm"
          onClick={() => {
            const nextValue = (() => {
              if (formationDir.toLowerCase() === "left") return "Right";
              if (formationDir.toLowerCase() === "right") return "";
              return "Left";
            })();
            onFormationDirChange(nextValue);
          }}
          className="px-sm min-w-24"
        >
          {(() => {
            if (!formationDir) return "Neutral";
            if (formationDir.toLowerCase() === "left") return "Left";
            return "Right";
          })()}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormationShowInNameChange(!formationShowInName)}
          className={`p-xs ${formationShowInName ? "text-info" : "text-muted"}`}
        >
          <Icon name="eye" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
