// src/pages/signup/index.js
import { signUp } from "../../auth/auth.js";
import { authCard } from "../../components/AuthCard.js";
import { showToast } from "../../utils/toast.js";
import { formatError } from "../../utils/errors.js";
import { navigateTo } from "../../routes/router.js";
import { initAuthState } from "../../state/authState.js";

export default function renderSignupPage(container) {
  container.innerHTML = authCard(
    "Sign Up",
    `
    <form id="signup-form" class="space-y-4">
      <input type="email" id="signup-email" placeholder="Email" required class="w-full border p-2 rounded" />
      <input type="password" id="signup-password" placeholder="Password" required class="w-full border p-2 rounded" />
      <button id="signup-btn" type="submit" class="w-full bg-green-600 text-white py-2 rounded">Sign Up</button>
      <p id="signup-message" class="text-sm mt-2 text-blue-500"></p>
    </form>
    <a href="#/login" class="text-sm text-blue-500 hover:underline block mt-2">Already have an account? Log in</a>
  `,
  );

  const form = document.getElementById("signup-form");
  form.addEventListener("submit", handleSignupSubmit);
}

async function handleSignupSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const btn = document.getElementById("signup-btn");
  const msg = document.getElementById("signup-message");

  msg.textContent = "";
  btn.disabled = true;
  btn.textContent = "Creating account...";

  const { error } = await signUp(email, password);

  if (error) {
    const formatted = formatError ? formatError(error) : error.message;
    msg.textContent = `⚠️ ${formatted}`;
    showToast("Signup failed: " + formatted, "error");
  } else {
    // ✅ Re-initialize auth state after signup (for confirmed users)
    await initAuthState();

    msg.textContent = `✅ Account created! Please check your email to confirm.`;
    showToast("Account created! Confirm your email.", "success");

    // Option 1: Send them to login page
    navigateTo("/login");

    // Option 2: If Supabase confirms user immediately, go to dashboard
    // navigateTo('/dashboard');
    const { user } = await signUp(email, password);
    if (user && user.confirmed_at) {
      await initAuthState();
      navigateTo("/dashboard");
    } else {
      navigateTo("/login");
    }
  }

  btn.disabled = false;
  btn.textContent = "Sign Up";
}
