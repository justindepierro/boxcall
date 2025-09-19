import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "../components/design-system/Typography";
import Card from "../components/ui/Card/Card";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Modal } from "../components/ui/Modal/Modal";
import Input from "../components/ui/Input/Input";
import Select from "../components/ui/Select/Select";
import {
  type GamePlan,
  type GamePlanSituation,
  GamePlanService,
  type CreateGamePlanData,
} from "@services/gamePlanService";

/**
 * Game Plan Page - Brian Billick Situational Methodology
 *
 * Complete game planning interface with situational organization
 * Based on Brian Billick's "Developing an Offensive Game Plan"
 */
export const GamePlanPage: React.FC = () => {
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([]);
  const [selectedGamePlan, setSelectedGamePlan] = useState<GamePlan | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newGamePlanData, setNewGamePlanData] = useState<
    Partial<CreateGamePlanData>
  >({
    name: "",
    weekNumber: 1,
    opponent: "",
    date: new Date(),
    teamId: "1", // Default team
    isTemplate: false,
  });

  // Load game plans on mount
  const loadGamePlans = useCallback(async () => {
    try {
      setIsLoading(true);
      // For now, create a sample game plan if none exist
      if (gamePlans.length === 0) {
        const sampleGamePlan = await GamePlanService.createGamePlan({
          name: "Sample Game Plan",
          weekNumber: 1,
          opponent: "Sample Opponent",
          date: new Date(),
          teamId: "1",
          isTemplate: false,
        });
        setGamePlans([sampleGamePlan]);
        setSelectedGamePlan(sampleGamePlan);
      }
    } catch (error) {
      console.error("Error loading game plans:", error);
    } finally {
      setIsLoading(false);
    }
  }, [gamePlans.length]);

  useEffect(() => {
    loadGamePlans();
  }, [loadGamePlans]);

  const handleCreateGamePlan = async () => {
    if (!newGamePlanData.name || !newGamePlanData.opponent) return;

    try {
      const gamePlan = await GamePlanService.createGamePlan({
        ...newGamePlanData,
        teamId: "1",
        date: new Date(),
      } as CreateGamePlanData);

      setGamePlans([...gamePlans, gamePlan]);
      setSelectedGamePlan(gamePlan);
      setIsCreateModalOpen(false);
      setNewGamePlanData({
        name: "",
        weekNumber: 1,
        opponent: "",
        date: new Date(),
        teamId: "1",
        isTemplate: false,
      });
    } catch (error) {
      console.error("Error creating game plan:", error);
    }
  };

  const getSituationIcon = (category: GamePlanSituation["category"]) => {
    switch (category) {
      case "base_run":
      case "base_pass":
        return "play";
      case "second_long":
        return "target";
      case "third_down":
        return "zap";
      case "red_zone":
        return "flag";
      case "goal_line":
        return "trophy";
      case "two_minute":
        return "clock";
      case "short_yardage":
        return "arrow-right";
      case "special_situations":
        return "star";
      default:
        return "circle";
    }
  };

  const getSituationColor = (category: GamePlanSituation["category"]) => {
    switch (category) {
      case "base_run":
        return "text-blue-600";
      case "base_pass":
        return "text-green-600";
      case "second_long":
        return "text-orange-600";
      case "third_down":
        return "text-red-600";
      case "red_zone":
        return "text-purple-600";
      case "goal_line":
        return "text-yellow-600";
      case "two_minute":
        return "text-indigo-600";
      case "short_yardage":
        return "text-pink-600";
      case "special_situations":
        return "text-gray-600";
      default:
        return "text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="headline-lg" as="h1">
            Game Plan
          </Typography>
          <Typography variant="body-lg" className="text-text-secondary mt-2">
            Brian Billick Situational Methodology
          </Typography>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Icon name="plus" size="sm" />
          <span>New Game Plan</span>
        </Button>
      </div>

      {/* Game Plan Selector */}
      {gamePlans.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Typography variant="headline-sm" as="h3">
              Current Game Plan:
            </Typography>
            <Select
              value={selectedGamePlan?.id || ""}
              onChange={(value) => {
                const gamePlanId = Array.isArray(value) ? value[0] : value;
                const gamePlan = gamePlans.find((gp) => gp.id === gamePlanId);
                setSelectedGamePlan(gamePlan || null);
              }}
              options={gamePlans.map((gp) => ({
                value: gp.id,
                label: `${gp.name} vs ${gp.opponent} (Week ${gp.weekNumber})`,
              }))}
              className="min-w-64"
            />
          </div>
        </Card>
      )}

      {/* Situations Grid */}
      {selectedGamePlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedGamePlan.situations.map((situation) => (
            <Card
              key={situation.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg bg-gray-100 ${getSituationColor(situation.category)}`}
                  >
                    <Icon
                      name={getSituationIcon(situation.category)}
                      size="md"
                    />
                  </div>
                  <div>
                    <Typography variant="headline-sm" as="h3">
                      {situation.name}
                    </Typography>
                    <Typography
                      variant="body-sm"
                      className="text-text-secondary"
                    >
                      Priority: {situation.priority}/10
                    </Typography>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Icon name="plus" size="sm" />
                </Button>
              </div>

              <Typography
                variant="body-sm"
                className="text-text-secondary mb-4"
              >
                {situation.description}
              </Typography>

              {/* Plays in this situation */}
              <div className="space-y-2">
                {situation.plays.length > 0 ? (
                  situation.plays
                    .sort((a, b) => a.priority - b.priority)
                    .map((gamePlanPlay) => (
                      <div
                        key={gamePlanPlay.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <Typography variant="body-sm" as="span">
                            {gamePlanPlay.play.play_name}
                          </Typography>
                          {gamePlanPlay.notes && (
                            <Typography
                              variant="body-xs"
                              className="text-text-secondary block"
                            >
                              {gamePlanPlay.notes}
                            </Typography>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-jade-100 text-jade-800 px-2 py-1 rounded">
                            #{gamePlanPlay.priority}
                          </span>
                          <Button variant="ghost" size="xs">
                            <Icon name="menu" size="sm" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6 text-text-secondary">
                    <Icon
                      name="circle"
                      size="lg"
                      className="mx-auto mb-2 opacity-50"
                    />
                    <Typography variant="body-sm">
                      No plays assigned yet
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Game Plan Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Game Plan"
      >
        <div className="space-y-4">
          <Input
            label="Game Plan Name"
            value={newGamePlanData.name || ""}
            onChange={(e) =>
              setNewGamePlanData({ ...newGamePlanData, name: e.target.value })
            }
            placeholder="e.g., Week 1 vs Eagles"
          />
          <Input
            label="Opponent"
            value={newGamePlanData.opponent || ""}
            onChange={(e) =>
              setNewGamePlanData({
                ...newGamePlanData,
                opponent: e.target.value,
              })
            }
            placeholder="e.g., Philadelphia Eagles"
          />
          <Input
            label="Week Number"
            type="number"
            value={newGamePlanData.weekNumber?.toString() || "1"}
            onChange={(e) =>
              setNewGamePlanData({
                ...newGamePlanData,
                weekNumber: parseInt(e.target.value) || 1,
              })
            }
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateGamePlan}>Create Game Plan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GamePlanPage;
