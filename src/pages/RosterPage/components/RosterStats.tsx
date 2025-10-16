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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-spacing-md">
        {/* Total Players - Navy gradient */}
        <Card className="p-spacing-md bg-gradient-to-br from-navy-50 to-navy-100 border-l-4 border-navy-600 transition-all duration-300 hover:shadow-lg">
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
        <Card className="p-spacing-md bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-sm"
                className="text-emerald-700 font-medium"
              >
                Active Players
              </Typography>
              <Typography variant="headline-lg" className="text-emerald-900">
                {activePlayerCount}
              </Typography>
            </div>
            <Icon name="check-circle" className="w-8 h-8 text-emerald-600" />
          </div>
        </Card>

        {/* Filtered Count - Blue gradient */}
        <Card className="p-spacing-md bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-sm"
                className="text-blue-700 font-medium"
              >
                Filtered
              </Typography>
              <Typography variant="headline-lg" className="text-blue-900">
                {filteredCount}
              </Typography>
            </div>
            <Icon name="filter" className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        {/* Selected Count - Amber gradient (attention/selection) */}
        <Card className="p-spacing-md bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-warning-600 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
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
