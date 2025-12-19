import React, { useState, useEffect } from "react";
import { FormationService } from "../../services/formationService";
import type { Formation } from "../../types/formation";
import { error as logError } from "../../utils/logger";
import { useToast } from "../../hooks/useToast";

interface FormationHealthDashboardProps {
  playbookId: string;
  onFormationUpdated?: () => void;
}

interface HealthStats {
  total: number;
  paired: number;
  standalone: number;
  unpaired: number;
}

type FormationMatchSuggestion = {
  formation: Formation;
  score: number;
  nameMatch: "exact" | "similar" | "different";
  directionMatch: "perfect" | "compatible" | "none";
  personnelMatch: boolean;
  categoryMatch: boolean;
};

type FormationMatchesById = Record<string, FormationMatchSuggestion[]>;

function getHealthColor(stats: HealthStats, stat: keyof HealthStats): string {
  if (stat === "unpaired" && stats.unpaired > 0) return "text-warning-600";
  if (stat === "paired") return "text-success-600";
  if (stat === "standalone") return "text-info-600";
  return "text-secondary";
}

function getScoreBadgeColor(score: number): string {
  if (score >= 200) return "bg-success-bg text-success-800";
  if (score >= 150) return "bg-warning-bg text-warning-800";
  return "bg-error-bg text-error-800";
}

const FormationHealthStatsOverview: React.FC<{ stats: HealthStats }> = ({
  stats,
}) => (
  <div className="bg-white rounded-lg border p-6">
    <h3 className="text-lg font-semibold mb-4">Formation Health</h3>
    <div className="grid grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-primary">{stats.total}</div>
        <div className="text-sm text-secondary">Total Formations</div>
      </div>
      <div className="text-center">
        <div
          className={`text-3xl font-bold ${getHealthColor(stats, "paired")}`}
        >
          {stats.paired}
        </div>
        <div className="text-sm text-secondary">Paired</div>
      </div>
      <div className="text-center">
        <div
          className={`text-3xl font-bold ${getHealthColor(stats, "standalone")}`}
        >
          {stats.standalone}
        </div>
        <div className="text-sm text-secondary">Standalone</div>
      </div>
      <div className="text-center">
        <div
          className={`text-3xl font-bold ${getHealthColor(stats, "unpaired")}`}
        >
          {stats.unpaired}
        </div>
        <div className="text-sm text-secondary">Needs Attention</div>
      </div>
    </div>
  </div>
);

