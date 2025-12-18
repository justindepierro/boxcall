import React from "react";
import type { Formation } from "../../../types/formation";
import type { PersonnelConfiguration } from "../../../types/personnel";
import { Typography } from "../../design-system/Typography";
import { Button } from "../../ui/Button/Button";

export type FormationSelectorProps = {
  formations: Formation[];
  selectedFormation: Formation | null;
  linkedFormation: Formation | null;
  applyToBothSides: boolean;
  loading: boolean;
  isMobile: boolean;
  isSelected: (formationId: string) => boolean;
  toggleSelection: (formationId: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  selectionCount: number;
  hasSelection: boolean;
  onSelectFormation: (formation: Formation | null) => void;
  onApplyToBothSidesChange: (value: boolean) => void;
};

export const FormationSelector: React.FC<FormationSelectorProps> = ({
  formations,
  selectedFormation,
  linkedFormation,
  loading,
  onSelectFormation,
}) => {
  return (
    <div className="flex flex-col gap-xs">
      <Typography variant="body-sm" className="text-muted">
        {loading ? "Loading formations…" : `Formations (${formations.length})`}
      </Typography>
      <div className="border border-secondary rounded-md overflow-hidden">
        {formations.length === 0 ? (
          <div className="p-sm">
            <Typography variant="body-sm" className="text-muted">
              No formations found.
            </Typography>
          </div>
        ) : (
          formations.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFormation(f)}
              className={
                "w-full text-left px-sm py-xs border-b border-secondary last:border-b-0 " +
                (selectedFormation?.id === f.id ? "bg-muted" : "bg-primary")
              }
            >
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" className="text-primary">
                  {f.name}
                </Typography>
                {linkedFormation?.id === f.id && (
                  <Typography variant="caption" className="text-muted">
                    Linked
                  </Typography>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export type NewFormationFormProps = {
  playbookId: string;
  availablePersonnel: PersonnelConfiguration[];
  onFormationCreated: (formation: Formation) => void;
  onLoadData: () => Promise<void>;
};

export const NewFormationForm: React.FC<NewFormationFormProps> = () => {
  return (
    <div className="p-sm border border-secondary rounded-md bg-muted">
      <Typography variant="body-sm" className="text-muted">
        Formation creation is currently unavailable.
      </Typography>
    </div>
  );
};

export type FormationEditFormProps = {
  selectedFormation: Formation;
  availablePersonnel: PersonnelConfiguration[];
  saving: boolean;
  selectedPersonnelIds: string[];
  category: string;
  formationType: string;
  runStrength: string;
  passStrength: string;
  tags: string[];
  description: string;
  setCategory: (value: string) => void;
  setFormationType: (value: string) => void;
  setRunStrength: (value: string) => void;
  setPassStrength: (value: string) => void;
  setTags: (value: string[]) => void;
  setDescription: (value: string) => void;
  togglePersonnel: (personnelId: string) => void;
  onSave: () => Promise<void>;
  onAutoSave: () => Promise<void>;
  onShowOppositeModal: () => Promise<void>;
};

export const FormationEditForm: React.FC<FormationEditFormProps> = ({
  selectedFormation,
  saving,
  onSave,
}) => {
  return (
    <div className="p-sm border border-secondary rounded-md bg-primary">
      <div className="flex items-center justify-between">
        <Typography variant="body-md" className="text-primary font-medium">
          Editing: {selectedFormation.name}
        </Typography>
        <Button onClick={onSave} variant="primary" size="sm" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <Typography variant="caption" className="text-muted mt-xs">
        Metadata editor extracted modules are currently stubbed.
      </Typography>
    </div>
  );
};
