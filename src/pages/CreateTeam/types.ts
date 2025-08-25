// Shared types for CreateTeam workflow

export interface TeamFormData {
  // Basic Team Info
  teamName: string;
  sport: string;
  season: string;

  // School Information
  schoolName: string;
  schoolDistrict: string;
  schoolAddress: string;
  schoolCity: string;
  schoolState: string;
  schoolZip: string;

  // Team Owner Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerRole: string;

  // Head Coach Information
  coachName: string;
  coachEmail: string;
  coachPhone: string;

  // Fallback/Emergency Contact
  fallbackName: string;
  fallbackEmail: string;
  fallbackPhone: string;
  fallbackRole: string;

  // Team Details
  expectedPlayerCount: number;
  coachingStaffCount: number;

  // Payment (Future)
  subscriptionTier: string;
  paymentMethod: string;
}
