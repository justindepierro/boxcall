import React from "react";
import { Modal } from "../ui/Modal/Modal";
import { TeamVoteWidget } from "./TeamVoteWidget";

interface TeamVotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetId: string;
  userRole: "coach" | "player" | "family";
  userId: string;
  userName: string;
}

export const TeamVotesModal: React.FC<TeamVotesModalProps> = ({
  isOpen,
  onClose,
  widgetId,
  userRole,
  userId,
  userName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Decisions & Voting"
      size="xl"
    >
      <div className="p-6">
        <TeamVoteWidget
          widgetId={widgetId}
          userRole={userRole}
          userId={userId}
          userName={userName}
        />
      </div>
    </Modal>
  );
};
