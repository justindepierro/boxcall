import React from "react";
import { Typography } from "../../design-system";
import { LogoIcon } from "../../ui/Logo";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui";

export interface TeamBulletinHeaderProps {
  teamId: string | undefined;
  teamName: string;
  seasonDisplay: string;
  record: { wins: number; losses: number };
  memberCount: number;
  nextGame: string;
  schoolName?: string | null;
  mascot?: string | null;
  isCoach: boolean;
  /** Optional id for main heading to support aria-labelledby on main */
  headingId?: string;
}

export const TeamBulletinHeader: React.FC<TeamBulletinHeaderProps> = ({
  teamId,
  teamName,
  seasonDisplay,
  record,
  memberCount,
  nextGame,
  schoolName,
  mascot,
  isCoach,
  headingId,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Team Logo Placeholder */}
            <div className="relative group">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
                <div className="text-center">
                  <LogoIcon size="md" color="brand" />
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                    Team Logo
                  </div>
                </div>
              </div>
              {isCoach && (
                <Button
                  variant="primary"
                  size="xs"
                  className="absolute -top-2 -right-2 !px-2 !py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg rounded-full"
                  title="Upload team logo (Go to Team Settings)"
                  onClick={() =>
                    (window.location.href = `/team/${teamId}/settings`)
                  }
                  icon={<Icon name="edit" size="xs" />}
                  iconPosition="only"
                  aria-label="Edit team logo"
                />
              )}
              {!isCoach && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                    Coaches can add team logo
                  </div>
                </div>
              )}
            </div>
            <div>
              <Typography
                variant="headline-xl"
                as="h1"
                id={headingId}
                className="text-gray-900 dark:text-white"
              >
                {teamName}
              </Typography>
              <Typography
                variant="body-lg"
                className="mt-1 text-gray-600 dark:text-gray-300"
              >
                {seasonDisplay} • Record: {record.wins}-{record.losses}
              </Typography>
              {schoolName && (
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {schoolName}
                  {mascot ? ` ${mascot}` : ""}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <Typography
                variant="body-sm"
                className="text-gray-600 dark:text-gray-300"
              >
                Next Game
              </Typography>
              <Typography
                variant="body-md"
                className="font-semibold text-gray-900 dark:text-white"
              >
                {nextGame}
              </Typography>
            </div>
            <div className="text-right">
              <Typography
                variant="body-sm"
                className="text-gray-600 dark:text-gray-300"
              >
                Team Members
              </Typography>
              <Typography
                variant="body-md"
                className="font-semibold text-gray-900 dark:text-white"
              >
                {memberCount}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
