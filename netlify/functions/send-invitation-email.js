/**
 * Netlify Function: Send Invitation Email
 *
 * This serverless function handles sending invitation emails via Resend API
 * to avoid CORS issues and keep API keys secure.
 */

const { Resend } = require("resend");

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { to, subject, html, text } = JSON.parse(event.body);

    // Validate required fields
    if (!to || !subject || !html) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields: to, subject, html",
        }),
      };
    }

    const fromEmail =
      process.env.VITE_RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const fromName = process.env.VITE_RESEND_FROM_NAME || "BoxCall";

    console.log("[SendInvitationEmail] Sending email:", {
      to,
      subject,
      from: `${fromName} <${fromEmail}>`,
    });

    // Send email via Resend
    const response = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });

    if (response.error) {
      console.error("[SendInvitationEmail] Error:", response.error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: response.error.message,
        }),
      };
    }

    console.log("[SendInvitationEmail] Success:", response.data?.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: response.data?.id,
      }),
    };
  } catch (error) {
    console.error("[SendInvitationEmail] Exception:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || "Failed to send email",
      }),
    };
  }
};

/**
 * Simple HTML tag stripper for plain text fallback
 */
function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
