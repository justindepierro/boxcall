/**
 * FormationBuilderPanel
 *
 * Dedicated panel for editing formation metadata:
 * - Personnel packages that can run this formation
 * - Formation category (spread, pro, power, etc.)
 * - Tags for filtering/organization
 * - Description
 *
 * This is separate from drawing (canvas) and linking (left/right variants)
 *
 * Refactored: Extracted hooks and sub-components for maintainability
 */

import React, { useMemo } from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { CreateOppositeFormationModal } from "./CreateOppositeFormationModal";
import { FormationDirectionReviewPanel } from "./FormationDirectionReviewPanel";
import { FormationDataDiagnostic } from "./FormationDataDiagnostic";
import { FormationTemplateSelector } from "./FormationTemplateSelector";
import { useBulkSelection } from "./BulkSelectionContext";
import { FormationService } from "../../services/formationService";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import type { Formation } from "../../types/formation";

// Extracted hooks and components
import { useFormationBuilderState } from "./hooks/useFormationBuilderState";
import { useFormationDataLoader } from "./hooks/useFormationDataLoader";
import { useFormationAutoSave } from "./hooks/useFormationAutoSave";
import { useFormationOperations } from "./hooks/useFormationOperations";
import {
  FormationSelector,
  NewFormationForm,
  FormationEditForm,
} from "./components";

interface FormationBuilderPanelProps {
  playbookId: string;
  onFormationCreated?: (formation: Formation) => void;
  onFormationUpdated?: (formation: Formation) => void;
  showHeader?: boolean;
  hideSubTabs?: boolean;
}

