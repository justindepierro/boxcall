/**
 * Player Invitation Service
 * 
 * Handles sending invitations to players to join a team.
 * Currently uses placeholder email (console.log) until email service is integrated.
 * 
 * @version 1.0.0 - MVP
 */

import { supabase } from "../lib/supabase";
import { info, error as logError } from "../utils/logger";

export interface SendInvitationParams {
  playerId: string;
  email: string;
  playerName: string;
  teamName: string;
  invitedBy: string;
}

export interface InvitationResult {
  success: boolean;
  message: string;
  invitationToken?: string;
}

/**
 * Send invitation to a player
 * 
 * MVP Implementation: Logs invitation details and updates database
 * Future: Integrate with email service (Resend, SendGrid, etc.)
 */
export async function sendPlayerInvitation(
  params: SendInvitationParams
): Promise<InvitationResult> {
  const { playerId, email, playerName, teamName, invitedBy } = params;

  try {
    info(`[invitationService] Sending invitation to ${playerName} (${email})`);

    // Update player record with invitation status
    // Using .from() with explicit any cast for fields not yet in types
    const updateData: Record<string, any> = {
      invitation_status: "pending",
      invitation_sent_at: new Date().toISOString(),
    };
    
    const { data, error } = await (supabase
      .from("team_players") as any)
      .update(updateData)
      .eq("id", playerId)
      .select("invitation_token")
      .single();

    if (error) {
      logError("[invitationService] Failed to update invitation status:", error);
      throw error;
    }

    const invitationToken = data?.invitation_token;

    // Generate invitation URL
    const invitationUrl = `${window.location.origin}/invite/accept?token=${invitationToken}`;

    // === MVP: Placeholder Email Logic ===
    // TODO: Replace with real email service integration
    console.log("📧 ============ INVITATION EMAIL ============");
    console.log(`To: ${email}`);
    console.log(`Subject: You're invited to join ${teamName}!`);
    console.log("");
    console.log(`Hi ${playerName},`);
    console.log("");
    console.log(`You've been invited to join ${teamName} on BoxCall!`);
    console.log("");
    console.log(`Click the link below to accept:`);
    console.log(invitationUrl);
    console.log("");
    console.log(`If you don't have an account, you'll be able to create one.`);
    console.log("");
    console.log(`Invited by: ${invitedBy}`);
    console.log("============================================");
    
    // Optional: Open mailto link as fallback
    // const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(`Join ${teamName} on BoxCall`)}&body=${encodeURIComponent(invitationUrl)}`;
    // window.open(mailtoLink, '_blank');

    info(`[invitationService] Invitation sent successfully to ${email}`);

    return {
      success: true,
      message: `Invitation sent to ${email}`,
      invitationToken,
    };
  } catch (err) {
    logError("[invitationService] Failed to send invitation:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to send invitation",
    };
  }
}

/**
 * Resend invitation to a player
 */
export async function resendPlayerInvitation(
  playerId: string,
  email: string,
  playerName: string,
  teamName: string,
  invitedBy: string
): Promise<InvitationResult> {
  if (!email) {
    return {
      success: false,
      message: "Player has no email address",
    };
  }

  return sendPlayerInvitation({
    playerId,
    email,
    playerName,
    teamName,
    invitedBy,
  });
}

/**
 * Get invitation by token (for acceptance flow)
 * Future implementation when building acceptance page
 */
export async function getInvitationByToken(token: string) {
  const { data, error } = await supabase
    .from("team_players")
    .select("*")
    .eq("invitation_token", token)
    .eq("invitation_status", "pending")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Accept invitation (for acceptance flow)
 * Future implementation when building acceptance page
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<boolean> {
  try {
    const updateData: Record<string, any> = {
      invitation_status: "accepted",
      invitation_accepted_at: new Date().toISOString(),
      user_id: userId,
    };

    const { error } = await (supabase
      .from("team_players") as any)
      .update(updateData)
      .eq("invitation_token", token)
      .eq("invitation_status", "pending");

    if (error) {
      logError("[invitationService] Failed to accept invitation:", error);
      return false;
    }

    return true;
  } catch (err) {
    logError("[invitationService] Error accepting invitation:", err);
    return false;
  }
}
