import React, { lazy, Suspense } from "react";
import { Modal, FormSelect, Button } from "../../../components/ui";
import { Icon } from "../../../components/ui/Icon/Icon";
import { Typography } from "../../../components/design-system";
import { DeleteConfirmationDialog } from "../../../components/common/DeleteConfirmationDialog";
import { SendInvitationModal } from "../../../components/roster/SendInvitationModal";
import type { RosterPlayerView } from "../../../services/rosterService";
import type { UseRosterModalsReturn } from "../hooks";
import type { BulkEditUpdates } from "../../../components/roster/BulkEditModal";

const RosterImportModal = lazy(() =>
  import("../../../components/roster/RosterImportModal").then((m) => ({
    default: m.RosterImportModal,
  }))
);
const BulkEditModal = lazy(() =>
  import("../../../components/roster/BulkEditModal").then((m) => ({
    default: m.BulkEditModal,
  }))
);

// Status options for bulk status change
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "injured", label: "Injured" },
  { value: "suspended", label: "Suspended" },
  { value: "academic_probation", label: "Academic Probation" },
  { value: "inactive", label: "Inactive" },
  { value: "inactive_cut", label: "Inactive (Cut)" },
  { value: "inactive_quit", label: "Inactive (Quit)" },
  { value: "transferred", label: "Transferred" },
  { value: "alumni", label: "Alumni" },
] as const;

export interface RosterPageModalsProps {
  modals: UseRosterModalsReturn;
  // Delete
  onDeleteConfirm: () => Promise<void>;
  // Bulk status
  onBulkStatusConfirm: () => Promise<void>;
  // Bulk edit
  onBulkEdit: (updates: BulkEditUpdates) => Promise<void>;
  // Import
  onImport: (players: any[]) => Promise<void>;
  // Invitation
  onSendInvitation: (email: string) => Promise<void>;
  // State
  saving: boolean;
  selectedPlayerIds: Set<string>;
  players: RosterPlayerView[];
}

/**
 * RosterPageModals - All modals/dialogs for RosterPage
 * Extracted to reduce main component complexity
 */
export const RosterPageModals: React.FC<RosterPageModalsProps> = ({
  modals,
  onDeleteConfirm,
  onBulkStatusConfirm,
  onBulkEdit,
  onImport,
  onSendInvitation,
  saving,
  selectedPlayerIds,
  players,
}) => {
  return (
    <>
      {/* Import Modal (lazy loaded) */}
      <Suspense fallback={null}>
        <RosterImportModal
          isOpen={modals.showImportModal}
          onClose={modals.closeImportModal}
          onImport={onImport}
        />
      </Suspense>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={modals.showDeleteDialog}
        onClose={modals.closeDeleteDialog}
        onConfirm={onDeleteConfirm}
        title="Delete Player"
        entityName={modals.playerToDelete?.name || ""}
      />

      {/* Bulk Status Change Dialog */}
      <Modal
        isOpen={modals.showBulkStatusDialog}
        onClose={modals.closeBulkStatusDialog}
        title="Change Player Status"
      >
        <div className="space-y-md">
          <Typography variant="body-sm" className="text-secondary">
            You are about to change the status for{" "}
            <strong>{selectedPlayerIds.size}</strong> player
            {selectedPlayerIds.size !== 1 ? "s" : ""}. This will affect their
            access to team features.
          </Typography>

          <div className="bg-warning-bg border border-warning rounded-lg p-sm">
            <div className="flex gap-xs">
              <Icon
                name="info"
                className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm text-warning-foreground">
                <strong>Note:</strong> Players marked as Inactive (Cut),
                Inactive (Quit), or Alumni will lose access to the team feed,
                calendar, and playbook.
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="bulk-status"
              className="block text-sm font-medium text-primary mb-2"
            >
              New Status
            </label>
            <FormSelect
              id="bulk-status"
              value={modals.bulkStatusValue}
              onChange={modals.setBulkStatusValue}
              options={STATUS_OPTIONS.map((status) => ({
                value: status.value,
                label: status.label,
              }))}
            />
          </div>

          <div className="flex justify-end gap-sm pt-md">
            <Button
              variant="outline"
              onClick={modals.closeBulkStatusDialog}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={onBulkStatusConfirm}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Edit Modal (lazy loaded) */}
      <Suspense fallback={null}>
        <BulkEditModal
          isOpen={modals.showBulkEditModal}
          onClose={modals.closeBulkEditModal}
          selectedCount={selectedPlayerIds.size}
          onSave={onBulkEdit}
          hasInactiveOrAlumni={Array.from(selectedPlayerIds).some((id) => {
            const player = players.find((p) => p.id === id);
            return (
              player &&
              (player.roster_status === "inactive_cut" ||
                player.roster_status === "inactive_quit" ||
                player.roster_status === "alumni")
            );
          })}
        />
      </Suspense>

      {/* Send Invitation Modal */}
      <SendInvitationModal
        isOpen={modals.showInvitationModal}
        onClose={modals.closeInvitationModal}
        player={modals.playerToInvite}
        onSend={onSendInvitation}
      />
    </>
  );
};

RosterPageModals.displayName = "RosterPageModals";
