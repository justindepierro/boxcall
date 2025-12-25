export type LeftRight = "left" | "right";

export type FormationDirectionVariant = LeftRight | "base" | null | undefined;

export type DirectionDisplayFormat = "full" | "abbrev" | "letter";

export function parseLeftRight(
  value: string | null | undefined
): LeftRight | null {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return null;

  if (v === "l" || v === "lt" || v === "left") return "left";
  if (v === "r" || v === "rt" || v === "right") return "right";

  return null;
}

export function leftRightToLegacyValue(
  dir: LeftRight | null | undefined
): "LEFT" | "RIGHT" | "" {
  if (dir === "left") return "LEFT";
  if (dir === "right") return "RIGHT";
  return "";
}

export function legacyValueToLeftRight(
  value: string | null | undefined
): LeftRight | null {
  return parseLeftRight(value);
}

export function getFormationDirSelectValue(play: {
  f_dir?: string | null;
  formation_direction?: FormationDirectionVariant;
}): "" | "LEFT" | "RIGHT" {
  const legacy = legacyValueToLeftRight(play.f_dir);
  if (legacy) return leftRightToLegacyValue(legacy);

  const variant = legacyValueToLeftRight(
    typeof play.formation_direction === "string" ? play.formation_direction : ""
  );
  return leftRightToLegacyValue(variant);
}

export function formatLeftRight(
  dir: LeftRight | null | undefined,
  format: DirectionDisplayFormat = "full"
): string {
  if (!dir) return "";

  switch (format) {
    case "full":
      return dir === "left" ? "Left" : "Right";
    case "abbrev":
      return dir === "left" ? "Lt" : "Rt";
    case "letter":
      return dir === "left" ? "L" : "R";
    default:
      return dir === "left" ? "Left" : "Right";
  }
}

export function getFormationDirDisplayLabel(
  play: {
    f_dir?: string | null;
    formation_direction?: FormationDirectionVariant;
  },
  format: DirectionDisplayFormat = "full"
): string {
  const legacy = legacyValueToLeftRight(play.f_dir);
  if (legacy) return formatLeftRight(legacy, format);

  const variant = legacyValueToLeftRight(
    typeof play.formation_direction === "string" ? play.formation_direction : ""
  );
  return formatLeftRight(variant, format);
}
