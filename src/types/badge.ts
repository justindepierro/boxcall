export type BadgeColorScheme =
  | "jade"
  | "navy"
  | "blue"
  | "cyan"
  | "orange"
  | "purple"
  | "red"
  | "amber"
  | "pink"
  | "lime"
  | "indigo";

export const BADGE_COLOR_SCHEME_OPTIONS: Array<{
  value: BadgeColorScheme;
  label: string;
}> = [
  { value: "jade", label: "Jade" },
  { value: "navy", label: "Navy" },
  { value: "blue", label: "Blue" },
  { value: "cyan", label: "Cyan" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Purple" },
  { value: "red", label: "Red" },
  { value: "amber", label: "Amber" },
  { value: "pink", label: "Pink" },
  { value: "lime", label: "Lime" },
  { value: "indigo", label: "Indigo" },
];

export function isBadgeColorScheme(v: unknown): v is BadgeColorScheme {
  return (
    v === "jade" ||
    v === "navy" ||
    v === "blue" ||
    v === "cyan" ||
    v === "orange" ||
    v === "purple" ||
    v === "red" ||
    v === "amber" ||
    v === "pink" ||
    v === "lime" ||
    v === "indigo"
  );
}
