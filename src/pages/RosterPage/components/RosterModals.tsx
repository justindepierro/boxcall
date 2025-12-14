import React from "react";
import { Modal, Button, FormSelect } from "../../../components/ui";
import { Icon } from "../../../components/ui/Icon/Icon";
import { Typography } from "../../../components/design-system";
import { SendInvitationModal } from "../../../components/roster/SendInvitationModal";
import type { RosterPlayerView } from "../../../services/rosterService";

interface RosterModalsProps {
  // Delete Modal
  showDeleteModal: boolean;
  onDeleteClose: () => void;
  onDeleteConfirm: () => Promise<void>;
  deletingPlayer: RosterPlayerView | null;
  deleting: boolean;

  // Bulk Status Modal
  showBulkStatusModal: boolean;
  onBulkStatusClose: () => void;
  onBulkStatusConfirm: () => Promise<void>;
  bulkStatus: string;
  onBulkStatusChange: (status: string) => void;
  selectedCount: number;
  bulkUpdating: boolean;
  statusOptions: Array<{ value: string; label: string }>;

  // Bulk Edit Modal
  showBulkEditModal: boolean;
  onBulkEditClose: () => void;
  // Add additional bulk edit props as needed

  // Invite Modal
  showInviteModal: boolean;
  onInviteClose: () => void;
  invitingPlayer: RosterPlayerView | null;
}

export const RosterModals: React.FC<RosterModalsProps> = ({
  showDeleteModal,
  onDeleteClose,
  onDeleteConfirm,
  deletingPlayer,
  deleting,
  showBulkStatusModal,
  onBulkStatusClose,
  onBulkStatusConfirm,
  bulkStatus,
  onBulkStatusChange,
  selectedCount,
  bulkUpdating,
  statusOptions,
  showBulkEditModal,
  onBulkEditClose,
  showInviteModal,
  onInviteClose,
  invitingPlayer,
}) => {
  return (
    <>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={onDeleteClose}
        title="Delete Player"
        size="sm"
      >
        <div className="space-y-md">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start gap-3">
            <Icon
              name="alert-triangle"
              className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
            />
            <div className="space-y-1">
              <Typography
                variant="body-sm"
                className="text-warning font-medium"
              >
                This action cannot be undone
              </Typography>
              <Typography variant="body-sm" className="text-muted">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-primary">
                  {deletingPlayer?.first_name} {deletingPlayer?.last_name}
                </span>
                ? All associated data will be permanently removed.
              </Typography>
            </div>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-border">
            <Button
              variant="outline"
              onClick={onDeleteClose}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Player"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Status Change Modal */}
      <Modal
        isOpen={showBulkStatusModal}
        onClose={onBulkStatusClose}
        title="Change Status"
        size="sm"
      >
        <div className="space-y-md">
          <div className="bg-info/10 border border-info/20 rounded-lg p-3">
            <Typography variant="body-sm" className="text-info">
              Change the status for{" "}
              <span className="font-semibold">
                {selectedCount} selected player(s)
              </span>
            </Typography>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              New Status
            </label>
            <FormSelect
              value={bulkStatus}
              onChange={onBulkStatusChange}
              options={statusOptions}
              disabled={bulkUpdating}
            />
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-border">
            <Button
              variant="outline"
              onClick={onBulkStatusClose}
              disabled={bulkUpdating}
            >
              Cancel
            </Button>
            <Button onClick={onBulkStatusConfirm} disabled={bulkUpdating}>
              {bulkUpdating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Edit Modal (Placeholder for future implementation) */}
      <Modal
        isOpen={showBulkEditModal}
        onClose={onBulkEditClose}
        title="Bulk Edit Players"
        size="lg"
      >
        <div className="space-y-md">
          <div className="bg-info/10 border border-info/20 rounded-lg p-3">
            <Typography variant="body-sm" className="text-info">
              Bulk edit functionality coming soon. You can currently change
              status using the "Change Status" action.
            </Typography>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-border">
            <Button variant="outline" onClick={onBulkEditClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Player Modal */}
      {invitingPlayer && (
        <SendInvitationModal
          isOpen={showInviteModal}
          onClose={onInviteClose}
          player={invitingPlayer}
          onSend={async () => {
            // Handled by parent
          }}
        />
      )}
    </>
  );
};
