/**
 * RosterStats Component
 *
 * Displays key roster statistics:
 * - Total Players (all players)
 * - Active Players (is_active === true)
 * - Filtered (current filtered count)
 * - Selected (currently selected count)
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */

import React from "react";
import { Card } from "../../../components/ui";
import { Icon } from "../../../components/ui/Icon/Icon";
import { Typography } from "../../../components/design-system";

export interface RosterStatsProps {
  totalPlayers: number;
  activePlayerCount: number;
  filteredCount: number;
  selectedCount: number;
}

export const RosterStats = React.memo<RosterStatsProps>(
  ({ totalPlayers, activePlayerCount, filteredCount, selectedCount }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Total Players - Navy gradient */}
        <Card className="p-md bg-gradient-to-br from-navy-50 to-navy-100 border-l-4 border-navy-600 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-sm"
                className="text-navy-600 font-medium"
              >
                Total Players
              </Typography>
              <Typography variant="headline-lg" className="text-navy-900">
                {totalPlayers}
              </Typography>
            </div>
            <Icon name="users" className="w-8 h-8 text-navy-600" />
          </div>
        </Card>

        {/* Active Players - Emerald gradient */}
        <Card className="card-emerald p-md border-l-4 border-emerald-600 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-sm"
                className="card-emerald-text font-medium"
              >
                Active Players
              </Typography>
              <Typography variant="headline-lg" className="card-emerald-text">
                {activePlayerCount}
              </Typography>
            </div>
            <Icon name="check-circle" className="w-8 h-8 card-emerald-icon" />
          </div>
        </Card>

        {/* Filtered Count - Blue gradient */}
        <Card className="card-blue p-md border-l-4 border-blue-600 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-sm"
                className="card-blue-text font-medium"
              >
                Filtered
              </Typography>
              <Typography variant="headline-lg" className="card-blue-text">
                {filteredCount}
              </Typography>
            </div>
            <Icon name="filter" className="w-8 h-8 card-blue-icon" />
          </div>
        </Card>

        {/* Selected Count - Amber gradient (attention/selection) */}
        <Card className="p-md bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-warning-600 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--card-orange-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-sm"
                className="text-warning-600 font-medium"
              >
                Selected
              </Typography>
              <Typography variant="headline-lg" className="text-primary">
                {selectedCount}
              </Typography>
            </div>
            <Icon name="check" className="w-8 h-8 text-warning-600" />
          </div>
        </Card>
      </div>
    );
  },
  // Optimization: only re-render if counts change
  (prevProps, nextProps) => {
    return (
      prevProps.totalPlayers === nextProps.totalPlayers &&
      prevProps.activePlayerCount === nextProps.activePlayerCount &&
      prevProps.filteredCount === nextProps.filteredCount &&
      prevProps.selectedCount === nextProps.selectedCount
    );
  }
);

RosterStats.displayName = "RosterStats";
