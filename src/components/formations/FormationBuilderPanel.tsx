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
import type { FormationTemplate } from "../../data/formationTemplates";

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

type FormationBuilderState = ReturnType<typeof useFormationBuilderState>;

function usePanelDataLoader({
  playbookId,
  state,
}: {
  playbookId: string;
  state: FormationBuilderState;
}) {
  return useFormationDataLoader({
    playbookId,
    setLoading: state.setLoading,
    setAllFormations: state.setAllFormations,
    setAvailablePersonnel: state.setAvailablePersonnel,
  });
}

function usePanelAutoSave({
  playbookId,
  state,
  selectedFormation,
  linkedFormation,
  toast,
}: {
  playbookId: string;
  state: FormationBuilderState;
  selectedFormation: Formation | null;
  linkedFormation: Formation | null;
  toast: any;
}) {
  return useFormationAutoSave({
    playbookId,
    selectedFormation,
    linkedFormation,
    formDataRef: state.formDataRef,
    isPopulatingFieldsRef: state.isPopulatingFieldsRef,
    setAllFormations: state.setAllFormations,
    setAvailablePersonnel: state.setAvailablePersonnel,
    toast,
    selectedPersonnelIds: state.selectedPersonnelIds,
    category: state.category,
    formationType: state.formationType,
    runStrength: state.runStrength,
    passStrength: state.passStrength,
    tags: state.tags,
    description: state.description,
    applyToBothSides: state.applyToBothSides,
  });
}

function usePanelOperations({
  playbookId,
  state,
  selectedFormation,
  linkedFormation,
  onFormationUpdated,
  toast,
}: {
  playbookId: string;
  state: FormationBuilderState;
  selectedFormation: Formation | null;
  linkedFormation: Formation | null;
  onFormationUpdated?: (formation: Formation) => void;
  toast: any;
}) {
  return useFormationOperations({
    playbookId,
    selectedFormation,
    linkedFormation,
    onFormationUpdated,
    selectedPersonnelIds: state.selectedPersonnelIds,
    category: state.category,
    formationType: state.formationType,
    runStrength: state.runStrength,
    passStrength: state.passStrength,
    tags: state.tags,
    description: state.description,
    applyToBothSides: state.applyToBothSides,
    setSaving: state.setSaving,
    setAllFormations: state.setAllFormations,
    setAvailablePersonnel: state.setAvailablePersonnel,
    setSelectedFormation: state.setSelectedFormation,
    setFormationForOpposite: state.setFormationForOpposite,
    setShowOppositeModal: state.setShowOppositeModal,
    setCategory: state.setCategory,
    setFormationType: state.setFormationType,
    setRunStrength: state.setRunStrength,
    setPassStrength: state.setPassStrength,
    setTags: state.setTags,
    setDescription: state.setDescription,
    setSelectedPersonnelIds: state.setSelectedPersonnelIds,
    toast,
  });
}

const FORMATION_BUILDER_TABS = [
  { id: "details" as const, label: "Formation Details", icon: Save },
  { id: "diagnostic" as const, label: "Data Diagnostic", icon: AlertCircle },
  { id: "review" as const, label: "Direction Review", icon: AlertCircle },
  {
    id: "incomplete" as const,
    label: "Incomplete Formations",
    icon: CheckCircle,
  },
];

function FormationBuilderSkeleton({
  isMobile,
  showHeader,
  hideSubTabs,
}: {
  isMobile: boolean;
  showHeader: boolean;
  hideSubTabs: boolean;
}) {
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
              <div key={i} className="h-10 w-32 bg-subtle rounded-t"></div>
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

function FormationBuilderLoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
      <div className="bg-primary border border-primary rounded-lg p-lg shadow-lg flex flex-col items-center gap-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <Typography variant="body-sm" className="text-secondary">
          Loading formations...
        </Typography>
      </div>
    </div>
  );
}

function FormationBuilderHeader({
  showHeader,
  activeTab,
  onNewFormation,
}: {
  showHeader: boolean;
  activeTab: "details" | "diagnostic" | "review" | "incomplete";
  onNewFormation: () => void;
}) {
  if (!showHeader) return null;

  return (
    <div className="flex items-center justify-between">
      <Typography variant="headline-md" className="text-primary">
        Formation Manager
      </Typography>
      {activeTab === "details" && (
        <Button onClick={onNewFormation} variant="primary" size="sm">
          + New Formation
        </Button>
      )}
    </div>
  );
}

