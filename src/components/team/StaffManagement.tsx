import React, { useState, useEffect } from "react";
import { Icon } from "../../components/ui/Icon/Icon";
import { Typography } from "../../components/design-system";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui";
import { UserAvatar } from "../../components/ui/UserAvatar";
import {
  TeamMemberInviteModal,
  type TeamInvitation,
} from "./TeamMemberInviteModal";
import type { TeamRole } from "../../types/roles";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "pending" | "inactive";
  invitedAt: Date;
  joinedAt?: Date;
}

interface StaffManagementProps {
  teamId: string;
}

/** Staff member card component */
function StaffMemberCard({
  member,
  getRoleColor,
  getRoleLabel,
}: {
  member: StaffMember;
  getRoleColor: (role: TeamRole) => string;
  getRoleLabel: (role: TeamRole) => string;
}) {
  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-success/20 text-success";
    if (status === "pending") return "bg-warning/20 text-warning";
    return "bg-secondary text-primary";
  };

  const getStatusLabel = (status: string) => {
    if (status === "active") return "Active";
    if (status === "pending") return "Pending";
    return "Inactive";
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <UserAvatar
            userId={member.id}
            name={member.name}
            role={member.role}
            size="lg"
          />
          <div>
            <Typography variant="headline-sm" className="text-primary">
              {member.name}
            </Typography>
            <Typography variant="body-sm" color="muted">
              {member.email}
            </Typography>
          </div>
        </div>
        <div className="flex space-x-1">
          <button className="p-1 text-muted hover:text-secondary">
            <Icon name="edit" className="h-4 w-4" />
          </button>
          <button className="p-1 text-muted hover:text-error">
            <Icon name="delete" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="body-sm" color="muted">
            Role:
          </Typography>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${getRoleColor(
              member.role
            )}`}
          >
            {getRoleLabel(member.role)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <Typography variant="body-sm" color="muted">
            Status:
          </Typography>
          <span
            className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(
              member.status
            )}`}
          >
            {getStatusLabel(member.status)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <Typography variant="body-sm" color="muted">
            Joined:
          </Typography>
          <Typography variant="body-sm">
            {member.joinedAt?.toLocaleDateString() || "Not joined"}
          </Typography>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" className="flex-1">
            <Icon name="mail" className="h-4 w-4 mr-2" />
            Resend Invite
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Icon name="settings" className="h-4 w-4 mr-2" />
            Permissions
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Empty state for no staff */
function EmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <Card className="text-center py-12">
      <div className="text-6xl mb-4">👥</div>
      <Typography variant="headline-lg" className="mb-4">
        No Staff Members Yet
      </Typography>
      <Typography
        variant="body-lg"
        color="muted"
        className="mb-6 container-content"
      >
        Invite assistant coaches, coordinators, and managers to help run your
        team.
      </Typography>
      <Button onClick={onInvite} variant="primary">
        <Icon name="plus" className="h-5 w-5 mr-2" />
        Invite First Staff Member
      </Button>
    </Card>
  );
}

/** Quick actions section */
function QuickActions() {
  return (
    <Card className="p-6">
      <Typography variant="headline-sm" className="mb-4">
        Quick Actions
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="justify-start">
          <Icon name="mail" className="h-5 w-5 mr-3" />
          Send Team Email
        </Button>
        <Button variant="outline" className="justify-start">
          <Icon name="users" className="h-5 w-5 mr-3" />
          Export Staff List
        </Button>
        <Button variant="outline" className="justify-start">
          <Icon name="settings" className="h-5 w-5 mr-3" />
          Bulk Role Changes
        </Button>
      </div>
    </Card>
  );
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ teamId }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock data for now - in real implementation, fetch from team_members table
  useEffect(() => {
    const loadStaff = async () => {
      setLoading(true);
      // TODO: Fetch actual staff data from team_members table
      // For now, show mock data
      setStaff([
        {
          id: "1",
          name: "John Smith",
          email: "john@school.edu",
          role: "head_coach",
          status: "active",
          invitedAt: new Date("2024-01-15"),
          joinedAt: new Date("2024-01-16"),
        },
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarah@school.edu",
          role: "assistant_coach",
          status: "active",
          invitedAt: new Date("2024-01-20"),
          joinedAt: new Date("2024-01-21"),
        },
      ]);
      setLoading(false);
    };

    loadStaff();
  }, [teamId]);

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case "head_coach":
        return "bg-primary text-primary";
      case "assistant_coach":
        return "bg-info/20 text-info";
      case "coordinator":
        return "bg-success/20 text-success";
      case "manager":
        return "bg-warning/20 text-warning";
      default:
        return "bg-secondary text-secondary";
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case "head_coach":
        return "Head Coach";
      case "assistant_coach":
        return "Assistant Coach";
      case "coordinator":
        return "Coordinator";
      case "manager":
        return "Manager";
      default:
        return role;
    }
  };

  const handleInviteStaff = () => {
    setShowInviteModal(true);
  };

  const handleSendInvitation = async (invitation: TeamInvitation) => {
    // TODO: Implement actual invitation sending logic
    console.log("Sending staff invitation:", invitation);
    // For now, just close the modal
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-info mx-auto mb-4"></div>
        <Typography variant="body-lg" color="muted">
          Loading staff...
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Staff Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="headline-lg" className="text-primary">
            Coaching Staff
          </Typography>
          <Typography variant="body-md" color="muted" className="mt-1">
            {staff.length} staff member{staff.length !== 1 ? "s" : ""}
          </Typography>
        </div>
        <Button onClick={handleInviteStaff} variant="primary" size="sm">
          <Icon name="plus" className="h-4 w-4 mr-2" />
          Invite Staff Member
        </Button>
      </div>

      {/* Staff List */}
      {staff.length === 0 ? (
        <EmptyState onInvite={handleInviteStaff} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <StaffMemberCard
              key={member.id}
              member={member}
              getRoleColor={getRoleColor}
              getRoleLabel={getRoleLabel}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Invite Modal */}
      <TeamMemberInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleSendInvitation}
        type="staff"
      />
    </div>
  );
};
