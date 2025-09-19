import React from "react";
import { Icon } from "../../../ui/Icon";
import { Button } from "../../../ui/Button/Button";
import { Select } from "../../../ui/Select";
import { InlineEdit, validatePositionLabel } from "../../../ui/InlineEdit";
import type {
  PersonnelGrouping,
  PersonnelNamingPreset,
} from "../../../../types/personnel";

interface PositionEditorProps {
  activeGrouping: PersonnelGrouping | undefined;
  onUpdatePositionLabel: (
    groupingId: string,
    positionId: string,
    newLabel: string
  ) => void;
  onApplyNamingPreset: (preset: PersonnelNamingPreset) => void;
  onTogglePositionLock: (groupingId: string, positionId: string) => void;
}

export const PositionEditor: React.FC<PositionEditorProps> = ({
  activeGrouping,
  onUpdatePositionLabel,
  onApplyNamingPreset,
  onTogglePositionLock,
}) => {
  if (!activeGrouping) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          Edit Positions - {activeGrouping.name}
        </h3>
        <div className="relative z-10">
          <Select
            value=""
            onChange={(value) =>
              onApplyNamingPreset(value as PersonnelNamingPreset)
            }
            options={[
              { value: "", label: "Apply Naming Preset..." },
              { value: "traditional", label: "Traditional (WR1, WR2, TE)" },
              { value: "xy", label: "X/Y (X, Y, QB)" },
              { value: "lr", label: "L/R (L, R, QB)" },
              { value: "numbers", label: "Numbers (WR1, WR2, WR3)" },
            ]}
            className="w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeGrouping.positions.map((position) => (
          <div
            key={position.id}
            className="flex items-center space-x-3 p-3 border rounded"
          >
            <div className="flex-1">
              <div className="text-sm text-text-muted">{position.position}</div>
              <InlineEdit
                value={position.label}
                onChange={(value: string) =>
                  onUpdatePositionLabel(activeGrouping.id, position.id, value)
                }
                validate={validatePositionLabel}
                showMobileHighlight={true}
                disabled={position.isLocked}
                placeholder="Position label"
                className="mt-1"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onTogglePositionLock(activeGrouping.id, position.id)
              }
              className="p-1 h-8 w-8"
              title={
                position.isLocked
                  ? "Unlock position for editing"
                  : "Lock position to prevent changes"
              }
            >
              <Icon name={position.isLocked ? "lock" : "unlock"} size="sm" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
