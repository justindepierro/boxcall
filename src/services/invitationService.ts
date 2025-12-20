/**
 * Player Invitation Service
 *
 * Handles sending invitations to players to join a team.
 * Currently uses placeholder email logging until email service is integrated.
 *
 * @version 1.1.0 - Security improvements
 * - Email validation
 * - Rate limiting
 * - Token expiration
 * - Atomic acceptance via RPC
 */

import { supabase } from "../lib/supabase";
import { info, error as logError } from "../utils/logger";
import { getCurrentUserId } from "../lib/auth-helpers";
import { createSameOriginRedirectTo } from "../utils/redirectUtils";
import {
  sendPlayerInvitationEmail,
  sendInvitationReminderEmail,
} from "./email/emailService";
import {
  serviceFail,
  serviceOk,
} from "./serviceResult";

export interface SendInvitationParams {
  playerId: string;
  email: string;
  playerName: string;
  teamName: string;
  invitedBy: string;
  teamId: string;
}

export interface InvitationResult {
  success: boolean;
  message: string;
  invitationToken?: string;
}

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Check rate limit for invitation sends
 * Max 3 attempts per email per team per 24 hours
 */
async function checkRateLimit(
  teamId: string,
  email: string
): Promise<{ allowed: boolean; message?: string }> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("invitation_attempts")
      .select("id")
      .eq("team_id", teamId)
      .eq("email", email.toLowerCase())
      .gt("attempted_at", oneDayAgo);

    if (error) {
      logError("[invitationService] Rate limit check failed:", error);
      return { allowed: true }; // Fail open on error
    }

    const attemptCount = data?.length || 0;

    if (attemptCount >= 3) {
      return {
        allowed: false,
        message:
          "Too many invitation attempts for this email. Please wait 24 hours and try again.",
      };
    }

    return { allowed: true };
  } catch (err) {
    logError("[invitationService] Rate limit check error:", err);
    return { allowed: true }; // Fail open on error
  }
}

/**
 * Log invitation attempt for rate limiting and audit
 */
async function logInvitationAttempt(
  teamId: string,
  playerId: string,
  email: string,
  success: boolean
): Promise<void> {
  try {
    // Use cached user ID for bulletproof performance
    const userId = getCurrentUserId();

    await supabase.from("invitation_attempts").insert({
      team_id: teamId,
      player_id: playerId,
      email: email.toLowerCase(),
      attempted_by: userId,
      success,
      attempted_at: new Date().toISOString(),
    });
  } catch (err) {
    logError("[invitationService] Failed to log invitation attempt:", err);
    // Don't throw - logging failure shouldn't block invitation
  }
}

/**
 * Send invitation to a player
 *
 * MVP Implementation: Logs invitation details and updates database
 * Future: Integrate with email service (Resend, SendGrid, etc.)
 *
 * Security features:
 * - Email validation
 * - Rate limiting (3 per email per 24h)
 * - Token expiration (7 days)
 * - Audit logging
 */
type SendInvitationErrorCode =
  | "invalid_email"
  | "rate_limit"
  | "supabase_error"
  | "email_failed"
  | "exception";

type SendInvitationData = {
  invitationToken: string;
};

