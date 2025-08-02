import React from 'react';
import { Typography } from '../design-system';

interface TeamRosterProps {
  teamId: string;
}

/**
 * Team Roster - Team member overview
 * 
 * Features:
 * - Player roster with positions and stats
 * - Coaching staff listing
 * - Role-based member management
 * - Quick player lookup
 */
export const TeamRoster: React.FC<TeamRosterProps> = () => {
  // TODO: Use teamId for fetching team-specific roster
  
  return (
    <div className="p-6">
      <Typography variant="headline-md" className="mb-4">
        🏈 Team Roster
      </Typography>
      <Typography variant="body-sm" color="muted">
        Team roster component - Coming soon!
      </Typography>
    </div>
  );
};
