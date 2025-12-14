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
      if (!activeTeamId) {
        toast.error("No active team found");
        return;
      }

      try {
        // 1. Show instant success feedback
        toast.success(
          editingPlan ? "Game plan updated!" : "Game plan created!"
        );

        // 2. Optimistically update UI immediately
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

        // 3. Close modal instantly
        setShowModal(false);
        setEditingPlan(undefined);

        // 4. Sync with server in background
        if (editingPlan) {
          await GamePlanService.updateGamePlan(plan.id, {
            name: plan.name,
            opponent: plan.opponent,
            gameDate: plan.gameDate,
            gameLocation: plan.gameLocation,
          });
        } else {
          const newPlan = await GamePlanService.createGamePlan({
            teamId: activeTeamId,
            name: plan.name,
            opponent: plan.opponent,
            gameDate: plan.gameDate,
            gameLocation: plan.gameLocation,
          });

          // Replace temp ID with real ID from server
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
        }
      } catch (error) {
        logError("Failed to save game plan:", error);

        // 5. Rollback on error
        if (editingPlan) {
          const original = rawGamePlans.find((p) => p.id === plan.id);
          if (original) {
            const mappedOriginal: ModalGamePlan = {
              id: original.id,
              name: original.name,
              opponent: original.opponent || "",
              gameDate: original.gameDate,
              gameLocation: original.gameLocation as
                | "Home"
                | "Away"
                | "Neutral"
                | undefined,
              situations: [],
              createdAt: original.createdAt,
              updatedAt: original.updatedAt,
              isArchived: original.isArchived,
            };
            setGamePlans((prev) =>
              prev.map((p) => (p.id === plan.id ? mappedOriginal : p))
            );
          }
        } else {
          setGamePlans((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
        }

        toast.error("Failed to save game plan");
      }
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
      try {
        const newName = `${plan.name} (Copy)`;
        const tempId = `temp-${Date.now()}`;

        // 1. Instant UI update
        const duplicatedPlan: ModalGamePlan = {
          ...plan,
          id: tempId,
          name: newName,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setGamePlans((prev) => [duplicatedPlan, ...prev]);
        toast.success("Game plan duplicated!");

        // 2. Background sync
        const newPlan = await GamePlanService.duplicateGamePlan(
          plan.id,
          newName
        );

        // 3. Replace temp with real ID
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
    },
    [toast, setGamePlans, setRawGamePlans]
  );

  const handleArchivePlan = useCallback(
    async (plan: ModalGamePlan) => {
      const originalArchiveState = plan.isArchived;

      try {
        // 1. Instant UI update
        setGamePlans((prev) =>
          prev.map((p) =>
            p.id === plan.id ? { ...p, isArchived: !p.isArchived } : p
          )
        );
        toast.success(
          plan.isArchived ? "Game plan restored!" : "Game plan archived!"
        );

        // 2. Background sync
        if (plan.isArchived) {
          await GamePlanService.unarchiveGamePlan(plan.id);
        } else {
          await GamePlanService.archiveGamePlan(plan.id);
        }

        // Update rawGamePlans
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
    if (!deletePlanId) return;

    const deletedPlan = gamePlans.find((p) => p.id === deletePlanId);
    const deletedRawPlan = rawGamePlans.find((p) => p.id === deletePlanId);

    try {
      // 1. Instant UI update
      setGamePlans((prev) => prev.filter((p) => p.id !== deletePlanId));
      setRawGamePlans((prev) => prev.filter((p) => p.id !== deletePlanId));
      toast.success("Game plan deleted!");

      // 2. Background sync
      await GamePlanService.deleteGamePlan(deletePlanId);
    } catch (error) {
      logError("Failed to delete game plan:", error);

      // Rollback
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
