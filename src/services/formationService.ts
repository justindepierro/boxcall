/**
 * Formation Service
 *
 * UI-facing facade for formation operations.
 *
 * This replaces the prior no-op stub with real Supabase-backed behavior,
 * while keeping the same public API used across the formations UI.
 */

import { table } from "../data/supabase/db";
import type { Json } from "../types/database";
import type {
  Formation,
  FormationCreate,
  FormationUpdate,
} from "../types/formation";
import { FormationLibraryService } from "./formationLibrary/FormationLibraryService";
import { error as logError } from "../utils/logger";

type MatchName = "exact" | "similar" | "different";
type MatchDirection = "perfect" | "compatible" | "none";

export type FormationSuggestedMatch = {
  formation: Formation;
  score: number;
  nameMatch: MatchName;
  directionMatch: MatchDirection;
  personnelMatch: boolean;
  categoryMatch: boolean;
};

export type ImportFormationsFromPlaysResult = {
  created: number;
  formations: Formation[];
};

export type BulkUpdateResult = { updated: number };
export type BulkDirectionResult = { updated: number; created: number };
export type BulkDeleteResult = { count: number };

function normalizeFormationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(left|right|lt|rt)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function suggestOppositeName(originalName: string): string {
  const trimmed = originalName.trim();
  if (!trimmed) return "Opposite Formation";

  // Common replacements
  const replaced = trimmed
    .replace(/\bLeft\b/gi, "__TEMP__")
    .replace(/\bRight\b/gi, "Left")
    .replace(/__TEMP__/g, "Right")
    .replace(/\bLt\b/gi, "__TEMP__")
    .replace(/\bRt\b/gi, "Lt")
    .replace(/__TEMP__/g, "Rt");

  if (replaced !== trimmed) return replaced;
  return `${trimmed} Right`;
}

async function fetchFormationById(id: string): Promise<Formation | null> {
  const { data, error } = await table("formations")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    logError("[FormationService] Failed to fetch formation:", error);
    throw new Error(`Failed to fetch formation: ${error.message}`);
  }
  return (data as Formation) ?? null;
}

async function fetchFormationsByPlaybook(
  playbookId: string
): Promise<Formation[]> {
  const { data, error } = await table("formations")
    .select("*")
    .eq("playbook_id", playbookId)
    .order("name", { ascending: true })
    .range(0, 999);

  if (error) {
    logError("[FormationService] Failed to fetch formations:", error);
    throw new Error(`Failed to fetch formations: ${error.message}`);
  }

  return (data as Formation[]) || [];
}

export class FormationService {
  static async getFormationById(id: string): Promise<Formation | null> {
    if (!id) return null;
    return fetchFormationById(id);
  }

  static async getFormationsByPlaybook(
    playbookId: string
  ): Promise<Formation[]> {
    if (!playbookId) return [];
    return fetchFormationsByPlaybook(playbookId);
  }

  static async getFormationsListByPlaybook(
    playbookId: string
  ): Promise<Formation[]> {
    return this.getFormationsByPlaybook(playbookId);
  }

  static async getOppositeFormation(
    formationId: string
  ): Promise<Formation | null> {
    if (!formationId) return null;

    const formation = await fetchFormationById(formationId);
    if (!formation) return null;

    if (formation.opposite_formation_id) {
      return fetchFormationById(formation.opposite_formation_id);
    }

    const { data, error } = await table("formations")
      .select("*")
      .eq("opposite_formation_id", formationId)
      .maybeSingle();

    if (error) {
      logError("[FormationService] Failed to fetch opposite formation:", error);
      throw new Error(`Failed to fetch opposite formation: ${error.message}`);
    }

    return (data as Formation) ?? null;
  }

  static async createOppositeFormation(
    formationId: string,
    customName?: string
  ): Promise<Formation> {
    const original = await fetchFormationById(formationId);
    if (!original) {
      throw new Error("Formation not found");
    }

    const originalDirection: "left" | "right" =
      original.direction === "right" ? "right" : "left";
    const oppositeDirection: "left" | "right" =
      originalDirection === "left" ? "right" : "left";

    const name = (customName || suggestOppositeName(original.name)).trim();
    const safeName = name || "Opposite Formation";

    const created = await FormationLibraryService.createFormation({
      playbook_id: original.playbook_id,
      name: safeName,
      description: original.description ?? undefined,
      formation_type: (original.formation_type ?? undefined) as any,
      direction: oppositeDirection,
      opposite_formation_id: original.id,
      run_strength: original.run_strength ?? undefined,
      pass_strength: original.pass_strength ?? undefined,
      strength_player_position: original.strength_player_position ?? undefined,
      personnel_packages: original.personnel_packages ?? [],
      personnel_name: original.personnel_name ?? undefined,
      player_positions: original.player_positions ?? [],
    });

    // Ensure original is linked + has a direction if it was standalone
    await FormationLibraryService.updateFormation(original.id, {
      direction: originalDirection,
      opposite_formation_id: created.id,
    });

    return created;
  }

