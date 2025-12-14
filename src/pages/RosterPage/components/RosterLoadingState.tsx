import React from "react";
import { Card } from "../../../components/ui";
import { Typography } from "../../../components/design-system";

/**
 * Loading skeleton for RosterPage
 * Shows skeleton cards while roster data is being fetched
 */
export const RosterLoadingState: React.FC = () => (
  <div className="min-h-screen bg-secondary p-4 md:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-6">
        <Typography variant="headline-lg" className="text-primary mb-1">
          Roster
        </Typography>
        <Typography variant="body" className="text-secondary">
          Loading team roster...
        </Typography>
      </header>
      <div className="space-y-lg">
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {[...Array(4)].map((_, i) => (
            <Card key={`stat-${i}`} className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg" />
            </Card>
          ))}
        </div>

        {/* Loading skeleton for player cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {[...Array(9)].map((_, i) => (
            <Card key={`player-${i}`} className="animate-pulse p-md">
              <div className="space-y-sm">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <div className="h-6 w-32 bg-muted rounded" />
                  </div>
                  <div className="w-8 h-8 bg-muted rounded" />
                </div>

                {/* Badges skeleton */}
                <div className="flex flex-wrap gap-xs">
                  <div className="h-6 w-12 bg-muted rounded-full" />
                  <div className="h-6 w-16 bg-muted rounded-full" />
                  <div className="h-6 w-20 bg-muted rounded-full" />
                </div>

                {/* Stats skeleton */}
                <div className="flex gap-md pt-sm">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>

                {/* Footer skeleton */}
                <div className="flex items-center justify-between pt-sm">
                  <div className="h-8 w-20 bg-muted rounded" />
                  <div className="h-8 w-16 bg-muted rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);

RosterLoadingState.displayName = "RosterLoadingState";
