const FALLBACK_SUPER_ADMIN_EMAIL = "justindepierro@gmail.com";

const envEmail =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    typeof import.meta.env.VITE_SUPER_ADMIN_EMAIL === "string" &&
    import.meta.env.VITE_SUPER_ADMIN_EMAIL.trim()) ||
  FALLBACK_SUPER_ADMIN_EMAIL;

export const SUPER_ADMIN_EMAIL_RAW = envEmail;
export const SUPER_ADMIN_EMAIL = envEmail.toLowerCase();

export function isSuperAdminEmail(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase() === SUPER_ADMIN_EMAIL);
}
