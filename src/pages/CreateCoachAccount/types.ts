/**
 * Types for CreateCoachAccount page
 */

export interface CoachAccountFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Coaching Information
  yearsExperience: string;
  primarySport: string;
  coachingLevel: string;

  // Team Connection (Optional)
  hasSchoolCode: boolean;
  schoolCode: string;
  schoolName: string;
  requestTeamLink: boolean;
}

export type CoachAccountStep =
  | "intro"
  | "personal-info"
  | "address-info"
  | "coaching-info"
  | "team-connection"
  | "payment"
  | "complete";

export interface StepDefinition {
  id: CoachAccountStep;
  title: string;
  description: string;
}

export interface StepProps {
  formData: CoachAccountFormData;
  onFormChange: (data: Partial<CoachAccountFormData>) => void;
}

export interface CompleteStepProps {
  firstName: string;
  onNavigateDashboard: () => void;
  onNavigatePlaybook: () => void;
}

export interface PaymentStepProps extends StepProps {
  isSuperAdmin: boolean;
}
