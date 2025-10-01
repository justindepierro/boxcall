import React from "react";
import { Modal } from "../ui/Modal/Modal";
import { SharedGoalTracker } from "../collaboration/SharedGoalTracker";

interface TeamGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetId: string;
  userRole: "coach" | "player" | "family";
  userId: string;
  teamId: string;
}

export const TeamGoalsModal: React.FC<TeamGoalsModalProps> = ({
  isOpen,
  onClose,
  widgetId,
  userRole,
  userId,
  teamId,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Goals & Progress"
      size="xl"
    >
      <div className="p-6">
        <SharedGoalTracker
          widgetId={widgetId}
          userRole={userRole}
          userId={userId}
          teamId={teamId}
        />
      </div>
    </Modal>
  );
};