  static async importFormationsFromPlays(
    playbookId: string,
    _userId: string
  ): Promise<ImportFormationsFromPlaysResult> {
    if (!playbookId) return { created: 0, formations: [] };

    const [
      { data: existing, error: existingError },
      { data: plays, error: playsError },
    ] = await Promise.all([
      table("formations")
        .select("id, name")
        .eq("playbook_id", playbookId)
        .range(0, 999),
      table("plays")
        .select("formation, f_type, r_str, p_str, personnel")
        .eq("playbook_id", playbookId)
        .eq("is_archived", false)
        .not("formation", "is", null)
        .range(0, 1999),
    ]);

    if (existingError) {
      logError(
        "[FormationService] Failed to load existing formations:",
        existingError
      );
      throw new Error(`Failed to load formations: ${existingError.message}`);
    }
    if (playsError) {
      logError(
        "[FormationService] Failed to load plays for formation import:",
        playsError
      );
      throw new Error(`Failed to load plays: ${playsError.message}`);
    }

    const existingNames = new Set(
      (existing || []).map((f) => (f.name || "").trim().toLowerCase())
    );

    const grouped = new Map<
      string,
      Array<{
        formation: string;
        f_type: string | null;
        r_str: string | null;
        p_str: string | null;
        personnel: string | null;
      }>
    >();

    for (const play of plays || []) {
      const rawName = (play.formation || "").trim();
      if (!rawName) continue;
      const key = rawName.toLowerCase();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(play as any);
    }

    const toCreate: any[] = [];
    for (const [key, group] of grouped.entries()) {
      if (existingNames.has(key)) continue;
      const sample = group[0];
      const usageCount = group.length;
      const mostCommon = <T>(values: Array<T | null>): T | null => {
        const counts = new Map<string, { value: T; count: number }>();
        for (const v of values) {
          if (!v) continue;
          const k = String(v).trim().toLowerCase();
          const current = counts.get(k);
          counts.set(k, { value: v, count: (current?.count || 0) + 1 });
        }
        let best: { value: T; count: number } | null = null;
        for (const c of counts.values()) {
          if (!best || c.count > best.count) best = c;
        }
        return best?.value ?? null;
      };

      toCreate.push({
        playbook_id: playbookId,
        name: sample.formation,
        description: null,
        formation_type: mostCommon(group.map((p) => p.f_type)),
        run_strength: mostCommon(group.map((p) => p.r_str)),
        pass_strength: mostCommon(group.map((p) => p.p_str)),
        strength_player_position: null,
        opposite_formation_id: null,
        direction: null,
        is_standalone: true,
        confidence_score: 0,
        last_analyzed_at: null,
        analysis_play_count: 0,
        player_positions: [] as unknown as Json,
        diagram_data: null,
        personnel_packages: [],
        personnel_name: mostCommon(group.map((p) => p.personnel)),
        usage_count: usageCount,
      });
    }

    let created = 0;
    if (toCreate.length > 0) {
      const { error: insertError } = await table("formations").insert(toCreate);
      if (insertError) {
        logError(
          "[FormationService] Failed to import formations:",
          insertError
        );
        throw new Error(`Failed to import formations: ${insertError.message}`);
      }
      created = toCreate.length;
    }

    const formations = await fetchFormationsByPlaybook(playbookId);
    return { created, formations };
  }

