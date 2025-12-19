import React from "react";
import { Modal, Input, FormSelect, Button } from "../../../components/ui";
import { Icon } from "../../../components/ui/Icon/Icon";
import { Typography } from "../../../components/design-system";
import type { RosterPlayerView } from "../../../services/rosterService";
import type { UseAutosavePlayerReturn } from "../hooks/useAutosavePlayer";
import type { PlayerFormData } from "../hooks/useRosterCrud";

// Position options
const POSITION_OPTIONS = [
  "QB",
  "RB",
  "FB",
  "WR",
  "TE",
  "OL",
  "C",
  "G",
  "T",
  "DT",
  "DE",
  "LB",
  "CB",
  "S",
  "K",
  "P",
];

// Grade level options
const GRADE_OPTIONS = [
  { value: "freshman", label: "Freshman" },
  { value: "sophomore", label: "Sophomore" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
  { value: "graduate", label: "Graduate" },
];

function FormErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-sm bg-error-100 dark:bg-error-900/30 border border-error-500 rounded-lg">
      <Typography
        variant="body-sm"
        className="text-error-700 dark:text-error-300"
      >
        {message}
      </Typography>
    </div>
  );
}

function getAutosaveStatusText(
  autosavePlayer: UseAutosavePlayerReturn
): string {
  if (autosavePlayer.status === "saving") return "💾 Saving changes...";
  if (autosavePlayer.status === "saved") return "✓ All changes saved";
  if (autosavePlayer.status === "error") {
    return "⚠️ Autosave failed - please save manually";
  }
  if (autosavePlayer.status === "idle" && autosavePlayer.hasUnsavedChanges) {
    return "⏳ Saving soon...";
  }
  if (autosavePlayer.status === "idle" && !autosavePlayer.hasUnsavedChanges) {
    if (autosavePlayer.lastSaved) return "✓ Up to date";
    return "Ready to edit";
  }

  return "";
}

function AutosaveStatusBanner({
  isEdit,
  editingPlayer,
  autosavePlayer,
}: {
  isEdit: boolean;
  editingPlayer?: RosterPlayerView | null;
  autosavePlayer?: UseAutosavePlayerReturn;
}) {
  if (!isEdit || !editingPlayer || !autosavePlayer) return null;

  const statusText = getAutosaveStatusText(autosavePlayer);
  return (
    <div className="flex items-center justify-between px-sm py-xs rounded-lg bg-secondary/50">
      <Typography variant="body-sm" className="text-secondary">
        {statusText}
      </Typography>
      {autosavePlayer.lastSaved && (
        <Typography variant="body-xs" className="text-tertiary">
          {new Date(autosavePlayer.lastSaved).toLocaleTimeString()}
        </Typography>
      )}
    </div>
  );
}

function parsePositions(positionCsv: string) {
  return positionCsv ? positionCsv.split(",").filter(Boolean) : [];
}

