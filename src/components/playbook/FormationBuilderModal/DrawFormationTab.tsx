/**
 * DrawFormationTab - Wrapper for FormationBuilderCanvas
 *
 * Provides:
 * 1. Formation selector (prioritize formations without diagrams)
 * 2. "New Formation" button
 * 3. Canvas for drawing/editing formation diagrams
 */

import React, { useState, useEffect } from "react";
import { FormationBuilderCanvas } from "./FormationBuilderCanvas";
import { FormationService } from "../../../services/formationService";
import { useToast } from "../../../hooks/useToast";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { Pencil, AlertCircle } from "lucide-react";
import type {
  Formation,
  FormationPlayerPosition,
  FormationCreationSource,
} from "../../../types/formation";

interface DrawFormationTabProps {
  playbookId: string;
  formationId?: string;
  formation?: Formation | null;
  isLoading?: boolean;
  onSave: (
    players: FormationPlayerPosition[],
    personnel: string,
    source?: FormationCreationSource
  ) => void;
  onCancel: () => void;
  onFormationSelected: (formationId: string) => void;
}

export const DrawFormationTab: React.FC<DrawFormationTabProps> = ({
  playbookId,
  formationId,
  formation,
  isLoading,
  onSave,
  onCancel,
  onFormationSelected,
}) => {
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [loadingFormations, setLoadingFormations] = useState(false);
  const toast = useToast();

  // Load all formations
  useEffect(() => {
    const loadFormations = async () => {
      setLoadingFormations(true);
      try {
        const formations =
          await FormationService.getFormationsByPlaybook(playbookId);
        setAllFormations(formations);
      } catch (error) {
        console.error("Failed to load formations:", error);
        toast.error("Failed to load formations");
      } finally {
        setLoadingFormations(false);
      }
    };

    loadFormations();
  }, [playbookId, toast]);

  // Filter formations without diagrams (prioritize these)
  const formationsWithoutDiagrams = allFormations.filter(
    (f) => !f.player_positions || f.player_positions.length === 0
  );

  const formationsWithDiagrams = allFormations.filter(
    (f) => f.player_positions && f.player_positions.length > 0
  );

  // If already editing a formation, show the canvas
  if (formationId || formation) {
    return (
      <div className="h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Typography variant="body-md" className="text-text-muted">
              Loading formation...
            </Typography>
          </div>
        ) : (
          <FormationBuilderCanvas
            playbookId={playbookId}
            formationId={formationId}
            formation={formation || null}
            creationSource="formation_builder"
            onSave={onSave}
            onCancel={onCancel}
          />
        )}
      </div>
    );
  }

  // Show formation selector if no formation selected
  return (
    <div className="flex flex-col items-center justify-center h-full p-spacing-xl max-w-2xl mx-auto">
      <div className="w-full space-y-spacing-lg">
        {/* Header */}
        <div className="text-center">
          <Pencil className="w-12 h-12 mx-auto mb-spacing-md text-primary-500" />
          <Typography
            variant="headline-lg"
            className="text-text-primary mb-spacing-sm"
          >
            Draw Formation Diagram
          </Typography>
          <Typography variant="body-md" className="text-text-muted">
            Select a formation to add or edit its player positions
          </Typography>
        </div>

        {/* Formations Without Diagrams (Priority) */}
        {formationsWithoutDiagrams.length > 0 && (
          <div className="p-spacing-lg bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start gap-spacing-sm mb-spacing-md">
              <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
              <div>
                <Typography
                  variant="body-md"
                  className="text-warning-900 font-medium"
                >
                  {formationsWithoutDiagrams.length} Formation
                  {formationsWithoutDiagrams.length > 1 ? "s" : ""} Need
                  Diagrams
                </Typography>
                <Typography variant="body-sm" className="text-warning-700">
                  These formations don't have player positions yet
                </Typography>
              </div>
            </div>

            <select
              onChange={(e) => {
                if (e.target.value) {
                  onFormationSelected(e.target.value);
                }
              }}
              className="w-full px-spacing-md py-spacing-sm border border-warning-300 rounded-md bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-warning-500"
            >
              <option value="">Select formation to draw...</option>
              {formationsWithoutDiagrams.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.direction !== "base" && `(${f.direction})`} -{" "}
                  {f.personnel_name || "No personnel"}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* All Formations */}
        {loadingFormations ? (
          <div className="text-center py-spacing-lg">
            <Typography variant="body-md" className="text-text-muted">
              Loading formations...
            </Typography>
          </div>
        ) : allFormations.length === 0 ? (
          <div className="text-center py-spacing-lg p-spacing-lg bg-surface-muted rounded-lg border border-border-secondary">
            <Typography
              variant="body-md"
              className="text-text-muted mb-spacing-md"
            >
              No formations found. Create one first in the "Edit Details" tab.
            </Typography>
          </div>
        ) : (
          <div>
            <Typography
              variant="body-md"
              className="text-text-primary font-medium mb-spacing-sm"
            >
              Or select any formation:
            </Typography>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onFormationSelected(e.target.value);
                }
              }}
              className="w-full px-spacing-md py-spacing-sm border border-border-primary rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a formation...</option>

              {/* Formations with diagrams */}
              {formationsWithDiagrams.length > 0 && (
                <optgroup label="Formations with diagrams">
                  {formationsWithDiagrams.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.direction !== "base" && `(${f.direction})`}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-spacing-md pt-spacing-md border-t border-border-primary">
          <Button onClick={onCancel} variant="secondary" className="flex-1">
            Cancel
          </Button>
        </div>

        <Typography
          variant="caption"
          className="text-text-muted text-center block"
        >
          💡 Tip: Create formations in "Edit Details" tab, then draw diagrams
          here
        </Typography>
      </div>
    </div>
  );
};
