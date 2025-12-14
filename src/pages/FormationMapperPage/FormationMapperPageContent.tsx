/**
 * ⚠️ DEPRECATED PAGE - Formation Mapper
 *
 * This page was designed to pair formation variants (Left/Right) using a separate
 * formations table. As of November 28, 2025, BoxCall uses the simplified approach:
 *
 * - Formation names stored as TEXT in plays table
 * - Direction detected from name suffix ("Shotgun Trips Left" vs "Shotgun Trips Right")
 * - No separate formations table needed
 * - No formation pairing/matching needed
 *
 * This page remains for backwards compatibility but may be removed in future versions.
 *
 * See: docs/FORMATION_FIX_COMPLETE_NOV28_2025.md
 */

import React, { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useFormationAudit } from "../../hooks/useFormationAudit";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import { useTeamsData } from "../../hooks/useTeamsData";
import { useRecentPlayCombos } from "../../hooks/useRecentPlayCombos";
import {
  useFormationMapperState,
  useFormationSuggestions,
  useFormationAssignment,
  useFormationHandlers,
} from "./hooks";
import {
  FormationMapperHeader,
  FormationMapperOverview,
  FormationMapperPlayRow,
  FormationMapperSelectionBar,
  FormationMapperLoadingState,
  FormationMapperEmptyState,
  FormationMapperErrors,
  LinkFormationModal,
  BulkAssignModal,
} from "./components";

