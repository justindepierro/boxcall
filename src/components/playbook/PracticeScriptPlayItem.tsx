import React, { useState } from "react";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Badge } from "../ui/Badge";
import Textarea from "../ui/TextArea/TextArea";
import type { PracticeScriptPlay } from "@services";

interface PracticeScriptPlayItemProps {
  scriptPlay: PracticeScriptPlay;
  index: number;
  onRemove: () => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateRepetitions: (repetitions: number) => void;
  onUpdateScenario?: (scenario: {
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
  }) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export const PracticeScriptPlayItem: React.FC<PracticeScriptPlayItemProps> = ({
  scriptPlay,
  index,
  onRemove,
  onUpdateNotes,
  onUpdateRepetitions,
  onUpdateScenario,
  dragHandleProps,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(scriptPlay.notes || "");
  const [repetitionsValue, setRepetitionsValue] = useState(
    scriptPlay.repetitions
  );

  // Game scenario state
  const [hash, setHash] = useState<"left" | "middle" | "right">(
    scriptPlay.hash || "middle"
  );
  const [downDistance, setDownDistance] = useState(
    scriptPlay.downDistance || "1st & 10"
  );
  const [fieldPosition, setFieldPosition] = useState<
    "plus_territory" | "red_zone" | "backed_up" | "midfield"
  >(scriptPlay.fieldPosition || "plus_territory");
  const [defensiveFront, setDefensiveFront] = useState(
    scriptPlay.defensiveFront || "base"
  );
  const [coverage, setCoverage] = useState(scriptPlay.coverage || "cover_2");
  const [blitz, setBlitz] = useState(scriptPlay.blitz || "none");

  // Custom input states
  const [customDefensiveFront, setCustomDefensiveFront] = useState("");
  const [customCoverage, setCustomCoverage] = useState("");
  const [customBlitz, setCustomBlitz] = useState("");
  const [showCustomFront, setShowCustomFront] = useState(false);
  const [showCustomCoverage, setShowCustomCoverage] = useState(false);
  const [showCustomBlitz, setShowCustomBlitz] = useState(false);

  const play = scriptPlay.play;
  const displayName = `${play.formation}${play.f_dir ? ` ${play.f_dir}` : ""} - ${play.play_name}${play.p_dir ? ` (${play.p_dir})` : ""}`;

  const handleNotesSave = () => {
    onUpdateNotes(notesValue);
    setIsEditingNotes(false);
  };

  const handleNotesCancel = () => {
    setNotesValue(scriptPlay.notes || "");
    setIsEditingNotes(false);
  };

  const handleRepetitionsChange = (value: number) => {
    const clampedValue = Math.max(1, Math.min(20, value)); // Clamp between 1-20
    setRepetitionsValue(clampedValue);
    onUpdateRepetitions(clampedValue);
  };

  const handleScenarioChange = (field: string, value: any) => {
    // Update local state
    switch (field) {
      case "hash":
        setHash(value);
        break;
      case "downDistance":
        setDownDistance(value);
        break;
      case "fieldPosition":
        setFieldPosition(value);
        break;
      case "defensiveFront":
        setDefensiveFront(value);
        break;
      case "coverage":
        setCoverage(value);
        break;
      case "blitz":
        setBlitz(value);
        break;
    }

    // Notify parent component
    if (onUpdateScenario) {
      onUpdateScenario({
        hash,
        downDistance,
        fieldPosition,
        defensiveFront,
        coverage,
        blitz,
        [field]: value, // Update the specific field
      });
    }
  };

  return (
    <div className="bg-primary border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-muted hover:text-primary"
        >
          <Icon name="move" className="h-5 w-5" />
        </div>

        {/* Play Number */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </div>
        </div>

        {/* Play Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Typography
                variant="body-sm"
                className="text-primary font-medium truncate"
              >
                {displayName}
              </Typography>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="neutral" size="sm">
                  {play.p_type}
                </Badge>
                {play.personnel && (
                  <Badge variant="accent" size="sm">
                    {play.personnel}
                  </Badge>
                )}
                <Typography variant="caption" className="text-secondary">
                  {play.formation}
                </Typography>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-secondary hover:text-primary"
              >
                <Icon
                  name={isEditingNotes ? "check" : "edit"}
                  className="h-4 w-4"
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-secondary hover:text-error"
              >
                <Icon name="delete" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-3">
            {isEditingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notesValue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNotesValue(e.target.value)
                  }
                  placeholder="Add notes for this play (e.g., focus on footwork, emphasize timing)..."
                  rows={2}
                  className="w-full text-sm"
                />
                <div className="flex space-x-2">
                  <Button variant="primary" size="sm" onClick={handleNotesSave}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleNotesCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Typography variant="body-sm" className="text-secondary">
                {scriptPlay.notes || "No notes added"}
              </Typography>
            )}
          </div>

          {/* Game Scenario Configuration */}
          <div className="mt-4 pt-4 border-t border-border">
            {/* Repetitions */}
            <div className="mb-4">
              <Typography
                variant="caption"
                className="text-secondary font-medium mb-2 block"
              >
                Repetitions
              </Typography>
              <div className="flex items-center space-x-2 max-w-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRepetitionsChange(repetitionsValue - 1)}
                  disabled={repetitionsValue <= 1}
                  className="h-10 w-10 p-0 rounded-lg border border-border hover:bg-subtle"
                  aria-label="Decrease repetitions"
                >
                  <Icon name="minus" className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center">
                  <Typography
                    variant="body-lg"
                    className="font-bold text-primary"
                  >
                    {repetitionsValue}
                  </Typography>
                  <Typography variant="caption" className="text-muted">
                    reps
                  </Typography>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRepetitionsChange(repetitionsValue + 1)}
                  disabled={repetitionsValue >= 20}
                  className="h-10 w-10 p-0 rounded-lg border border-border hover:bg-subtle"
                  aria-label="Increase repetitions"
                >
                  <Icon name="plus" className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scenario Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Hash */}
              <div className="flex flex-col space-y-2">
                <Typography
                  variant="caption"
                  className="text-secondary font-medium"
                >
                  Hash Mark
                </Typography>
                <select
                  value={hash}
                  onChange={(e) => handleScenarioChange("hash", e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="left">Left Hash</option>
                  <option value="middle">Middle</option>
                  <option value="right">Right Hash</option>
                </select>
              </div>

              {/* Down & Distance */}
              <div className="flex flex-col space-y-2">
                <Typography
                  variant="caption"
                  className="text-secondary font-medium"
                >
                  Down & Distance
                </Typography>
                <select
                  value={downDistance}
                  onChange={(e) =>
                    handleScenarioChange("downDistance", e.target.value)
                  }
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="1st & 10">1st & 10</option>
                  <option value="1st & 5">1st & 5</option>
                  <option value="2nd & 10">2nd & 10</option>
                  <option value="2nd & 7">2nd & 7</option>
                  <option value="2nd & 5">2nd & 5</option>
                  <option value="2nd & 3">2nd & 3</option>
                  <option value="3rd & 10">3rd & 10</option>
                  <option value="3rd & 7">3rd & 7</option>
                  <option value="3rd & 3">3rd & 3</option>
                  <option value="3rd & 1">3rd & 1</option>
                  <option value="4th & 1">4th & 1</option>
                </select>
              </div>

              {/* Field Position */}
              <div className="flex flex-col space-y-2">
                <Typography
                  variant="caption"
                  className="text-secondary font-medium"
                >
                  Field Position
                </Typography>
                <select
                  value={fieldPosition}
                  onChange={(e) =>
                    handleScenarioChange("fieldPosition", e.target.value)
                  }
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="plus_territory">
                    Plus Territory (Opp 40-50)
                  </option>
                  <option value="midfield">Midfield (Own 40-Opp 40)</option>
                  <option value="red_zone">Red Zone (Inside 20)</option>
                  <option value="backed_up">Backed Up (Own 10 or less)</option>
                </select>
              </div>

              {/* Defensive Front */}
              <div className="flex flex-col space-y-2">
                <Typography
                  variant="caption"
                  className="text-secondary font-medium"
                >
                  Defensive Front
                </Typography>
                {!showCustomFront ? (
                  <select
                    value={defensiveFront}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setShowCustomFront(true);
                      } else {
                        handleScenarioChange("defensiveFront", e.target.value);
                      }
                    }}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="base">Base Defense</option>
                    <option value="4-3">4-3 Front</option>
                    <option value="3-4">3-4 Front</option>
                    <option value="nickel">Nickel</option>
                    <option value="dime">Dime</option>
                    <option value="bear">Bear Front</option>
                    <option value="tite">Tite Front</option>
                    <option value="custom">➕ Custom...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customDefensiveFront}
                      onChange={(e) => setCustomDefensiveFront(e.target.value)}
                      onBlur={() => {
                        if (customDefensiveFront.trim()) {
                          handleScenarioChange(
                            "defensiveFront",
                            customDefensiveFront.trim()
                          );
                          setShowCustomFront(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customDefensiveFront.trim()) {
                          handleScenarioChange(
                            "defensiveFront",
                            customDefensiveFront.trim()
                          );
                          setShowCustomFront(false);
                        }
                        if (e.key === "Escape") {
                          setShowCustomFront(false);
                          setCustomDefensiveFront("");
                        }
                      }}
                      className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1"
                      placeholder="Custom front..."
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomFront(false)}
                      aria-label="Cancel custom front"
                    >
                      <Icon name="close" size="sm" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Coverage */}
              <div className="flex flex-col space-y-2">
                <Typography
                  variant="caption"
                  className="text-secondary font-medium"
                >
                  Coverage
                </Typography>
                {!showCustomCoverage ? (
                  <select
                    value={coverage}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setShowCustomCoverage(true);
                      } else {
                        handleScenarioChange("coverage", e.target.value);
                      }
                    }}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="cover_2">Cover 2</option>
                    <option value="cover_3">Cover 3</option>
                    <option value="cover_4">Cover 4 / Quarters</option>
                    <option value="cover_6">Cover 6</option>
                    <option value="cover_1">Cover 1 / Man-Free</option>
                    <option value="cover_0">Cover 0 / Blitz</option>
                    <option value="man">Man Coverage</option>
                    <option value="quarters">Pure Quarters</option>
                    <option value="custom">➕ Custom...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customCoverage}
                      onChange={(e) => setCustomCoverage(e.target.value)}
                      onBlur={() => {
                        if (customCoverage.trim()) {
                          handleScenarioChange(
                            "coverage",
                            customCoverage.trim()
                          );
                          setShowCustomCoverage(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customCoverage.trim()) {
                          handleScenarioChange(
                            "coverage",
                            customCoverage.trim()
                          );
                          setShowCustomCoverage(false);
                        } else if (e.key === "Escape") {
                          setShowCustomCoverage(false);
                          setCustomCoverage("");
                        }
                      }}
                      placeholder="Type custom coverage..."
                      autoFocus
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomCoverage(false);
                        setCustomCoverage("");
                      }}
                      className="shrink-0"
                    >
                      <Icon name="close" size="sm" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Blitz */}
              <div className="flex flex-col space-y-2">
                <Typography
                  variant="caption"
                  className="text-secondary font-medium"
                >
                  Blitz Package
                </Typography>
                {!showCustomBlitz ? (
                  <select
                    value={blitz}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setShowCustomBlitz(true);
                      } else {
                        handleScenarioChange("blitz", e.target.value);
                      }
                    }}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="none">No Blitz</option>
                    <option value="edge">Edge Blitz</option>
                    <option value="a_gap">A-Gap Blitz</option>
                    <option value="b_gap">B-Gap Blitz</option>
                    <option value="sim_pressure">Sim Pressure</option>
                    <option value="zone_blitz">Zone Blitz</option>
                    <option value="all_out">All-Out Blitz</option>
                    <option value="custom">➕ Custom...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customBlitz}
                      onChange={(e) => setCustomBlitz(e.target.value)}
                      onBlur={() => {
                        if (customBlitz.trim()) {
                          handleScenarioChange("blitz", customBlitz.trim());
                          setShowCustomBlitz(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customBlitz.trim()) {
                          handleScenarioChange("blitz", customBlitz.trim());
                          setShowCustomBlitz(false);
                        } else if (e.key === "Escape") {
                          setShowCustomBlitz(false);
                          setCustomBlitz("");
                        }
                      }}
                      placeholder="Type custom blitz..."
                      autoFocus
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomBlitz(false);
                        setCustomBlitz("");
                      }}
                      className="shrink-0"
                    >
                      <Icon name="close" size="sm" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
