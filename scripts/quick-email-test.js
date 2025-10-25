import { Resend } from "resend";

const resend = new Resend("re_ZbfC3gyv_K9WHbXbruMDPko5DVGxP7z8v");

async function testEmail() {
  try {
    console.log("🧪 Testing Resend API connection...\n");

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "jdepierro@burkecatholic.org", // Resend account owner email
      subject: "BoxCall Email Service Test",
      html: "<h1>Success!</h1><p>Your Resend integration is working correctly.</p>",
    });

    if (result.data) {
      console.log("✅ Email sent successfully!");
      console.log("📧 Message ID:", result.data.id);
      console.log("\n🎉 Resend integration is working!");
      console.log("Check your inbox at jdepierro@burkecatholic.org");
    } else if (result.error) {
      console.error("❌ Error sending email:", result.error.message);
    }
  } catch (error) {
    console.error("❌ Exception:", error.message);
  }
}

testEmail();