function FormationBuilderTabs({
  isMobile,
  activeTab,
  onChangeTab,
}: {
  isMobile: boolean;
  activeTab: "details" | "diagnostic" | "review" | "incomplete";
  onChangeTab: (
    tab: "details" | "diagnostic" | "review" | "incomplete"
  ) => void;
}) {
  return (
    <div
      className={`flex ${isMobile ? "gap-0" : "gap-xs"} border-b border-primary`}
    >
      {FORMATION_BUILDER_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
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
            <span className={isMobile ? "text-xs" : ""}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FormationBuilderDetailsTab({
  playbookId,
  loading,
  saving,
  formations,
  availablePersonnel,
  selectedFormation,
  linkedFormation,
  applyToBothSides,
  isMobile,
  isSelected,
  toggleSelection,
  selectAll,
  clearSelection,
  selectionCount,
  hasSelection,
  setSelectedFormation,
  setApplyToBothSides,
  selectedPersonnelIds,
  category,
  formationType,
  runStrength,
  passStrength,
  tags,
  description,
  setCategory,
  setFormationType,
  setRunStrength,
  setPassStrength,
  setTags,
  setDescription,
  togglePersonnel,
  onCreateFromTemplate,
  onSave,
  onAutoSave,
  onLoadData,
  onOpenOppositeModal,
  showOppositeModal,
  formationForOpposite,
  onCloseOppositeModal,
  onOppositeCreated,
  onMarkedAsStandalone,
}: {
  playbookId: string;
  loading: boolean;
  saving: boolean;
  formations: Formation[];
  availablePersonnel: any[];
  selectedFormation: Formation | null;
  linkedFormation: Formation | null;
  applyToBothSides: boolean;
  isMobile: boolean;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  selectionCount: number;
  hasSelection: boolean;
  setSelectedFormation: (f: Formation | null) => void;
  setApplyToBothSides: (v: boolean) => void;
  selectedPersonnelIds: string[];
  category: string;
  formationType: string;
  runStrength: string;
  passStrength: string;
  tags: string[];
  description: string;
  setCategory: (v: string) => void;
  setFormationType: (v: string) => void;
  setRunStrength: (v: string) => void;
  setPassStrength: (v: string) => void;
  setTags: (v: string[]) => void;
  setDescription: (v: string) => void;
  togglePersonnel: (id: string) => void;
  onCreateFromTemplate: (template: FormationTemplate) => void;
  onSave: () => Promise<void>;
  onAutoSave: () => Promise<void>;
  onLoadData: () => Promise<void>;
  onOpenOppositeModal: () => Promise<void>;
  showOppositeModal: boolean;
  formationForOpposite: Formation | null;
  onCloseOppositeModal: () => void;
  onOppositeCreated: (formation: Formation) => Promise<void> | void;
  onMarkedAsStandalone: () => Promise<void> | void;
}) {
  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <Typography variant="body-md" className="text-primary font-medium">
          Quick Start
        </Typography>
        <FormationTemplateSelector
          onSelectTemplate={onCreateFromTemplate}
          disabled={loading}
        />
        <Typography variant="caption" className="text-muted">
          Start with a professional NFL formation template, or select an
          existing formation below to edit.
        </Typography>
      </div>

      <div className="border-t border-secondary"></div>

      <FormationSelector
        formations={formations}
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

      {!selectedFormation && (
        <NewFormationForm
          playbookId={playbookId}
          availablePersonnel={availablePersonnel}
          onFormationCreated={setSelectedFormation}
          onLoadData={onLoadData}
        />
      )}

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
          onSave={onSave}
          onAutoSave={onAutoSave}
          onShowOppositeModal={onOpenOppositeModal}
        />
      )}

      {!selectedFormation && (
        <div className="p-lg bg-muted rounded border border-secondary text-center">
          <Typography variant="body-sm" className="text-muted">
            👆 Select a formation above to edit its details
          </Typography>
        </div>
      )}

      {formationForOpposite && (
        <CreateOppositeFormationModal
          isOpen={showOppositeModal}
          onClose={onCloseOppositeModal}
          originalFormation={formationForOpposite}
          onOppositeCreated={onOppositeCreated}
          onMarkedAsStandalone={onMarkedAsStandalone}
        />
      )}
    </div>
  );
}

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
        loading,
        saving,
        allFormations,
        availablePersonnel,
        selectedFormation,
        formationForOpposite,
        showOppositeModal,
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
      const { loadData, toast } = usePanelDataLoader({ playbookId, state });

      // Auto-save
      const { autoSave } = usePanelAutoSave({
        playbookId,
        state,
        selectedFormation,
        linkedFormation,
        toast,
      });

      // Operations
      const { handleCreateFromTemplate, handleSave, togglePersonnel } =
        usePanelOperations({
          playbookId,
          state,
          selectedFormation,
          linkedFormation,
          onFormationUpdated,
          toast,
        });

      // Loading state
      if (loading && allFormations.length === 0) {
        return (
          <FormationBuilderSkeleton
            isMobile={isMobile}
            showHeader={showHeader}
            hideSubTabs={hideSubTabs}
          />
        );
      }

      return (
        <div
          className={`flex flex-col gap-md ${isMobile ? "p-sm" : "p-sm max-w-3xl mx-auto"} relative`}
        >
          <FormationBuilderLoadingOverlay
            show={loading && allFormations.length > 0}
          />

          <FormationBuilderHeader
            showHeader={showHeader}
            activeTab={activeTab}
            onNewFormation={state.resetForm}
          />

          {/* Tab Navigation */}
          {!hideSubTabs && (
            <FormationBuilderTabs
              isMobile={isMobile}
              activeTab={activeTab}
              onChangeTab={state.setActiveTab}
            />
          )}

          {/* Tab Content */}
          {activeTab === "details" && (
            <FormationBuilderDetailsTab
              playbookId={playbookId}
              loading={loading}
              saving={saving}
              formations={allFormations}
              availablePersonnel={availablePersonnel}
              selectedFormation={selectedFormation}
              linkedFormation={linkedFormation}
              applyToBothSides={state.applyToBothSides}
              isMobile={isMobile}
              isSelected={isSelected}
              toggleSelection={toggleSelection}
              selectAll={selectAll}
              clearSelection={clearSelection}
              selectionCount={selectionCount}
              hasSelection={hasSelection}
              setSelectedFormation={state.setSelectedFormation}
              setApplyToBothSides={state.setApplyToBothSides}
              selectedPersonnelIds={state.selectedPersonnelIds}
              category={state.category}
              formationType={state.formationType}
              runStrength={state.runStrength}
              passStrength={state.passStrength}
              tags={state.tags}
              description={state.description}
              setCategory={state.setCategory}
              setFormationType={state.setFormationType}
              setRunStrength={state.setRunStrength}
              setPassStrength={state.setPassStrength}
              setTags={state.setTags}
              setDescription={state.setDescription}
              togglePersonnel={togglePersonnel}
              onCreateFromTemplate={handleCreateFromTemplate}
              onSave={handleSave}
              onAutoSave={async () => {
                await Promise.resolve(autoSave());
              }}
              onLoadData={loadData}
              onOpenOppositeModal={async () => {
                if (!selectedFormation) return;
                const fresh = await FormationService.getFormationById(
                  selectedFormation.id
                );
                state.setFormationForOpposite(fresh);
                state.setShowOppositeModal(true);
              }}
              showOppositeModal={showOppositeModal}
              formationForOpposite={formationForOpposite}
              onCloseOppositeModal={() => {
                state.setShowOppositeModal(false);
                state.setFormationForOpposite(null);
              }}
              onOppositeCreated={async (oppositeFormation) => {
                toast?.success(
                  `Created ${oppositeFormation.direction}-side formation!`,
                  "Opposite Formation Created"
                );
                await loadData();
                state.setShowOppositeModal(false);
                state.setFormationForOpposite(null);
              }}
              onMarkedAsStandalone={async () => {
                toast?.success(
                  "Formation marked as standalone (no opposite needed)",
                  "Formation Updated"
                );
                await loadData();
                state.setShowOppositeModal(false);
                state.setFormationForOpposite(null);
              }}
            />
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
              onBack={() => state.setActiveTab("details")}
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
