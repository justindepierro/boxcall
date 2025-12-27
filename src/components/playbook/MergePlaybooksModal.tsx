/**
 * MergePlaybooksModal - Create a new playbook from multiple existing playbooks
 *
 * Features:
 * - Select 2+ playbooks to merge
 * - Name the new merged playbook
 * - Preview play counts
 * - Original playbooks remain untouched
 */

import React, { useState, useMemo } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { BottomSheet } from "../BottomSheet";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { useToast } from "../../hooks/useToast";

// ============================================================================
// Types
// ============================================================================

interface Playbook {
  id: string;
  name: string;
  description?: string;
  play_count: number;
}

interface MergePlaybooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbooks: Playbook[];
  onMerge: (
    sourcePlaybookIds: string[],
    newPlaybookName: string,
    newPlaybookDescription?: string
  ) => Promise<void>;
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Playbook selection card */
const PlaybookSelectCard: React.FC<{
  playbook: Playbook;
  selected: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}> = ({ playbook, selected, onToggle, isMobile }) => (
  <button
    onClick={() => {
      triggerHapticFeedback("light");
      onToggle();
    }}
    className={`w-full flex items-center gap-3 ${isMobile ? "p-4" : "p-3"} rounded-xl transition-all border-2 ${
      selected
        ? "bg-brand-jade/10 border-brand-jade shadow-sm"
        : "bg-neutral-50 dark:bg-navy-800/50 border-transparent hover:bg-neutral-100 dark:hover:bg-navy-800 hover:border-neutral-200 dark:hover:border-navy-700"
    }`}
  >
    <div
      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
        selected
          ? "bg-brand-jade text-white"
          : "bg-neutral-200 dark:bg-navy-700 text-neutral-400 dark:text-neutral-500"
      }`}
    >
      {selected ? (
        <Icon name="check" className="w-4 h-4" />
      ) : (
        <Icon name="plus" className="w-4 h-4" />
      )}
    </div>

    <div className="flex-1 text-left">
      <Typography
        variant="body-sm"
        className={`font-medium ${
          selected ? "text-brand-jade" : "text-navy-900 dark:text-neutral-100"
        }`}
      >
        {playbook.name}
      </Typography>
      {playbook.description && (
        <Typography
          variant="caption"
          className="text-neutral-500 dark:text-neutral-400 line-clamp-1"
        >
          {playbook.description}
        </Typography>
      )}
    </div>

    <div
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        selected
          ? "bg-brand-jade/20 text-brand-jade"
          : "bg-neutral-100 dark:bg-navy-700 text-neutral-600 dark:text-neutral-400"
      }`}
    >
      {playbook.play_count} plays
    </div>
  </button>
);

/** Summary stat display */
const MergeSummary: React.FC<{
  selectedCount: number;
  totalPlays: number;
}> = ({ selectedCount, totalPlays }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-brand-jade/10 to-brand-jade/5 border border-brand-jade/20">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-brand-jade/20 flex items-center justify-center">
        <Icon name="copy" className="w-5 h-5 text-brand-jade" />
      </div>
      <div>
        <Typography
          variant="body-sm"
          className="font-medium text-navy-900 dark:text-neutral-100"
        >
          {selectedCount} playbook{selectedCount !== 1 ? "s" : ""} selected
        </Typography>
        <Typography
          variant="caption"
          className="text-neutral-600 dark:text-neutral-400"
        >
          {totalPlays} total plays to merge
        </Typography>
      </div>
    </div>
    <Icon name="arrow-right" className="w-5 h-5 text-brand-jade" />
  </div>
);

/** Instructions card */
const InstructionsCard: React.FC = () => (
  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
    <div className="flex gap-3">
      <Icon
        name="info"
        className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
      />
      <div>
        <Typography
          variant="body-sm"
          className="font-medium text-blue-700 dark:text-blue-400"
        >
          How it works
        </Typography>
        <Typography
          variant="caption"
          className="text-blue-600/80 dark:text-blue-400/80 mt-1"
        >
          Select playbooks to combine into a new playbook. All plays will be
          copied—your original playbooks stay untouched.
        </Typography>
      </div>
    </div>
  </div>
);

