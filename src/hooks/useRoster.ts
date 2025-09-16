import { useEffect, useState } from "react";

import { emitTelemetry } from "../lib/telemetry";
import { rosterService, type RosterPlayerView } from "@services/rosterService";

interface UseRosterResult {
  players: RosterPlayerView[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRoster(teamId: string | undefined): UseRosterResult {
  const [players, setPlayers] = useState<RosterPlayerView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!teamId) {
      setPlayers([]);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const start = performance.now();
      try {
        const data = await rosterService.listByTeam(teamId as string);
        if (cancelled) return;
        setPlayers(data);
        emitTelemetry("roster.fetch.success", {
          teamId,
          count: data.length,
          duration_ms: Math.round(performance.now() - start),
        });
      } catch (e) {
        if (cancelled) return;
        const msg = (e as Error).message;
        setError(msg);
        emitTelemetry("roster.fetch.error", {
          teamId,
          error: msg,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [teamId, nonce]);

  return {
    players,
    loading,
    error,
    refresh: () => setNonce((n) => n + 1),
  };
}
