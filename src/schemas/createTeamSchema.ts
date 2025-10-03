import { z } from "zod";

export const createTeamSchema = z.object({
  teamName: z.string().min(1, "Team mascot is required"),
  sport: z.string().min(1, "Sport is required"),
  season: z.string().min(1),

  schoolName: z.string().min(1, "School name is required"),
  schoolDistrict: z.string().optional(),
  schoolAddress: z.string().optional(),
  schoolCity: z.string().optional(),
  schoolState: z.string().optional(),
  schoolZip: z.string().optional(),

  ownerName: z.string().min(1, "Team owner name is required"),
  ownerEmail: z.string().email("Owner email must be valid"),
  ownerPhone: z.string().optional(),
  ownerRole: z.string().min(1),

  coachName: z.string().optional(),
  coachEmail: z.string().email().optional(),
  coachPhone: z.string().optional(),

  fallbackName: z.string().optional(),
  fallbackEmail: z.string().email().optional(),
  fallbackPhone: z.string().optional(),
  fallbackRole: z.string().optional(),

  expectedPlayerCount: z.number().int().min(0).max(200).optional(),
  coachingStaffCount: z.number().int().min(0).max(50).optional(),

  subscriptionTier: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export type CreateTeamForm = z.infer<typeof createTeamSchema>;
