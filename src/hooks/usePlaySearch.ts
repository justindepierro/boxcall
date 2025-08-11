import { useEffect, useRef, useState, useCallback } from "react";
import { getSupabaseClient } from "../lib/supabaseClient";
import { telemetry } from "../telemetry/dispatcher";

export interface PlaySearchResult {
  play_id: string;
  rank?: number;
  similarity?: number;
  source: "fulltext" | "fuzzy";
}

interface UsePlaySearchOptions {
  playbookId?: string;
  debounceMs?: number;
  minChars?: number;
  limit?: number;
}

interface UsePlaySearchReturn {
  results: PlaySearchResult[];
  loading: boolean;
  query: string;
  setQuery: (q: string) => void;
  select: (playId: string) => void;
  attemptedFuzzy: boolean;
  error?: string;
}

export function usePlaySearch(
  initialQuery = "",
  opts: UsePlaySearchOptions = {}
): UsePlaySearchReturn {
  const { playbookId, debounceMs = 200, minChars = 2, limit = 12 } = opts;
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PlaySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [attemptedFuzzy, setAttemptedFuzzy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const lastShownIds = useRef<string>("");
  const timer = useRef<number | null>(null);

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < minChars) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(undefined);
      let combined: PlaySearchResult[] = [];
      // Timing metrics
      const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
      let ftDuration = 0;
      let fuzzyDuration = 0;
      let usedFuzzy = false;
      try {
        const supabase = getSupabaseClient();
        type FT = { play_id: string; rank?: number };
        type FZ = { play_id: string; similarity?: number };
        const ftStart = typeof performance !== "undefined" ? performance.now() : Date.now();
        const { data: fulltext, error: ftErr } = await supabase.rpc(
          "search_plays",
          { q, lim: limit, playbook: playbookId }
        );
        if (ftErr) throw ftErr;
        ftDuration = (typeof performance !== "undefined" ? performance.now() : Date.now()) - ftStart;
        combined = Array.isArray(fulltext)
          ? (fulltext as FT[]).map((r: FT) => ({
              ...r,
              source: "fulltext" as const,
            }))
          : [];
        if (!combined.length) {
          const fzStart = typeof performance !== "undefined" ? performance.now() : Date.now();
          const { data: fuzzy, error: fErr } = await supabase.rpc(
            "search_plays_fuzzy",
            { q, lim: limit, playbook: playbookId }
          );
          setAttemptedFuzzy(true);
          if (!fErr && fuzzy) {
            combined = Array.isArray(fuzzy)
              ? (fuzzy as FZ[]).map((r: FZ) => ({
                  ...r,
                  source: "fuzzy" as const,
                }))
              : [];
          }
          fuzzyDuration = (typeof performance !== "undefined" ? performance.now() : Date.now()) - fzStart;
          usedFuzzy = true;
        } else {
          setAttemptedFuzzy(false);
        }
        setResults(combined);
        const idsKey = combined.map((r) => r.play_id).join(",");
        if (idsKey && idsKey !== lastShownIds.current) {
          lastShownIds.current = idsKey;
          telemetry.enqueue({
            type: "suggestion:shown",
            data: {
              query: q,
              playbookId,
              result_ids: combined.map((r) => r.play_id),
              count: combined.length,
              fuzzy: combined[0]?.source === "fuzzy",
            },
          });
        }
        const totalDuration = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
        telemetry.enqueue({
          type: "search:query",
          data: {
            query: q,
            playbookId,
            count: combined.length,
            usedFuzzy,
            ftDurationMs: Math.round(ftDuration),
            fuzzyDurationMs: usedFuzzy ? Math.round(fuzzyDuration) : null,
            totalDurationMs: Math.round(totalDuration),
          },
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "search failed");
        const totalDuration = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
        telemetry.enqueue({
          type: "search:error",
          data: {
            query: q,
            playbookId,
            message: e instanceof Error ? e.message : String(e),
            ftDurationMs: Math.round(ftDuration),
            fuzzyTried: attemptedFuzzy,
            totalDurationMs: Math.round(totalDuration),
          },
        });
      } finally {
        setLoading(false);
      }
    },
  [playbookId, limit, minChars, attemptedFuzzy]
  );

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void runSearch(query);
    }, debounceMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [query, runSearch, debounceMs]);

  const select = useCallback(
    (playId: string) => {
      const idx = results.findIndex((r) => r.play_id === playId);
      telemetry.enqueue({
        type: "suggestion:accept",
        data: {
          query,
          playId,
          position: idx >= 0 ? idx + 1 : null,
          total: results.length,
          playbookId,
        },
      });
    },
    [results, query, playbookId]
  );

  return { results, loading, query, setQuery, select, attemptedFuzzy, error };
}
