/**
 * Formation Service
 *
 * NOTE:
 * This file previously contained an "archived" stub that threw at runtime and
 * returned untyped empty arrays (which infer as never[]), causing large
 * TypeScript cascades across the formations UI.
 *
 * Until the full formation backend is wired up, we keep this service as a
 * typed, safe no-op layer that prevents crashes and keeps TS boundaries sane.
 */

import type {
  Formation,
  FormationCreate,
  FormationUpdate,
} from "../types/formation";

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

function warn(methodName: string) {
  if (import.meta.env.DEV) {
    console.warn(`[FormationService] ${methodName} is currently a no-op stub.`);
  }
}

function createStubFormation(overrides: Partial<Formation> = {}): Formation {
  const now = new Date().toISOString();
  return {
    id: `stub-${Date.now()}`,
    playbook_id: "",
    name: "Stub Formation",
    description: null,
    formation_type: null,
    run_strength: null,
    pass_strength: null,
    strength_player_position: null,
    opposite_formation_id: null,
    direction: null,
    is_standalone: true,
    confidence_score: 0,
    last_analyzed_at: null,
    analysis_play_count: 0,
    player_positions: [],
    diagram_data: null,
    personnel_packages: [],
    personnel_name: null,
    usage_count: 0,
    metadata_quality: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

export class FormationService {
  static async getFormationById(id: string): Promise<Formation | null> {
    warn("getFormationById");
    // No data source available in this stub.
    return id ? null : null;
  }

  static async getFormationsByPlaybook(
    playbookId: string
  ): Promise<Formation[]> {
    warn("getFormationsByPlaybook");
    return playbookId ? [] : [];
  }

  static async getFormationsListByPlaybook(
    playbookId: string
  ): Promise<Formation[]> {
    return this.getFormationsByPlaybook(playbookId);
  }

  static async getOppositeFormation(
    _formationId: string
  ): Promise<Formation | null> {
    warn("getOppositeFormation");
    return null;
  }

  static async createOppositeFormation(
    formationId: string,
    customName?: string
  ): Promise<Formation> {
    warn("createOppositeFormation");
    const name =
      (customName || "Opposite Formation").trim() || "Opposite Formation";
    return createStubFormation({
      name,
      direction: "right",
      opposite_formation_id: formationId,
      is_standalone: false,
    });
  }

  static async importFormationsFromPlays(
    playbookId: string,
    _userId: string
  ): Promise<ImportFormationsFromPlaysResult> {
    warn("importFormationsFromPlays");
    const formations = await this.getFormationsByPlaybook(playbookId);
    return { created: 0, formations };
  }

  static async bulkUpdateMetadata(
    _formationIds: string[],
    _metadata: Partial<Record<string, unknown>>,
    _mode: "replace" | "merge" = "merge"
  ): Promise<BulkUpdateResult> {
    warn("bulkUpdateMetadata");
    return { updated: _formationIds.length };
  }

  static async bulkSetDirection(
    _playbookId: string,
    _formationIds: string[],
    _direction: "left" | "right" | "both",
    _autoCreateOpposites: boolean
  ): Promise<BulkDirectionResult> {
    warn("bulkSetDirection");
    return { updated: _formationIds.length, created: 0 };
  }

  static async bulkDelete(
    _formationIds: string[],
    _deleteOpposites: boolean
  ): Promise<BulkDeleteResult> {
    warn("bulkDelete");
    return { count: _formationIds.length };
  }

  static async getUnpairedFormations(
    _playbookId: string
  ): Promise<Formation[]> {
    warn("getUnpairedFormations");
    return [];
  }

  static async getStandaloneFormations(
    _playbookId: string
  ): Promise<Formation[]> {
    warn("getStandaloneFormations");
    return [];
  }

  static async getSuggestedMatches(
    _formationId: string,
    _limit: number
  ): Promise<FormationSuggestedMatch[]> {
    warn("getSuggestedMatches");
    return [];
  }

  static async linkExistingFormations(
    _leftId: string,
    _rightId: string
  ): Promise<void> {
    warn("linkExistingFormations");
  }

  static async markAsStandalone(_formationId: string): Promise<void> {
    warn("markAsStandalone");
  }

  static async updateFormation(
    _id: string,
    _data: FormationUpdate
  ): Promise<Formation> {
    warn("updateFormation");
    return createStubFormation();
  }

  static async createFormation(_data: FormationCreate): Promise<Formation> {
    warn("createFormation");
    return createStubFormation();
  }

  static async deleteFormation(_id: string): Promise<void> {
    warn("deleteFormation");
  }
}
