/**
 * TeamRoleSection Component
 *
 * Shows the user's role on the team
 */

import { Shield, Target, User } from "lucide-react";
import { Typography } from "../../../design-system/Typography";
import { getRoleLabel } from "../utils";
import type { TeamMemberInfo } from "../types";

interface TeamRoleSectionProps {
  teamMember: TeamMemberInfo;
}

function getRoleIcon(role: string) {
  switch (role) {
    case "head_coach":
      return <Shield className="w-4 h-4 text-warning-500" />;
    case "assistant_coach":
      return <Shield className="w-4 h-4 text-blue-500" />;
    case "coach":
      return <Shield className="w-4 h-4 text-blue-400" />;
    case "coordinator":
      return <Target className="w-4 h-4 text-purple-500" />;
    case "manager":
      return <User className="w-4 h-4 text-success-500" />;
    default:
      return null;
  }
}

export function TeamRoleSection({ teamMember }: TeamRoleSectionProps) {
  return (
    <div className="p-3 bg-secondary rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {getRoleIcon(teamMember.team_role)}
        <Typography
          variant="body-sm"
          className="font-semibold text-primary"
        >
          {getRoleLabel(teamMember.team_role)}
        </Typography>
        {teamMember.status === "active" && (
          <span className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded-full">
            Active
          </span>
        )}
      </div>
    </div>
  );
}
