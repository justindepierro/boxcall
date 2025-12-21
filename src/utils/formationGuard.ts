import { table } from "../data/supabase/db";
import {
  validateFormationName,
  validatePersonnelValue,
} from "./playFieldValidation";

interface FormationGuardOptions {
  playbookId: string;
  formationId?: string | null;
  formationName?: string | null;
  personnel?: string | null;
  allowCustom?: boolean;
}

interface FormationGuardResult {
  formationId?: string;
  formationName?: string;
}

export async function ensureValidFormation({
  playbookId,
  formationId,
  formationName,
  personnel,
  allowCustom = true,
}: FormationGuardOptions): Promise<FormationGuardResult> {
  if (!playbookId) {
    throw new Error("A playbook is required to validate formation data.");
  }

  if (personnel) {
    const personnelCheck = validatePersonnelValue(personnel);
    if (!personnelCheck.isValid) {
      throw new Error(personnelCheck.error || "Invalid personnel value.");
    }
  }

  if (formationId) {
    const { data: formation, error } = await table("formations")
      .select("id, name, playbook_id")
      .eq("id", formationId)
      .single();

    if (error) {
      throw new Error(`Formation not found: ${error.message}`);
    }

    if (formation.playbook_id !== playbookId) {
      throw new Error("Selected formation belongs to a different playbook.");
    }
    return {
      formationId: formation.id,
      formationName: formation.name,
    };
  }

  const trimmedName = formationName?.trim();
  if (!trimmedName) {
    throw new Error("Please select or enter a formation.");
  }

  const formationCheck = validateFormationName(trimmedName);
  if (!formationCheck.isValid) {
    throw new Error(formationCheck.error || "Invalid formation name.");
  }

  if (!allowCustom) {
    const { data: formations, error } = await table("formations")
      .select("id, name")
      .eq("playbook_id", playbookId);

    if (error) {
      throw new Error(`Failed to fetch formations: ${error.message}`);
    }

    const match = formations?.find(
      (formation) =>
        formation.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (!match) {
      throw new Error(
        `Formation "${trimmedName}" is not in your catalogue. Select an existing formation or create one in the Formation Builder.`
      );
    }
    return {
      formationId: match.id,
      formationName: match.name,
    };
  }

  return {
    formationName: trimmedName,
  };
}
