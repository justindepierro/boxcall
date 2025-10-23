/**
 * Email Service - Handles all email sending via serverless function
 * 
 * Features:
 * - Player invitation emails
 * - Invitation reminder emails
 * - Error handling and retry logic
 * - Delivery logging
 * 
 * Note: Calls serverless function to avoid CORS issues with Resend API
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a generic email via serverless function
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const { to, subject, html, text } = params;
    
    console.log('[EmailService] Sending email via serverless function:', {
      to,
      subject,
    });

    // Call Netlify serverless function
    const response = await fetch('/.netlify/functions/send-invitation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text: text || stripHtml(html),
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('[EmailService] Error sending email:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to send email',
      };
    }

    console.log('[EmailService] Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('[EmailService] Exception sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a player invitation email
 */
export interface PlayerInvitationEmailParams {
  to: string;
  playerName: string;
  teamName: string;
  teamLogoUrl?: string;
  invitationLink: string;
  expiresAt: Date;
  invitedBy: string;
  teamId: string;
}

export async function sendPlayerInvitationEmail(
  params: PlayerInvitationEmailParams
): Promise<SendEmailResult> {
  const {
    to,
    playerName,
    teamName,
    teamLogoUrl,
    invitationLink,
    expiresAt,
    invitedBy,
  } = params;

  const expiresInDays = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const subject = `You're invited to join ${teamName} on BoxCall!`;

  const html = generateInvitationHtml({
    playerName,
    teamName,
    teamLogoUrl,
    invitationLink,
    expiresInDays,
    invitedBy,
  });

  const text = generateInvitationText({
    playerName,
    teamName,
    invitationLink,
    expiresInDays,
    invitedBy,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send an invitation reminder email
 */
export interface InvitationReminderEmailParams {
  to: string;
  playerName: string;
  teamName: string;
  teamLogoUrl?: string;
  invitationLink: string;
  expiresAt: Date;
}

export async function sendInvitationReminderEmail(
  params: InvitationReminderEmailParams
): Promise<SendEmailResult> {
  const {
    to,
    playerName,
    teamName,
    teamLogoUrl,
    invitationLink,
    expiresAt,
  } = params;

  const expiresInDays = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const subject = `Reminder: Join ${teamName} on BoxCall`;

  const html = generateReminderHtml({
    playerName,
    teamName,
    teamLogoUrl,
    invitationLink,
    expiresInDays,
  });

  const text = generateReminderText({
    playerName,
    teamName,
    invitationLink,
    expiresInDays,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Generate HTML for invitation email
 */
function generateInvitationHtml(params: {
  playerName: string;
  teamName: string;
  teamLogoUrl?: string;
  invitationLink: string;
  expiresInDays: number;
  invitedBy: string;
}): string {
  const { playerName, teamName, teamLogoUrl, invitationLink, expiresInDays, invitedBy } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ${teamName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              ${teamLogoUrl ? `
                <img src="${teamLogoUrl}" alt="${teamName}" style="max-width: 120px; max-height: 120px; border-radius: 12px; margin-bottom: 20px; border: 3px solid #ffffff;" />
              ` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">
                You're Invited!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi <strong>${playerName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                <strong>${invitedBy}</strong> has invited you to join <strong>${teamName}</strong> on BoxCall!
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                BoxCall is the all-in-one platform for managing your team. Track plays, view schedules, communicate with teammates, and more.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${invitationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px; color: #667eea; font-size: 13px; word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 3px solid #667eea;">
                ${invitationLink}
              </p>

              <!-- Expiration notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                      ⏰ <strong>This invitation expires in ${expiresInDays} day${expiresInDays !== 1 ? 's' : ''}.</strong>
                      <br>
                      Click the button above to accept and get started!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #6c757d; font-size: 13px; line-height: 1.5; text-align: center;">
                Questions? Contact your coach or visit our help center.
              </p>
              <p style="margin: 0; color: #adb5bd; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} BoxCall. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text for invitation email
 */
function generateInvitationText(params: {
  playerName: string;
  teamName: string;
  invitationLink: string;
  expiresInDays: number;
  invitedBy: string;
}): string {
  const { playerName, teamName, invitationLink, expiresInDays, invitedBy } = params;

  return `
You're Invited to ${teamName}!

Hi ${playerName},

${invitedBy} has invited you to join ${teamName} on BoxCall!

BoxCall is the all-in-one platform for managing your team. Track plays, view schedules, communicate with teammates, and more.

Accept your invitation:
${invitationLink}

⏰ This invitation expires in ${expiresInDays} day${expiresInDays !== 1 ? 's' : ''}. Click the link above to accept and get started!

Questions? Contact your coach or visit our help center.

© ${new Date().getFullYear()} BoxCall. All rights reserved.
  `.trim();
}

/**
 * Generate HTML for reminder email
 */
function generateReminderHtml(params: {
  playerName: string;
  teamName: string;
  teamLogoUrl?: string;
  invitationLink: string;
  expiresInDays: number;
}): string {
  const { playerName, teamName, teamLogoUrl, invitationLink, expiresInDays } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: Join ${teamName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td align="center" style="padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              ${teamLogoUrl ? `
                <img src="${teamLogoUrl}" alt="${teamName}" style="max-width: 120px; max-height: 120px; border-radius: 12px; margin-bottom: 20px; border: 3px solid #ffffff;" />
              ` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">
                Reminder: Join Your Team
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi <strong>${playerName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                This is a friendly reminder that you have a pending invitation to join <strong>${teamName}</strong> on BoxCall.
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                Don't miss out! Accept your invitation to access your team's plays, schedule, and more.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${invitationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                      ⏰ <strong>Expires in ${expiresInDays} day${expiresInDays !== 1 ? 's' : ''}!</strong>
                      <br>
                      Click the button above before your invitation expires.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #6c757d; font-size: 13px; line-height: 1.5; text-align: center;">
                Questions? Contact your coach or visit our help center.
              </p>
              <p style="margin: 0; color: #adb5bd; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} BoxCall. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text for reminder email
 */
function generateReminderText(params: {
  playerName: string;
  teamName: string;
  invitationLink: string;
  expiresInDays: number;
}): string {
  const { playerName, teamName, invitationLink, expiresInDays } = params;

  return `
Reminder: Join ${teamName}

Hi ${playerName},

This is a friendly reminder that you have a pending invitation to join ${teamName} on BoxCall.

Don't miss out! Accept your invitation to access your team's plays, schedule, and more.

Accept your invitation:
${invitationLink}

⏰ Expires in ${expiresInDays} day${expiresInDays !== 1 ? 's' : ''}! Click the link above before your invitation expires.

Questions? Contact your coach or visit our help center.

© ${new Date().getFullYear()} BoxCall. All rights reserved.
  `.trim();
}

/**
 * Strip HTML tags for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
