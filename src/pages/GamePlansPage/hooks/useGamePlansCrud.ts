/**
 * useGamePlansCrud
 *
 * Handles CRUD operations for game plans with optimistic updates
 */

import { useCallback } from "react";
import {
  GamePlanService,
  type GamePlan as ServiceGamePlan,
} from "../../../services/gamePlanService";
import type { GamePlan as ModalGamePlan } from "../../../components/playbook/GamePlanModal/types";
import { error as logError } from "../../../utils/logger";

interface UseGamePlansCrudProps {
  activeTeamId: string | null;
  gamePlans: ModalGamePlan[];
  rawGamePlans: ServiceGamePlan[];
  editingPlan: ModalGamePlan | undefined;
  setGamePlans: React.Dispatch<React.SetStateAction<ModalGamePlan[]>>;
  setRawGamePlans: React.Dispatch<React.SetStateAction<ServiceGamePlan[]>>;
  setShowModal: (show: boolean) => void;
  setEditingPlan: (plan: ModalGamePlan | undefined) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setDeletePlanId: (id: string | null) => void;
  deletePlanId: string | null;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
  };
}

function mapServicePlanToModalPlan(plan: ServiceGamePlan): ModalGamePlan {
  return {
    id: plan.id,
    name: plan.name,
    opponent: plan.opponent || "",
    gameDate: plan.gameDate,
    gameLocation: plan.gameLocation as "Home" | "Away" | "Neutral" | undefined,
    situations: [],
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    isArchived: plan.isArchived,
  };
}

