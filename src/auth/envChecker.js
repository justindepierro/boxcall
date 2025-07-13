// src/auth/envChecker.js

export function checkEnv(requiredKeys = []) {
  const env = import.meta.env;
  const missing = requiredKeys.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing env variables: ${missing.join(", ")}`);
    throw new Error("Supabase env vars are not defined!");
  }

  const result = {};
  requiredKeys.forEach((key) => {
    result[key] = env[key];
  });

  console.log("✅ Supabase env loaded");
  return result;
}
