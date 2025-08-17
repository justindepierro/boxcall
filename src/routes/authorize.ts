import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";

// Types
export type AppRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
export type TeamMemberRole = Database["public"]["Tables"]["team_members"]["Row"]["role"];
export type SubscriptionTier = Database["public"]["Tables"]["teams"]["Row"]["subscription_tier"];

export function isRoleAllowed(
  userRole: AppRole | null | undefined,
  allowed: NonNullable<AppRole>[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as NonNullable<AppRole>);
}

export async function fetchTeamMembership(
  userId: string,
  teamId: string
): Promise<{ role: TeamMemberRole; status: "active" | "inactive" | "pending" | null } | null> {
  const { data, error } = await supabase
    .from("team_members")
    .select("role, status")
    .eq("user_id", userId)
    .eq("team_id", teamId)
    .single();
  if (error || !data) return null;
  return { role: data.role as TeamMemberRole, status: data.status };
}

export async function fetchTeamSubscription(
  teamId: string
): Promise<{ subscription_tier: SubscriptionTier; subscription_expires_at: string | null } | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("subscription_tier, subscription_expires_at")
    .eq("id", teamId)
    .single();
  if (error || !data) return null;
  return data;
}
