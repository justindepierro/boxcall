import { useCallback, useRef, useState } from "react";
import type { Formation } from "../../../types/formation";
import type { PersonnelConfiguration } from "../../../types/personnel";

type FormationBuilderTab = "details" | "diagnostic" | "review" | "incomplete";

export function useFormationBuilderState() {
  const [activeTab, setActiveTab] = useState<FormationBuilderTab>("details");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [availablePersonnel, setAvailablePersonnel] = useState<
    PersonnelConfiguration[]
  >([]);

  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );

  const [formationForOpposite, setFormationForOpposite] =
    useState<Formation | null>(null);
  const [showOppositeModal, setShowOppositeModal] = useState(false);

  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(
    []
  );

  const [category, setCategory] = useState<string>("");
  const [formationType, setFormationType] = useState<string>("");
  const [runStrength, setRunStrength] = useState<string>("");
  const [passStrength, setPassStrength] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [applyToBothSides, setApplyToBothSides] = useState<boolean>(true);

  // Used by the panel + autosave hook; keep the same API even if we no-op autosave.
  const formDataRef = useRef<Record<string, unknown>>({});
  const isPopulatingFieldsRef = useRef<boolean>(false);

  const resetForm = useCallback(() => {
    setSelectedFormation(null);
    setSelectedPersonnelIds([]);
    setCategory("");
    setFormationType("");
    setRunStrength("");
    setPassStrength("");
    setTags([]);
    setDescription("");
    setApplyToBothSides(true);
    formDataRef.current = {};
  }, []);

  return {
    activeTab,
    setActiveTab,
    loading,
    setLoading,
    saving,
    setSaving,
    allFormations,
    setAllFormations,
    availablePersonnel,
    setAvailablePersonnel,
    selectedFormation,
    setSelectedFormation,
    formationForOpposite,
    setFormationForOpposite,
    showOppositeModal,
    setShowOppositeModal,
    selectedPersonnelIds,
    setSelectedPersonnelIds,
    category,
    setCategory,
    formationType,
    setFormationType,
    runStrength,
    setRunStrength,
    passStrength,
    setPassStrength,
    tags,
    setTags,
    description,
    setDescription,
    applyToBothSides,
    setApplyToBothSides,
    formDataRef,
    isPopulatingFieldsRef,
    resetForm,
  };
}
