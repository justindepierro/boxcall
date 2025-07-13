// src/pages/reset/index.js
import { supabase } from "../../lib/supabase/client.js";
import { authCard } from "../../components/AuthCard.js";
import { showToast } from "../../../utils/toast.js";
import { initAuthState } from "../../state/authState.js";
import { navigateTo } from "../../routes/router.js";

export default function renderResetPage(container) {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.split("?")[1]);
  const type = params.get("type");

  if (type !== "recovery") {
    container.innerHTML = `<p class="text-red-500">Invalid or expired reset link.</p>`;
    return;
  }

  container.innerHTML = authCard(
    "Reset Password",
    `
    <form id="reset-form" class="space-y-4">
      <input type="password" id="new-password" placeholder="New Password" required class="w-full border p-2 rounded" />
      <input type="password" id="confirm-password" placeholder="Confirm Password" required class="w-full border p-2 rounded" />
      <button id="reset-btn" type="submit" class="w-full bg-green-600 text-white py-2 rounded">Update Password</button>
      <p id="reset-message" class="text-sm mt-2 text-blue-500"></p>
    </form>
  `,
    "Enter and confirm your new password below to complete your reset. You’ll be redirected once successful."
  );

  const form = document.getElementById("reset-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const msg = document.getElementById("reset-message");
    const btn = document.getElementById("reset-btn");

    msg.textContent = "";
    btn.disabled = true;
    btn.textContent = "Updating...";

    // 🚫 Basic validation
    if (newPassword.length < 6) {
      msg.textContent = "⚠️ Password must be at least 6 characters.";
      btn.disabled = false;
      btn.textContent = "Update Password";
      return;
    }

    if (newPassword !== confirmPassword) {
      msg.textContent = "⚠️ Passwords do not match.";
      btn.disabled = false;
      btn.textContent = "Update Password";
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      msg.textContent = `⚠️ ${error.message}`;
      showToast("Reset failed: " + error.message, "error");
    } else {
      await initAuthState(); // 🔐 Load new session
      msg.textContent = "✅ Password updated! Redirecting...";
      showToast("Password successfully reset.", "success");
      setTimeout(() => navigateTo("dashboard"), 2500); // 🚀 Auto-login
    }

    btn.disabled = false;
    btn.textContent = "Update Password";
  });
}
