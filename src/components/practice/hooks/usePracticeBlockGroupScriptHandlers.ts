import { useCallback } from "react";

import { savePracticeToStorage } from "../utils";

import type {
  PracticeBlock,
  SelectedGroupForScript,
  EditingGroup,
} from "../types";

type ScriptInfo = { id: string; title: string };

type Args = {
  eventId: string;
  setPracticeBlocks: React.Dispatch<React.SetStateAction<PracticeBlock[]>>;
  recalculateBlockTimes: (blocks: PracticeBlock[]) => PracticeBlock[];

  setEditingGroup: (editing: EditingGroup | null) => void;
  setSelectedBlockForScript: (blockId: string | null) => void;
  setSelectedGroupForScript: (group: SelectedGroupForScript | null) => void;
  setShowScriptSelector: (show: boolean) => void;
};

function saveBlocks(
  blocks: PracticeBlock[],
  eventId: string,
  recalculateBlockTimes: (blocks: PracticeBlock[]) => PracticeBlock[]
) {
  const blocksWithTimes = recalculateBlockTimes(blocks);
  savePracticeToStorage(blocksWithTimes, eventId);
  return blocksWithTimes;
}

export function usePracticeBlockGroupScriptHandlers({
  eventId,
  setPracticeBlocks,
  recalculateBlockTimes,
  setEditingGroup,
  setSelectedBlockForScript,
  setSelectedGroupForScript,
  setShowScriptSelector,
}: Args) {
  const handleRemoveBlock = useCallback(
    (id: string) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.filter((block) => block.id !== id);
        return saveBlocks(updatedBlocks, eventId, recalculateBlockTimes);
      });
    },
    [eventId, recalculateBlockTimes, setPracticeBlocks]
  );

  const handleAddGroup = useCallback(
    (blockId: string) => {
      setEditingGroup({
        blockId,
        group: { id: "", name: "", location: "", notes: "" },
      });
    },
    [setEditingGroup]
  );

  const handleRemoveGroup = useCallback(
    (blockId: string, groupId: string) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.id !== blockId) return block;
          return {
            ...block,
            groups: block.groups?.filter((g) => g.id !== groupId) || [],
          };
        });

        return saveBlocks(updatedBlocks, eventId, recalculateBlockTimes);
      });
    },
    [eventId, recalculateBlockTimes, setPracticeBlocks]
  );

  const handleAddScriptToBlock = useCallback(
    (blockId: string) => {
      setSelectedBlockForScript(blockId);
      setShowScriptSelector(true);
    },
    [setSelectedBlockForScript, setShowScriptSelector]
  );

  const handleAddScriptToGroup = useCallback(
    (blockId: string, groupId: string) => {
      setSelectedGroupForScript({ blockId, groupId });
      setShowScriptSelector(true);
    },
    [setSelectedGroupForScript, setShowScriptSelector]
  );

  const handleRemoveScriptFromGroup = useCallback(
    (blockId: string, groupId: string) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.id !== blockId) return block;
          return {
            ...block,
            groups:
              block.groups?.map((group) =>
                group.id === groupId
                  ? { ...group, scriptId: undefined, scriptTitle: undefined }
                  : group
              ) || [],
          };
        });

        return saveBlocks(updatedBlocks, eventId, recalculateBlockTimes);
      });
    },
    [eventId, recalculateBlockTimes, setPracticeBlocks]
  );

  const handleAutoAssignCoaches = useCallback(() => {
    setPracticeBlocks((prevBlocks) => {
      const updatedBlocks = prevBlocks.map((block) => {
        let assignedCoach = "";
        switch (block.category) {
          case "offense":
            assignedCoach = "Offensive Coordinator";
            break;
          case "defense":
            assignedCoach = "Defensive Coordinator";
            break;
          case "special-teams":
            assignedCoach = "Special Teams Coach";
            break;
          case "meeting":
            assignedCoach = "Head Coach";
            break;
          case "weight-room":
            assignedCoach = "Strength Coach";
            break;
          default:
            assignedCoach = "Head Coach";
        }

        return { ...block, assignedCoach };
      });

      return saveBlocks(updatedBlocks, eventId, recalculateBlockTimes);
    });
  }, [eventId, recalculateBlockTimes, setPracticeBlocks]);

  const assignScriptToBlock = useCallback(
    (blockId: string, script: ScriptInfo) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) =>
          block.id === blockId
            ? { ...block, scriptId: script.id, scriptTitle: script.title }
            : block
        );

        return saveBlocks(updatedBlocks, eventId, recalculateBlockTimes);
      });
    },
    [eventId, recalculateBlockTimes, setPracticeBlocks]
  );

  const assignScriptToGroup = useCallback(
    (blockId: string, groupId: string, script: ScriptInfo) => {
      setPracticeBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.id !== blockId) return block;
          return {
            ...block,
            groups:
              block.groups?.map((group) =>
                group.id === groupId
                  ? { ...group, scriptId: script.id, scriptTitle: script.title }
                  : group
              ) || [],
          };
        });

        return saveBlocks(updatedBlocks, eventId, recalculateBlockTimes);
      });
    },
    [eventId, recalculateBlockTimes, setPracticeBlocks]
  );

  return {
    handleRemoveBlock,
    handleAddGroup,
    handleRemoveGroup,
    handleAddScriptToBlock,
    handleAddScriptToGroup,
    handleRemoveScriptFromGroup,
    handleAutoAssignCoaches,
    assignScriptToBlock,
    assignScriptToGroup,
  };
}
