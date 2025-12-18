import { useCallback } from "react";
import type { Formation } from "../../../types/formation";
import type { PersonnelConfiguration } from "../../../types/personnel";

type Args = {
  playbookId: string;
  selectedFormation: Formation | null;
  linkedFormation: Formation | null;
  onFormationUpdated?: (formation: Formation) => void;
  selectedPersonnelIds: string[];
  category: string;
  formationType: string;
  runStrength: string;
  passStrength: string;
  tags: string[];
  description: string;
  applyToBothSides: boolean;
  setSaving: (saving: boolean) => void;
  setAllFormations: (formations: Formation[]) => void;
  setAvailablePersonnel: (personnel: PersonnelConfiguration[]) => void;
  setSelectedFormation: (formation: Formation | null) => void;
  setFormationForOpposite: (formation: Formation | null) => void;
  setShowOppositeModal: (open: boolean) => void;
  setCategory: (value: string) => void;
  setFormationType: (value: string) => void;
  setRunStrength: (value: string) => void;
  setPassStrength: (value: string) => void;
  setTags: (value: string[]) => void;
  setDescription: (value: string) => void;
  setSelectedPersonnelIds: (value: string[]) => void;
};

export function useFormationOperations({
  setSaving,
  toast,
}: Args & { toast: any }) {
  const handleCreateFromTemplate = useCallback(async () => {
    toast?.info?.(
      "FormationService is currently archived.",
      "Formation templates are not available"
    );
  }, [toast]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      toast?.error?.(
        "FormationService is currently archived.",
        "Saving formations is not available"
      );
    } finally {
      setSaving(false);
    }
  }, [setSaving, toast]);

  const togglePersonnel = useCallback((personnelId: string) => {
    // Component-level handler will keep its own list; no-op here.
    void personnelId;
  }, []);

  return { handleCreateFromTemplate, handleSave, togglePersonnel };
}
