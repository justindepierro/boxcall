import { useCallback, useEffect, useMemo, useState } from "react";
import type { Play } from "../../../types/play";
import type { Formation } from "../../../types/formation";
import { FormationService } from "../../../services/formationService";
import { logError } from "../../../utils/logger";
import {
  readLocalString,
  storageKeys,
  writeLocalString,
} from "../../../utils/storage";

// Minimal Playbook interface for Formation Mapper
interface Playbook {
  id: string;
  team_id: string | null;
  name: string;
  description?: string | null;
  is_active: boolean | null;
  play_count: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface UseFormationMapperStateParams {
  plays: Play[];
  teamPlaybooks: Playbook[];
  activeTeamId: string | null;
}

interface UseFormationMapperStateReturn {
  // Playbook selection
  selectedPlaybookId: string;
  selectedPlaybook: Playbook | null;
  handlePlaybookChange: (playbookId: string) => void;

  // Play selection
  selectedPlayIds: Set<string>;
  selectedPlays: Play[];
  selectedCount: number;
  allSelected: boolean;
  handleSelectPlay: (playId: string, isSelected: boolean) => void;
  handleClearSelection: () => void;
  handleToggleSelectAll: () => void;
  setSelectedPlayIds: React.Dispatch<React.SetStateAction<Set<string>>>;

  // Edit state
  editingPlay: Play | null;
  setEditingPlay: (play: Play | null) => void;
  showBuilder: boolean;
  setShowBuilder: (show: boolean) => void;
  selectedFormation: Formation | null;
  setSelectedFormation: (formation: Formation | null) => void;

  // Bulk assign state
  bulkAssignOpen: boolean;
  setBulkAssignOpen: (open: boolean) => void;
  bulkAssignFormation: Formation | null;
  setBulkAssignFormation: (formation: Formation | null) => void;

  // Assignment state
  assigning: boolean;
  setAssigning: (assigning: boolean) => void;

  // Formation catalog
  formationCatalog: Formation[];
  setFormationCatalog: (formations: Formation[]) => void;
  formationsLoading: boolean;
  formationsError: string | null;
  loadFormations: (playbookId: string | null | undefined) => Promise<void>;
}

export function useFormationMapperState({
  plays,
  teamPlaybooks,
  activeTeamId,
}: UseFormationMapperStateParams): UseFormationMapperStateReturn {
  // Playbook selection
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("");
  const selectedPlaybook = useMemo(
    () => teamPlaybooks.find((pb) => pb.id === selectedPlaybookId) || null,
    [teamPlaybooks, selectedPlaybookId]
  );

  // Play selection
  const [selectedPlayIds, setSelectedPlayIds] = useState<Set<string>>(
    new Set()
  );

  // Edit state
  const [editingPlay, setEditingPlay] = useState<Play | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );

  // Bulk assign state
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkAssignFormation, setBulkAssignFormation] =
    useState<Formation | null>(null);

  // Assignment state
  const [assigning, setAssigning] = useState(false);

  // Formation catalog
  const [formationCatalog, setFormationCatalog] = useState<Formation[]>([]);
  const [formationsLoading, setFormationsLoading] = useState(false);
  const [formationsError, setFormationsError] = useState<string | null>(null);

  // Initialize playbook selection from localStorage
  useEffect(() => {
    if (teamPlaybooks.length === 0) return;

    const savedPlaybookId = activeTeamId
      ? readLocalString(
          storageKeys.playbook.activePlaybookForTeam(activeTeamId)
        )
      : null;

    if (
      savedPlaybookId &&
      teamPlaybooks.some((playbook) => playbook.id === savedPlaybookId)
    ) {
      setSelectedPlaybookId(savedPlaybookId);
    } else {
      setSelectedPlaybookId(teamPlaybooks[0].id);
    }
  }, [teamPlaybooks, activeTeamId]);

  // Sync selection with available plays
  useEffect(() => {
    setSelectedPlayIds((prev) => {
      if (prev.size === 0) return prev;
      const validIds = new Set(plays.map((play) => play.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      if (changed || next.size !== prev.size) {
        return next;
      }
      return prev;
    });
  }, [plays]);

  // Derived selection state
  const selectedPlays = useMemo(
    () => plays.filter((play) => selectedPlayIds.has(play.id)),
    [plays, selectedPlayIds]
  );
  const selectedCount = selectedPlays.length;
  const allSelected = plays.length > 0 && selectedCount === plays.length;

  // Handlers
  const handlePlaybookChange = useCallback(
    (playbookId: string) => {
      setSelectedPlaybookId(playbookId);
      if (activeTeamId) {
        writeLocalString(
          storageKeys.playbook.activePlaybookForTeam(activeTeamId),
          playbookId
        );
      }
      setSelectedPlayIds(new Set());
    },
    [activeTeamId]
  );

  const handleSelectPlay = useCallback(
    (playId: string, isSelected: boolean) => {
      setSelectedPlayIds((prev) => {
        const next = new Set(prev);
        if (isSelected) {
          next.add(playId);
        } else {
          next.delete(playId);
        }
        return next;
      });
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setSelectedPlayIds(new Set());
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedPlayIds((prev) => {
      if (plays.length === 0) {
        return new Set();
      }
      if (prev.size === plays.length) {
        return new Set();
      }
      return new Set(plays.map((play) => play.id));
    });
  }, [plays]);

  // Formation catalog loading
  const loadFormations = useCallback(
    async (playbookId: string | null | undefined) => {
      if (!playbookId) {
        setFormationCatalog([]);
        return;
      }

      setFormationsLoading(true);
      setFormationsError(null);
      try {
        const data = await FormationService.getFormationsByPlaybook(playbookId);
        setFormationCatalog(data);
      } catch (err) {
        logError("Failed to load formation catalog", err);
        setFormationCatalog([]);
        setFormationsError(
          err instanceof Error
            ? err.message
            : "Failed to load formations for suggestions"
        );
      } finally {
        setFormationsLoading(false);
      }
    },
    []
  );

  // Load formations when playbook changes
  useEffect(() => {
    void loadFormations(selectedPlaybookId || null);
  }, [selectedPlaybookId, loadFormations]);

  return {
    // Playbook selection
    selectedPlaybookId,
    selectedPlaybook,
    handlePlaybookChange,

    // Play selection
    selectedPlayIds,
    selectedPlays,
    selectedCount,
    allSelected,
    handleSelectPlay,
    handleClearSelection,
    handleToggleSelectAll,
    setSelectedPlayIds,

    // Edit state
    editingPlay,
    setEditingPlay,
    showBuilder,
    setShowBuilder,
    selectedFormation,
    setSelectedFormation,

    // Bulk assign state
    bulkAssignOpen,
    setBulkAssignOpen,
    bulkAssignFormation,
    setBulkAssignFormation,

    // Assignment state
    assigning,
    setAssigning,

    // Formation catalog
    formationCatalog,
    setFormationCatalog,
    formationsLoading,
    formationsError,
    loadFormations,
  };
}
