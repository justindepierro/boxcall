import { FormationService } from "../services/formationService";
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
    const formation = await FormationService.getFormationById(formationId);
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
    const formations = await FormationService.getFormationsByPlaybook(
      playbookId
    );
    const match = formations.find(
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

