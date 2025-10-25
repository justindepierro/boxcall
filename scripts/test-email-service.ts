/**
 * Test Email Service Integration
 *
 * Quick test to verify Resend API is working correctly
 * Run with: npm run dev (in separate terminal) then run this script
 */

import {
  sendEmail,
  sendPlayerInvitationEmail,
} from "../src/services/email/emailService";

async function testEmailService() {
  console.log("🧪 Testing Email Service Integration\n");

  // Test 1: Simple email
  console.log("Test 1: Sending simple test email...");
  const result1 = await sendEmail({
    to: "justindepierro@gmail.com", // Replace with your email for testing
    subject: "BoxCall Email Service Test",
    html: "<h1>Email Service Working!</h1><p>Your Resend integration is configured correctly.</p>",
  });

  if (result1.success) {
    console.log("✅ Test 1 PASSED - Message ID:", result1.messageId);
  } else {
    console.log("❌ Test 1 FAILED -", result1.error);
  }

  console.log("\n---\n");

  // Test 2: Player invitation email
  console.log("Test 2: Sending player invitation email...");
  const result2 = await sendPlayerInvitationEmail({
    to: "justindepierro@gmail.com", // Replace with your email for testing
    playerName: "Test Player",
    teamName: "Test Football Team",
    invitationLink: "https://boxcall.com/invite/accept?token=test-token-123",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    invitedBy: "Coach Smith",
    teamId: "test-team-id",
  });

  if (result2.success) {
    console.log("✅ Test 2 PASSED - Message ID:", result2.messageId);
  } else {
    console.log("❌ Test 2 FAILED -", result2.error);
  }

  console.log("\n🎉 Email service testing complete!");
  console.log("Check your inbox for the test emails.");
}

// Run tests
testEmailService().catch(console.error);
