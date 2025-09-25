import React, { useState } from "react";
import { Icon } from "../../components/ui/Icon/Icon";
import { Typography } from "../../components/design-system";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui";
import type { TeamRole } from "../../types/roles";

interface TeamMemberInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invitation: TeamInvitation) => Promise<void>;
  type: "staff" | "player";
}

export interface TeamInvitation {
  email: string;
  role: TeamRole;
  firstName?: string;
  lastName?: string;
  message?: string;
}

export const TeamMemberInviteModal: React.FC<TeamMemberInviteModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  type,
}) => {
  const [invitationData, setInvitationData] = useState<TeamInvitation>({
    email: "",
    role: type === "staff" ? "assistant_coach" : "player",
    firstName: "",
    lastName: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationData.email) return;

    setIsSubmitting(true);
    try {
      await onInvite(invitationData);
      setInvitationData({
        email: "",
        role: type === "staff" ? "assistant_coach" : "player",
        firstName: "",
        lastName: "",
        message: "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to send invitation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleOptions = () => {
    if (type === "staff") {
      return [
        { value: "assistant_coach", label: "Assistant Coach" },
        { value: "coordinator", label: "Coordinator" },
        { value: "manager", label: "Manager" },
      ];
    } else {
      return [
        { value: "player", label: "Player" },
        { value: "family", label: "Family Member" },
        { value: "alumni", label: "Alumni" },
      ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay-modal flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="headline-lg">
              Invite {type === "staff" ? "Staff Member" : "Team Member"}
            </Typography>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-secondary"
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={invitationData.email}
                onChange={(e) =>
                  setInvitationData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-focus-info"
                placeholder="john.doe@school.edu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={invitationData.firstName}
                  onChange={(e) =>
                    setInvitationData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-focus-info"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={invitationData.lastName}
                  onChange={(e) =>
                    setInvitationData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-focus-info"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Role
              </label>
              <select
                value={invitationData.role}
                onChange={(e) =>
                  setInvitationData((prev) => ({
                    ...prev,
                    role: e.target.value as TeamRole,
                  }))
                }
                className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-focus-info"
              >
                {getRoleOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Personal Message (Optional)
              </label>
              <textarea
                value={invitationData.message}
                onChange={(e) =>
                  setInvitationData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Join our ${type === "staff" ? "coaching staff" : "team"}! We're excited to have you on board.`}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !invitationData.email}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon name="mail" className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
