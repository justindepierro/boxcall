/**
 * PracticePlansPage Component
 *
 * Page for creating and managing practice scripts for team training sessions
 */

import React, { lazy, Suspense, useCallback } from "react";
import { Button } from "../../components/ui/Button/Button";
import { Icon } from "../../components/ui/Icon";
import { Typography } from "../../components/design-system/Typography";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal/ConfirmationModal";
import { usePracticePlansHandlers } from "./usePracticePlansHandlers";
import {
  AuroraDashboard,
  SearchFilterSection,
  LoadingState,
  EmptyState,
  ScriptsListSection,
} from "./components";

// Lazy loaded modals
const PracticeScriptModal = lazy(() =>
  import("../../components/practice/PracticeScriptModal").then((module) => ({
    default: module.PracticeScriptModal,
  }))
);

const ImportPracticeScriptsModal = lazy(() =>
  import("../../components/practice/ImportPracticeScriptsModal").then(
    (module) => ({
      default: module.ImportPracticeScriptsModal,
    })
  )
);

const PracticePlansPage: React.FC = () => {
  const {
    showModal,
    showImportModal,
    editingScript,
    practiceScripts,
    isLoading,
    searchQuery,
    activeFilters,
    sortBy,
    showDeleteConfirm,
    activeScripts,
    archivedScripts,
    setSearchQuery,
    setSortBy,
    handleCreateScript,
    handleEditScript,
    handleSaveScript,
    handleDuplicateScript,
    handleArchiveScript,
    handleDeleteScript,
    confirmDeleteScript,
    cancelDeleteScript,
    handleExportScripts,
    handleImportScripts,
    handleToggleFilter,
    handleCloseModal,
    handleOpenImportModal,
    handleCloseImportModal,
    handleNavigateToPlaybook,
    toast,
  } = usePracticePlansHandlers();

  const scrollToList = useCallback(() => {
    if (typeof window === "undefined") return;
    const section = document.getElementById("practice-scripts-section");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleShowTemplates = useCallback(() => {
    toast.info("Template library coming soon!");
  }, [toast]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (
      activeScripts.length === 0 &&
      archivedScripts.length === 0 &&
      !searchQuery &&
      activeFilters.length === 0
    ) {
      return (
        <EmptyState
          onCreateScript={handleCreateScript}
          onNavigateToPlaybook={handleNavigateToPlaybook}
        />
      );
    }

    return (
      <ScriptsListSection
        activeScripts={activeScripts}
        archivedScripts={archivedScripts}
        onCreateScript={handleCreateScript}
        onEditScript={handleEditScript}
        onDuplicateScript={handleDuplicateScript}
        onArchiveScript={handleArchiveScript}
        onDeleteScript={handleDeleteScript}
      />
    );
  };

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Practice Plans
          </Typography>
          <Typography variant="body" className="text-secondary">
            Create and manage practice scripts for your team's training sessions
          </Typography>
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={handleNavigateToPlaybook}
              variant="secondary"
              size="sm"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2" />
              Back to Playbook
            </Button>
            <Button onClick={handleCreateScript} variant="primary" size="sm">
              <Icon name="plus" className="h-4 w-4 mr-2" />
              New Script
            </Button>
          </div>
        </header>

        {/* Aurora Dashboard */}
        <AuroraDashboard
          activeScripts={activeScripts}
          archivedScripts={archivedScripts}
          onCreateScript={handleCreateScript}
          onScrollToList={scrollToList}
          onShowTemplates={handleShowTemplates}
        />

        {/* Search & Filter Section */}
        {practiceScripts.length > 0 && !isLoading && (
          <SearchFilterSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilters={activeFilters}
            onToggleFilter={handleToggleFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onOpenImportModal={handleOpenImportModal}
            onExportScripts={handleExportScripts}
          />
        )}

        {/* Main Content */}
        {renderContent()}

        {/* Practice Script Modal */}
        {showModal && (
          <Suspense
            fallback={
              <div className="fixed inset-0 bg-backdrop flex items-center justify-center z-modal">
                <div className="text-white">Loading modal...</div>
              </div>
            }
          >
            <PracticeScriptModal
              editingScript={editingScript}
              onClose={handleCloseModal}
              onSave={handleSaveScript}
            />
          </Suspense>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <Suspense fallback={<div>Loading...</div>}>
            <ImportPracticeScriptsModal
              isOpen={showImportModal}
              onClose={handleCloseImportModal}
              onImport={handleImportScripts}
            />
          </Suspense>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={cancelDeleteScript}
          onConfirm={confirmDeleteScript}
          title="Delete Practice Script"
          message="Are you sure you want to delete this practice script? This cannot be undone."
          variant="danger"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

PracticePlansPage.displayName = "PracticePlansPage";

export default React.memo(PracticePlansPage);
