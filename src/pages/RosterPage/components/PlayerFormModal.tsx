import React from "react";
import { Modal, Input, FormSelect, Button } from "../../../components/ui";
import { Icon } from "../../../components/ui/Icon/Icon";
import { Typography } from "../../../components/design-system";
import type { RosterPlayerView } from "../../../services/rosterService";

export interface PlayerFormData {
  first_name: string;
  last_name: string;
  nickname: string;
  position: string;
  jersey_number: string;
  grade_level: string;
  heightFeet: string;
  heightInches: string;
  weight_lbs: string;
  email_address: string;
  phone_number: string;
  parent_contact: string;
  graduation_year: string;
  dominant_hand: string;
  roster_status: string;
}

// Extracted component for physical stats fields
const PhysicalStatsFields: React.FC<{
  formData: Pick<PlayerFormData, "heightFeet" | "heightInches" | "weight_lbs">;
  onFieldChange: <K extends keyof PlayerFormData>(
    field: K,
    value: PlayerFormData[K]
  ) => void;
  saving: boolean;
}> = ({ formData, onFieldChange, saving }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Height (ft)
      </label>
      <Input
        type="number"
        value={formData.heightFeet}
        onChange={(e) => onFieldChange("heightFeet", e.target.value)}
        placeholder="5"
        min="0"
        max="8"
        disabled={saving}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Height (in)
      </label>
      <Input
        type="number"
        value={formData.heightInches}
        onChange={(e) => onFieldChange("heightInches", e.target.value)}
        placeholder="10"
        min="0"
        max="11"
        disabled={saving}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Weight (lbs)
      </label>
      <Input
        type="number"
        value={formData.weight_lbs}
        onChange={(e) => onFieldChange("weight_lbs", e.target.value)}
        placeholder="150"
        min="0"
        disabled={saving}
      />
    </div>
  </div>
);

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  mode: "add" | "edit";
  formData: PlayerFormData;
  onFieldChange: <K extends keyof PlayerFormData>(
    field: K,
    value: PlayerFormData[K]
  ) => void;
  saving: boolean;
  error: string | null;
  editingPlayer: RosterPlayerView | null;
  autosaving?: boolean;
  positionOptions: Array<{ value: string; label: string }>;
  gradeLevelOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
}

export const PlayerFormModal: React.FC<PlayerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  formData,
  onFieldChange,
  saving,
  error,
  editingPlayer,
  autosaving,
  positionOptions,
  gradeLevelOptions,
  statusOptions,
}) => {
  const title =
    mode === "add"
      ? "Add New Player"
      : `Edit ${editingPlayer?.first_name} ${editingPlayer?.last_name}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-md">
        {/* Autosave Indicator (Edit Mode Only) */}
        {mode === "edit" && autosaving && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-3 flex items-center gap-2">
            <Icon name="save" className="w-4 h-4 text-info animate-pulse" />
            <Typography variant="body-sm" className="text-info">
              Autosaving changes...
            </Typography>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center gap-2">
            <Icon name="alert-circle" className="w-4 h-4 text-error" />
            <Typography variant="body-sm" className="text-error">
              {error}
            </Typography>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              First Name <span className="text-error">*</span>
            </label>
            <Input
              type="text"
              value={formData.first_name}
              onChange={(e) => onFieldChange("first_name", e.target.value)}
              placeholder="Enter first name"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Last Name <span className="text-error">*</span>
            </label>
            <Input
              type="text"
              value={formData.last_name}
              onChange={(e) => onFieldChange("last_name", e.target.value)}
              placeholder="Enter last name"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Nickname
            </label>
            <Input
              type="text"
              value={formData.nickname}
              onChange={(e) => onFieldChange("nickname", e.target.value)}
              placeholder="Optional"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Jersey Number
            </label>
            <Input
              type="number"
              value={formData.jersey_number}
              onChange={(e) => onFieldChange("jersey_number", e.target.value)}
              placeholder="#"
              min="0"
              max="99"
              disabled={saving}
            />
          </div>
        </div>

        {/* Position and Grade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Primary Position <span className="text-error">*</span>
            </label>
            <FormSelect
              value={formData.position}
              onChange={(value) => onFieldChange("position", value)}
              options={positionOptions}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Grade Level
            </label>
            <FormSelect
              value={formData.grade_level}
              onChange={(value) => onFieldChange("grade_level", value)}
              options={gradeLevelOptions}
              disabled={saving}
            />
          </div>
        </div>

        {/* Physical Stats */}
        <PhysicalStatsFields
          formData={formData}
          onFieldChange={onFieldChange}
          saving={saving}
        />

        {/* Contact Info (Edit Mode Only) */}
        {mode === "edit" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email_address}
                onChange={(e) => onFieldChange("email_address", e.target.value)}
                placeholder="player@example.com"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => onFieldChange("phone_number", e.target.value)}
                placeholder="(555) 123-4567"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Parent/Guardian Contact
              </label>
              <Input
                type="text"
                value={formData.parent_contact}
                onChange={(e) =>
                  onFieldChange("parent_contact", e.target.value)
                }
                placeholder="parent@example.com or phone"
                disabled={saving}
              />
            </div>
          </div>
        )}

        {/* Status (Edit Mode Only) */}
        {mode === "edit" && (
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Roster Status
            </label>
            <FormSelect
              value={formData.roster_status}
              onChange={(value) => onFieldChange("roster_status", value)}
              options={statusOptions}
              disabled={saving}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-sm pt-md border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {(() => {
              if (saving) {
                return mode === "add" ? "Adding..." : "Saving...";
              }
              return mode === "add" ? "Add Player" : "Save Changes";
            })()}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
