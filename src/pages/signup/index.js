// src/pages/signup/index.js
import { signUp } from '../../auth/auth.js'
import { authCard } from '../../lib/authCard.js'

export default function renderSignupPage(container) {
  container.innerHTML = authCard('Sign Up', `
    <form id="signup-form" class="space-y-4">
      <input type="email" id="signup-email" placeholder="Email" required class="w-full border p-2 rounded" />
      <input type="password" id="signup-password" placeholder="Password" required class="w-full border p-2 rounded" />
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded">Sign Up</button>
      <p id="signup-message" class="text-sm mt-2 text-blue-500"></p>
    </form>
  `)

  const form = document.getElementById('signup-form')
  const message = document.getElementById('signup-message')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('signup-email').value.trim()
    const password = document.getElementById('signup-password').value

    const { error } = await signUp(email, password)

    if (error) {
      message.textContent = `⚠️ ${error.message}`
    } else {
      message.textContent = `✅ Check your email to confirm your account.`
    }
  })
}