import React, { useEffect, useMemo, useState } from "react";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import type { PracticeScriptPlay } from "@services";
import { getFormationDirDisplayLabel } from "../../utils/leftRight";

import { PracticeScriptPlayHeader } from "./practice-script-play-item/PracticeScriptPlayHeader";
import { PracticeScriptPlayNotes } from "./practice-script-play-item/PracticeScriptPlayNotes";
import { PracticeScriptPlayScenario } from "./practice-script-play-item/PracticeScriptPlayScenario";

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

  const play = scriptPlay.play;
  const formationDirText = useMemo(
    () => getFormationDirDisplayLabel(play, "full"),
    [play]
  );

  const displayName = useMemo(
    () =>
      `${play.formation}${formationDirText ? ` ${formationDirText}` : ""} - ${play.play_name}${play.p_dir ? ` (${play.p_dir})` : ""}`,
    [play.formation, formationDirText, play.play_name, play.p_dir]
  );

  useEffect(() => {
    if (!isEditingNotes) {
      setNotesValue(scriptPlay.notes || "");
    }
  }, [isEditingNotes, scriptPlay.notes]);

  const handleNotesSave = () => {
    onUpdateNotes(notesValue);
    setIsEditingNotes(false);
  };

  const handleNotesCancel = () => {
    setNotesValue(scriptPlay.notes || "");
    setIsEditingNotes(false);
  };

  return (
    <div className="bg-primary border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <PracticeScriptPlayHeader
        play={play}
        index={index}
        displayName={displayName}
        isEditingNotes={isEditingNotes}
        onToggleEditNotes={() => setIsEditingNotes((prev) => !prev)}
        onRemove={onRemove}
        dragHandleProps={dragHandleProps}
      />

      <PracticeScriptPlayScenario
        scriptPlay={scriptPlay}
        onUpdateRepetitions={onUpdateRepetitions}
        onUpdateScenario={onUpdateScenario}
      />

      <PracticeScriptPlayNotes
        isEditing={isEditingNotes}
        value={notesValue}
        defaultValue={scriptPlay.notes || ""}
        onChange={setNotesValue}
        onSave={handleNotesSave}
        onCancel={handleNotesCancel}
      />
    </div>
  );
};