export const FormationBuilderPanel: React.FC<FormationBuilderPanelProps> =
  React.memo(
    ({
      playbookId,
      onFormationCreated: _onFormationCreated,
      onFormationUpdated,
      showHeader = true,
      hideSubTabs = false,
    }) => {
      const isMobile = useIsMobile();
      const {
        isSelected,
        toggleSelection,
        selectAll,
        clearSelection,
        selectionCount,
        hasSelection,
      } = useBulkSelection();

      // State management
      const state = useFormationBuilderState();
      const {
        activeTab,
        setActiveTab,
        loading,
        saving,
        allFormations,
        availablePersonnel,
        selectedFormation,
        setSelectedFormation,
        formationForOpposite,
        setFormationForOpposite,
        showOppositeModal,
        setShowOppositeModal,
        selectedPersonnelIds,
        category,
        setCategory,
        formationType,
        setFormationType,
        runStrength,
        setRunStrength,
        passStrength,
        setPassStrength,
        tags,
        setTags,
        description,
        setDescription,
        applyToBothSides,
        setApplyToBothSides,
        formDataRef,
        isPopulatingFieldsRef,
        resetForm,
      } = state;

      // Compute linked formation
      const linkedFormation = useMemo((): Formation | null => {
        if (!selectedFormation || !selectedFormation.opposite_formation_id)
          return null;
        return (
          allFormations.find(
            (f) => f.id === selectedFormation.opposite_formation_id
          ) || null
        );
      }, [selectedFormation, allFormations]);

      // Data loading
      const { loadData, toast } = useFormationDataLoader({
        playbookId,
        setLoading: state.setLoading,
        setAllFormations: state.setAllFormations,
        setAvailablePersonnel: state.setAvailablePersonnel,
      });

      // Auto-save
      const { autoSave } = useFormationAutoSave({
        playbookId,
        selectedFormation,
        linkedFormation,
        formDataRef,
        isPopulatingFieldsRef,
        setAllFormations: state.setAllFormations,
        setAvailablePersonnel: state.setAvailablePersonnel,
        toast,
        selectedPersonnelIds,
        category,
        formationType,
        runStrength,
        passStrength,
        tags,
        description,
        applyToBothSides,
      });

      // Operations
      const { handleCreateFromTemplate, handleSave, togglePersonnel } =
        useFormationOperations({
          playbookId,
          selectedFormation,
          linkedFormation,
          onFormationUpdated,
          selectedPersonnelIds,
          category,
          formationType,
          runStrength,
          passStrength,
          tags,
          description,
          applyToBothSides,
          setSaving: state.setSaving,
          setAllFormations: state.setAllFormations,
          setAvailablePersonnel: state.setAvailablePersonnel,
          setSelectedFormation,
          setFormationForOpposite,
          setShowOppositeModal,
          setCategory,
          setFormationType,
          setRunStrength,
          setPassStrength,
          setTags,
          setDescription,
          setSelectedPersonnelIds: state.setSelectedPersonnelIds,
        });

      // Show all formations (no filtering needed)
      const visibleFormations = useMemo(() => allFormations, [allFormations]);

      const tabs = useMemo(
        () => [
          { id: "details" as const, label: "Formation Details", icon: Save },
          {
            id: "diagnostic" as const,
            label: "Data Diagnostic",
            icon: AlertCircle,
          },
          {
            id: "review" as const,
            label: "Direction Review",
            icon: AlertCircle,
          },
          {
            id: "incomplete" as const,
            label: "Incomplete Formations",
            icon: CheckCircle,
          },
        ],
        []
      );

      // Loading state
      if (loading && allFormations.length === 0) {
        return (
          <div
            className={`flex flex-col gap-md ${isMobile ? "p-sm" : "p-sm max-w-3xl mx-auto"}`}
          >
            <div className="space-y-lg animate-pulse">
              {showHeader && (
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-subtle rounded w-48"></div>
                  <div className="h-10 w-32 bg-subtle rounded"></div>
                </div>
              )}
              {!hideSubTabs && (
                <div className="flex gap-xs border-b border-primary">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-32 bg-subtle rounded-t"
                    ></div>
                  ))}
                </div>
              )}
              <div className="space-y-md">
                <div className="h-12 bg-subtle rounded"></div>
                <div className="h-64 bg-subtle rounded"></div>
                <div className="h-32 bg-subtle rounded"></div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div
          className={`flex flex-col gap-md ${isMobile ? "p-sm" : "p-sm max-w-3xl mx-auto"} relative`}
        >
          {/* Loading Overlay - Show when refetching data */}
          {loading && allFormations.length > 0 && (
            <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
              <div className="bg-primary border border-primary rounded-lg p-lg shadow-lg flex flex-col items-center gap-md">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <Typography variant="body-sm" className="text-secondary">
                  Loading formations...
                </Typography>
              </div>
            </div>
          )}

          {/* Header */}
          {showHeader && (
            <div className="flex items-center justify-between">
              <Typography variant="headline-md" className="text-primary">
                Formation Manager
              </Typography>
              {activeTab === "details" && (
                <Button onClick={resetForm} variant="primary" size="sm">
                  + New Formation
                </Button>
              )}
            </div>
          )}

          {/* Tab Navigation */}
          {!hideSubTabs && (
            <div
              className={`flex ${isMobile ? "gap-0" : "gap-xs"} border-b border-primary`}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-xs ${isMobile ? "px-lg py-md flex-1 justify-center" : "px-md py-sm"}
                      text-sm font-medium transition-colors border-b-2
                      ${
                        isActive
                          ? "border-primary-500 text-primary-700 bg-primary-50"
                          : "border-transparent text-secondary hover:text-primary hover:bg-muted"
                      }
                    `}
                  >
                    <Icon className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />
                    <span className={isMobile ? "text-xs" : ""}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "details" && (
            <div className="flex flex-col gap-md">
              {/* Quick Start: Insert NFL Template */}
              <div className="flex flex-col gap-xs">
                <Typography
                  variant="body-md"
                  className="text-primary font-medium"
                >
                  Quick Start
                </Typography>
                <FormationTemplateSelector
                  onSelectTemplate={handleCreateFromTemplate}
                  disabled={loading}
                />
                <Typography variant="caption" className="text-muted">
                  Start with a professional NFL formation template, or select an
                  existing formation below to edit.
                </Typography>
              </div>

              {/* Divider */}
              <div className="border-t border-secondary"></div>

              {/* Formation Selector */}
              <FormationSelector
                formations={visibleFormations}
                selectedFormation={selectedFormation}
                linkedFormation={linkedFormation}
                applyToBothSides={applyToBothSides}
                loading={loading}
                isMobile={isMobile}
                isSelected={isSelected}
                toggleSelection={toggleSelection}
                selectAll={selectAll}
                clearSelection={clearSelection}
                selectionCount={selectionCount}
                hasSelection={hasSelection}
                onSelectFormation={setSelectedFormation}
                onApplyToBothSidesChange={setApplyToBothSides}
              />

              {/* New Formation Form - Shows when no formation selected */}
              {!selectedFormation && (
                <NewFormationForm
                  playbookId={playbookId}
                  availablePersonnel={availablePersonnel}
                  onFormationCreated={setSelectedFormation}
                  onLoadData={loadData}
                />
              )}

              {/* Edit Form - Shows when formation is selected */}
              {selectedFormation && (
                <FormationEditForm
                  selectedFormation={selectedFormation}
                  availablePersonnel={availablePersonnel}
                  saving={saving}
                  selectedPersonnelIds={selectedPersonnelIds}
                  category={category}
                  formationType={formationType}
                  runStrength={runStrength}
                  passStrength={passStrength}
                  tags={tags}
                  description={description}
                  setCategory={setCategory}
                  setFormationType={setFormationType}
                  setRunStrength={setRunStrength}
                  setPassStrength={setPassStrength}
                  setTags={setTags}
                  setDescription={setDescription}
                  togglePersonnel={togglePersonnel}
                  onSave={handleSave}
                  onAutoSave={autoSave}
                  onShowOppositeModal={async () => {
                    const fresh = await FormationService.getFormationById(
                      selectedFormation.id
                    );
                    setFormationForOpposite(fresh);
                    setShowOppositeModal(true);
                  }}
                />
              )}

              {!selectedFormation && (
                <div className="p-lg bg-muted rounded border border-secondary text-center">
                  <Typography variant="body-sm" className="text-muted">
                    👆 Select a formation above to edit its details
                  </Typography>
                </div>
              )}

              {/* Automatic Opposite Formation Prompt */}
              {formationForOpposite && (
                <CreateOppositeFormationModal
                  isOpen={showOppositeModal}
                  onClose={() => {
                    setShowOppositeModal(false);
                    setFormationForOpposite(null);
                  }}
                  originalFormation={formationForOpposite}
                  onOppositeCreated={async (oppositeFormation) => {
                    toast?.success(
                      `Created ${oppositeFormation.direction}-side formation!`,
                      "Opposite Formation Created"
                    );
                    await loadData();
                    setShowOppositeModal(false);
                    setFormationForOpposite(null);
                  }}
                  onMarkedAsStandalone={async () => {
                    toast?.success(
                      "Formation marked as standalone (no opposite needed)",
                      "Formation Updated"
                    );
                    await loadData();
                    setShowOppositeModal(false);
                    setFormationForOpposite(null);
                  }}
                />
              )}
            </div>
          )}

          {/* Data Diagnostic Tab */}
          {!hideSubTabs && activeTab === "diagnostic" && (
            <FormationDataDiagnostic playbookId={playbookId} />
          )}

          {/* Direction Review Tab */}
          {!hideSubTabs && activeTab === "review" && (
            <FormationDirectionReviewPanel
              playbookId={playbookId}
              onFixComplete={loadData}
              onBack={() => setActiveTab("details")}
            />
          )}

          {/* Incomplete Formations Tab */}
          {!hideSubTabs && activeTab === "incomplete" && (
            <div className="p-lg bg-muted rounded border border-secondary text-center">
              <Typography variant="body-sm" className="text-muted">
                Incomplete Formations panel coming in Phase 2...
              </Typography>
            </div>
          )}
        </div>
      );
    }
  );