const FormationHealthUnpairedSection: React.FC<{
  unpairedFormations: Formation[];
  matches: FormationMatchesById;
  actionLoading: string | null;
  onMarkAsStandalone: (formationId: string) => void;
  onLink: (formationId: string, oppositeFormationId: string) => void;
}> = ({
  unpairedFormations,
  matches,
  actionLoading,
  onMarkAsStandalone,
  onLink,
}) => {
  if (unpairedFormations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="inline-block w-2 h-2 bg-warning-500 rounded-full mr-2"></span>
        Formations Needing Attention ({unpairedFormations.length})
      </h3>
      <p className="text-sm text-secondary mb-4">
        These formations have a direction but no opposite formation linked.
        Review suggestions below or mark as standalone if no opposite is needed.
      </p>
      <div className="space-y-4">
        {unpairedFormations.map((formation) => (
          <div key={formation.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-primary">
                  {formation.name}
                </div>
                <div className="text-sm text-secondary">
                  Direction: {formation.direction || "None"}
                  {formation.personnel_name &&
                    ` • Personnel: ${formation.personnel_name}`}
                  {formation.category && ` • ${formation.category}`}
                </div>
              </div>
              <button
                onClick={() => onMarkAsStandalone(formation.id)}
                disabled={
                  actionLoading === `standalone-${formation.id}` ||
                  actionLoading !== null
                }
                className="px-3 py-1 text-sm border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === `standalone-${formation.id}`
                  ? "Marking..."
                  : "Mark as Standalone"}
              </button>
            </div>

            {matches[formation.id] && matches[formation.id].length > 0 && (
              <div>
                <div className="text-sm font-medium text-primary mb-2">
                  Suggested Matches:
                </div>
                <div className="space-y-2">
                  {matches[formation.id].map((match) => (
                    <div
                      key={match.formation.id}
                      className="flex items-center justify-between bg-secondary rounded p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {match.formation.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${getScoreBadgeColor(match.score)}`}
                          >
                            {match.score} pts
                          </span>
                          {match.directionMatch === "perfect" && (
                            <span className="px-2 py-0.5 text-xs bg-success-bg text-success-800 rounded-full">
                              Perfect opposite
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-secondary mt-1">
                          Direction: {match.formation.direction || "None"}
                          {match.personnelMatch && " • Same personnel"}
                          {match.categoryMatch && " • Same category"}
                          {match.nameMatch === "exact" && " • Exact name match"}
                          {match.nameMatch === "similar" && " • Similar name"}
                        </div>
                      </div>
                      <button
                        onClick={() => onLink(formation.id, match.formation.id)}
                        disabled={
                          actionLoading ===
                            `${formation.id}-${match.formation.id}` ||
                          actionLoading !== null
                        }
                        className="ml-4 px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ===
                        `${formation.id}-${match.formation.id}`
                          ? "Linking..."
                          : "Link"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!matches[formation.id] || matches[formation.id].length === 0) && (
              <div className="text-sm text-muted italic">
                No good matches found. Consider creating an opposite formation
                or marking as standalone.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FormationHealthStandaloneSection: React.FC<{
  standaloneFormations: Formation[];
}> = ({ standaloneFormations }) => {
  if (standaloneFormations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="inline-block w-2 h-2 bg-info-500 rounded-full mr-2"></span>
        Standalone Formations ({standaloneFormations.length})
      </h3>
      <p className="text-sm text-secondary mb-4">
        These formations are marked as standalone (no opposite needed).
      </p>
      <div className="grid grid-cols-2 gap-4">
        {standaloneFormations.map((formation) => (
          <div key={formation.id} className="border rounded-lg p-3">
            <div className="font-semibold text-primary">{formation.name}</div>
            <div className="text-sm text-secondary">
              {formation.personnel_name && `${formation.personnel_name}`}
              {formation.category && ` • ${formation.category}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FormationHealthAllClearMessage: React.FC<{ show: boolean }> = ({
  show,
}) => {
  if (!show) return null;
  return (
    <div className="bg-success-bg rounded-lg border border-success-200 p-6 text-center">
      <div className="text-success-800 font-semibold mb-2">
        ✓ All formations are healthy!
      </div>
      <div className="text-sm text-success-700">
        All formations are either paired with their opposite or marked as
        standalone.
      </div>
    </div>
  );
};

export const FormationHealthDashboard: React.FC<
  FormationHealthDashboardProps
> = ({ playbookId, onFormationUpdated }) => {
  const toast = useToast();
  const [stats, setStats] = useState<HealthStats>({
    total: 0,
    paired: 0,
    standalone: 0,
    unpaired: 0,
  });
  const [unpairedFormations, setUnpairedFormations] = useState<Formation[]>([]);
  const [standaloneFormations, setStandaloneFormations] = useState<Formation[]>(
    []
  );
  const [matches, setMatches] = useState<FormationMatchesById>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all formations
      const allFormations =
        await FormationService.getFormationsByPlaybook(playbookId);

      // Load unpaired and standalone
      const unpaired = await FormationService.getUnpairedFormations(playbookId);
      const standalone =
        await FormationService.getStandaloneFormations(playbookId);

      // Calculate stats
      const paired = allFormations.filter(
        (f) => f.opposite_formation_id !== null
      ).length;

      setStats({
        total: allFormations.length,
        paired,
        standalone: standalone.length,
        unpaired: unpaired.length,
      });

      setUnpairedFormations(unpaired);
      setStandaloneFormations(standalone);

      // Load matches for unpaired formations
      const matchesData: FormationMatchesById = {};
      for (const formation of unpaired) {
        const suggestions = await FormationService.getSuggestedMatches(
          formation.id,
          3
        );
        if (suggestions.length > 0) {
          matchesData[formation.id] = suggestions;
        }
      }
      setMatches(matchesData);
    } catch (error) {
      logError(
        "[FormationHealthDashboard] Failed to load formation health data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbookId]);

  const handleLink = async (
    formationId: string,
    oppositeFormationId: string
  ) => {
    try {
      setActionLoading(`${formationId}-${oppositeFormationId}`);
      await FormationService.linkExistingFormations(
        formationId,
        oppositeFormationId
      );
      await loadData();
      onFormationUpdated?.();
    } catch (error) {
      logError("[FormationHealthDashboard] Failed to link formations:", error);
      toast.error("Failed to link formations. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsStandalone = async (formationId: string) => {
    try {
      setActionLoading(`standalone-${formationId}`);
      await FormationService.markAsStandalone(formationId);
      await loadData();
      onFormationUpdated?.();
    } catch (error) {
      logError(
        "[FormationHealthDashboard] Failed to mark as standalone:",
        error
      );
      toast.error("Failed to mark as standalone. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted">Loading formation health data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormationHealthStatsOverview stats={stats} />
      <FormationHealthUnpairedSection
        unpairedFormations={unpairedFormations}
        matches={matches}
        actionLoading={actionLoading}
        onMarkAsStandalone={(formationId) =>
          void handleMarkAsStandalone(formationId)
        }
        onLink={(formationId, oppositeFormationId) =>
          void handleLink(formationId, oppositeFormationId)
        }
      />
      <FormationHealthStandaloneSection
        standaloneFormations={standaloneFormations}
      />
      <FormationHealthAllClearMessage show={unpairedFormations.length === 0} />
    </div>
  );
};
