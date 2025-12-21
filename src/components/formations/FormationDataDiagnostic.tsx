/**
 * FormationDataDiagnostic Component
 *
 * Temporary diagnostic component to check formation data
 * Shows current state of formations in the database
 *
 * Usage: Import and render this component anywhere in your app
 */

import React, { useState, useEffect } from "react";
import { table } from "../../data/supabase/db";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { debug, error as logError } from "../../utils/logger";

interface FormationStats {
  total: number;
  withDirection: number;
  withOpposites: number;
  standalone: number;
  needingAttention: number;
  byDirection: {
    left: number;
    right: number;
    none: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  topFormations: Array<{
    name: string;
    direction: string | null;
    usage_count: number;
    has_opposite: boolean;
    is_standalone: boolean;
  }>;
}

type FormationRow = {
  id: string;
  name: string;
  direction: "left" | "right" | null;
  opposite_formation_id: string | null;
  usage_count: number | null;
  playbook_id: string;
};

async function fetchFormationDiagnosticData(playbookId?: string): Promise<{
  stats: FormationStats;
  rawData: any;
}> {
  let query = table("formations").select(
    "id, name, direction, opposite_formation_id, usage_count, playbook_id"
  );

  if (playbookId) {
    query = query.eq("playbook_id", playbookId);
  }

  const { data: rawFormations, error: fetchError } = await query;

  if (fetchError) throw fetchError;

  const formations = (rawFormations || []) as FormationRow[];

  let playsData = null;
  try {
    const { data: plays } = await table("plays")
      .select("id, formation, f_dir, f_type, play_name")
      .limit(10);
    playsData = plays;
  } catch (e) {
    debug("[FormationDataDiagnostic] Could not fetch plays:", e);
  }

  const rawData = {
    formations: {
      count: formations.length,
      sample: formations[0] || null,
      all: formations.slice(0, 5),
    },
    plays: {
      count: playsData?.length || 0,
      sample: playsData?.[0] || null,
      all: playsData || [],
    },
    diagnosis: (() => {
      if (formations.length === 0 && playsData && playsData.length > 0) {
        return "⚠️ FOUND THE ISSUE: Formations table is empty but plays table has data! Your formation data is in plays.formation and plays.f_dir fields.";
      }
      if (formations.length > 0) return "✅ Formations table has data";
      return "❌ Both formations and plays tables appear empty";
    })(),
  };

  if (!formations || formations.length === 0) {
    return {
      rawData,
      stats: {
        total: 0,
        withDirection: 0,
        withOpposites: 0,
        standalone: 0,
        needingAttention: 0,
        byDirection: { left: 0, right: 0, none: 0 },
        byPriority: { high: 0, medium: 0, low: 0 },
        topFormations: [],
      },
    };
  }

  const withDirection = formations.filter((f) => f.direction !== null);
  const withOpposites = formations.filter(
    (f) => f.opposite_formation_id && f.opposite_formation_id !== f.id
  );
  const standalone = formations.filter((f) => f.opposite_formation_id === f.id);
  const needingAttention = formations.filter(
    (f) =>
      f.direction &&
      (!f.opposite_formation_id || f.opposite_formation_id === f.id) === false
  );

  const leftCount = formations.filter((f) => f.direction === "left").length;
  const rightCount = formations.filter((f) => f.direction === "right").length;
  const noneCount = formations.filter((f) => !f.direction).length;

  const highPriority = needingAttention.filter(
    (f) => (f.usage_count || 0) >= 5
  );
  const medPriority = needingAttention.filter(
    (f) => (f.usage_count || 0) >= 2 && (f.usage_count || 0) < 5
  );
  const lowPriority = needingAttention.filter((f) => (f.usage_count || 0) < 2);

  const topFormations = [...formations]
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 10)
    .map((f) => ({
      name: f.name,
      direction: f.direction,
      usage_count: f.usage_count || 0,
      has_opposite: !!(
        f.opposite_formation_id && f.opposite_formation_id !== f.id
      ),
      is_standalone: f.opposite_formation_id === f.id,
    }));