export async function sendPlayerInvitation(params: SendInvitationParams) {
  const { playerId, email, playerName, teamName, invitedBy, teamId } = params;

  try {
    info(`[invitationService] Sending invitation to ${playerName} (${email})`);

    // Validate email format
    if (!isValidEmail(email)) {
      await logInvitationAttempt(teamId, playerId, email, false);
      return serviceFail<SendInvitationData, SendInvitationErrorCode>(
        "invalid_email",
        "Invalid email address format"
      );
    }

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(teamId, email);
    if (!rateLimitCheck.allowed) {
      await logInvitationAttempt(teamId, playerId, email, false);
      return serviceFail<SendInvitationData, SendInvitationErrorCode>(
        "rate_limit",
        rateLimitCheck.message ||
          "Too many invitation attempts. Please try again later."
      );
    }

    // Get current user for tracking
    // Use cached user ID for bulletproof performance
    const userId = getCurrentUserId();

    // Update player record with invitation status
    // Using .from() with explicit any cast for fields not yet in types
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const updateData: Record<string, any> = {
      invitation_status: "pending",
      invitation_sent_at: new Date().toISOString(),
      invitation_expires_at: expirationDate.toISOString(),
      invited_by: userId,
    };

    const { data, error } = await (supabase.from("team_players") as any)
      .update(updateData)
      .eq("id", playerId)
      .select("invitation_token")
      .single();

    if (error) {
      logError(
        "[invitationService] Failed to update invitation status:",
        error
      );
      await logInvitationAttempt(teamId, playerId, email, false);
      return serviceFail<SendInvitationData, SendInvitationErrorCode>(
        "supabase_error",
        "Failed to update invitation status"
      );
    }

    const invitationToken = data?.invitation_token;

    // Generate invitation URL
    const invitationPath = `/invite/accept?token=${encodeURIComponent(
      invitationToken
    )}`;
    const invitationUrl = createSameOriginRedirectTo(invitationPath);

    // Send email via Resend
    // Note: Team logo support can be added later when logo_url column exists
    const emailResult = await sendPlayerInvitationEmail({
      to: email,
      playerName,
      teamName,
      teamLogoUrl: undefined, // TODO: Add when teams.logo_url column is added
      invitationLink: invitationUrl,
      expiresAt: expirationDate,
      invitedBy,
      teamId,
    });

    if (!emailResult.success) {
      logError(
        "[invitationService] Email delivery failed:",
        emailResult.error.message
      );

      // Update status to failed but don't throw - player is still in system
      await (supabase.from("team_players") as any)
        .update({ invitation_status: "failed" })
        .eq("id", playerId);

      await logInvitationAttempt(teamId, playerId, email, false);

      return serviceFail<SendInvitationData, SendInvitationErrorCode>(
        "email_failed",
        `Failed to send email: ${emailResult.error.message}`
      );
    }

    info(
      `[invitationService] Invitation email sent successfully to ${email} (Message ID: ${emailResult.data.messageId})`
    );

    // Log successful attempt
    await logInvitationAttempt(teamId, playerId, email, true);

    return serviceOk({
      invitationToken,
    });
  } catch (err) {
    logError("[invitationService] Failed to send invitation:", err);
    await logInvitationAttempt(teamId, playerId, email, false);
    return serviceFail<SendInvitationData, SendInvitationErrorCode>(
      "exception",
      err instanceof Error ? err.message : "Failed to send invitation"
    );
  }
}

/**
 * Resend invitation to a player
 * Regenerates token for security
 */
type ResendInvitationErrorCode =
  | "no_email"
  | "supabase_error"
  | "email_failed"
  | "exception";

type ResendInvitationData = {
  invitationToken: string;
};

export async function resendPlayerInvitation(
  playerId: string,
  email: string,
  playerName: string,
  teamName: string,
  _invitedBy: string,
  teamId: string
) {
  if (!email) {
    return serviceFail<ResendInvitationData, ResendInvitationErrorCode>(
      "no_email",
      "Player has no email address"
    );
  }

  try {
    // Regenerate token for security
    const newToken = crypto.randomUUID();
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Use cached user ID for bulletproof performance
    const userId = getCurrentUserId();

    const updateData: Record<string, any> = {
      invitation_token: newToken,
      invitation_status: "pending",
      invitation_sent_at: new Date().toISOString(),
      invitation_expires_at: expirationDate.toISOString(),
      invited_by: userId,
    };

    const { error } = await (supabase.from("team_players") as any)
      .update(updateData)
      .eq("id", playerId);

    if (error) {
      return serviceFail<ResendInvitationData, ResendInvitationErrorCode>(
        "supabase_error",
        "Failed to update invitation status"
      );
    }

    // Generate invitation URL with new token
    const invitationPath = `/invite/accept?token=${encodeURIComponent(newToken)}`;
    const invitationUrl = createSameOriginRedirectTo(invitationPath);

    // Send reminder email (different template)
    const emailResult = await sendInvitationReminderEmail({
      to: email,
      playerName,
      teamName,
      teamLogoUrl: undefined, // TODO: Add when teams.logo_url column is added
      invitationLink: invitationUrl,
      expiresAt: expirationDate,
    });

    if (!emailResult.success) {
      logError(
        "[invitationService] Reminder email failed:",
        emailResult.error.message
      );
      return serviceFail<ResendInvitationData, ResendInvitationErrorCode>(
        "email_failed",
        `Failed to send reminder: ${emailResult.error.message}`
      );
    }

    info(
      `[invitationService] Reminder email sent to ${email} (Message ID: ${emailResult.data.messageId})`
    );

    await logInvitationAttempt(teamId, playerId, email, true);

    return serviceOk({
      invitationToken: newToken,
    });
  } catch (err) {
    logError("[invitationService] Failed to resend invitation:", err);
    return serviceFail<ResendInvitationData, ResendInvitationErrorCode>(
      "exception",
      "Failed to resend invitation"
    );
  }
}

