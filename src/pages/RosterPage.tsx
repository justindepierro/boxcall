import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../components/design-system";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { EmptyState } from "../components/ui/EmptyState";
import { Pagination } from "../components/Pagination";
import type { MultiSelectOption } from "../components/ui/MultiSelect";
import { usePagination } from "../hooks/usePagination";
import {
  useRosterData,
  useRosterFilters,
  useRosterSelection,
  useRosterStats,
  useRosterModals,
  useRosterCrud,
  useRosterBulkOps,
  useRosterInvitations,
} from "./RosterPage/hooks";
import {
  RosterStats,
  RosterFiltersBar,
  RosterToolbar,
  RosterTable,
  RosterLoadingState,
  RosterPageModals,
  AddEditPlayerModal,
} from "./RosterPage/components";

// Options constants
const POSITION_OPTIONS: MultiSelectOption[] = [
  "QB",
  "RB",
  "FB",
  "WR",
  "TE",
  "OL",
  "C",
  "G",
  "T",
  "DT",
  "DE",
  "LB",
  "CB",
  "S",
  "K",
  "P",
].map((pos) => ({ value: pos, label: pos }));

const GRADE_LEVEL_OPTIONS: MultiSelectOption[] = [
  { value: "9", label: "9th Grade (Freshman)" },
  { value: "10", label: "10th Grade (Sophomore)" },
  { value: "11", label: "11th Grade (Junior)" },
  { value: "12", label: "12th Grade (Senior)" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "injured", label: "Injured" },
  { value: "suspended", label: "Suspended" },
  { value: "academic_probation", label: "Academic Probation" },
  { value: "inactive", label: "Inactive" },
  { value: "inactive_cut", label: "Inactive (Cut)" },
  { value: "inactive_quit", label: "Inactive (Quit)" },
  { value: "transferred", label: "Transferred" },
  { value: "alumni", label: "Alumni" },
];

/**
 * RosterPage - Complete roster management interface
 * Refactored to use extracted hooks and components
 */
