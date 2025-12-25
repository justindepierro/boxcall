import type {
  FieldZoneDefinition,
  SituationDefinitions,
} from "../types/situationDefinitions";
import { DEFAULT_SITUATION_DEFINITIONS } from "../types/situationDefinitions";
import type { SituationBadgeTone } from "../types/situationDefinitions";
import type { BadgeColorScheme } from "../types/badge";

export type FieldZoneKey = string;

export type DistanceBucketKey =
  | "short"
  | "medium"
  | "long"
  | "very_long"
  | "unknown";

const LEGACY_ZONE_LABELS: Record<
  "backed_up" | "open_field" | "plus_territory" | "red_zone" | "goal_line",
  string
> = {
  backed_up: "Backed Up",
  open_field: "Open Field",
  plus_territory: "Plus Territory",
  red_zone: "Red Zone",
  goal_line: "Goal Line",
};

const LEGACY_ZONE_TONES: Record<
  "backed_up" | "open_field" | "plus_territory" | "red_zone" | "goal_line",
  SituationBadgeTone
> = {
  backed_up: "info",
  open_field: "neutral",
  plus_territory: "success",
  red_zone: "warning",
  goal_line: "danger",
};

const DEFAULT_ZONE_SCHEMES: Record<
  "backed_up" | "open_field" | "plus_territory" | "red_zone" | "goal_line",
  BadgeColorScheme
> = {
  backed_up: "blue",
  open_field: "navy",
  plus_territory: "jade",
  red_zone: "orange",
  goal_line: "red",
};

const DEFAULT_DISTANCE_SCHEMES: Record<
  Exclude<DistanceBucketKey, "unknown">,
  BadgeColorScheme
> = {
  short: "jade",
  medium: "blue",
  long: "amber",
  very_long: "red",
};

function toneToScheme(tone: SituationBadgeTone): BadgeColorScheme {
  switch (tone) {
    case "success":
      return "jade";
    case "info":
      return "blue";
    case "warning":
      return "amber";
    case "danger":
      return "red";
    case "accent":
      return "purple";
    case "premium":
      return "purple";
    case "neutral":
    default:
      return "navy";
  }
}

const DEFAULT_DISTANCE_TONES: Record<
  Exclude<DistanceBucketKey, "unknown">,
  SituationBadgeTone
> = {
  short: "success",
  medium: "info",
  long: "warning",
  very_long: "danger",
};

function withDefaults(
  defs: Partial<SituationDefinitions> | null | undefined
): SituationDefinitions {
  return {
    field_zones: {
      ...DEFAULT_SITUATION_DEFINITIONS.field_zones,
      ...(defs?.field_zones ?? {}),
    },
    field_zones_v2: Array.isArray((defs as any)?.field_zones_v2)
      ? ((defs as any).field_zones_v2 as any)
      : undefined,
    custom_situations: Array.isArray((defs as any)?.custom_situations)
      ? ((defs as any).custom_situations as any)
      : undefined,
    distance_badges: {
      ...(DEFAULT_SITUATION_DEFINITIONS.distance_badges ?? {}),
      ...(((defs as any)?.distance_badges as any) ?? {}),
    },
    distance_badge_colors:
      (((defs as any)?.distance_badge_colors as any) ?? {}) || {},
    down_distance: {
      ...DEFAULT_SITUATION_DEFINITIONS.down_distance,
      ...(defs?.down_distance ?? {}),
    },
  };
}