async function saveGamePlanWithOptimism({
  activeTeamId,
  plan,
  editingPlan,
  rawGamePlans,
  toast,
  setGamePlans,
  setRawGamePlans,
  setShowModal,
  setEditingPlan,
}: {
  activeTeamId: string | null;
  plan: ModalGamePlan;
  editingPlan: ModalGamePlan | undefined;
  rawGamePlans: ServiceGamePlan[];
  toast: UseGamePlansCrudProps["toast"];
  setGamePlans: UseGamePlansCrudProps["setGamePlans"];
  setRawGamePlans: UseGamePlansCrudProps["setRawGamePlans"];
  setShowModal: UseGamePlansCrudProps["setShowModal"];
  setEditingPlan: UseGamePlansCrudProps["setEditingPlan"];
}) {
  if (!activeTeamId) {
    toast.error("No active team found");
    return;
  }

  try {
    toast.success(editingPlan ? "Game plan updated!" : "Game plan created!");

    if (editingPlan) {
      setGamePlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...plan, updatedAt: new Date() } : p
        )
      );
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimisticPlan: ModalGamePlan = {
        ...plan,
        id: tempId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      setGamePlans((prev) => [optimisticPlan, ...prev]);
    }

    setShowModal(false);
    setEditingPlan(undefined);

    if (editingPlan) {
      await GamePlanService.updateGamePlan(plan.id, {
        name: plan.name,
        opponent: plan.opponent,
        gameDate: plan.gameDate,
        gameLocation: plan.gameLocation,
      });
      return;
    }

    const newPlan = await GamePlanService.createGamePlan({
      teamId: activeTeamId,
      name: plan.name,
      opponent: plan.opponent,
      gameDate: plan.gameDate,
      gameLocation: plan.gameLocation,
    });

    setGamePlans((prev) =>
      prev.map((p) =>
        p.id.startsWith("temp-")
          ? {
              ...p,
              id: newPlan.id,
              createdAt: newPlan.createdAt,
              updatedAt: newPlan.updatedAt,
            }
          : p
      )
    );
    setRawGamePlans((prev) => [newPlan, ...prev]);
  } catch (error) {
    logError("Failed to save game plan:", error);

    if (editingPlan) {
      const original = rawGamePlans.find((p) => p.id === plan.id);
      if (original) {
        const mappedOriginal = mapServicePlanToModalPlan(original);
        setGamePlans((prev) =>
          prev.map((p) => (p.id === plan.id ? mappedOriginal : p))
        );
      }
    } else {
      setGamePlans((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
    }

    toast.error("Failed to save game plan");
  }
}

async function duplicateGamePlanWithOptimism({
  plan,
  toast,
  setGamePlans,
  setRawGamePlans,
}: {
  plan: ModalGamePlan;
  toast: UseGamePlansCrudProps["toast"];
  setGamePlans: UseGamePlansCrudProps["setGamePlans"];
  setRawGamePlans: UseGamePlansCrudProps["setRawGamePlans"];
}) {
  const newName = `${plan.name} (Copy)`;
  const tempId = `temp-${Date.now()}`;

  try {
    const duplicatedPlan: ModalGamePlan = {
      ...plan,
      id: tempId,
      name: newName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setGamePlans((prev) => [duplicatedPlan, ...prev]);
    toast.success("Game plan duplicated!");

    const newPlan = await GamePlanService.duplicateGamePlan(plan.id, newName);

    setGamePlans((prev) =>
      prev.map((p) =>
        p.id === tempId
          ? { ...p, id: newPlan.id, createdAt: newPlan.createdAt }
          : p
      )
    );
    setRawGamePlans((prev) => [newPlan, ...prev]);
  } catch (error) {
    logError("Failed to duplicate game plan:", error);
    setGamePlans((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
    toast.error("Failed to duplicate game plan");
  }
}

async function toggleArchiveGamePlanWithOptimism({
  plan,
  toast,
  setGamePlans,
  setRawGamePlans,
}: {
  plan: ModalGamePlan;
  toast: UseGamePlansCrudProps["toast"];
  setGamePlans: UseGamePlansCrudProps["setGamePlans"];
  setRawGamePlans: UseGamePlansCrudProps["setRawGamePlans"];
}) {
  const originalArchiveState = plan.isArchived;

  try {
    setGamePlans((prev) =>
      prev.map((p) =>
        p.id === plan.id ? { ...p, isArchived: !p.isArchived } : p
      )
    );
    toast.success(
      plan.isArchived ? "Game plan restored!" : "Game plan archived!"
    );

    if (plan.isArchived) {
      await GamePlanService.unarchiveGamePlan(plan.id);
    } else {
      await GamePlanService.archiveGamePlan(plan.id);
    }

    setRawGamePlans((prev) =>
      prev.map((p) =>
        p.id === plan.id ? { ...p, isArchived: !originalArchiveState } : p
      )
    );
  } catch (error) {
    logError("Failed to archive/unarchive game plan:", error);
    setGamePlans((prev) =>
      prev.map((p) =>
        p.id === plan.id ? { ...p, isArchived: originalArchiveState } : p
      )
    );
    toast.error("Failed to update game plan");
  }
}

async function deleteGamePlanWithOptimism({
  deletePlanId,
  gamePlans,
  rawGamePlans,
  toast,
  setGamePlans,
  setRawGamePlans,
  setShowDeleteConfirm,
  setDeletePlanId,
}: {
  deletePlanId: string | null;
  gamePlans: ModalGamePlan[];
  rawGamePlans: ServiceGamePlan[];
  toast: UseGamePlansCrudProps["toast"];
  setGamePlans: UseGamePlansCrudProps["setGamePlans"];
  setRawGamePlans: UseGamePlansCrudProps["setRawGamePlans"];
  setShowDeleteConfirm: UseGamePlansCrudProps["setShowDeleteConfirm"];
  setDeletePlanId: UseGamePlansCrudProps["setDeletePlanId"];
}) {
  if (!deletePlanId) return;

  const deletedPlan = gamePlans.find((p) => p.id === deletePlanId);
  const deletedRawPlan = rawGamePlans.find((p) => p.id === deletePlanId);

  try {
    setGamePlans((prev) => prev.filter((p) => p.id !== deletePlanId));
    setRawGamePlans((prev) => prev.filter((p) => p.id !== deletePlanId));
    toast.success("Game plan deleted!");

    await GamePlanService.deleteGamePlan(deletePlanId);
  } catch (error) {
    logError("Failed to delete game plan:", error);

    if (deletedPlan) {
      setGamePlans((prev) => [...prev, deletedPlan]);
    }
    if (deletedRawPlan) {
      setRawGamePlans((prev) => [...prev, deletedRawPlan]);
    }
    toast.error("Failed to delete game plan");
  } finally {
    setShowDeleteConfirm(false);
    setDeletePlanId(null);
  }
}

export function useGamePlansCrud({
  activeTeamId,
  gamePlans,
  rawGamePlans,
  editingPlan,
  setGamePlans,
  setRawGamePlans,
  setShowModal,
  setEditingPlan,
  setShowDeleteConfirm,
  setDeletePlanId,
  deletePlanId,
  toast,
}: UseGamePlansCrudProps) {
  const handleCreatePlan = useCallback(() => {
    setEditingPlan(undefined);
    setShowModal(true);
  }, [setEditingPlan, setShowModal]);

  const handleEditPlan = useCallback(
    (plan: ModalGamePlan) => {
      setEditingPlan(plan);
      setShowModal(true);
    },
    [setEditingPlan, setShowModal]
  );

  const handleSavePlan = useCallback(
    async (plan: ModalGamePlan) => {
      await saveGamePlanWithOptimism({
        activeTeamId,
        plan,
        editingPlan,
        rawGamePlans,
        toast,
        setGamePlans,
        setRawGamePlans,
        setShowModal,
        setEditingPlan,
      });
    },
    [
      activeTeamId,
      editingPlan,
      rawGamePlans,
      toast,
      setGamePlans,
      setRawGamePlans,
      setShowModal,
      setEditingPlan,
    ]
  );

  const handleDuplicatePlan = useCallback(
    async (plan: ModalGamePlan) => {
      await duplicateGamePlanWithOptimism({
        plan,
        toast,
        setGamePlans,
        setRawGamePlans,
      });
    },
    [toast, setGamePlans, setRawGamePlans]
  );

  const handleArchivePlan = useCallback(
    async (plan: ModalGamePlan) => {
      await toggleArchiveGamePlanWithOptimism({
        plan,
        toast,
        setGamePlans,
        setRawGamePlans,
      });
    },
    [toast, setGamePlans, setRawGamePlans]
  );

  const handleDeletePlan = useCallback(
    (planId: string) => {
      setDeletePlanId(planId);
      setShowDeleteConfirm(true);
    },
    [setDeletePlanId, setShowDeleteConfirm]
  );

  const confirmDeletePlan = useCallback(async () => {
    await deleteGamePlanWithOptimism({
      deletePlanId,
      gamePlans,
      rawGamePlans,
      toast,
      setGamePlans,
      setRawGamePlans,
      setShowDeleteConfirm,
      setDeletePlanId,
    });
  }, [
    deletePlanId,
    gamePlans,
    rawGamePlans,
    toast,
    setGamePlans,
    setRawGamePlans,
    setShowDeleteConfirm,
    setDeletePlanId,
  ]);

  return {
    handleCreatePlan,
    handleEditPlan,
    handleSavePlan,
    handleDuplicatePlan,
    handleArchivePlan,
    handleDeletePlan,
    confirmDeletePlan,
  };
}