  static async bulkUpdateMetadata(
    formationIds: string[],
    metadata: Partial<Record<string, unknown>>,
    mode: "replace" | "merge" = "merge"
  ): Promise<BulkUpdateResult> {
    if (formationIds.length === 0) return { updated: 0 };

    const patch: Record<string, unknown> = { ...metadata };
    patch.updated_at = new Date().toISOString();

    // Merge mode only merges tags; all other fields replace.
    if (mode !== "merge" || !Array.isArray((patch as any).tags)) {
      const { error } = await table("formations")
        .update(patch)
        .in("id", formationIds);
      if (error) {
        logError("[FormationService] Bulk update failed:", error);
        throw new Error(`Failed to update formations: ${error.message}`);
      }
      return { updated: formationIds.length };
    }

    const nextTags = (patch as any).tags as string[];
    delete (patch as any).tags;

    const { data, error } = await table("formations")
      .select("id, tags")
      .in("id", formationIds);
    if (error) {
      logError("[FormationService] Failed to load existing tags:", error);
      throw new Error(`Failed to load formations: ${error.message}`);
    }

    await Promise.all(
      (data || []).map(async (row: any) => {
        const current: string[] = Array.isArray(row.tags) ? row.tags : [];
        const merged = Array.from(new Set([...current, ...nextTags]));
        const { error: updateError } = await table("formations")
          .update({ ...patch, tags: merged })
          .eq("id", row.id);
        if (updateError) {
          throw new Error(updateError.message);
        }
      })
    );

    return { updated: formationIds.length };
  }

  static async bulkSetDirection(
    playbookId: string,
    formationIds: string[],
    direction: "left" | "right" | "both",
    autoCreateOpposites: boolean
  ): Promise<BulkDirectionResult> {
    if (!playbookId || formationIds.length === 0) {
      return { updated: 0, created: 0 };
    }

    if (direction === "left" || direction === "right") {
      const { error } = await table("formations")
        .update({
          direction,
          is_standalone: false,
          updated_at: new Date().toISOString(),
        })
        .in("id", formationIds);
      if (error) {
        logError("[FormationService] Bulk direction update failed:", error);
        throw new Error(`Failed to update directions: ${error.message}`);
      }
      return { updated: formationIds.length, created: 0 };
    }

    // direction === "both" (ensure paired variants)
    let created = 0;
    for (const id of formationIds) {
      const formation = await fetchFormationById(id);
      if (!formation) continue;

      const existingOpposite =
        formation.opposite_formation_id ||
        (await (async () => {
          const { data } = await table("formations")
            .select("id")
            .eq("opposite_formation_id", id)
            .maybeSingle();
          return data?.id ?? null;
        })());

      if (existingOpposite) {
        const baseDirection: "left" | "right" =
          formation.direction === "right" ? "right" : "left";
        const oppositeDirection: "left" | "right" =
          baseDirection === "left" ? "right" : "left";
        await Promise.all([
          table("formations")
            .update({
              direction: baseDirection,
              is_standalone: false,
              opposite_formation_id: existingOpposite,
            })
            .eq("id", id),
          table("formations")
            .update({
              direction: oppositeDirection,
              is_standalone: false,
              opposite_formation_id: id,
            })
            .eq("id", existingOpposite),
        ]);
        continue;
      }

      // No opposite exists
      await table("formations")
        .update({ direction: "left", is_standalone: false })
        .eq("id", id);

      if (autoCreateOpposites) {
        await this.createOppositeFormation(
          id,
          suggestOppositeName(formation.name)
        );
        created += 1;
      }
    }

    return { updated: formationIds.length, created };
  }

  static async bulkDelete(
    formationIds: string[],
    deleteOpposites: boolean
  ): Promise<BulkDeleteResult> {
    if (formationIds.length === 0) return { count: 0 };

    const { data, error } = await table("formations")
      .select("id, opposite_formation_id")
      .in("id", formationIds);
    if (error) {
      logError(
        "[FormationService] Failed to load formations for delete:",
        error
      );
      throw new Error(`Failed to load formations: ${error.message}`);
    }

    const idsToDelete = new Set<string>(formationIds);
    if (deleteOpposites) {
      for (const row of data || []) {
        if (row.opposite_formation_id)
          idsToDelete.add(row.opposite_formation_id);
      }
      const { data: reverse } = await table("formations")
        .select("id")
        .in("opposite_formation_id", formationIds);
      for (const row of reverse || []) idsToDelete.add(row.id);
    }

    const deleteList = Array.from(idsToDelete);
    const { error: deleteError } = await table("formations")
      .delete()
      .in("id", deleteList);
    if (deleteError) {
      logError("[FormationService] Bulk delete failed:", deleteError);
      throw new Error(`Failed to delete formations: ${deleteError.message}`);
    }

    return { count: deleteList.length };
  }

