import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { telemetry } from "../telemetry/dispatcher";

const nowMs = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

type FulltextRow = { play_id: string; rank?: number };
type FuzzyRow = { play_id: string; similarity?: number };

const mapFulltextResults = (rows: unknown): PlaySearchResult[] =>
  Array.isArray(rows)
    ? (rows as FulltextRow[]).map((r) => ({
        ...r,
        source: "fulltext" as const,
      }))
    : [];

const mapFuzzyResults = (rows: unknown): PlaySearchResult[] =>
  Array.isArray(rows)
    ? (rows as FuzzyRow[]).map((r) => ({ ...r, source: "fuzzy" as const }))
    : [];

const enqueueSuggestionShownIfChanged = (params: {
  query: string;
  playbookId?: string;
  combined: PlaySearchResult[];
  lastShownIds: React.MutableRefObject<string>;
}) => {
  const { query, playbookId, combined, lastShownIds } = params;
  const idsKey = combined.map((r) => r.play_id).join(",");
  if (!idsKey || idsKey === lastShownIds.current) return;

  lastShownIds.current = idsKey;
  telemetry.enqueue({
    type: "suggestion:shown",
    data: {
      query,
      playbookId,
      result_ids: combined.map((r) => r.play_id),
      count: combined.length,
      fuzzy: combined[0]?.source === "fuzzy",
    },
  });
};

const enqueueSearchQueryTelemetry = (params: {
  query: string;
  playbookId?: string;
  count: number;
  usedFuzzy: boolean;
  ftDuration: number;
  fuzzyDuration: number;
  totalDuration: number;
}) => {
  const {
    query,
    playbookId,
    count,
    usedFuzzy,
    ftDuration,
    fuzzyDuration,
    totalDuration,
  } = params;

  telemetry.enqueue({
    type: "search:query",
    data: {
      query,
      playbookId,
      count,
      usedFuzzy,
      ftDurationMs: Math.round(ftDuration),
      fuzzyDurationMs: usedFuzzy ? Math.round(fuzzyDuration) : null,
      totalDurationMs: Math.round(totalDuration),
    },
  });
};

const enqueueSearchErrorTelemetry = (params: {
  query: string;
  playbookId?: string;
  message: string;
  ftDuration: number;
  attemptedFuzzy: boolean;
  totalDuration: number;
}) => {
  const {
    query,
    playbookId,
    message,
    ftDuration,
    attemptedFuzzy,
    totalDuration,
  } = params;
  telemetry.enqueue({
    type: "search:error",
    data: {
      query,
      playbookId,
      message,
      ftDurationMs: Math.round(ftDuration),
      fuzzyTried: attemptedFuzzy,
      totalDurationMs: Math.round(totalDuration),
    },
  });
};

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
      const t0 = nowMs();
      let ftDuration = 0;
      let fuzzyDuration = 0;
      let usedFuzzy = false;
      try {
        const ftStart = nowMs();
        const { data: fulltext, error: ftErr } = await (supabase as any).rpc(
          "search_plays",
          { q, lim: limit, playbook: playbookId }
        );
        if (ftErr) throw ftErr;
        ftDuration = nowMs() - ftStart;
        combined = mapFulltextResults(fulltext);
        if (!combined.length) {
          const fzStart = nowMs();
          const { data: fuzzy, error: fErr } = await (supabase as any).rpc(
            "search_plays_fuzzy",
            { q, lim: limit, playbook: playbookId }
          );
          setAttemptedFuzzy(true);
          if (!fErr && fuzzy) {
            combined = mapFuzzyResults(fuzzy);
          }
          fuzzyDuration = nowMs() - fzStart;
          usedFuzzy = true;
        } else {
          setAttemptedFuzzy(false);
        }
        setResults(combined);
        enqueueSuggestionShownIfChanged({
          query: q,
          playbookId,
          combined,
          lastShownIds,
        });
        const totalDuration = nowMs() - t0;
        enqueueSearchQueryTelemetry({
          query: q,
          playbookId,
          count: combined.length,
          usedFuzzy,
          ftDuration,
          fuzzyDuration,
          totalDuration,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "search failed");
        const totalDuration = nowMs() - t0;
        enqueueSearchErrorTelemetry({
          query: q,
          playbookId,
          message: e instanceof Error ? e.message : String(e),
          ftDuration,
          attemptedFuzzy,
          totalDuration,
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
