import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";

interface GamePlan {
  id: string;
  name: string;
  opponent: string;
  date: string;
  plays: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function GamePlansPage() {
  const navigate = useNavigate();
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([]);

  const handleCreatePlan = () => {
    // TODO: Open create game plan modal or navigate to editor
    console.log("Create new game plan");
  };

  const handleEditPlan = (plan: GamePlan) => {
    // TODO: Navigate to plan editor
    console.log("Edit plan:", plan);
  };

  const handleDeletePlan = (planId: string) => {
    setGamePlans((prev) => prev.filter((p) => p.id !== planId));
    // TODO: Delete from database
  };

  return (
    <div className="py-8 min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/playbook")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name="arrow-left" className="h-5 w-5 mr-2" />
              Back to Playbook
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Typography variant="headline-lg" className="text-gray-900">
              Game Plans
            </Typography>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {gamePlans.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Icon name="target" className="h-12 w-12 text-gray-400" />
            </div>
            <Typography variant="headline-md" className="text-gray-900 mb-2">
              No Game Plans Yet
            </Typography>
            <Typography
              variant="body-lg"
              className="text-gray-600 mb-8 max-w-md mx-auto"
            >
              Create your first game plan to strategize plays and formations for
              upcoming matches.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleCreatePlan} variant="primary" size="lg">
                <Icon name="plus" className="h-5 w-5 mr-2" />
                Create New Plan
              </Button>
              <Button
                onClick={() => navigate("/playbook")}
                variant="secondary"
                size="lg"
              >
                <Icon name="book" className="h-5 w-5 mr-2" />
                Browse Playbook
              </Button>
            </div>
          </div>
        ) : (
          // Plans List
          <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
              <Typography variant="headline-md" className="text-gray-900">
                Your Game Plans ({gamePlans.length})
              </Typography>
              <Button onClick={handleCreatePlan} variant="primary">
                <Icon name="plus" className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Typography
                        variant="headline-sm"
                        className="text-gray-900 mb-1"
                      >
                        {plan.name}
                      </Typography>
                      <Typography variant="body-sm" className="text-gray-600">
                        vs {plan.opponent}
                      </Typography>
                      <Typography variant="body-sm" className="text-gray-500">
                        {new Date(plan.date).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPlan(plan);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit plan"
                      >
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete plan"
                      >
                        <Icon name="delete" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{plan.plays.length} plays</span>
                    <span>{plan.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
