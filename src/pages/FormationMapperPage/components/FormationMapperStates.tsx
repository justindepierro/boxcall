import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button/Button";
import { Typography } from "../../../components/design-system/Typography";
import { Icon } from "../../../components/ui/Icon";
import { Card } from "../../../components/ui/Card";
import { Modal } from "../../../components/ui/Modal/Modal";
import { FormationSelector } from "../../../components/playbook/FormationSelector";
import type { Play } from "../../../types/play";
import type { Formation } from "../../../types/formation";

export const FormationMapperLoadingState: React.FC = () => (
  <Card variant="glass" size="lg">
    <div className="flex items-center gap-2">
      <Icon name="loader" className="h-5 w-5 animate-spin text-muted" />
      <Typography variant="body-sm" className="text-secondary">
        Loading plays needing formation mapping...
      </Typography>
    </div>
  </Card>
);

export const FormationMapperEmptyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card variant="glass" size="lg" className="text-center space-y-3">
      <Icon
        name="check-circle"
        className="mx-auto h-10 w-10 text-success-500"
      />
      <Typography variant="headline-sm" className="text-primary">
        All synced!
      </Typography>
      <Typography variant="body-sm" className="text-secondary">
        Every play in this playbook is linked to a formation.
      </Typography>
      <Button variant="secondary" onClick={() => navigate("/playbook")}>
        Back to Playbook
      </Button>
    </Card>
  );
};

interface FormationMapperErrorsProps {
  error: string | null;
  formationsError: string | null;
}

export const FormationMapperErrors: React.FC<FormationMapperErrorsProps> = ({
  error,
  formationsError,
}) => (
  <>
    {error && (
      <Card variant="glass" size="md" className="border-error-300">
        <div className="flex items-center gap-3 text-error-600">
          <Icon name="alert-circle" className="h-5 w-5" />
          <Typography variant="body-sm">{error}</Typography>
        </div>
      </Card>
    )}

    {formationsError && (
      <Card variant="glass" size="md" className="border-warning-300">
        <div className="flex items-center gap-3 text-warning-600">
          <Icon name="alert-triangle" className="h-5 w-5" />
          <Typography variant="body-sm">
            {formationsError}. Suggestions may be limited until this reloads.
          </Typography>
        </div>
      </Card>
    )}
  </>
);

// Link Formation Modal
interface LinkFormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlay: Play | null;
  selectedFormation: Formation | null;
  assigning: boolean;
  onFormationChange: (formationId: string | null, formation: Formation | null) => void;
  onCreateNew: () => void;
  onAssign: () => void;
  onFormationsLoaded: (formations: Formation[]) => void;
}

export const LinkFormationModal: React.FC<LinkFormationModalProps> = ({
  isOpen,
  onClose,
  editingPlay,
  selectedFormation,
  assigning,
  onFormationChange,
  onCreateNew,
  onAssign,
  onFormationsLoaded,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Link Formation"
    size="md"
  >
    {editingPlay && (
      <div className="space-y-5">
        <div>
          <Typography variant="body-md" className="text-primary">
            {editingPlay.play_name || "Untitled Play"}
          </Typography>
          <Typography variant="caption" className="text-secondary">
            Current string: {editingPlay.formation || "—"}
          </Typography>
        </div>
        <FormationSelector
          playbookId={editingPlay.playbook_id}
          value={selectedFormation?.id || null}
          onChange={(formationId, formation) => {
            if (formationId && formation) {
              onFormationChange(formationId, formation);
            } else {
              onFormationChange(null, null);
            }
          }}
          onCreateNew={onCreateNew}
          disabled={assigning}
          onFormationsLoaded={onFormationsLoaded}
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onAssign}
            disabled={!selectedFormation || assigning}
          >
            Assign
          </Button>
        </div>
      </div>
    )}
  </Modal>
);

// Bulk Assign Modal
interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlays: Play[];
  selectedCount: number;
  selectedPlaybookId: string;
  bulkAssignFormation: Formation | null;
  assigning: boolean;
  onFormationChange: (formationId: string | null, formation: Formation | null) => void;
  onConfirm: () => void;
  onFormationsLoaded: (formations: Formation[]) => void;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  selectedPlays,
  selectedCount,
  selectedPlaybookId,
  bulkAssignFormation,
  assigning,
  onFormationChange,
  onConfirm,
  onFormationsLoaded,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Assign Formation (${selectedCount} selected)`}
    size="md"
  >
    <div className="space-y-5">
      <Typography variant="body-sm" className="text-secondary">
        Choose a formation to link to the selected plays.
      </Typography>
      <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-secondary/60 p-3">
        <Typography
          variant="caption"
          className="text-muted uppercase tracking-wide"
        >
          Selected plays
        </Typography>
        <ul className="mt-2 space-y-1">
          {selectedPlays.slice(0, 6).map((play) => (
            <li key={play.id} className="text-sm text-primary truncate">
              {play.play_name || "Untitled Play"}
            </li>
          ))}
          {selectedCount > 6 && (
            <li className="text-xs text-secondary">
              +{selectedCount - 6} more
            </li>
          )}
          {selectedCount === 0 && (
            <li className="text-xs text-secondary">No plays selected</li>
          )}
        </ul>
      </div>
      <FormationSelector
        playbookId={selectedPlaybookId || selectedPlays[0]?.playbook_id || ""}
        value={bulkAssignFormation?.id || null}
        onChange={(formationId, formation) => {
          if (formationId && formation) {
            onFormationChange(formationId, formation);
          } else {
            onFormationChange(null, null);
          }
        }}
        disabled={assigning || selectedCount === 0 || !selectedPlaybookId}
        onFormationsLoaded={onFormationsLoaded}
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={assigning}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={!bulkAssignFormation || assigning || selectedCount === 0}
        >
          Assign to selected
        </Button>
      </div>
    </div>
  </Modal>
);

FormationMapperLoadingState.displayName = "FormationMapperLoadingState";
FormationMapperEmptyState.displayName = "FormationMapperEmptyState";
FormationMapperErrors.displayName = "FormationMapperErrors";
LinkFormationModal.displayName = "LinkFormationModal";
BulkAssignModal.displayName = "BulkAssignModal";