function buildLegacyZones(defs: SituationDefinitions): FieldZoneDefinition[] {
  return [
    {
      id: "backed_up",
      label: LEGACY_ZONE_LABELS.backed_up,
      start_yard_line: 0,
      end_yard_line: Math.max(
        0,
        Math.min(100, defs.field_zones.backed_up_max - 1)
      ),
    },
    {
      id: "open_field",
      label: LEGACY_ZONE_LABELS.open_field,
      start_yard_line: Math.max(
        0,
        Math.min(100, defs.field_zones.backed_up_max)
      ),
      end_yard_line: Math.max(0, Math.min(100, defs.field_zones.plus_min - 1)),
    },
    {
      id: "plus_territory",
      label: LEGACY_ZONE_LABELS.plus_territory,
      start_yard_line: Math.max(0, Math.min(100, defs.field_zones.plus_min)),
      end_yard_line: Math.max(
        0,
        Math.min(100, defs.field_zones.red_zone_min - 1)
      ),
    },
    {
      id: "red_zone",
      label: LEGACY_ZONE_LABELS.red_zone,
      start_yard_line: Math.max(
        0,
        Math.min(100, defs.field_zones.red_zone_min)
      ),
      end_yard_line: Math.max(
        0,
        Math.min(100, defs.field_zones.goal_line_min - 1)
      ),
    },
    {
      id: "goal_line",
      label: LEGACY_ZONE_LABELS.goal_line,
      start_yard_line: Math.max(
        0,
        Math.min(100, defs.field_zones.goal_line_min)
      ),
      end_yard_line: 100,
    },
  ];
}

export function getFieldZoneDefinitions(
  teamDefs: Partial<SituationDefinitions> | null | undefined
): FieldZoneDefinition[] {
  const defs = withDefaults(teamDefs);

  const v2 = defs.field_zones_v2;
  if (Array.isArray(v2) && v2.length > 0) {
    return [...v2]
      .filter(
        (z) =>
          z &&
          typeof z.id === "string" &&
          typeof z.label === "string" &&
          Number.isFinite(z.start_yard_line) &&
          Number.isFinite(z.end_yard_line)
      )
      .sort((a, b) => a.start_yard_line - b.start_yard_line);
  }

  return buildLegacyZones(defs);
}

export function bucketFieldZoneKey(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  yardLine: number | null | undefined
): FieldZoneKey {
  if (yardLine == null || !Number.isFinite(yardLine)) return "unknown";

  const zones = getFieldZoneDefinitions(teamDefs);
  const yl = Math.max(0, Math.min(100, Math.round(yardLine)));

  const match = zones.find(
    (z) => yl >= z.start_yard_line && yl <= z.end_yard_line
  );

  return match?.id ?? "unknown";
}

export function bucketFieldZone(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  yardLine: number | null | undefined
): string {
  if (yardLine == null || !Number.isFinite(yardLine)) return "Unknown";

  const zones = getFieldZoneDefinitions(teamDefs);
  const yl = Math.max(0, Math.min(100, Math.round(yardLine)));

  const match = zones.find(
    (z) => yl >= z.start_yard_line && yl <= z.end_yard_line
  );
  if (match?.label) return match.label;

  const legacyKey = bucketFieldZoneKey(teamDefs, yardLine);
  if (
    legacyKey === "backed_up" ||
    legacyKey === "open_field" ||
    legacyKey === "plus_territory" ||
    legacyKey === "red_zone" ||
    legacyKey === "goal_line"
  ) {
    return LEGACY_ZONE_LABELS[legacyKey];
  }
  return "Unknown";
}

export function bucketDistance(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  distance: number | null | undefined
): string {
  const key = bucketDistanceKey(teamDefs, distance);
  switch (key) {
    case "short":
      return "Short";
    case "medium":
      return "Medium";
    case "long":
      return "Long";
    case "very_long":
      return "Very Long";
    default:
      return "Unknown";
  }
}

export function bucketDistanceKey(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  distance: number | null | undefined
): DistanceBucketKey {
  if (distance == null || !Number.isFinite(distance)) return "unknown";

  const defs = withDefaults(teamDefs);
  if (distance <= defs.down_distance.short_max) return "short";
  if (distance <= defs.down_distance.medium_max) return "medium";
  if (distance <= defs.down_distance.long_max) return "long";
  return "very_long";
}

function normalizeLabel(v: string): string {
  return v.trim().toLowerCase();
}

function normalizeIdLike(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, "_").replace(/-+/g, "_");
}

