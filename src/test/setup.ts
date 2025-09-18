// Global test setup for Vitest
// - Adds jest-dom matchers (e.g., toBeInTheDocument)
// - Can host other global test config/mocks later
import "@testing-library/jest-dom/vitest";
// Load global styles so getComputedStyle in JSDOM sees our Tailwind utilities and tokens
import "../index.css";

// --- Test Environment Hardening & Noise Reduction ---
// 1) Stub Supabase globally to prevent network/DB calls in unit tests
//    Individual tests can override with vi.mock again if needed.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vitest globals available in test runtime
vi.mock("../lib/supabase", () => {
  const fake = {
    auth: {
      getUser: async () => ({ data: { user: null } }),
    },
    from: (_table: string) => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            async single() {
              return { data: null, error: null } as const;
            },
          }),
          async single() {
            return { data: null, error: null } as const;
          },
        }),
      }),
    }),
  };
  return { supabase: fake };
});

// 2) Filter noisy console warnings/errors that are known and non-actionable in jsdom
//    Keep real errors visible.
const originalError = console.error;
const originalWarn = console.warn;

const NOISE_PATTERNS: RegExp[] = [
  /No `HydrateFallback` element provided to render during initial hydration/i,
  /The tag <(g|rect|circle|line|polygon|text|foreignObject)> is unrecognized/i,
  /<foreignObject \/> is using incorrect casing/i,
  /If you meant to render a React component, start its name with an uppercase letter\./i,
  /Error fetching helmet stickers:/i,
];

function isNoise(args: unknown[]): boolean {
  const msg = args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
    .join(" ");
  return NOISE_PATTERNS.some((rx) => rx.test(msg));
}

// console.error = (...args: unknown[]) => {
  if (isNoise(args)) return;
  originalError(...(args as []));
};

// console.warn = (...args: unknown[]) => {
  if (isNoise(args)) return;
  originalWarn(...(args as []));
};
