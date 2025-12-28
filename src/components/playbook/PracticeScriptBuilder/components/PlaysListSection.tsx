import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Typography } from "../../../design-system/Typography";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon";
import { PracticeScriptPlayItem } from "../../PracticeScriptPlayItem";
import type { PracticeScript } from "@services";
import { triggerHapticFeedback } from "../../../../lib/hapticFeedback";

/**
 * Scenario configuration for practice script plays
 */
interface ScenarioUpdate {
  hash?: "left" | "middle" | "right";
  downDistance?: string;
  fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
  defensiveFront?:
    | "base"
    | "4-3"
    | "3-4"
    | "nickel"
    | "dime"
    | "bear"
    | "tite";
  coverage?:
    | "cover_0"
    | "cover_1"
    | "cover_2"
    | "cover_3"
    | "cover_4"
    | "cover_6"
    | "quarters"
    | "man";
  blitz?:
    | "none"
    | "edge"
    | "a_gap"
    | "b_gap"
    | "sim_pressure"
    | "zone_blitz"
    | "all_out";
}

interface PlaysListSectionProps {
  currentScript: PracticeScript | null;
  isLoadingPlays: boolean;
  isMobile: boolean;
  onAddPlayClick: () => void;
  onDragEnd: (result: DropResult) => void;
  onRemovePlay: (playId: string) => void;
  onUpdateNotes: (playId: string, notes: string) => void;
  onUpdateRepetitions: (playId: string, reps: number) => void;
  onUpdateScenario: (playId: string, scenario: ScenarioUpdate) => void;
}

export const PlaysListSection: React.FC<PlaysListSectionProps> = ({
  currentScript,
  isLoadingPlays,
  isMobile,
  onAddPlayClick,
  onDragEnd,
  onRemovePlay,
  onUpdateNotes,
  onUpdateRepetitions,
  onUpdateScenario,
}) => {
  const renderContent = () => {
    if (isLoadingPlays) {
      return (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <Typography variant="body-sm" className="text-muted">
            Loading selected plays...
          </Typography>
        </div>
      );
    }

    if (!currentScript?.plays?.length) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Icon name="file" className="h-16 w-16 text-muted mx-auto mb-4" />
          <Typography variant="headline-sm" className="text-secondary mb-2">
            No plays added yet
          </Typography>
          <Typography variant="body-sm" className="text-muted mb-6">
            Add plays from your playbook to create a structured practice
            session.
          </Typography>
          <Button
            variant="primary"
            size={isMobile ? "lg" : "md"}
            onClick={() => {
              if (isMobile) triggerHapticFeedback("light");
              onAddPlayClick();
            }}
          >
            <Icon name="plus" className="h-4 w-4 mr-2" />
            Add Your First Play
          </Button>
        </div>
      );
    }

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="practice-plays">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {currentScript.plays?.map((scriptPlay, index) => (
                <Draggable
                  key={scriptPlay.id}
                  draggableId={scriptPlay.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${snapshot.isDragging ? "shadow-lg rotate-2" : ""}`}
                    >
                      <PracticeScriptPlayItem
                        scriptPlay={scriptPlay}
                        index={index}
                        onRemove={() => onRemovePlay(scriptPlay.id)}
                        onUpdateNotes={(notes: string) =>
                          onUpdateNotes(scriptPlay.id, notes)
                        }
                        onUpdateRepetitions={(reps: number) =>
                          onUpdateRepetitions(scriptPlay.id, reps)
                        }
                        onUpdateScenario={(scenario) =>
                          onUpdateScenario(scriptPlay.id, scenario)
                        }
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="headline-sm" as="h4" className="text-primary">
          Practice Plays
        </Typography>
        <Button
          variant="primary"
          size={isMobile ? "md" : "sm"}
          onClick={() => {
            if (isMobile) triggerHapticFeedback("light");
            onAddPlayClick();
          }}
        >
          <Icon name="plus" className="h-4 w-4 mr-2" />
          Add Play
        </Button>
      </div>
      {renderContent()}
    </div>
  );
};