const RosterPage = () => {
  const navigate = useNavigate();

  // Data hooks
  const { players, setPlayers, loading, teamId, loadRoster } = useRosterData();
  const filters = useRosterFilters(players);
  const selection = useRosterSelection();
  const stats = useRosterStats(players);
  const pagination = usePagination(filters.filteredPlayers, 50, {
    persistInUrl: true,
    urlParamName: "page",
  });
  const modals = useRosterModals();

  // CRUD operations hook
  const crud = useRosterCrud({ teamId, modals, setPlayers });

  // Bulk operations hook
  const bulk = useRosterBulkOps({
    teamId,
    modals,
    players,
    setPlayers,
    selectedPlayerIds: selection.selectedPlayerIds,
    filteredPlayers: filters.filteredPlayers,
    clearSelection: selection.clearSelection,
    loadRoster,
  });

  // Invitations hook
  const invitations = useRosterInvitations({
    teamId,
    modals,
    playerForm: crud.playerForm,
    loadRoster,
  });

  // Loading state
  if (loading) return <RosterLoadingState />;

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Team Roster
          </Typography>
          <Typography
            variant="body"
            className="text-secondary"
          >{`${players.length} players • Manage your team's roster and player information`}</Typography>
        </header>

        <Breadcrumb
          items={[
            {
              id: "dashboard",
              label: "Dashboard",
              onClick: () => navigate("/dashboard"),
            },
            { id: "roster", label: "Roster", current: true },
          ]}
          className="mb-4"
        />

        <div className="space-y-lg relative z-10">
          <RosterToolbar
            totalPlayers={stats.totalPlayers}
            activePlayerCount={stats.activePlayerCount}
            filteredCount={filters.filteredPlayers.length}
            selectedCount={selection.selectedPlayerIds.size}
            hasSelection={selection.selectedPlayerIds.size > 0}
            onAddPlayer={modals.openAddModal}
            onImport={modals.openImportModal}
            onExport={bulk.handleExportCSV}
            onBulkStatusChange={modals.openBulkStatusDialog}
            onBulkEdit={modals.openBulkEditModal}
            onClearSelection={selection.clearSelection}
          />

          <RosterFiltersBar
            searchTerm={filters.searchTerm}
            onSearchChange={filters.setSearchTerm}
            positionFilters={new Set(filters.positionFilters)}
            onTogglePosition={filters.togglePositionFilter}
            gradeLevelFilters={new Set(filters.gradeLevelFilters)}
            onToggleGradeLevel={filters.toggleGradeLevelFilter}
            statusFilter={filters.statusFilter}
            onStatusChange={filters.setStatusFilter}
            onClearFilters={filters.clearAllFilters}
            hasActiveFilters={filters.hasActiveFilters}
            positionOptions={POSITION_OPTIONS}
            gradeLevelOptions={GRADE_LEVEL_OPTIONS}
            statusOptions={STATUS_OPTIONS}
          />

          <RosterStats
            totalPlayers={stats.totalPlayers}
            activePlayerCount={stats.activePlayerCount}
            filteredCount={filters.filteredPlayers.length}
            selectedCount={selection.selectedPlayerIds.size}
          />

          {/* Empty States */}
          {filters.filteredPlayers.length === 0 && players.length === 0 && (
            <EmptyState
              icon="users"
              title="No players yet"
              description="Get started by adding your first player to the roster"
              primaryAction={{
                label: "Add First Player",
                onClick: modals.openAddModal,
                icon: "plus",
              }}
            />
          )}

          {filters.filteredPlayers.length === 0 && players.length > 0 && (
            <EmptyState
              icon="search"
              title="No players found"
              description="Try adjusting your search or filters"
              primaryAction={{
                label: "Clear Filters",
                onClick: filters.clearAllFilters,
              }}
            />
          )}

          {/* Player Grid */}
          {filters.filteredPlayers.length > 0 && (
            <>
              <RosterTable
                players={pagination.paginatedData}
                selectedPlayerIds={selection.selectedPlayerIds}
                onToggleSelection={selection.togglePlayerSelection}
                onSelectAll={() => selection.selectAll(filters.filteredPlayers)}
                onEditPlayer={crud.openEditModal}
                onDeletePlayer={(player) => modals.openDeleteDialog(player)}
                onSendInvitation={(player) =>
                  invitations.handleSendInvite(player)
                }
                onViewProfile={(id) => navigate(`/roster/${id}`)}
                onToggleStatus={bulk.togglePlayerStatus}
                isAllSelected={
                  selection.selectedPlayerIds.size ===
                  filters.filteredPlayers.length
                }
                hasFilters={filters.hasActiveFilters}
                onClearFilters={filters.clearAllFilters}
              />
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.goToPage}
                itemsPerPage={50}
                totalItems={filters.filteredPlayers.length}
                className="mt-lg"
              />
            </>
          )}

          {/* Add Player Modal */}
          <AddEditPlayerModal
            mode="add"
            isOpen={modals.showAddModal}
            onClose={() => {
              modals.closeAddModal();
              crud.resetForm();
            }}
            onSubmit={crud.handleAddPlayer}
            formData={crud.playerForm}
            setFormData={crud.setPlayerForm}
            saving={crud.saving}
            formError={crud.formError}
            onSendInvitation={invitations.handleSendInvitationFromModal}
          />

          {/* Edit Player Modal */}
          <AddEditPlayerModal
            mode="edit"
            isOpen={modals.showEditModal}
            onClose={() => {
              modals.closeEditModal();
              crud.resetForm();
            }}
            onSubmit={crud.handleEditPlayer}
            formData={crud.playerForm}
            setFormData={crud.setPlayerForm}
            onFieldChange={crud.handleFieldChange}
            saving={crud.saving}
            formError={crud.formError}
            editingPlayer={modals.editingPlayer}
            autosavePlayer={crud.autosavePlayer}
            onSendInvitation={invitations.handleSendInvitationFromModal}
          />

          {/* Other Modals */}
          <RosterPageModals
            modals={modals}
            onDeleteConfirm={crud.handleDeletePlayer}
            onBulkStatusConfirm={bulk.handleBulkStatusChange}
            onBulkEdit={bulk.handleBulkEdit}
            onImport={bulk.handleImportPlayers}
            onSendInvitation={invitations.sendInvitation}
            saving={crud.saving || bulk.bulkSaving}
            selectedPlayerIds={selection.selectedPlayerIds}
            players={players}
          />
        </div>
      </div>
    </div>
  );
};

RosterPage.displayName = "RosterPage";

export default React.memo(RosterPage);
