/**
 * Personnel Library Page
 *
 * Main page for managing personnel packages with badge customization.
 * Target: 250 lines max, modular design.
 */

import React, { useState, useEffect } from "react";
import { PersonnelLibraryService } from "../services/personnelLibrary/PersonnelLibraryService";
import { PersonnelSyncService } from "../services/personnelLibrary/PersonnelSyncService";
import type { PersonnelConfiguration } from "../types/personnel";
import { Icon } from "../components/ui/Icon/Icon";
import { toast } from "sonner";
import { useTeamsData } from "../hooks/useTeamsData";
import { useActiveTeamStore } from "../stores/activeTeamStore";

export const PersonnelLibraryPage: React.FC = () => {
  const { playbooks } = useTeamsData();
  const { activeTeamId } = useActiveTeamStore();
  
  // Get playbook ID from localStorage preference or first active playbook
  const savedPlaybookId = localStorage.getItem(`bc_active_playbook_${activeTeamId}`);
  const activePlaybook = playbooks.find(pb => 
    pb.team_id === activeTeamId && pb.is_active && 
    (savedPlaybookId ? pb.id === savedPlaybookId : true)
  ) || playbooks.find(pb => pb.team_id === activeTeamId && pb.is_active);
  
  const playbookId = activePlaybook?.id || "";

  if (!playbookId) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Icon
            name="alert-circle"
            size="xl"
            className="text-secondary mb-4 mx-auto"
          />
          <p className="text-secondary text-lg">No playbook selected</p>
        </div>
      </div>
    );
  }

  return <PersonnelLibraryPageContent playbookId={playbookId} />;
};

interface PersonnelLibraryPageContentProps {
  playbookId: string;
}

const PersonnelLibraryPageContent: React.FC<
  PersonnelLibraryPageContentProps
> = ({ playbookId }) => {
  const [personnel, setPersonnel] = useState<PersonnelConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPersonnel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbookId]);

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      const response = await PersonnelLibraryService.getPersonnelConfigs(
        playbookId,
        {
          search: searchQuery || undefined,
          sort_by: "usage_count",
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

  const filteredPersonnel = personnel.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-divider sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Personnel Library
              </h1>
              <p className="text-sm text-secondary mt-1">
                Manage personnel packages and badge customization
              </p>
            </div>
            <button
              onClick={handleUpdateUsage}
              className="btn-secondary flex items-center gap-2"
            >
              <Icon name="refresh-cw" size="sm" />
              Update Usage
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Icon
              name="search"
              size="sm"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-primary w-full pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon
              name="loader"
              size="lg"
              className="animate-spin text-primary"
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
            <p className="text-sm text-muted mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Create personnel packages to see them here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonnel.map((config) => (
              <PersonnelCard key={config.id} config={config} />
            ))}
          </div>
        )}

        {/* Stats */}
        {personnel.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-divider p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-secondary">Total Packages</p>
                <p className="text-2xl font-bold text-primary">
                  {personnel.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">With Customization</p>
                <p className="text-2xl font-bold text-primary">
                  {personnel.filter((p) => p.badgeCustomization).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Total Usage</p>
                <p className="text-2xl font-bold text-primary">
                  {personnel.reduce((sum, p) => sum + p.usage_count, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface PersonnelCardProps {
  config: PersonnelConfiguration;
}

const PersonnelCard: React.FC<PersonnelCardProps> = ({ config }) => {
  const getPlayerBreakdown = () => {
    if (!config.players || config.players.length === 0) return null;

    const counts = config.players.reduce(
      (acc, p) => {
        acc[p.player_position] = (acc[p.player_position] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts)
      .map(([pos, count]) => `${count} ${pos}`)
      .join(", ");
  };

  return (
    <div className="bg-white rounded-lg border border-divider p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-primary text-xl">{config.name}</h3>
          {config.description && (
            <p className="text-sm text-secondary mt-1">{config.description}</p>
          )}
        </div>
        {config.badgeCustomization && (
          <div className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
            Custom
          </div>
        )}
      </div>

      {/* Player Breakdown */}
      {config.players && config.players.length > 0 && (
        <div className="mb-3 pb-3 border-b border-divider">
          <p className="text-xs text-secondary mb-2">Players:</p>
          <p className="text-sm text-primary font-medium">
            {getPlayerBreakdown()}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {config.players.map((player) => (
              <span
                key={player.id}
                className="text-xs bg-surface-muted text-secondary px-2 py-1 rounded"
              >
                {player.label} ({player.player_position})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {config.confidence_score > 0 && (
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-divider">
          <span className="text-sm text-secondary">Confidence</span>
          <span className="text-sm font-bold text-primary">
            {config.confidence_score}%
          </span>
        </div>
      )}

      {/* Usage */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-secondary">Usage</span>
        <span className="text-sm font-medium text-primary">
          {config.usage_count} {config.usage_count === 1 ? "play" : "plays"}
        </span>
      </div>
    </div>
  );
};
