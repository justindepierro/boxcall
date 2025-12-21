import React from "react";
import { useNavigate } from "react-router-dom";
import { getActiveTeamId } from "../utils/activeTeam";
import { teamRoutes } from "../routes/paths";
import { Button } from "../components/ui/Button/Button";
import { Typography } from "../components/design-system";
import Card from "../components/ui/Card/Card";
import Icon from "../components/ui/Icon/Icon";
import type { IconName } from "../components/ui/Icon";

// Progress tracking bar
const ProgressBar: React.FC<{
  planningProgress: Record<string, boolean>;
}> = ({ planningProgress }) => {
  const completedTasks = Object.values(planningProgress).filter(Boolean).length;
  const totalTasks = Object.keys(planningProgress).length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="bg-primary rounded-lg p-lg shadow-sm mb-lg">
      <div className="flex items-center justify-between mb-md">
        <h2 className="text-lg font-semibold text-primary">
          Weekly Planning Progress
        </h2>
        <span className="text-sm text-secondary">
          {completedTasks}/{totalTasks} tasks completed
        </span>
      </div>
      <div className="w-full bg-border rounded-full h-3">
        <div
          className="bg-text-success h-3 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-xs">
        {Object.entries(planningProgress).map(([task, completed]) => (
          <span
            key={task}
            className={`px-2 py-1 text-xs rounded-full ${
              completed
                ? "bg-success text-success"
                : "bg-secondary text-tertiary"
            }`}
          >
            {task.replace(/([A-Z])/g, " $1").toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
};

// Planning card component
const PlannerCard: React.FC<{
  icon: IconName;
  iconColor: string;
  title: string;
  description: string;
  buttonText: string;
  onNavigate: () => void;
}> = ({ icon, iconColor, title, description, buttonText, onNavigate }) => (
  <Card className="p-lg flex flex-col">
    <div className="flex-1">
      <div className="flex items-center mb-md">
        <div className={`p-xs bg-${iconColor} rounded-lg`}>
          <Icon name={icon} size="lg" className={`text-${iconColor}`} />
        </div>
        <h3 className="ml-3 text-lg font-medium text-primary">{title}</h3>
      </div>
      <p className="text-secondary mb-md">{description}</p>
    </div>
    <div className="mt-auto">
      <Button onClick={onNavigate} variant="primary" className="w-full">
        {buttonText}
      </Button>
    </div>
  </Card>
);

const PlannerPage: React.FC = React.memo(() => {
  const navigate = useNavigate();

  // Mock progress data - in real app this would come from state/API
  const planningProgress = {
    practiceScheduled: true,
    gamePlanCreated: false,
    scriptsCreated: true,
    dashboardUpdated: false,
    awardsGiven: false,
  };

  const completedTasks = Object.values(planningProgress).filter(Boolean).length;
  const totalTasks = Object.keys(planningProgress).length;
  void completedTasks;
  void totalTasks;

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Weekly Planning Dashboard
          </Typography>
          <Typography variant="body" className="text-secondary">
            Systematic planning tools for coaches to organize their week
          </Typography>
        </header>
        {/* Progress Bar */}
        <ProgressBar planningProgress={planningProgress} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          <PlannerCard
            icon="clock"
            iconColor="info"
            title="Practice Schedule"
            description="Plan your weekly practice schedule (Mon-Fri 3:00-6:30)"
            buttonText="Schedule Practices"
            onNavigate={() => navigate("/calendar")}
          />

          <PlannerCard
            icon="file"
            iconColor="success"
            title="Game Plan Maker"
            description="Create detailed game plans for upcoming matches"
            buttonText="Create Game Plan"
            onNavigate={() => navigate("/game-plans")}
          />

          <PlannerCard
            icon="clipboard-list"
            iconColor="primary"
            title="Practice Scripts"
            description="Build and organize practice scripts for your team"
            buttonText="Create Practice Script"
            onNavigate={() => navigate("/practice-plans")}
          />

          <PlannerCard
            icon="bar-chart"
            iconColor="warning"
            title="Team Dashboard"
            description="Update team announcements and important information"
            buttonText="Update Dashboard"
            onNavigate={() => {
              const teamId = getActiveTeamId();
              if (teamId) {
                navigate(teamRoutes.bulletin(teamId));
                return;
              }
              navigate("/dashboard");
            }}
          />

          <PlannerCard
            icon="calendar"
            iconColor="info"
            title="Calendar"
            description="View and manage your team's calendar events"
            buttonText="Open Calendar"
            onNavigate={() => navigate("/calendar")}
          />

          <PlannerCard
            icon="award"
            iconColor="warning"
            title="Helmet Stickers & Awards"
            description="Give out awards and recognition to players and staff"
            buttonText="Manage Awards"
            onNavigate={() => navigate("/awards")}
          />

          <PlannerCard
            icon="book"
            iconColor="error"
            title="Playbook"
            description="Manage your team's plays and formations"
            buttonText="Open Playbook"
            onNavigate={() => navigate("/playbook")}
          />
        </div>
      </div>
    </div>
  );
});

PlannerPage.displayName = "PlannerPage";

export default PlannerPage;
