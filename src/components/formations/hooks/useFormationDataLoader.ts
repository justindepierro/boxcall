import { useCallback } from "react";
import { FormationService } from "../../../services/formationService";
import { PersonnelService } from "../../../services/personnelService";
import { useToast } from "../../../hooks/useToast";
import type { Formation } from "../../../types/formation";
import type { PersonnelConfiguration } from "../../../types/personnel";

type LoaderArgs = {
  playbookId: string;
  setLoading: (loading: boolean) => void;
  setAllFormations: (formations: Formation[]) => void;
  setAvailablePersonnel: (personnel: PersonnelConfiguration[]) => void;
};

export function useFormationDataLoader({
  playbookId,
  setLoading,
  setAllFormations,
  setAvailablePersonnel,
}: LoaderArgs) {
  const toast = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [formations, personnel] = await Promise.all([
        FormationService.getFormationsByPlaybook(playbookId),
        PersonnelService.getPersonnelConfigurations(playbookId),
      ]);

      setAllFormations(formations);
      setAvailablePersonnel(personnel);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message, "Failed to load formations");
    } finally {
      setLoading(false);
    }
  }, [playbookId, setAvailablePersonnel, setAllFormations, setLoading, toast]);

  return { loadData, toast };
}