const FormationMapperPageContent: React.FC = () => {
  const { activeTeamId } = useActiveTeamStore();
  const { playbooks } = useTeamsData();
  const { combos } = useRecentPlayCombos(12);

  const teamPlaybooks = useMemo(
    () => playbooks.filter((pb) => pb.team_id === activeTeamId && pb.is_active),
    [playbooks, activeTeamId]
  );

  // Initialize state management
  const state = useFormationMapperState({
    plays: [], // Will be populated after plays load
    teamPlaybooks,
    activeTeamId,
  });

  const { plays, loading, error, refresh } = useFormationAudit(
    state.selectedPlaybookId || null
  );

  // Re-initialize state with actual plays
  const stateWithPlays = useFormationMapperState({
    plays,
    teamPlaybooks,
    activeTeamId,
  });

  // Calculate suggestions
  const suggestionsByPlay = useFormationSuggestions({
    plays,
    formationCatalog: stateWithPlays.formationCatalog,
    combos,
  });

  // Calculate derived values
  const selectedSuggestionsCount = useMemo(() => {
    if (stateWithPlays.selectedPlays.length === 0) return 0;
    return stateWithPlays.selectedPlays.reduce((count, play) => {
      const suggestions = suggestionsByPlay.get(play.id) ?? [];
      return count + (suggestions.length > 0 ? 1 : 0);
    }, 0);
  }, [stateWithPlays.selectedPlays, suggestionsByPlay]);

  const canApplySuggestions =
    selectedSuggestionsCount > 0 && !stateWithPlays.assigning;
  const canBulkAssign =
    stateWithPlays.selectedCount > 0 && !stateWithPlays.assigning;

  // Setup assignment handlers
  const { assignFormations } = useFormationAssignment({ refresh });

  const handlers = useFormationHandlers({
    assignFormations,
    editingPlay: stateWithPlays.editingPlay,
    selectedFormation: stateWithPlays.selectedFormation,
    selectedPlays: stateWithPlays.selectedPlays,
    selectedCount: stateWithPlays.selectedCount,
    bulkAssignFormation: stateWithPlays.bulkAssignFormation,
    suggestionsByPlay,
    setEditingPlay: stateWithPlays.setEditingPlay,
    setSelectedFormation: stateWithPlays.setSelectedFormation,
    setBulkAssignOpen: stateWithPlays.setBulkAssignOpen,
    setBulkAssignFormation: stateWithPlays.setBulkAssignFormation,
    setSelectedPlayIds: stateWithPlays.setSelectedPlayIds,
  });

  // Calculate stats
  const total = plays.length;
  const unresolved = total;
  const lastUpdated = useMemo(() => {
    if (plays.length === 0) return null;
    const mostRecent = plays.reduce((latest, play) => {
      const updated = new Date(play.updated_at);
      return updated > latest ? updated : latest;
    }, new Date(0));
    return formatDistanceToNow(mostRecent, { addSuffix: true });
  }, [plays]);

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <FormationMapperHeader
          teamPlaybooks={teamPlaybooks}
          selectedPlaybookId={stateWithPlays.selectedPlaybookId}
          onPlaybookChange={stateWithPlays.handlePlaybookChange}
          playsCount={plays.length}
          allSelected={stateWithPlays.allSelected}
          onToggleSelectAll={stateWithPlays.handleToggleSelectAll}
          onRefresh={refresh}
          loading={loading}
          assigning={stateWithPlays.assigning}
        />

        <div className="space-y-6">
          <FormationMapperOverview
            selectedPlaybook={stateWithPlays.selectedPlaybook}
            total={total}
            unresolved={unresolved}
            lastUpdated={lastUpdated}
          />

          <FormationMapperErrors
            error={error}
            formationsError={stateWithPlays.formationsError}
          />

          {loading ? (
            <FormationMapperLoadingState />
          ) : plays.length === 0 ? (
            <FormationMapperEmptyState />
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3">
                {plays.map((play) => (
                  <FormationMapperPlayRow
                    key={play.id}
                    play={play}
                    isSelected={stateWithPlays.selectedPlayIds.has(play.id)}
                    suggestions={suggestionsByPlay.get(play.id) ?? []}
                    formationsLoading={stateWithPlays.formationsLoading}
                    assigning={stateWithPlays.assigning}
                    onSelectPlay={stateWithPlays.handleSelectPlay}
                    onSuggestionAssign={handlers.handleSuggestionAssign}
                    onAssignClick={(p) => {
                      stateWithPlays.setEditingPlay(p);
                      stateWithPlays.setSelectedFormation(null);
                    }}
                    onCreateNewClick={(p) => {
                      stateWithPlays.setEditingPlay(p);
                      stateWithPlays.setSelectedFormation(null);
                      stateWithPlays.setShowBuilder(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <FormationMapperSelectionBar
          selectedCount={stateWithPlays.selectedCount}
          selectedSuggestionsCount={selectedSuggestionsCount}
          assigning={stateWithPlays.assigning}
          canApplySuggestions={canApplySuggestions}
          canBulkAssign={canBulkAssign}
          onClearSelection={stateWithPlays.handleClearSelection}
          onBulkAssignOpen={() => stateWithPlays.setBulkAssignOpen(true)}
          onApplySuggestions={handlers.handleBulkApplySuggestions}
        />
      </div>

      <LinkFormationModal
        isOpen={Boolean(stateWithPlays.editingPlay) && !stateWithPlays.showBuilder}
        onClose={() => {
          if (stateWithPlays.assigning) return;
          stateWithPlays.setEditingPlay(null);
          stateWithPlays.setSelectedFormation(null);
        }}
        editingPlay={stateWithPlays.editingPlay}
        selectedFormation={stateWithPlays.selectedFormation}
        assigning={stateWithPlays.assigning}
        onFormationChange={(formationName) => {
          if (formationName) {
            stateWithPlays.setSelectedFormation({ id: formationName, name: formationName } as any);
          } else {
            stateWithPlays.setSelectedFormation(null);
          }
        }}
        onCreateNew={() => stateWithPlays.setShowBuilder(true)}
        onAssign={handlers.handleAssignFormation}
      />

      <BulkAssignModal
        isOpen={stateWithPlays.bulkAssignOpen}
        onClose={() => {
          if (stateWithPlays.assigning) return;
          stateWithPlays.setBulkAssignOpen(false);
          stateWithPlays.setBulkAssignFormation(null);
        }}
        selectedPlays={stateWithPlays.selectedPlays}
        selectedCount={stateWithPlays.selectedCount}
        selectedPlaybookId={stateWithPlays.selectedPlaybookId}
        bulkAssignFormation={stateWithPlays.bulkAssignFormation}
        assigning={stateWithPlays.assigning}
        onFormationChange={(formationName) => {
          if (formationName) {
            stateWithPlays.setBulkAssignFormation({ id: formationName, name: formationName } as any);
          } else {
            stateWithPlays.setBulkAssignFormation(null);
          }
        }}
        onConfirm={handlers.handleBulkAssignConfirm}
      />
    </div>
  );
};

FormationMapperPageContent.displayName = "FormationMapperPageContent";

export default React.memo(FormationMapperPageContent);
