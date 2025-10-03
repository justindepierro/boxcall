import React from "react";
import { Modal } from "../ui/Modal/Modal";
import { SeasonStatsCard } from "./SeasonStatsCard";

interface SeasonStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  userRole?: string;
}

export const SeasonStatsModal: React.FC<SeasonStatsModalProps> = ({
  isOpen,
  onClose,
  teamId,
  userRole,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Season Statistics"
      size="lg"
    >
      <div className="p-6">
        <SeasonStatsCard teamId={teamId} userRole={userRole} />
      </div>
    </Modal>
  );
};