  static async getUnpairedFormations(playbookId: string): Promise<Formation[]> {
    if (!playbookId) return [];
    const { data, error } = await table("formations")
      .select("*")
      .eq("playbook_id", playbookId)
      .eq("is_standalone", false)
      .is("opposite_formation_id", null)
      .not("direction", "is", null)
      .order("name", { ascending: true });

    if (error) {
      logError(
        "[FormationService] Failed to fetch unpaired formations:",
        error
      );
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    return (data as Formation[]) || [];
  }

  static async getStandaloneFormations(
    playbookId: string
  ): Promise<Formation[]> {
    if (!playbookId) return [];
    const { data, error } = await table("formations")
      .select("*")
      .eq("playbook_id", playbookId)
      .eq("is_standalone", true)
      .order("name", { ascending: true });

    if (error) {
      logError(
        "[FormationService] Failed to fetch standalone formations:",
        error
      );
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    return (data as Formation[]) || [];
  }

  static async getSuggestedMatches(
    formationId: string,
    limit: number
  ): Promise<FormationSuggestedMatch[]> {
    const formation = await fetchFormationById(formationId);
    if (!formation) return [];

    const formations = await fetchFormationsByPlaybook(formation.playbook_id);
    const baseName = normalizeFormationName(formation.name);
    const basePersonnel = new Set(formation.personnel_packages || []);

    const scored: FormationSuggestedMatch[] = formations
      .filter((f) => f.id !== formation.id)
      .map((candidate) => {
        const candidateBase = normalizeFormationName(candidate.name);

        const nameMatch: MatchName =
          candidateBase === baseName
            ? "exact"
            : candidateBase.includes(baseName) ||
                baseName.includes(candidateBase)
              ? "similar"
              : "different";

        const desiredOpposite: "left" | "right" | null =
          formation.direction === "left"
            ? "right"
            : formation.direction === "right"
              ? "left"
              : null;

        const directionMatch: MatchDirection =
          desiredOpposite && candidate.direction === desiredOpposite
            ? "perfect"
            : desiredOpposite === null
              ? "compatible"
              : "none";

        const candidatePersonnel = new Set(candidate.personnel_packages || []);
        const personnelMatch = Array.from(basePersonnel).some((p) =>
          candidatePersonnel.has(p)
        );

        const categoryMatch =
          !!formation.category && formation.category === candidate.category;

        let score = 0;
        if (nameMatch === "exact") score += 60;
        if (nameMatch === "similar") score += 35;
        if (directionMatch === "perfect") score += 25;
        if (directionMatch === "compatible") score += 10;
        if (personnelMatch) score += 10;
        if (categoryMatch) score += 5;

        return {
          formation: candidate,
          score,
          nameMatch,
          directionMatch,
          personnelMatch,
          categoryMatch,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, limit));

    return scored;
  }

  static async linkExistingFormations(
    leftId: string,
    rightId: string
  ): Promise<void> {
    if (!leftId || !rightId) return;
    if (leftId === rightId) {
      throw new Error("Cannot link a formation to itself");
    }

    await FormationLibraryService.linkOpposites(leftId, rightId);

    // Enforce left/right directions for the linking UI
    await Promise.all([
      FormationLibraryService.updateFormation(leftId, {
        direction: "left",
        opposite_formation_id: rightId,
      }),
      FormationLibraryService.updateFormation(rightId, {
        direction: "right",
        opposite_formation_id: leftId,
      }),
    ]);
  }

  static async markAsStandalone(formationId: string): Promise<void> {
    if (!formationId) return;

    const formation = await fetchFormationById(formationId);
    if (!formation) return;

    // Clear any inverse link as well
    const linkedIds = new Set<string>();
    if (formation.opposite_formation_id)
      linkedIds.add(formation.opposite_formation_id);
    const { data: inverse } = await table("formations")
      .select("id")
      .eq("opposite_formation_id", formationId);
    for (const row of inverse || []) linkedIds.add(row.id);

    await Promise.all([
      table("formations")
        .update({
          direction: null,
          is_standalone: true,
          opposite_formation_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formationId),
      ...Array.from(linkedIds).map((id) =>
        table("formations")
          .update({
            direction: null,
            is_standalone: true,
            opposite_formation_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
      ),
    ]);
  }

  static async updateFormation(
    id: string,
    data: FormationUpdate
  ): Promise<Formation> {
    return FormationLibraryService.updateFormation(id, data);
  }

  static async createFormation(data: FormationCreate): Promise<Formation> {
    return FormationLibraryService.createFormation(data);
  }

  static async deleteFormation(id: string): Promise<void> {
    await FormationLibraryService.deleteFormation(id);
  }
}