  return {
    rawData,
    stats: {
      total: formations.length,
      withDirection: withDirection.length,
      withOpposites: withOpposites.length,
      standalone: standalone.length,
      needingAttention: needingAttention.length,
      byDirection: { left: leftCount, right: rightCount, none: noneCount },
      byPriority: {
        high: highPriority.length,
        medium: medPriority.length,
        low: lowPriority.length,
      },
      topFormations,
    },
  };
}

const FormationDataDiagnosticLoading: React.FC = () => (
  <div className="p-lg bg-secondary rounded border border-primary">
    <Typography variant="body">Loading formation data...</Typography>
  </div>
);

const FormationDataDiagnosticErrorState: React.FC<{ message: string }> = ({
  message,
}) => (
  <div className="p-lg bg-error-50 rounded border border-error-200">
    <Typography variant="body" className="text-error-700">
      Error: {message}
    </Typography>
  </div>
);

const FormationDataDiagnosticView: React.FC<{
  stats: FormationStats;
  playbookId?: string;
  onRefresh: () => void;
  showDebug: boolean;
  onToggleDebug: () => void;
  rawData: any;
}> = ({ stats, playbookId, onRefresh, showDebug, onToggleDebug, rawData }) => (
  <div className="p-lg bg-secondary rounded border border-primary space-y-md">
    <div className="flex items-center justify-between">
      <Typography variant="headline-md">Formation Data Diagnostic</Typography>
      <Button onClick={onRefresh} size="sm" variant="secondary">
        Refresh
      </Button>
    </div>

    {stats.total === 0 ? (
      <div className="p-md bg-muted rounded text-center">
        <Typography variant="body" className="text-muted">
          No formations found {playbookId ? "in this playbook" : "in database"}
        </Typography>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-sm">
          <div className="p-sm bg-primary rounded border border-primary">
            <Typography variant="caption" className="text-muted">
              Total Formations
            </Typography>
            <Typography variant="headline-lg" className="text-primary-600">
              {stats.total}
            </Typography>
          </div>

          <div className="p-sm bg-primary rounded border border-primary">
            <Typography variant="caption" className="text-muted">
              With Direction
            </Typography>
            <Typography variant="headline-lg" className="text-primary-600">
              {stats.withDirection}
            </Typography>
          </div>

          <div className="p-sm bg-primary rounded border border-primary">
            <Typography variant="caption" className="text-muted">
              With Opposites
            </Typography>
            <Typography variant="headline-lg" className="text-success-600">
              {stats.withOpposites}
            </Typography>
          </div>

          <div className="p-sm bg-primary rounded border border-primary">
            <Typography variant="caption" className="text-muted">
              Standalone
            </Typography>
            <Typography variant="headline-lg" className="text-info-600">
              {stats.standalone}
            </Typography>
          </div>

          <div className="p-sm bg-primary rounded border border-primary">
            <Typography variant="caption" className="text-muted">
              Needing Attention
            </Typography>
            <Typography variant="headline-lg" className="text-warning-600">
              {stats.needingAttention}
            </Typography>
          </div>
        </div>

        <div>
          <Typography variant="body-sm" className="font-medium mb-xs">
            📍 Direction Breakdown
          </Typography>
          <div className="grid grid-cols-3 gap-xs">
            <div className="p-xs bg-primary-50 rounded text-center">
              <Typography variant="caption" className="text-muted">
                Left
              </Typography>
              <Typography variant="body" className="font-medium">
                {stats.byDirection.left}
              </Typography>
            </div>
            <div className="p-xs bg-primary-50 rounded text-center">
              <Typography variant="caption" className="text-muted">
                Right
              </Typography>
              <Typography variant="body" className="font-medium">
                {stats.byDirection.right}
              </Typography>
            </div>
            <div className="p-xs bg-muted rounded text-center">
              <Typography variant="caption" className="text-muted">
                No Direction
              </Typography>
              <Typography variant="body" className="font-medium">
                {stats.byDirection.none}
              </Typography>
            </div>
          </div>
        </div>

        {stats.needingAttention > 0 && (
          <div>
            <Typography variant="body-sm" className="font-medium mb-xs">
              🚨 Formations Needing Opposites
            </Typography>
            <div className="grid grid-cols-3 gap-xs">
              <div className="p-xs bg-error-50 rounded text-center">
                <Typography variant="caption" className="text-error-700">
                  🔴 High (5+ uses)
                </Typography>
                <Typography
                  variant="body"
                  className="font-medium text-error-700"
                >
                  {stats.byPriority.high}
                </Typography>
              </div>
              <div className="p-xs bg-warning-50 rounded text-center">
                <Typography variant="caption" className="text-warning-700">
                  🟡 Medium (2-4)
                </Typography>
                <Typography
                  variant="body"
                  className="font-medium text-warning-700"
                >
                  {stats.byPriority.medium}
                </Typography>
              </div>
              <div className="p-xs bg-success-50 rounded text-center">
                <Typography variant="caption" className="text-success-700">
                  🟢 Low (0-1)
                </Typography>
                <Typography
                  variant="body"
                  className="font-medium text-success-700"
                >
                  {stats.byPriority.low}
                </Typography>
              </div>
            </div>
          </div>
        )}

        <div>
          <Typography variant="body-sm" className="font-medium mb-xs">
            📊 Top Formations (by usage)
          </Typography>
          <div className="space-y-xs max-h-64 overflow-y-auto">
            {stats.topFormations.map((f, i) => (
              <div
                key={i}
                className="p-sm bg-primary rounded border border-primary flex items-center justify-between"
              >
                <div className="flex-1">
                  <Typography variant="body-sm" className="font-medium">
                    {f.name}
                  </Typography>
                  <Typography variant="caption" className="text-muted">
                    Direction: {f.direction || "none"} | Uses: {f.usage_count}
                  </Typography>
                </div>
                <div className="text-right">
                  {f.has_opposite && (
                    <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs">
                      ✅ Has opposite
                    </span>
                  )}
                  {f.is_standalone && (
                    <span className="px-2 py-1 bg-info-100 text-info-700 rounded text-xs">
                      🔷 Standalone
                    </span>
                  )}
                  {!f.has_opposite && !f.is_standalone && f.direction && (
                    <span className="px-2 py-1 bg-warning-100 text-warning-700 rounded text-xs">
                      ⚠️ Needs opposite
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-md border-t border-primary">
          <Button
            onClick={onToggleDebug}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            {showDebug ? "🔽 Hide" : "🔍 Show"} Raw Data (Debug Mode)
          </Button>
        </div>

        {showDebug && rawData && (
          <div className="p-md bg-muted rounded border border-secondary">
            <pre className="overflow-x-auto font-mono text-xs p-sm bg-primary rounded">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        )}
      </>
    )}
  </div>
);

export const FormationDataDiagnostic: React.FC<{ playbookId?: string }> = ({
  playbookId,
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FormationStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [rawData, setRawData] = useState<any>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const { stats, rawData } = await fetchFormationDiagnosticData(playbookId);
      setStats(stats);
      setRawData(rawData);
    } catch (err) {
      logError("[FormationDataDiagnostic] Error loading formation stats:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbookId]);

  if (loading) {
    return <FormationDataDiagnosticLoading />;
  }

  if (error) {
    return <FormationDataDiagnosticErrorState message={error} />;
  }

  if (!stats) return null;

  return (
    <FormationDataDiagnosticView
      stats={stats}
      playbookId={playbookId}
      onRefresh={loadStats}
      showDebug={showDebug}
      onToggleDebug={() => setShowDebug((prev) => !prev)}
      rawData={rawData}
    />
  );
};
