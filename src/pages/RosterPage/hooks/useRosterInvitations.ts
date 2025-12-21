import { useCallback } from "react";
import { sendPlayerInvitation } from "../../../services/invitationService";
import type { RosterPlayerView } from "../../../services/rosterService";
import { info, error as logError } from "../../../utils/logger";
import { useToast } from "../../../hooks/useToast";
import type { UseRosterModalsReturn } from "./useRosterModals";
import type { PlayerFormData } from "./useRosterCrud";

interface UseRosterInvitationsOptions {
  teamId: string | null;
  modals: UseRosterModalsReturn;
  playerForm: PlayerFormData;
  loadRoster: () => Promise<void>;
}

export interface UseRosterInvitationsReturn {
  handleSendInvite: (player: RosterPlayerView, e?: React.MouseEvent) => void;
  sendInvitation: (email: string) => Promise<void>;
  handleSendInvitationFromModal: () => Promise<void>;
}

/**
 * useRosterInvitations - Player invitation handlers
 */
export function useRosterInvitations(
  options: UseRosterInvitationsOptions
): UseRosterInvitationsReturn {
  const { teamId, modals, playerForm, loadRoster } = options;
  const toast = useToast();

  const handleSendInvite = useCallback(
    (player: RosterPlayerView, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!player.first_name || !player.last_name) {
        toast.error(
          "Player must have a first and last name to send an invitation"
        );
        return;
      }
      modals.openInvitationModal(player);
    },
    [modals, toast]
  );

  const sendInvitation = useCallback(
    async (email: string) => {
      if (!modals.playerToInvite || !teamId) {
        toast.error("Missing required information");
        return;
      }
      const isResend = modals.playerToInvite.invitation_status === "pending";
      const playerName = `${modals.playerToInvite.first_name} ${modals.playerToInvite.last_name}`;

      const result = await sendPlayerInvitation({
        teamId,
        playerId: modals.playerToInvite.id,
        email,
        playerName,
        teamName: "Your Team",
        invitedBy: "Coach",
      });

      if (!result.success) {
        logError(
          "[RosterPage] Failed to send invitation:",
          result.error.message
        );
        toast.error(`Failed to send invitation: ${result.error.message}`);
        return;
      }

      info(
        `[RosterPage] ${isResend ? "Resent" : "Sent"} invitation to ${playerName} at ${email}`
      );
      toast.success(
        `Invitation ${isResend ? "resent" : "sent"} to ${playerName}`
      );
      await loadRoster();
    },
    [modals.playerToInvite, teamId, toast, loadRoster]
  );

  const handleSendInvitationFromModal = useCallback(async () => {
    if (!playerForm.email_address?.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!teamId) {
      toast.error("Team ID not found");
      return;
    }

    info("[RosterPage] Sending invitation to player");
    const playerName = `${playerForm.first_name} ${playerForm.last_name}`;
    const result = await sendPlayerInvitation({
      playerId: modals.editingPlayer?.id || "",
      email: playerForm.email_address,
      playerName,
      teamName: "Your Team",
      invitedBy: "Coach",
      teamId,
    });

    if (!result.success) {
      logError("[RosterPage] Failed to send invitation:", result.error.message);
      toast.error(result.error.message);
      return;
    }

    toast.success("Invitation sent successfully");
    await loadRoster();
  }, [playerForm, teamId, modals.editingPlayer, toast, loadRoster]);

  return {
    handleSendInvite,
    sendInvitation,
    handleSendInvitationFromModal,
  };
}
