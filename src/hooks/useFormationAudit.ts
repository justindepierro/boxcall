import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Play } from "../types/play";

interface UseFormationAuditResult {
  plays: Play[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFormationAudit(playbookId: string | null | undefined): UseFormationAuditResult {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!playbookId) {
      setPlays([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from("plays")
        .select("*")
        .eq("playbook_id", playbookId)
        .neq("formation_status", "ok")
        .order("updated_at", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setPlays((data as Play[]) || []);
    } catch (err) {
      console.error("useFormationAudit failed", err);
      setError(
        err instanceof Error ? err.message : "Failed to load formation audit data"
      );
      setPlays([]);
    } finally {
      setLoading(false);
    }
  }, [playbookId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { plays, loading, error, refresh: load };
}

