import React from "react";
import { Modal } from "../ui/Modal/Modal";
import { TeamTrophyCase } from "./TeamTrophyCase";

interface TeamTrophyCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

export const TeamTrophyCaseModal: React.FC<TeamTrophyCaseModalProps> = ({
  isOpen,
  onClose,
  teamId,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Team Trophy Case" size="lg">
      <div className="p-6">
        <TeamTrophyCase teamId={teamId} />
      </div>
    </Modal>
  );
};
