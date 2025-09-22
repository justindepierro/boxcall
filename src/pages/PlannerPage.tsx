import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import Card from "../components/ui/Card/Card";
import Icon from "../components/ui/Icon/Icon";

export default function PlannerPage() {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Weekly Planning Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Systematic planning tools for coaches to organize their week
          </p>

          {/* Progress Bar */}
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Weekly Planning Progress
              </h2>
              <span className="text-sm text-gray-600">
                {completedTasks}/{totalTasks} tasks completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(planningProgress).map(([task, completed]) => (
                <span
                  key={task}
                  className={`px-2 py-1 text-xs rounded-full ${
                    completed
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.replace(/([A-Z])/g, " $1").toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Practice Schedule */}
          <Card className="p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="clock" size="lg" className="text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Practice Schedule
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
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
          <Card className="p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="file" size="lg" className="text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Game Plan Maker
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
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
          <Card className="p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon
                    name="clipboard-list"
                    size="lg"
                    className="text-purple-600"
                  />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Practice Scripts
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
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
          <Card className="p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Icon
                    name="bar-chart"
                    size="lg"
                    className="text-orange-600"
                  />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Team Dashboard
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
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
          <Card className="p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Icon name="calendar" size="lg" className="text-indigo-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Calendar
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
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
          <Card className="p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Icon name="award" size="lg" className="text-yellow-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Helmet Stickers & Awards
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
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
          <Card className="p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Icon name="book" size="lg" className="text-red-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Playbook
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
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
}
