import React from "react";
import { Typography } from "../../design-system/Typography";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon";
import type { PracticeScript } from "@services";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

interface ScriptSummaryProps {
  currentScript: PracticeScript;
  totalPlays: number;
  isMobile: boolean;
  onExportPDF: () => void;
  onSaveAsTemplate: () => void;
  onLoadFromTemplate: () => void;
}

export const ScriptSummary: React.FC<ScriptSummaryProps> = ({
  currentScript,
  totalPlays,
  isMobile,
  onExportPDF,
  onSaveAsTemplate,
  onLoadFromTemplate,
}) => {
  const totalReps =
    currentScript.plays?.reduce((sum, play) => sum + play.repetitions, 0) || 0;

  return (
    <div className="bg-secondary rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-secondary">
            Total Plays: {totalPlays}
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            Total Reps: {totalReps}
          </Typography>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportPDF}
            className="btn-action"
          >
            <Icon name="download" className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (isMobile) triggerHapticFeedback("light");
              onSaveAsTemplate();
            }}
            disabled={!currentScript?.id}
            title={
              !currentScript?.id
                ? "Save script first"
                : "Save as reusable template"
            }
            className="btn-action"
          >
            <Icon name="save" className="h-4 w-4 mr-2" />
            Save as Template
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (isMobile) triggerHapticFeedback("light");
              onLoadFromTemplate();
            }}
            className="btn-action"
          >
            <Icon name="folder" className="h-4 w-4 mr-2" />
            Load from Template
          </Button>
        </div>
      </div>
    </div>
  );
};
