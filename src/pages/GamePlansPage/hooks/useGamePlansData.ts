/**
 * useGamePlansData
 *
 * Manages state and data loading for GamePlansPage
 */

import { useState, useCallback, useEffect } from "react";
import {
  GamePlanService,
  type GamePlan as ServiceGamePlan,
} from "../../../services/gamePlanService";
import type { GamePlan as ModalGamePlan } from "../../../components/playbook/GamePlanModal/types";
import { useAuth } from "../../../app/auth-store";
import { useToast } from "../../../hooks/useToast";
import { debug, error as logError } from "../../../utils/logger";
import { readLocalString, storageKeys } from "../../../utils/storage";

/**
 * Maps a ServiceGamePlan to the UI ModalGamePlan type
 */
function mapServiceToModalPlan(plan: ServiceGamePlan): ModalGamePlan {
  return {
    id: plan.id,
    name: plan.name,
    opponent: plan.opponent || "",
    gameDate: plan.gameDate,
    gameLocation: plan.gameLocation as "Home" | "Away" | "Neutral" | undefined,
    situations: (plan.situations || []).map((sit) => ({
      id: sit.id,
      situationType: sit.situationType,
      plays: (sit.plays || []).map((p) => ({
        id: p.id,
        playId: p.playId,
        playName: p.play?.play_name || "Unknown Play",
        formation: p.play?.formation,
        personnel: p.play?.personnel,
        wristbandNumber: p.play?.wristband_number,
        priority: p.priority,
      })),
    })),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    isArchived: plan.isArchived,
  };
}

export function useGamePlansData() {
  const { user } = useAuth();
  const toast = useToast();

  const [gamePlans, setGamePlans] = useState<ModalGamePlan[]>([]);
  const [rawGamePlans, setRawGamePlans] = useState<ServiceGamePlan[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ModalGamePlan | undefined>(
    undefined
  );

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  // Get active team ID from localStorage
  useEffect(() => {
    const teamId = readLocalString(storageKeys.activeTeamId);
    setActiveTeamId(teamId);
  }, []);

  const loadGamePlans = useCallback(async () => {
    if (!user || !activeTeamId) return;

    setLoading(true);
    try {
      const plans = await GamePlanService.getGamePlans(activeTeamId, false);
      setRawGamePlans(plans);
      setGamePlans(plans.map(mapServiceToModalPlan));
    } catch (error) {
      logError("Failed to load game plans:", error);
      toast.error("Failed to load game plans");
    } finally {
      setLoading(false);
    }
  }, [user, activeTeamId, toast]);

  // Load game plans from database
  useEffect(() => {
    loadGamePlans();
  }, [loadGamePlans]);

  // Preload heavy modals during idle time
  useEffect(() => {
    if (isLoading || gamePlans.length === 0) return;

    const timer = setTimeout(() => {
      debug("[GamePlansPage] Preloading heavy modals during idle time...");

      import("../../../components/playbook/GamePlanModal").catch(() => {
        debug("GamePlanModal preload failed (will load on demand)");
      });

      import("../../../components/playbook/ImportGamePlansModal").catch(() => {
        debug("ImportGamePlansModal preload failed (will load on demand)");
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, gamePlans.length]);

  return {
    // Data
    gamePlans,
    setGamePlans,
    rawGamePlans,
    setRawGamePlans,
    isLoading,
    activeTeamId,

    // Search & Sort
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,

    // Modal state
    showModal,
    setShowModal,
    showImportModal,
    setShowImportModal,
    editingPlan,
    setEditingPlan,

    // Delete confirmation
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletePlanId,
    setDeletePlanId,

    // Actions
    loadGamePlans,
    toast,
  };
}
