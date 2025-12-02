/**
 * Personnel Library Modal
 *
 * Slide-out modal for managing personnel packages with badge customization.
 * Converted from full-page to modal for better integration with Playbook view.
 */

import React, { useState, useEffect } from "react";
import { PersonnelLibraryService } from "../../../services/personnelLibrary/PersonnelLibraryService";
import { PersonnelSyncService } from "../../../services/personnelLibrary/PersonnelSyncService";
import type { PersonnelConfiguration } from "../../../types/personnel";
import { Icon } from "../../ui/Icon/Icon";
import { toast } from "sonner";
import { CreatePersonnelModal } from "./CreatePersonnelModal";
import { EditPersonnelBadgeModal } from "./EditPersonnelBadgeModal";

interface PersonnelLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
}

export const PersonnelLibraryModal: React.FC<PersonnelLibraryModalProps> = ({
  isOpen,
  onClose,
  playbookId,
}) => {
  const [personnel, setPersonnel] = useState<PersonnelConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPersonnel, setEditingPersonnel] =
    useState<PersonnelConfiguration | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPersonnel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, playbookId]);

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      const response = await PersonnelLibraryService.getPersonnelConfigs(
        playbookId,
        {
          search: searchQuery || undefined,
          sort_by: "usage",
          sort_order: "desc",
          limit: 100,
        }
      );
      setPersonnel(response.items);
    } catch (error) {
      console.error("Error loading personnel:", error);
      toast.error("Failed to load personnel");
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromPlays = async () => {
    try {
      toast.loading("Scanning plays for personnel...", {
        id: "import-personnel",
      });
      const result = await PersonnelLibraryService.importFromPlays(playbookId);

      if (result.success) {
        if (result.imported_count > 0) {
          toast.success(
            `Imported ${result.imported_count} personnel: ${result.imported_names?.join(", ")}`,
            { id: "import-personnel" }
          );
          await loadPersonnel();
        } else {
          toast.info(result.message || "No new personnel to import", {
            id: "import-personnel",
          });
        }
      } else {
        toast.error(`Import failed: ${result.error}`, {
          id: "import-personnel",
        });
      }
    } catch (error) {
      console.error("Error importing personnel:", error);
      toast.error("Failed to import personnel from plays", {
        id: "import-personnel",
      });
    }
  };

  const handleUpdateUsage = async () => {
    try {
      toast.loading("Updating usage counts...", { id: "usage" });
      const result =
        await PersonnelSyncService.updateAllUsageCounts(playbookId);

      if (result.success) {
        toast.success(`Updated ${result.updated_count} personnel packages`, {
          id: "usage",
        });
        await loadPersonnel();
      } else {
        toast.error(
          `Failed to update some personnel: ${result.errors.join(", ")}`,
          {
            id: "usage",
          }
        );
      }
    } catch (error) {
      console.error("Error updating usage:", error);
      toast.error("Failed to update usage counts", { id: "usage" });
    }
  };

  if (!isOpen) return null;

  const filteredPersonnel = personnel.filter((p) =>
    searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const stats = {
    total: personnel.length,
    withConfidence: personnel.filter(
      (p) => p.confidence_score && p.confidence_score > 0
    ).length,
    totalUsage: filteredPersonnel.reduce(
      (sum, p) => sum + (p.usage_count || 0),
      0
    ),
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[95vw] md:w-[85vw] lg:w-[75vw] xl:w-[65vw] h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 z-50 shadow-2xl rounded-lg overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 sm:p-6 border-b border-divider shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Icon name="users" size="lg" className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Personnel Library
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  Manage personnel packages and badge customization
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Icon name="close" size="lg" className="text-white" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 bg-white text-purple-600 hover:bg-white/90 shadow-md"
            >
              <Icon name="plus" size="sm" />
              Create New
            </button>
            <button
              onClick={handleImportFromPlays}
              className="btn-secondary flex items-center gap-2 bg-orange-500 text-white border-orange-600 hover:bg-orange-600 shadow-md"
            >
              <Icon name="download" size="sm" />
              Import from Plays
            </button>
            <button
              onClick={handleUpdateUsage}
              className="btn-secondary flex items-center gap-2 text-white border-white/30 hover:bg-white/10"
            >
              <Icon name="refresh-cw" size="sm" />
              Update Usage
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-divider bg-surface-secondary">
          <div className="relative">
            <Icon
              name="search"
              size="sm"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500"
            />
            <input
              type="text"
              placeholder="Search personnel packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Icon
                name="loader"
                size="xl"
                className="animate-spin text-secondary"
              />
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                name="users"
                size="xl"
                className="text-secondary mb-4 mx-auto"
              />
              <p className="text-secondary text-lg">
                No personnel packages found
              </p>
              <p className="text-tertiary text-sm mt-2">
                Create personnel packages in the Playbook Builder
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPersonnel.map((config) => {
                const badge = config.badgeCustomization as any;
                const bgColor = badge?.backgroundColor || "#10b981";
                const textColor = badge?.textColor || "#ffffff";

                return (
                  <div
                    key={config.id}
                    className="card p-6 hover:shadow-xl hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div
                          className="inline-flex px-6 py-3 rounded-xl text-lg font-bold shadow-lg"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            boxShadow: `0 8px 16px -4px ${bgColor}40, 0 4px 8px -2px ${bgColor}30`,
                          }}
                        >
                          {config.name}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingPersonnel(config)}
                        className="flex-shrink-0 p-2.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-colors border border-transparent hover:border-purple-300 dark:hover:border-purple-700"
                        title="Customize Badge Colors"
                      >
                        <Icon name="settings" size="md" />
                      </button>
                    </div>

                    {config.description && (
                      <p className="text-sm text-secondary mb-3">
                        {config.description}
                      </p>
                    )}

                    {config.confidence_score !== null &&
                      config.confidence_score > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-secondary">Confidence</span>
                            <span className="text-primary font-medium">
                              {config.confidence_score}%
                            </span>
                          </div>
                          <div className="w-full bg-surface-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                              style={{ width: `${config.confidence_score}%` }}
                            />
                          </div>
                        </div>
                      )}

                    <div className="flex items-center justify-between pt-3 border-t border-divider">
                      <span className="text-xs text-secondary">Usage</span>
                      <span className="text-sm font-medium text-primary">
                        {config.usage_count || 0} plays
                      </span>
                    </div>

                    {config.last_analyzed_at && (
                      <div className="text-xs text-tertiary mt-2">
                        Analyzed:{" "}
                        {new Date(config.last_analyzed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-divider bg-surface-secondary p-4 shadow-inner">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {stats.total}
              </div>
              <div className="text-xs text-secondary">Total Packages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {stats.withConfidence}
              </div>
              <div className="text-xs text-secondary">With Confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {stats.totalUsage}
              </div>
              <div className="text-xs text-secondary">Total Usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Personnel Modal */}
      <CreatePersonnelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        playbookId={playbookId}
        onSuccess={loadPersonnel}
      />

      {/* Edit Personnel Badge Modal */}
      {editingPersonnel && (
        <EditPersonnelBadgeModal
          isOpen={!!editingPersonnel}
          onClose={() => setEditingPersonnel(null)}
          personnel={editingPersonnel}
          onSuccess={loadPersonnel}
        />
      )}
    </>
  );
};