/** Playbook selection list */
const PlaybookSelectionList: React.FC<{
  playbooks: Playbook[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  isMobile: boolean;
}> = ({ playbooks, selectedIds, onToggle, isMobile }) => (
  <div className="space-y-3">
    <Typography
      variant="label-lg"
      className="text-navy-900 dark:text-neutral-100 font-semibold"
    >
      Select Playbooks
    </Typography>

    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {playbooks.map((playbook) => (
        <PlaybookSelectCard
          key={playbook.id}
          playbook={playbook}
          selected={selectedIds.has(playbook.id)}
          onToggle={() => onToggle(playbook.id)}
          isMobile={isMobile}
        />
      ))}

      {playbooks.length === 0 && (
        <div className="p-6 text-center">
          <Icon
            name="book"
            className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-2"
          />
          <Typography variant="body-sm" className="text-neutral-500">
            No playbooks available
          </Typography>
        </div>
      )}
    </div>
  </div>
);

/** New playbook form fields */
const NewPlaybookForm: React.FC<{
  newName: string;
  setNewName: (v: string) => void;
  newDescription: string;
  setNewDescription: (v: string) => void;
  suggestName: () => string;
  showSuggest: boolean;
  isMobile: boolean;
}> = ({
  newName,
  setNewName,
  newDescription,
  setNewDescription,
  suggestName,
  showSuggest,
  isMobile,
}) => (
  <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-navy-700">
    <div className="flex items-center justify-between">
      <Typography
        variant="label-lg"
        className="text-navy-900 dark:text-neutral-100 font-semibold"
      >
        New Playbook
      </Typography>
      {showSuggest && !newName && (
        <button
          onClick={() => {
            triggerHapticFeedback("light");
            setNewName(suggestName());
          }}
          className="text-xs text-brand-jade hover:text-brand-jade/80 font-medium"
        >
          Suggest name
        </button>
      )}
    </div>

    <div className="space-y-3">
      <div className="space-y-2">
        <Typography
          variant="label-md"
          className="text-navy-800 dark:text-neutral-200 font-medium"
        >
          Name <span className="text-error-500">*</span>
        </Typography>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g., Master Playbook 2025"
          className={`w-full ${isMobile ? "h-12" : ""}`}
        />
      </div>

      <div className="space-y-2">
        <Typography
          variant="label-md"
          className="text-navy-800 dark:text-neutral-200 font-medium"
        >
          Description
        </Typography>
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Optional description..."
          className={`w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-jade/50 focus:border-brand-jade transition-all ${
            isMobile ? "min-h-[80px]" : "min-h-[60px]"
          }`}
        />
      </div>
    </div>
  </div>
);

/** Action buttons footer */
const ActionFooter: React.FC<{
  onClose: () => void;
  onMerge: () => void;
  canMerge: boolean;
  merging: boolean;
  isMobile: boolean;
}> = ({ onClose, onMerge, canMerge, merging, isMobile }) => (
  <div
    className={`flex gap-3 pt-4 border-t border-neutral-200 dark:border-navy-700 ${
      isMobile
        ? "sticky bottom-0 bg-white dark:bg-navy-900 pb-safe -mx-4 px-4 pt-4"
        : ""
    }`}
  >
    <Button
      onClick={() => {
        triggerHapticFeedback("light");
        onClose();
      }}
      variant="outline"
      size={isMobile ? "lg" : "md"}
      className="flex-1"
    >
      Cancel
    </Button>
    <Button
      onClick={onMerge}
      variant="primary"
      size={isMobile ? "lg" : "md"}
      className="flex-1"
      disabled={!canMerge || merging}
    >
      {merging ? (
        <>
          <Icon name="loader" className="w-4 h-4 mr-2 animate-spin" />
          Merging...
        </>
      ) : (
        <>
          <Icon name="copy" className="w-4 h-4 mr-2" />
          Create Playbook
        </>
      )}
    </Button>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const MergePlaybooksModal: React.FC<MergePlaybooksModalProps> = ({
  isOpen,
  onClose,
  playbooks,
  onMerge,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [merging, setMerging] = useState(false);

  const isMobile = useIsMobile();
  const toast = useToast();

  // Calculate totals
  const { totalPlays, selectedPlaybooks } = useMemo(() => {
    const selected = playbooks.filter((pb) => selectedIds.has(pb.id));
    const total = selected.reduce((sum, pb) => sum + pb.play_count, 0);
    return { totalPlays: total, selectedPlaybooks: selected };
  }, [playbooks, selectedIds]);

  // Toggle playbook selection
  const togglePlaybook = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handle merge
  const handleMerge = async () => {
    if (selectedIds.size < 2) {
      toast.error("Select at least 2 playbooks to merge");
      return;
    }

    if (!newName.trim()) {
      toast.error("Enter a name for the new playbook");
      return;
    }

    setMerging(true);
    try {
      await onMerge(
        Array.from(selectedIds),
        newName.trim(),
        newDescription.trim() || undefined
      );
      triggerHapticFeedback("success");
      toast.success(`Created "${newName}" with ${totalPlays} plays`);
      onClose();
      // Reset state
      setSelectedIds(new Set());
      setNewName("");
      setNewDescription("");
    } catch {
      toast.error("Failed to merge playbooks");
    } finally {
      setMerging(false);
    }
  };

  // Generate suggested name from selected playbooks
  const suggestName = () => {
    if (selectedPlaybooks.length >= 2) {
      const names = selectedPlaybooks.slice(0, 2).map((pb) => pb.name);
      return `${names.join(" + ")} Merged`;
    }
    return "";
  };

  const canMerge = selectedIds.size >= 2 && newName.trim().length > 0;

  // ============================================================================
  // Render Content
  // ============================================================================

  const renderContent = () => (
    <div className="space-y-6">
      <InstructionsCard />

      <PlaybookSelectionList
        playbooks={playbooks}
        selectedIds={selectedIds}
        onToggle={togglePlaybook}
        isMobile={isMobile}
      />

      {selectedIds.size > 0 && (
        <MergeSummary
          selectedCount={selectedIds.size}
          totalPlays={totalPlays}
        />
      )}

      <NewPlaybookForm
        newName={newName}
        setNewName={setNewName}
        newDescription={newDescription}
        setNewDescription={setNewDescription}
        suggestName={suggestName}
        showSuggest={selectedPlaybooks.length >= 2}
        isMobile={isMobile}
      />

      <ActionFooter
        onClose={onClose}
        onMerge={handleMerge}
        canMerge={canMerge}
        merging={merging}
        isMobile={isMobile}
      />
    </div>
  );

  if (!isOpen) return null;

  // Mobile: BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        snapPoints={[0.15, 0.5, 0.92]}
        initialSnapPoint={2}
        showHandle={true}
        backdropOpacity={0.4}
      >
        <div className="px-4 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-jade to-brand-jade/80 flex items-center justify-center shadow-lg shadow-brand-jade/20">
                <Icon name="copy" className="w-6 h-6 text-white" />
              </div>
              <div>
                <Typography
                  variant="headline-md"
                  className="text-navy-900 dark:text-neutral-100"
                >
                  Merge Playbooks
                </Typography>
                <Typography
                  variant="caption"
                  className="text-neutral-500 dark:text-neutral-400"
                >
                  Combine into a new playbook
                </Typography>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHapticFeedback("light");
                onClose();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-navy-800 hover:bg-neutral-200 dark:hover:bg-navy-700 transition-colors"
            >
              <Icon
                name="close"
                className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
              />
            </button>
          </div>

          {renderContent()}
        </div>
      </BottomSheet>
    );
  }

  // Desktop: Modal
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Merge Playbooks" size="md">
      <div className="p-6">{renderContent()}</div>
    </Modal>
  );
};
