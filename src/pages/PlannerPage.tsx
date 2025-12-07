import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Typography } from "../components/design-system";
import Card from "../components/ui/Card/Card";
import Icon from "../components/ui/Icon/Icon";

const PlannerPage: React.FC = React.memo(function PlannerPage() {
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
  const progressPercentage = (completedTasks / totalTasks) * 100;

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {/* Practice Schedule */}
          <Card className="p-lg flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-md">
                <div className="p-xs bg-info rounded-lg">
                  <Icon name="clock" size="lg" className="text-info" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-primary">
                  Practice Schedule
                </h3>
              </div>
              <p className="text-secondary mb-md">
                Plan your weekly practice schedule (Mon-Fri 3:00-6:30)
              </p>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate("/calendar")}
                variant="primary"
                className="w-full"
              >
                Schedule Practices
              </Button>
            </div>
          </Card>

          {/* Game Plan Maker */}
          <Card className="p-lg flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-md">
                <div className="p-xs bg-success rounded-lg">
                  <Icon name="file" size="lg" className="text-success" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-primary">
                  Game Plan Maker
                </h3>
              </div>
              <p className="text-secondary mb-md">
                Create detailed game plans for upcoming matches
              </p>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate("/game-plans")}
                variant="primary"
                className="w-full"
              >
                Create Game Plan
              </Button>
            </div>
          </Card>

          {/* Practice Scripts */}
          <Card className="p-lg flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-md">
                <div className="p-xs bg-primary rounded-lg">
                  <Icon
                    name="clipboard-list"
                    size="lg"
                    className="text-primary"
                  />
                </div>
                <h3 className="ml-3 text-lg font-medium text-primary">
                  Practice Scripts
                </h3>
              </div>
              <p className="text-secondary mb-md">
                Build and organize practice scripts for your team
              </p>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate("/practice-plans")}
                variant="primary"
                className="w-full"
              >
                Create Practice Script
              </Button>
            </div>
          </Card>

          {/* Team Dashboard Updates */}
          <Card className="p-lg flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-md">
                <div className="p-xs bg-warning rounded-lg">
                  <Icon name="bar-chart" size="lg" className="text-warning" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-primary">
                  Team Dashboard
                </h3>
              </div>
              <p className="text-secondary mb-md">
                Update team announcements and important information
              </p>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate("/teams")}
                variant="primary"
                className="w-full"
              >
                Update Dashboard
              </Button>
            </div>
          </Card>

          {/* Calendar Integration */}
          <Card className="p-lg flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-md">
                <div className="p-xs bg-info rounded-lg">
                  <Icon name="calendar" size="lg" className="text-info" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-primary">
                  Calendar
                </h3>
              </div>
              <p className="text-secondary mb-md">
                View and manage your team's calendar events
              </p>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate("/calendar")}
                variant="primary"
                className="w-full"
              >
                Open Calendar
              </Button>
            </div>
          </Card>

          {/* Helmet Stickers and Awards */}
          <Card className="p-lg flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-md">
                <div className="p-xs bg-warning rounded-lg">
                  <Icon name="award" size="lg" className="text-warning" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-primary">
                  Helmet Stickers & Awards
                </h3>
              </div>
              <p className="text-secondary mb-md">
                Give out awards and recognition to players and staff
              </p>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate("/awards")}
                variant="primary"
                className="w-full"
              >
                Manage Awards
              </Button>
            </div>
          </Card>

          {/* Playbook */}
          <Card className="p-lg flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-md">
                <div className="p-xs bg-error rounded-lg">
                  <Icon name="book" size="lg" className="text-error" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-primary">
                  Playbook
                </h3>
              </div>
              <p className="text-secondary mb-md">
                Manage your team's plays and formations
              </p>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate("/playbook")}
                variant="primary"
                className="w-full"
              >
                Open Playbook
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

PlannerPage.displayName = "PlannerPage";

export default PlannerPage;
