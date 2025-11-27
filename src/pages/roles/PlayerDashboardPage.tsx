import React from "react";

import { Typography } from "../../components/design-system/Typography";
import { Button, Card } from "../../components/ui";
import { Icon } from "../../components/ui/Icon/Icon";
import ProfileCard from "../../components/dashboard/ProfileCard";
import { PageLayout } from "../../components/layout/PageLayout";

const PlayerDashboardPage: React.FC = () => {
  const quickStats = [
    {
      icon: "target" as const,
      accent: "bg-aurora-indigo",
      label: "Practices Attended",
      value: "23/25",
    },
    {
      icon: "trophy" as const,
      accent: "bg-aurora-amber",
      label: "Games Played",
      value: "8",
    },
    {
      icon: "star" as const,
      accent: "bg-aurora-emerald",
      label: "Skill Rating",
      value: "8.5",
    },
    {
      icon: "trending-up" as const,
      accent: "bg-aurora-violet",
      label: "Improvement",
      value: "+2.1",
    },
  ];

  const upcomingEvents = [
    {
      icon: "calendar" as const,
      title: "Practice Session",
      subtitle: "Thursday • 3:30 – 5:30 PM",
      detail: "Focus: Offensive Line Drills",
    },
    {
      icon: "flag" as const,
      title: "Game vs. Eagles",
      subtitle: "Saturday • 7:00 PM",
      detail: "Away Game • Memorial Stadium",
    },
    {
      icon: "users" as const,
      title: "Team Meeting",
      subtitle: "Monday • 4:00 – 5:00 PM",
      detail: "Film Review & Strategy",
    },
  ];

  const performanceMetrics = [
    { label: "Shooting", value: "72%" },
    { label: "Attendance", value: "92%" },
    { label: "Weekly Gains", value: "+4%" },
  ];

  const quickActions = [
    {
      label: "View Playbook",
      icon: "book" as const,
      variant: "primary" as const,
    },
    {
      label: "Check Schedule",
      icon: "calendar" as const,
      variant: "success" as const,
    },
    {
      label: "Team Chat",
      icon: "message" as const,
      variant: "secondary" as const,
    },
    { label: "My Profile", icon: "user" as const, variant: "ghost" as const },
  ];

  return (
    <PageLayout
      variant="dashboard"
      title="Player Dashboard"
      subtitle="Track your progress and stay updated with team activities"
    >
      <div className="mb-6 max-w-md">
        <ProfileCard />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <span className={`${stat.accent} rounded-xl p-2.5 shadow-sm`}>
                <Icon name={stat.icon} className="text-primary" />
              </span>
              <div className="space-y-1">
                <Typography variant="body-sm" className="text-secondary">
                  {stat.label}
                </Typography>
                <Typography variant="headline-sm" className="text-primary">
                  {stat.value}
                </Typography>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between pb-4 border-b border/60">
            <Typography
              variant="headline-sm"
              className="flex items-center gap-2"
            >
              <Icon name="calendar" /> Upcoming Events
            </Typography>
            <Button variant="ghost" size="sm">
              See calendar
            </Button>
          </div>
          <div className="pt-4 space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.title} className="flex items-start gap-3">
                <span className="bg-aurora-indigo rounded-lg p-2 shadow-sm">
                  <Icon name={event.icon} size="sm" />
                </span>
                <div className="space-y-0.5">
                  <Typography variant="body-sm" className="font-medium">
                    {event.title}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    {event.subtitle}
                  </Typography>
                  <Typography variant="caption" className="text-secondary">
                    {event.detail}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between pb-4 border-b border/60">
            <Typography
              variant="headline-sm"
              className="flex items-center gap-2"
            >
              <Icon name="activity" /> Recent Performance
            </Typography>
            <Button variant="ghost" size="sm">
              View stats
            </Button>
          </div>
          <div className="pt-4 space-y-4">
            <div>
              <Typography variant="body-sm" className="text-secondary">
                Last Game
              </Typography>
              <Typography variant="headline-sm" className="text-primary">
                17 pts • 8 rebounds • 5 assists
              </Typography>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {performanceMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="bg-aurora-shell rounded-aurora border border/60 p-3 text-center"
                >
                  <Typography
                    variant="headline-sm"
                    className="text-primary"
                  >
                    {metric.value}
                  </Typography>
                  <Typography variant="caption" className="text-secondary">
                    {metric.label}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="headline-sm" className="text-primary">
              Quick Actions
            </Typography>
            <Typography variant="body-xs" className="text-secondary">
              Jump into the tools you use most.
            </Typography>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                className="flex items-center justify-center gap-2 py-3"
              >
                <Icon name={action.icon} size="sm" />
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </section>
    </PageLayout>
  );
};

export { PlayerDashboardPage };
export default PlayerDashboardPage;
