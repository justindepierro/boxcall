import React from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import type { IconName } from "../ui/Icon/Icon";

export interface HeroStatsCardProps {
  userName: string;
  stats: {
    totalPlays: number;
    thisWeekActivity: number;
    achievements: number;
  };
  onViewDetails?: () => void;
  greeting?: string;
}

/**
 * MobileHeroStatsCard - Hero summary card for Dashboard mobile view
 *
 * Replaces 3 Aurora tiles on mobile with single compact stats card.
 * Shows personalized greeting + 3 key metrics in thumb-reachable area.
 *
 * Design:
 * - Height: 160px (vs 900px for 3 Aurora tiles)
 * - Stats: Total Plays, This Week, Achievements
 * - Gradient background (aurora-inspired)
 * - Time-based greeting (Good morning/afternoon/evening)
 *
 * Responsive:
 * - Mobile (<768px): Full width hero card
 * - Desktop (≥1024px): Hidden (Aurora tiles used instead)
 */
export const MobileHeroStatsCard: React.FC<HeroStatsCardProps> = ({
  userName,
  stats,
  onViewDetails,
  greeting,
}) => {
  // Generate time-based greeting if not provided
  const getGreeting = () => {
    if (greeting) return greeting;

    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const statsConfig = [
    {
      key: "plays",
      value: stats.totalPlays,
      label: "Plays",
      icon: "book" as IconName,
      color: "text-brand-primary",
      bgColor: "bg-brand-primary/10",
    },
    {
      key: "week",
      value: stats.thisWeekActivity,
      label: "This Week",
      icon: "calendar" as IconName,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      key: "achievements",
      value: stats.achievements,
      label: "Badges",
      icon: "trophy" as IconName,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary/10 via-surface-card to-brand-secondary/10 p-5 shadow-md backdrop-blur-sm border border-border">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-secondary/5 rounded-full -ml-12 -mb-12" />

      {/* Content */}
      <div className="relative">
        {/* Greeting */}
        <div className="mb-4">
          <Typography variant="headline-md" className="text-text-primary font-bold">
            {getGreeting()}, {userName}! 👋
          </Typography>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {statsConfig.map((stat) => (
            <div
              key={stat.key}
              className={`${stat.bgColor} rounded-lg p-3 text-center border border-${stat.color.replace("text-", "")}/20`}
            >
              <div className="flex justify-center mb-1">
                <Icon name={stat.icon} className={`w-4 h-4 ${stat.color}`} />
              </div>
              <Typography
                variant="headline-sm"
                className={`${stat.color} font-bold text-xl`}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body-xs"
                className="text-text-secondary mt-0.5"
              >
                {stat.label}
              </Typography>
            </div>
          ))}
        </div>

        {/* View Details Link */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="w-full text-center py-2 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors flex items-center justify-center gap-1"
            aria-label="View detailed statistics"
          >
            <span>View Details</span>
            <Icon name="chevron-right" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileHeroStatsCard;