function legacyZoneIdFromLabel(
  label: string
): keyof typeof LEGACY_ZONE_LABELS | null {
  const l = normalizeLabel(label);
  for (const [id, legacyLabel] of Object.entries(LEGACY_ZONE_LABELS) as Array<
    [keyof typeof LEGACY_ZONE_LABELS, string]
  >) {
    if (normalizeLabel(legacyLabel) === l) return id;
  }
  return null;
}

export function getFieldZoneToneByYardLine(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  yardLine: number | null | undefined
): SituationBadgeTone {
  const key = bucketFieldZoneKey(teamDefs, yardLine);
  const zones = getFieldZoneDefinitions(teamDefs);
  const match = zones.find((z) => z.id === key);

  if (match?.tone) return match.tone;
  if (
    key === "backed_up" ||
    key === "open_field" ||
    key === "plus_territory" ||
    key === "red_zone" ||
    key === "goal_line"
  ) {
    return LEGACY_ZONE_TONES[key];
  }
  return "neutral";
}

export function getFieldZoneColorByYardLine(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  yardLine: number | null | undefined
): BadgeColorScheme {
  const key = bucketFieldZoneKey(teamDefs, yardLine);
  const zones = getFieldZoneDefinitions(teamDefs);
  const match = zones.find((z) => z.id === key);

  const explicit = (match as any)?.color as BadgeColorScheme | undefined;
  if (explicit) return explicit;

  const zoneId = match?.id;
  if (
    zoneId === "backed_up" ||
    zoneId === "open_field" ||
    zoneId === "plus_territory" ||
    zoneId === "red_zone" ||
    zoneId === "goal_line"
  ) {
    return DEFAULT_ZONE_SCHEMES[zoneId];
  }

  const legacyTone = getFieldZoneToneByYardLine(teamDefs, yardLine);
  return toneToScheme(legacyTone);
}

export function getFieldZoneToneByLabel(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  label: string | null | undefined
): SituationBadgeTone {
  const l = label ? normalizeLabel(label) : "";
  if (!l) return "neutral";

  const zones = getFieldZoneDefinitions(teamDefs);
  const match =
    zones.find((z) => normalizeLabel(z.label) === l) ??
    zones.find((z) => normalizeIdLike(z.id) === normalizeIdLike(label ?? ""));
  if (match?.tone) return match.tone;

  const key =
    (match?.id as keyof typeof LEGACY_ZONE_LABELS | undefined) ??
    (label ? legacyZoneIdFromLabel(label) : null) ??
    null;
  if (
    key === "backed_up" ||
    key === "open_field" ||
    key === "plus_territory" ||
    key === "red_zone" ||
    key === "goal_line"
  ) {
    return LEGACY_ZONE_TONES[key];
  }

  return "neutral";
}

export function getFieldZoneColorByLabel(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  label: string | null | undefined
): BadgeColorScheme {
  const l = label ? normalizeLabel(label) : "";
  if (!l) return "navy";

  const zones = getFieldZoneDefinitions(teamDefs);
  const match =
    zones.find((z) => normalizeLabel(z.label) === l) ??
    zones.find((z) => normalizeIdLike(z.id) === normalizeIdLike(label ?? ""));
  const explicit = (match as any)?.color as BadgeColorScheme | undefined;
  if (explicit) return explicit;

  const zoneId =
    (match?.id as keyof typeof DEFAULT_ZONE_SCHEMES | undefined) ??
    (label ? legacyZoneIdFromLabel(label) : null) ??
    null;
  if (
    zoneId === "backed_up" ||
    zoneId === "open_field" ||
    zoneId === "plus_territory" ||
    zoneId === "red_zone" ||
    zoneId === "goal_line"
  ) {
    return DEFAULT_ZONE_SCHEMES[zoneId];
  }

  const legacyTone = getFieldZoneToneByLabel(teamDefs, label);
  return toneToScheme(legacyTone);
}

export function getCustomSituationToneByLabel(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  label: string | null | undefined
): SituationBadgeTone {
  const l = label ? normalizeLabel(label) : "";
  if (!l) return "neutral";

  const defs = withDefaults(teamDefs);
  const situations = Array.isArray(defs.custom_situations)
    ? defs.custom_situations
    : [];

  const match = situations.find((s) => normalizeLabel(s.label) === l);
  return match?.tone ?? "neutral";
}