/**
 * Get invitation by token (for acceptance flow)
 * Checks expiration and validates status
 */
export async function getInvitationByToken(token: string) {
  type InvitationLookupErrorCode =
    | "not_found"
    | "expired"
    | "invalid_status"
    | "supabase_error";

  type InvitationLookupData = {
    id: string;
    team_id: string;
    first_name: string;
    last_name: string;
    invitation_expires_at: string;
    invitation_status: string;
    user_id?: string | null;
  };

  const { data, error } = await supabase
    .from("team_players")
    .select(
      "id, team_id, first_name, last_name, invitation_expires_at, invitation_status, user_id"
    )
    .eq("invitation_token", token)
    .single();

  if (error) {
    const message =
      error.code === "PGRST116"
        ? "Invitation not found"
        : "Failed to load invitation";
    return serviceFail<InvitationLookupData, InvitationLookupErrorCode>(
      error.code === "PGRST116" ? "not_found" : "supabase_error",
      message
    );
  }

  if (!data) {
    return serviceFail<InvitationLookupData, InvitationLookupErrorCode>(
      "not_found",
      "Invitation not found"
    );
  }

  const invitationData = data as InvitationLookupData;

  // If already accepted, return the data so the UI can show the proper state.
  if (invitationData.invitation_status === "accepted") {
    return serviceOk(invitationData);
  }

  // Only pending invitations can be accepted.
  if (invitationData.invitation_status !== "pending") {
    return serviceFail<InvitationLookupData, InvitationLookupErrorCode>(
      "invalid_status",
      "Invitation is not pending"
    );
  }

  // Check if expired
  if (
    invitationData.invitation_expires_at &&
    new Date(invitationData.invitation_expires_at) <= new Date()
  ) {
    // Mark as expired (best-effort)
    try {
      await (supabase.from("team_players") as any)
        .update({ invitation_status: "expired" })
        .eq("invitation_token", token);
    } catch {
      // ignore
    }

    return serviceFail<InvitationLookupData, InvitationLookupErrorCode>(
      "expired",
      "Invitation expired"
    );
  }

  return serviceOk(invitationData);
}

type AcceptInvitationErrorCode =
  | "rpc_error"
  | "already_member"
  | "unknown"
  | "exception";

type AcceptInvitationData = {
  teamId: string;
  playerName: string;
  alreadyMember: boolean;
};

/**
 * Accept invitation (for acceptance flow)
 * Uses atomic RPC function for data integrity
 * Creates team_members record automatically
 */
export async function acceptInvitation(
  token: string,
  userId: string
) {
  try {
    info(`[invitationService] Accepting invitation for user ${userId}`);

    // Call atomic RPC function
    const { data, error } = await supabase.rpc("accept_player_invitation", {
      p_token: token,
      p_user_id: userId,
    });

    if (error) {
      logError("[invitationService] RPC error:", error);
      return serviceFail<AcceptInvitationData, AcceptInvitationErrorCode>(
        "rpc_error",
        "Failed to accept invitation"
      );
    }

    // Parse response
    const result = data as {
      success: boolean;
      error?: string;
      message?: string;
      team_id?: string;
      player_name?: string;
      already_member?: boolean;
    };

    if (!result.success) {
      const code =
        result.error === "already_member" ? "already_member" : "unknown";
      return serviceFail<AcceptInvitationData, AcceptInvitationErrorCode>(
        code,
        result.message || "Failed to accept invitation"
      );
    }

    info(
      `[invitationService] Invitation accepted successfully for ${result.player_name}`
    );

    return serviceOk({
      teamId: result.team_id || "",
      playerName: result.player_name || "",
      alreadyMember: result.already_member || false,
    });
  } catch (err) {
    logError("[invitationService] Error accepting invitation:", err);
    return serviceFail<AcceptInvitationData, AcceptInvitationErrorCode>(
      "exception",
      "An unexpected error occurred"
    );
  }
}