function PositionChips({
  positions,
  onRemove,
}: {
  positions: string[];
  onRemove: (pos: string) => void;
}) {
  if (positions.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap mb-2">
      {positions.map((pos) => (
        <span
          key={pos}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"
        >
          {pos}
          <button
            type="button"
            onClick={() => onRemove(pos)}
            className="ml-1 hover:text-blue-900"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

function PositionsAndJerseySection({
  positions,
  onAddPosition,
  onRemovePosition,
  jerseyNumber,
  onChangeJersey,
}: {
  positions: string[];
  onAddPosition: (pos: string) => void;
  onRemovePosition: (pos: string) => void;
  jerseyNumber: string;
  onChangeJersey: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-md">
      <div>
        <label className="block text-sm font-medium mb-xs">Position(s) *</label>
        <PositionChips positions={positions} onRemove={onRemovePosition} />
        <FormSelect
          value=""
          onChange={onAddPosition}
          placeholder="+ Add Position"
          options={POSITION_OPTIONS.map((pos) => ({
            value: pos,
            label: pos,
          }))}
        />
        <p className="text-xs text-secondary mt-1">
          Select multiple positions if player plays more than one
        </p>
      </div>
      <Input
        label="Jersey Number"
        type="number"
        value={jerseyNumber}
        onChange={(e) => onChangeJersey(e.target.value)}
      />
    </div>
  );
}

function InvitePlayerButton({
  show,
  onSendInvitation,
  isEdit,
  invitationStatus,
  firstName,
}: {
  show: boolean;
  onSendInvitation?: () => Promise<void>;
  isEdit: boolean;
  invitationStatus?: string | null;
  firstName: string;
}) {
  if (!show || !onSendInvitation) return null;

  return (
    <Button
      variant="outline"
      onClick={onSendInvitation}
      className="w-full border-jade-600 text-jade-700 hover:bg-accent dark:border-jade-500 dark:text-jade-400 dark:hover:bg-jade-950"
    >
      <Icon name="mail" className="w-4 h-4 mr-xs" />
      {isEdit && invitationStatus === "pending"
        ? "Resend Invitation"
        : `Invite ${firstName || "Player"} to Team`}
    </Button>
  );
}

function ModalActions({
  onClose,
  onSubmit,
  submitLabel,
  disabled,
}: {
  onClose: () => void;
  onSubmit: () => Promise<void>;
  submitLabel: string;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        disabled={disabled}
        className="bg-primary hover:bg-primary/90"
      >
        {submitLabel}
      </Button>
    </div>
  );
}

interface AddEditPlayerModalProps {
  mode: "add" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  formData: PlayerFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlayerFormData>>;
  onFieldChange?: <K extends keyof PlayerFormData>(
    field: K,
    value: PlayerFormData[K]
  ) => void;
  saving: boolean;
  formError: string | null;
  editingPlayer?: RosterPlayerView | null;
  autosavePlayer?: UseAutosavePlayerReturn;
  onSendInvitation?: () => Promise<void>;
}

/**
 * AddEditPlayerModal - Unified modal for adding/editing players
 * Consolidates the duplicate add/edit modal JSX from RosterPage
 */
export const AddEditPlayerModal: React.FC<AddEditPlayerModalProps> = ({
  mode,
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  onFieldChange,
  saving,
  formError,
  editingPlayer,
  autosavePlayer,
  onSendInvitation,
}) => {
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Player" : "Add New Player";
  let submitLabel = isEdit ? "Save Now" : "Add Player";
  if (saving) {
    submitLabel = isEdit ? "Saving..." : "Adding...";
  }

  const positions = parsePositions(formData.position);

  // Handle field change - use autosave-aware handler in edit mode
  const handleChange = <K extends keyof PlayerFormData>(
    field: K,
    value: PlayerFormData[K]
  ) => {
    if (isEdit && onFieldChange) {
      onFieldChange(field, value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle position add/remove
  const addPosition = (pos: string) => {
    if (!pos) return;
    if (!positions.includes(pos)) {
      handleChange("position", [...positions, pos].join(","));
    }
  };

  const removePosition = (pos: string) => {
    const next = positions.filter((p) => p !== pos);
    handleChange("position", next.join(","));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-md">
        {/* Error display */}
        {formError && <FormErrorBanner message={formError} />}

        {/* Autosave status (edit mode only) */}
        <AutosaveStatusBanner
          isEdit={isEdit}
          editingPlayer={editingPlayer}
          autosavePlayer={autosavePlayer}
        />

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-md">
          <Input
            label="First Name"
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            required
          />
        </div>

        <Input
          label="Nickname"
          value={formData.nickname}
          onChange={(e) => handleChange("nickname", e.target.value)}
          placeholder="e.g., Johnny"
        />

        <PositionsAndJerseySection
          positions={positions}
          onAddPosition={addPosition}
          onRemovePosition={removePosition}
          jerseyNumber={formData.jersey_number}
          onChangeJersey={(value) =>
            setFormData((prev) => ({ ...prev, jersey_number: value }))
          }
        />

        {/* Grade, Height, Weight */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Grade Level
            </label>
            <FormSelect
              value={formData.grade_level}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, grade_level: value }))
              }
              placeholder="Select Grade"
              options={GRADE_OPTIONS}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Height (feet)"
              type="number"
              value={formData.heightFeet}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, heightFeet: e.target.value }))
              }
            />
            <Input
              label="Height (inches)"
              type="number"
              value={formData.heightInches}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  heightInches: e.target.value,
                }))
              }
            />
          </div>
          <Input
            label="Weight (lbs)"
            type="number"
            value={formData.weight_lbs}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, weight_lbs: e.target.value }))
            }
          />
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email_address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                email_address: e.target.value,
              }))
            }
          />
          <Input
            label="Phone"
            value={formData.phone_number}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
            }
          />
        </div>

        <Input
          label="Parent Contact"
          value={formData.parent_contact}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, parent_contact: e.target.value }))
          }
        />

        <InvitePlayerButton
          show={Boolean(formData.email_address?.trim())}
          onSendInvitation={onSendInvitation}
          isEdit={isEdit}
          invitationStatus={editingPlayer?.invitation_status}
          firstName={formData.first_name}
        />

        {/* Action buttons */}
        <ModalActions
          onClose={onClose}
          onSubmit={onSubmit}
          submitLabel={submitLabel}
          disabled={
            saving ||
            !formData.first_name ||
            !formData.last_name ||
            (!isEdit && !formData.position)
          }
        />
      </div>
    </Modal>
  );
};

AddEditPlayerModal.displayName = "AddEditPlayerModal";
