import { useCallback, type MutableRefObject } from "react";
import type { Formation } from "../../../types/formation";
import type { PersonnelConfiguration } from "../../../types/personnel";

type Args = {
  playbookId: string;
  selectedFormation: Formation | null;
  linkedFormation: Formation | null;
  formDataRef: MutableRefObject<Record<string, unknown>>;
  isPopulatingFieldsRef: MutableRefObject<boolean>;
  setAllFormations: (formations: Formation[]) => void;
  setAvailablePersonnel: (personnel: PersonnelConfiguration[]) => void;
  toast: any;
  selectedPersonnelIds: string[];
  category: string;
  formationType: string;
  runStrength: string;
  passStrength: string;
  tags: string[];
  description: string;
  applyToBothSides: boolean;
};

export function useFormationAutoSave(_args: Args) {
  // FormationService is currently archived; keep a no-op autosave to avoid runtime crashes.
  const autoSave = useCallback(async () => {}, []);

  return { autoSave };
}
