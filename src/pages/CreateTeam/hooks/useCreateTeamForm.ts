import { useState } from "react";
import type { TeamFormData } from "../types";

const initialForm: TeamFormData = {
  teamName: "",
  sport: "Football",
  season: "",
  schoolName: "",
  schoolDistrict: "",
  schoolAddress: "",
  schoolCity: "",
  schoolState: "",
  schoolZip: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerRole: "Head Coach",
  coachName: "",
  coachEmail: "",
  coachPhone: "",
  fallbackName: "",
  fallbackEmail: "",
  fallbackPhone: "",
  fallbackRole: "Assistant Coach",
  expectedPlayerCount: 25,
  coachingStaffCount: 3,
  subscriptionTier: "team-basic",
  paymentMethod: "",
};

export function useCreateTeamForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<TeamFormData>(initialForm);

  const goToNextStep = () => setStep((s) => s + 1);
  const goToPrevStep = () => setStep((s) => Math.max(0, s - 1));
  const updateField = (field: keyof TeamFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return { step, formData, goToNextStep, goToPrevStep, updateField };
}
