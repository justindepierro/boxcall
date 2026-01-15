/**
 * ScriptsListSection Component
 *
 * Section displaying the list of practice scripts with header and grid
 */

import React from "react";
import Icon from "../../../components/ui/Icon/Icon";
import { Button } from "../../../components/ui/Button/Button";
import { Typography } from "../../../components/design-system/Typography";
import { ScriptCard } from "./ScriptCard";
import type { PracticeScript } from "../../../services/practice";

interface ScriptsListSectionProps {
  activeScripts: PracticeScript[];
  archivedScripts: PracticeScript[];
  onCreateScript: () => void;
  onEditScript: (script: PracticeScript) => void;
  onDuplicateScript: (script: PracticeScript) => void;
  onArchiveScript: (script: PracticeScript) => void;
  onDeleteScript: (scriptId: string) => void;
}

export const ScriptsListSection: React.FC<ScriptsListSectionProps> = ({
  activeScripts,
  archivedScripts,
  onCreateScript,
  onEditScript,
  onDuplicateScript,
  onArchiveScript,
  onDeleteScript,
}) => {
  return (
    <div className="space-y-6" id="practice-scripts-section">
      {/* Header with Create Button */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography
            variant="headline-md"
            className="text-primary font-semibold"
          >
            Your Practice Scripts
          </Typography>
          <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-secondary">
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1">
              {activeScripts.length} Active
            </span>
            {archivedScripts.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1">
                {archivedScripts.length} Archived
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={onCreateScript}
          variant="primary"
          className="w-full sm:w-auto"
        >
          <Icon name="plus" className="h-4 w-4 mr-2" />
          New Script
        </Button>
      </div>

      {/* Scripts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeScripts.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            onEdit={onEditScript}
            onDuplicate={onDuplicateScript}
            onArchive={onArchiveScript}
            onDelete={onDeleteScript}
          />
        ))}
      </div>

      {/* Archived Scripts Section */}
      {archivedScripts.length > 0 && (
        <div className="mt-12">
          <Typography variant="headline-sm" className="text-secondary mb-4">
            Archived Scripts ({archivedScripts.length})
          </Typography>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archivedScripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                onEdit={onEditScript}
                onDuplicate={onDuplicateScript}
                onArchive={onArchiveScript}
                onDelete={onDeleteScript}
                isArchived
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ScriptsListSection.displayName = "ScriptsListSection";
