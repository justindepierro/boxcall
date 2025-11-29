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
    withConfidence: personnel.filter((p) => p.confidence_score && p.confidence_score > 0).length,
    totalUsage: filteredPersonnel.reduce((sum, p) => sum + (p.usage_count || 0), 0),
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-y-0 right-0 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 bg-white dark:bg-gray-900 z-50 shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 sm:p-6 border-b border-divider shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Icon name="users" size="lg" className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Personnel Library</h2>
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

          {/* Action Button */}
          <button
            onClick={handleUpdateUsage}
            className="btn-primary flex items-center gap-2 bg-white text-purple-600 hover:bg-white/90"
          >
            <Icon name="refresh-cw" size="sm" />
            Update Usage
          </button>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
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
              <Icon name="loader" size="xl" className="animate-spin text-secondary" />
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="users" size="xl" className="text-secondary mb-4 mx-auto" />
              <p className="text-secondary text-lg">No personnel packages found</p>
              <p className="text-tertiary text-sm mt-2">
                Create personnel packages in the Playbook Builder
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPersonnel.map((config) => {
                const badge = config.badgeCustomization as any;
                const bgColor = badge?.backgroundColor || "#10b981";
                const textColor = badge?.textColor || "#ffffff";

                return (
                  <div
                    key={config.id}
                    className="card p-5 hover:shadow-xl hover:border-purple-500/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="px-4 py-2 rounded-lg text-sm font-bold shadow-md"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            boxShadow: `0 4px 6px -1px ${bgColor}33, 0 2px 4px -1px ${bgColor}22`,
                          }}
                        >
                          {config.name}
                        </div>
                      </div>
                    </div>

                    {config.description && (
                      <p className="text-sm text-secondary mb-3">
                        {config.description}
                      </p>
                    )}

                    {config.confidence_score !== null && config.confidence_score > 0 && (
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
                        Analyzed: {new Date(config.last_analyzed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4 shadow-inner">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-secondary">Total Packages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.withConfidence}</div>
              <div className="text-xs text-secondary">With Confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.totalUsage}</div>
              <div className="text-xs text-secondary">Total Usage</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