export function getCustomSituationColorByLabel(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  label: string | null | undefined
): BadgeColorScheme {
  const l = label ? normalizeLabel(label) : "";
  if (!l) return "navy";

  const defs = withDefaults(teamDefs);
  const situations = Array.isArray(defs.custom_situations)
    ? defs.custom_situations
    : [];

  const match =
    situations.find((s) => normalizeLabel(s.label) === l) ??
    situations.find(
      (s) => normalizeIdLike(s.id) === normalizeIdLike(label ?? "")
    );
  const explicit = (match as any)?.color as BadgeColorScheme | undefined;
  if (explicit) return explicit;

  const legacyTone = match?.tone as SituationBadgeTone | undefined;
  if (legacyTone) return toneToScheme(legacyTone);
  return "navy";
}

export function getDistanceToneByDistance(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  distance: number | null | undefined
): SituationBadgeTone {
  const defs = withDefaults(teamDefs);
  const key = bucketDistanceKey(defs, distance);
  if (key === "unknown") return "neutral";
  return (defs.distance_badges as any)?.[key] ?? DEFAULT_DISTANCE_TONES[key];
}

export function getDistanceColorByDistance(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  distance: number | null | undefined
): BadgeColorScheme {
  const defs = withDefaults(teamDefs);
  const key = bucketDistanceKey(defs, distance);
  if (key === "unknown") return "navy";
  const explicit = (defs.distance_badge_colors as any)?.[key] as
    | BadgeColorScheme
    | undefined;
  if (explicit) return explicit;

  const legacyTone = getDistanceToneByDistance(teamDefs, distance);
  if (legacyTone) return toneToScheme(legacyTone);

  return DEFAULT_DISTANCE_SCHEMES[key] ?? "navy";
}

export function getDistanceToneByLabel(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  label: string | null | undefined
): SituationBadgeTone {
  const defs = withDefaults(teamDefs);
  const l = label ? normalizeLabel(label) : "";
  if (!l) return "neutral";

  let key: DistanceBucketKey = "unknown";
  if (l === "short") key = "short";
  else if (l === "medium") key = "medium";
  else if (l === "long") key = "long";
  else if (l === "very long" || l === "very_long") key = "very_long";

  if (key === "unknown") return "neutral";
  return (defs.distance_badges as any)?.[key] ?? DEFAULT_DISTANCE_TONES[key];
}

export function getDistanceColorByLabel(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  label: string | null | undefined
): BadgeColorScheme {
  const defs = withDefaults(teamDefs);
  const l = label ? normalizeLabel(label) : "";
  if (!l) return "navy";

  let key: DistanceBucketKey = "unknown";
  if (l === "short") key = "short";
  else if (l === "medium") key = "medium";
  else if (l === "long") key = "long";
  else if (l === "very long" || l === "very_long") key = "very_long";

  if (key === "unknown") return "navy";
  const explicit = (defs.distance_badge_colors as any)?.[key] as
    | BadgeColorScheme
    | undefined;
  if (explicit) return explicit;

  const legacyTone = getDistanceToneByLabel(teamDefs, label);
  if (legacyTone) return toneToScheme(legacyTone);

  return DEFAULT_DISTANCE_SCHEMES[key] ?? "navy";
}

export function bucketDownDistance(
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  down: number | null | undefined,
  distance: number | null | undefined
): string {
  if (down == null) return "Unknown";

  let downLabel: string;
  switch (down) {
    case 1:
      downLabel = "1st";
      break;
    case 2:
      downLabel = "2nd";
      break;
    case 3:
      downLabel = "3rd";
      break;
    case 4:
      downLabel = "4th";
      break;
    default:
      downLabel = `${down}th`;
  }

  const distLabel = bucketDistance(teamDefs, distance);
  if (distLabel === "Unknown") return downLabel;

  return `${downLabel} & ${distLabel}`;
}
