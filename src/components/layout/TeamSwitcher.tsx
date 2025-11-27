import React from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/Dropdown";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import { teamRoutes, ROUTES } from "../../routes/paths";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import { useAuth } from "../../app/auth-store";
import { emitTelemetry } from "../../lib/telemetry";
import { usePrefetchQueries } from "../../hooks/usePrefetchQueries";

interface TeamSwitcherProps {
  teams: Array<{ id: string; name: string }>; // simplified signature
}

export const TeamSwitcher: React.FC<TeamSwitcherProps> = ({ teams }) => {
  const navigate = useNavigate();
  const { activeTeamId, setActiveTeamId } = useActiveTeamStore();
  const { user } = useAuth();
  const { prefetchTeamDashboard, cancelPrefetch } = usePrefetchQueries();

  const handleSelect = (teamId: string) => {
    setActiveTeamId(teamId);
    emitTelemetry("navigation.team_switch", { teamId, userId: user?.id });
    navigate(teamRoutes.bulletin(teamId));
  };

  if (!teams.length) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="ml-4 whitespace-nowrap px-4 py-2 h-10 min-w-36"
        onClick={() => navigate(ROUTES.CREATE_TEAM)}
        icon={<Icon name="plus" size="sm" />}
        iconPosition="left"
      >
        Create Team
      </Button>
    );
  }

  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-3">
          <Icon name="users" size="sm" className="mr-2" />
          <span className="truncate max-w-40 text-left">
            {activeTeam?.name ?? "Select Team"}
          </span>
          <Icon name="chevron-down" size="xs" className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <Typography variant="body-sm" className="px-3 py-2 text-muted">
          Your Teams
        </Typography>
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onSelect={() => handleSelect(team.id)}
            isActive={team.id === activeTeam?.id}
            onMouseEnter={() => prefetchTeamDashboard(team.id)}
            onMouseLeave={cancelPrefetch}
          >
            {team.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onSelect={() => navigate(ROUTES.CREATE_TEAM)}>
          <Icon name="plus" size="sm" className="mr-2" /> Create or Find Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
