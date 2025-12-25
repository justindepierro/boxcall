import React, { useEffect, useMemo, useState } from "react";

import { Card } from "../ui";
import { Button } from "../ui/Button/Button";
import { Input } from "../ui/Input";
import { Typography } from "../design-system";
import { logError } from "../../utils/logger";
import { TeamSituationDefinitionsService } from "../../services/teamSituationDefinitionsService";
import type {
  SituationBadgeTone,
  SituationDefinitions,
} from "../../types/situationDefinitions";
import type { BadgeColorScheme } from "../../types/badge";
import {
  BADGE_COLOR_SCHEME_OPTIONS,
  isBadgeColorScheme,
} from "../../types/badge";
import { Dropdown } from "../ui/Dropdown";
import { parseBallOnToYardLine, yardLineToBallOn } from "../../utils/ballOn";
import { Badge } from "../ui/Badge";

type Props = {
  teamId: string;
};

type FormState = {
  fieldZones: Array<{
    id: string;
    label: string;
    startBallOn: string;
    endBallOn: string;
    color: BadgeColorScheme;
    locked?: boolean;
  }>;

  customSituations: Array<{
    id: string;
    label: string;
    color: BadgeColorScheme;
  }>;

  distanceBadgeColors: {
    short: BadgeColorScheme;
    medium: BadgeColorScheme;
    long: BadgeColorScheme;
    very_long: BadgeColorScheme;
  };

  shortMax: string;
  mediumMax: string;
  longMax: string;
};

const COLOR_OPTIONS: Array<{ value: BadgeColorScheme; label: string }> =
  BADGE_COLOR_SCHEME_OPTIONS;

function isTone(v: unknown): v is SituationBadgeTone {
  return (
    v === "neutral" ||
    v === "info" ||
    v === "success" ||
    v === "warning" ||
    v === "danger" ||
    v === "accent" ||
    v === "premium"
  );
}

function isColor(v: unknown): v is BadgeColorScheme {
  return isBadgeColorScheme(v);
}

const SchemePreview: React.FC<{ scheme: BadgeColorScheme; label?: string }> = ({
  scheme,
  label,
}) => (
  <div className="flex justify-end">
    <Badge variant="neutral" scheme={scheme} size="sm">
      {label ?? "Preview"}
    </Badge>
  </div>
);

function defaultZoneColor(zoneId: string): BadgeColorScheme {
  if (zoneId === "goal_line") return "red";
  if (zoneId === "red_zone") return "orange";
  if (zoneId === "plus_territory") return "jade";
  if (zoneId === "backed_up") return "blue";
  return "navy";
}

function buildDistanceBadgeColors(
  defs: SituationDefinitions
): FormState["distanceBadgeColors"] {
  const saved = (defs as any).distance_badge_colors as
    | Partial<Record<"short" | "medium" | "long" | "very_long", unknown>>
    | undefined;

  return {
    short: isBadgeColorScheme(saved?.short)
      ? (saved!.short as BadgeColorScheme)
      : "jade",
    medium: isBadgeColorScheme(saved?.medium)
      ? (saved!.medium as BadgeColorScheme)
      : "blue",
    long: isBadgeColorScheme(saved?.long)
      ? (saved!.long as BadgeColorScheme)
      : "amber",
    very_long: isBadgeColorScheme(saved?.very_long)
      ? (saved!.very_long as BadgeColorScheme)
      : "red",
  };
}

const BUILT_IN_ZONE_IDS = new Set([
  "backed_up",
  "open_field",
  "plus_territory",
  "red_zone",
  "goal_line",
]);

function parseIntOrNull(v: string): number | null {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function buildForm(defs: SituationDefinitions): FormState {
  const v2 = Array.isArray((defs as any).field_zones_v2)
    ? ((defs as any).field_zones_v2 as any[])
    : null;

  const fieldZones = (
    v2 && v2.length > 0
      ? v2
          .filter(
            (z) =>
              z &&
              typeof z.id === "string" &&
              typeof z.label === "string" &&
              Number.isFinite(z.start_yard_line) &&
              Number.isFinite(z.end_yard_line)
          )
          .sort((a, b) => a.start_yard_line - b.start_yard_line)
          .map((z) => {
            const explicit = (z as any).color as unknown;
            let color: BadgeColorScheme;

            if (isBadgeColorScheme(explicit)) {
              color = explicit as BadgeColorScheme;
            } else if (isTone((z as any).tone)) {
              const t = (z as any).tone as SituationBadgeTone;
              if (t === "success") color = "jade";
              else if (t === "info") color = "blue";
              else if (t === "warning") color = "amber";
              else if (t === "danger") color = "red";
              else if (t === "accent" || t === "premium") color = "purple";
              else color = defaultZoneColor(z.id);
            } else {
              color = defaultZoneColor(z.id);
            }

            return {
              id: z.id,
              label: z.label,
              startBallOn: yardLineToBallOn(z.start_yard_line),
              endBallOn: yardLineToBallOn(z.end_yard_line),
              color,
              locked: BUILT_IN_ZONE_IDS.has(z.id),
            };
          })
      : [
          {
            id: "backed_up",
            label: "Backed Up",
            startBallOn: yardLineToBallOn(0),
            endBallOn: yardLineToBallOn(
              Math.max(0, Math.min(100, defs.field_zones.backed_up_max - 1))
            ),
            color: defaultZoneColor("backed_up"),
            locked: true,
          },
          {
            id: "open_field",
            label: "Open Field",
            startBallOn: yardLineToBallOn(
              Math.max(0, Math.min(100, defs.field_zones.backed_up_max))
            ),
            endBallOn: yardLineToBallOn(
              Math.max(0, Math.min(100, defs.field_zones.plus_min - 1))
            ),
            color: defaultZoneColor("open_field"),
            locked: true,
          },
          {
            id: "plus_territory",
            label: "Plus Territory",
            startBallOn: yardLineToBallOn(
              Math.max(0, Math.min(100, defs.field_zones.plus_min))
            ),
            endBallOn: yardLineToBallOn(
              Math.max(0, Math.min(100, defs.field_zones.red_zone_min - 1))
            ),
            color: defaultZoneColor("plus_territory"),
            locked: true,
          },
          {
            id: "red_zone",
            label: "Red Zone",
            startBallOn: yardLineToBallOn(
              Math.max(0, Math.min(100, defs.field_zones.red_zone_min))
            ),
            endBallOn: yardLineToBallOn(
              Math.max(0, Math.min(100, defs.field_zones.goal_line_min - 1))
            ),
            color: defaultZoneColor("red_zone"),
            locked: true,
          },
          {
            id: "goal_line",
            label: "Goal Line",
            startBallOn: yardLineToBallOn(
              Math.max(0, Math.min(100, defs.field_zones.goal_line_min))
            ),
            endBallOn: yardLineToBallOn(100),
            color: defaultZoneColor("goal_line"),
            locked: true,
          },
        ]
  ) as FormState["fieldZones"];

  const customSituations = (
    Array.isArray((defs as any).custom_situations)
      ? ((defs as any).custom_situations as any[])
          .filter(
            (s) =>
              s &&
              typeof s.id === "string" &&
              typeof s.label === "string" &&
              s.label.trim().length > 0
          )
          .map((s) => {
            const explicit = (s as any).color as unknown;
            let color: BadgeColorScheme;

            if (isBadgeColorScheme(explicit)) {
              color = explicit as BadgeColorScheme;
            } else if (isTone(s.tone)) {
              const t = s.tone as SituationBadgeTone;
              if (t === "success") color = "jade";
              else if (t === "info") color = "blue";
              else if (t === "warning") color = "amber";
              else if (t === "danger") color = "red";
              else if (t === "accent" || t === "premium") color = "purple";
              else color = "navy";
            } else {
              color = "navy";
            }

            return {
              id: s.id,
              label: s.label,
              color,
            };
          })
      : []
  ) as FormState["customSituations"];

  return {
    fieldZones,

    customSituations,
    distanceBadgeColors: buildDistanceBadgeColors(defs),

    shortMax: String(defs.down_distance.short_max),
    mediumMax: String(defs.down_distance.medium_max),
    longMax: String(defs.down_distance.long_max),
  };
}

async function saveSituationDefinitions(teamId: string, form: FormState) {
  const zones = form.fieldZones
    .map((z) => {
      const start = parseBallOnToYardLine(z.startBallOn);
      const end = parseBallOnToYardLine(z.endBallOn);
      return {
        id: z.id,
        label: z.label.trim(),
        color: z.color,
        start_yard_line: start ?? 0,
        end_yard_line: end ?? 0,
      };
    })
    .sort((a, b) => a.start_yard_line - b.start_yard_line);

  const byId = new Map(zones.map((z) => [z.id, z] as const));
  const backedUp = byId.get("backed_up");
  const plusTerritory = byId.get("plus_territory");
  const redZone = byId.get("red_zone");
  const goalLine = byId.get("goal_line");

  const legacyFieldZones = {
    backed_up_max: backedUp ? backedUp.end_yard_line + 1 : 20,
    plus_min: plusTerritory ? plusTerritory.start_yard_line : 50,
    red_zone_min: redZone ? redZone.start_yard_line : 80,
    goal_line_min: goalLine ? goalLine.start_yard_line : 95,
  };

  const customSituations = form.customSituations
    .map((s) => ({ id: s.id, label: s.label.trim(), color: s.color }))
    .filter((s) => s.label.length > 0);

  const distanceBadgeColors = {
    short: form.distanceBadgeColors.short,
    medium: form.distanceBadgeColors.medium,
    long: form.distanceBadgeColors.long,
    very_long: form.distanceBadgeColors.very_long,
  };

  return TeamSituationDefinitionsService.set(teamId, {
    field_zones: legacyFieldZones,
    field_zones_v2: zones,
    custom_situations: customSituations,
    distance_badge_colors: distanceBadgeColors,
    down_distance: {
      short_max: Number.parseInt(form.shortMax, 10),
      medium_max: Number.parseInt(form.mediumMax, 10),
      long_max: Number.parseInt(form.longMax, 10),
    },
  });
}

function validateCustomSituations(
  customSituations: FormState["customSituations"]
): string | null {
  if (!Array.isArray(customSituations)) return null;

  const labels = customSituations
    .map((s) => s.label.trim().toLowerCase())
    .filter(Boolean);

  const labelSet = new Set(labels);
  if (labels.length !== labelSet.size) {
    return "Custom situation labels must be unique.";
  }

  for (const s of customSituations) {
    if (!s.label.trim()) return "All custom situations must have a label.";
  }

  return null;
}

function validateFieldZones(
  fieldZones: FormState["fieldZones"]
): string | null {
  if (!Array.isArray(fieldZones) || fieldZones.length < 2) {
    return "Add at least 2 field zones.";
  }

  const labels = fieldZones
    .map((z) => z.label.trim().toLowerCase())
    .filter(Boolean);
  const labelSet = new Set(labels);
  if (labels.length !== labelSet.size) {
    return "Field zone labels must be unique.";
  }

  const parsed = fieldZones
    .map((z) => {
      const start = parseBallOnToYardLine(z.startBallOn);
      const end = parseBallOnToYardLine(z.endBallOn);
      return {
        label: z.label.trim(),
        start,
        end,
      };
    })
    .sort((a, b) => (a.start ?? 999) - (b.start ?? 999));

  for (const z of parsed) {
    if (!z.label) return "All field zones must have a label.";
    if (z.start == null || z.end == null) {
      return "Field zone boundaries must use ball-on format (e.g. -30, +20, 50).";
    }
    if (z.start < 0 || z.start > 100 || z.end < 0 || z.end > 100) {
      return "Field zone boundaries must be between own goal line and opponent goal line.";
    }
    if (z.end < z.start) return "Zone end must be ≥ zone start.";
  }

  if (parsed[0].start !== 0) {
    return "Field zones must start at the goal line (ball on -0).";
  }
  if (parsed[parsed.length - 1].end !== 100) {
    return "Field zones must end at the goal line (ball on +0).";
  }
  for (let i = 1; i < parsed.length; i += 1) {
    const prev = parsed[i - 1];
    const curr = parsed[i];
    if (curr.start! !== prev.end! + 1) {
      return "Field zones must be contiguous with no gaps or overlaps.";
    }
  }

  return null;
}

function validateForm(form: FormState): string | null {
  const shortMax = parseIntOrNull(form.shortMax);
  const mediumMax = parseIntOrNull(form.mediumMax);
  const longMax = parseIntOrNull(form.longMax);

  const fieldZoneError = validateFieldZones(form.fieldZones);
  if (fieldZoneError) return fieldZoneError;

  const customSituationError = validateCustomSituations(form.customSituations);
  if (customSituationError) return customSituationError;

  const distVals = [shortMax, mediumMax, longMax];
  if (distVals.some((v) => v === null)) {
    return "All down & distance thresholds must be whole numbers.";
  }

  if (distVals.some((v) => (v as number) < 0)) {
    return "Down & distance thresholds must be 0 or greater.";
  }

  if (!(shortMax! <= mediumMax! && mediumMax! <= longMax!)) {
    return "Down & distance thresholds must be increasing: Short ≤ Medium ≤ Long.";
  }

  return null;
}

const MessageBanner: React.FC<{
  message:
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null;
  validationError: string | null;
}> = ({ message, validationError }) => {
  if (!message && !validationError) return null;

  return (
    <>
      {message && (
        <div
          className={`p-4 rounded-lg border mb-md ${
            message.type === "success"
              ? "bg-subtle border-muted text-success"
              : "bg-subtle border-muted text-error"
          }`}
        >
          {message.text}
        </div>
      )}

      {validationError && (
        <div className="p-4 rounded-lg border mb-md bg-subtle border-muted text-error">
          {validationError}
        </div>
      )}
    </>
  );
};

const FieldZonesSection: React.FC<{
  form: FormState;
  onChange: (next: Partial<FormState>) => void;
  disabled: boolean;
}> = ({ form, onChange, disabled }) => {
  const updateZone = (
    index: number,
    patch: Partial<FormState["fieldZones"][number]>
  ) => {
    const next = [...form.fieldZones];
    next[index] = { ...next[index], ...patch };
    onChange({ fieldZones: next });
  };

  const removeZone = (index: number) => {
    const zone = form.fieldZones[index];
    if (zone?.locked) return;
    const next = form.fieldZones.filter((_, i) => i !== index);
    onChange({ fieldZones: next });
  };

  const addZone = () => {
    const id = `zone_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const next = [
      ...form.fieldZones,
      {
        id,
        label: "New Zone",
        startBallOn: "50",
        endBallOn: "50",
        color: "navy" as const,
        locked: false,
      },
    ];
    onChange({ fieldZones: next });
  };

  return (
    <div className="bg-subtle border border-muted rounded-lg p-md">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <Typography variant="headline-sm" as="h3" className="text-primary">
            Field Zones
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            Ball-on format: -30 (your 30), +20 (their 20), 50 (midfield). Goal
            lines are -0 and +0.
          </Typography>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={addZone}
          disabled={disabled}
        >
          Add Zone
        </Button>
      </div>

      <div className="space-y-3">
        {form.fieldZones.map((z, index) => (
          <div
            key={z.id}
            className="grid grid-cols-1 gap-3 items-end md:grid-cols-12"
          >
            <div className="md:col-span-5">
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                Label
              </Typography>
              <Input
                value={z.label}
                onChange={(e) => updateZone(index, { label: e.target.value })}
                disabled={disabled}
              />
            </div>

            <div className="md:col-span-2">
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                Start
              </Typography>
              <Input
                value={z.startBallOn}
                onChange={(e) =>
                  updateZone(index, { startBallOn: e.target.value })
                }
                disabled={disabled}
              />
            </div>

            <div className="md:col-span-2">
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                End
              </Typography>
              <Input
                value={z.endBallOn}
                onChange={(e) =>
                  updateZone(index, { endBallOn: e.target.value })
                }
                disabled={disabled}
              />
            </div>

            <div className="md:col-span-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-end">
                <Dropdown
                  label="Color"
                  value={z.color}
                  onChange={(value) =>
                    updateZone(index, {
                      color: isColor(value) ? value : z.color,
                    })
                  }
                  options={COLOR_OPTIONS}
                  size="sm"
                  disabled={disabled}
                />
                <SchemePreview scheme={z.color} label={z.label || "Zone"} />
              </div>
            </div>

            <div className="md:col-span-12 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => removeZone(index)}
                disabled={disabled || !!z.locked}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DownDistanceSection: React.FC<{
  form: FormState;
  onChange: (next: Partial<FormState>) => void;
  disabled: boolean;
}> = ({ form, onChange, disabled }) => {
  return (
    <div className="bg-subtle border border-muted rounded-lg p-md">
      <Typography variant="headline-sm" as="h3" className="text-primary mb-4">
        Down & Distance
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-3 bc-grid-gap">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-secondary mb-2"
          >
            Short Max
          </Typography>
          <Input
            type="number"
            value={form.shortMax}
            onChange={(e) => onChange({ shortMax: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-secondary mb-2"
          >
            Medium Max
          </Typography>
          <Input
            type="number"
            value={form.mediumMax}
            onChange={(e) => onChange({ mediumMax: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-secondary mb-2"
          >
            Long Max
          </Typography>
          <Input
            type="number"
            value={form.longMax}
            onChange={(e) => onChange({ longMax: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
      <Typography variant="body-sm" color="muted" className="mt-2">
        Very Long is anything above Long Max.
      </Typography>

      <div className="mt-6">
        <Typography variant="headline-sm" as="h4" className="text-primary mb-4">
          Distance Badge Colors
        </Typography>

        <div className="space-y-3">
          {(
            [
              { key: "short" as const, label: "Short" },
              { key: "medium" as const, label: "Medium" },
              { key: "long" as const, label: "Long" },
              { key: "very_long" as const, label: "Very Long" },
            ] as const
          ).map(({ key, label }) => (
            <div
              key={key}
              className="grid grid-cols-1 gap-3 md:grid-cols-12 items-end"
            >
              <div className="md:col-span-4">
                <Typography
                  variant="body-sm"
                  className="font-medium text-secondary"
                >
                  {label}
                </Typography>
              </div>
              <div className="md:col-span-8">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-end">
                  <Dropdown
                    label="Color"
                    value={form.distanceBadgeColors[key]}
                    onChange={(value) =>
                      onChange({
                        distanceBadgeColors: {
                          ...form.distanceBadgeColors,
                          [key]: isColor(value)
                            ? value
                            : form.distanceBadgeColors[key],
                        },
                      })
                    }
                    options={COLOR_OPTIONS}
                    size="sm"
                    disabled={disabled}
                  />
                  <SchemePreview
                    scheme={form.distanceBadgeColors[key]}
                    label={label}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomSituationsSection: React.FC<{
  form: FormState;
  onChange: (next: Partial<FormState>) => void;
  disabled: boolean;
}> = ({ form, onChange, disabled }) => {
  const updateSituation = (
    index: number,
    patch: Partial<FormState["customSituations"][number]>
  ) => {
    const next = [...form.customSituations];
    next[index] = { ...next[index], ...patch };
    onChange({ customSituations: next });
  };

  const removeSituation = (index: number) => {
    const next = form.customSituations.filter((_, i) => i !== index);
    onChange({ customSituations: next });
  };

  const addSituation = () => {
    const id = `situation_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const next = [
      ...form.customSituations,
      { id, label: "New Situation", color: "navy" as const },
    ];
    onChange({ customSituations: next });
  };

  return (
    <div className="bg-subtle border border-muted rounded-lg p-md">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <Typography variant="headline-sm" as="h3" className="text-primary">
            Custom Situations
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            These appear as suggested values for play preferences. Labels are
            editable; IDs stay stable.
          </Typography>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={addSituation}
          disabled={disabled}
        >
          Add Situation
        </Button>
      </div>

      <div className="space-y-3">
        {form.customSituations.map((s, index) => (
          <div
            key={s.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-7">
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                Label
              </Typography>
              <Input
                value={s.label}
                onChange={(e) =>
                  updateSituation(index, { label: e.target.value })
                }
                disabled={disabled}
              />
            </div>

            <div className="md:col-span-5">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-end">
                <Dropdown
                  label="Color"
                  value={s.color}
                  onChange={(value) =>
                    updateSituation(index, {
                      color: isColor(value) ? value : s.color,
                    })
                  }
                  options={COLOR_OPTIONS}
                  size="sm"
                  disabled={disabled}
                />
                <SchemePreview
                  scheme={s.color}
                  label={s.label || "Situation"}
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => removeSituation(index)}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SituationThresholdSettings: React.FC<Props> = ({ teamId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<
    { type: "success"; text: string } | { type: "error"; text: string } | null
  >(null);

  const [initialDefs, setInitialDefs] = useState<SituationDefinitions | null>(
    null
  );
  const [form, setForm] = useState<FormState>(() => ({
    fieldZones: [
      {
        id: "backed_up",
        label: "Backed Up",
        startBallOn: "-0",
        endBallOn: "-19",
        color: defaultZoneColor("backed_up"),
        locked: true,
      },
      {
        id: "open_field",
        label: "Open Field",
        startBallOn: "-20",
        endBallOn: "-49",
        color: defaultZoneColor("open_field"),
        locked: true,
      },
      {
        id: "plus_territory",
        label: "Plus Territory",
        startBallOn: "50",
        endBallOn: "+21",
        color: defaultZoneColor("plus_territory"),
        locked: true,
      },
      {
        id: "red_zone",
        label: "Red Zone",
        startBallOn: "+20",
        endBallOn: "+6",
        color: defaultZoneColor("red_zone"),
        locked: true,
      },
      {
        id: "goal_line",
        label: "Goal Line",
        startBallOn: "+5",
        endBallOn: "+0",
        color: defaultZoneColor("goal_line"),
        locked: true,
      },
    ],
    customSituations: [],
    distanceBadgeColors: {
      short: "jade",
      medium: "blue",
      long: "amber",
      very_long: "red",
    },
    shortMax: "3",
    mediumMax: "7",
    longMax: "10",
  }));

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const defs = await TeamSituationDefinitionsService.get(teamId);
        if (!isMounted) return;
        setInitialDefs(defs);
        setForm(buildForm(defs));
      } catch (err) {
        logError("Failed to load situation thresholds:", err);
        if (!isMounted) return;
        setInitialDefs(null);
        setMessage({
          type: "error",
          text: "Failed to load situation thresholds.",
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [teamId]);

  const validationError = useMemo(() => validateForm(form), [form]);

  const hasChanges = useMemo(() => {
    if (!initialDefs) return false;
    const next = buildForm(initialDefs);
    return JSON.stringify(next) !== JSON.stringify(form);
  }, [form, initialDefs]);

  const handleSave = async () => {
    if (validationError) return;
    if (!teamId) return;

    setSaving(true);
    setMessage(null);

    try {
      const saved = await saveSituationDefinitions(teamId, form);

      setInitialDefs(saved);
      setForm(buildForm(saved));
      setMessage({
        type: "success",
        text: "Situation definitions saved.",
      });
    } catch (err) {
      logError("Failed to save situation thresholds:", err);
      setMessage({
        type: "error",
        text: "Failed to save situation thresholds.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!initialDefs) return;
    setMessage(null);
    setForm(buildForm(initialDefs));
  };

  return (
    <Card id="situation-thresholds" className="p-lg">
      <Typography variant="headline-lg" className="mb-md">
        Situation Definitions
      </Typography>
      <Typography variant="body-lg" color="muted" className="mb-lg">
        Configure field position and distance buckets. Tones control meaning;
        colors are optional palette overrides.
      </Typography>

      <MessageBanner message={message} validationError={validationError} />

      <div className="space-y-lg">
        <FieldZonesSection
          form={form}
          onChange={(next) => setForm((f) => ({ ...f, ...next }))}
          disabled={loading || saving}
        />

        <CustomSituationsSection
          form={form}
          onChange={(next) => setForm((f) => ({ ...f, ...next }))}
          disabled={loading || saving}
        />

        <DownDistanceSection
          form={form}
          onChange={(next) => setForm((f) => ({ ...f, ...next }))}
          disabled={loading || saving}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-secondary">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={loading || saving || !hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={loading || saving || !!validationError || !hasChanges}
          >
            Save Definitions
          </Button>
        </div>
      </div>
    </Card>
  );
};

SituationThresholdSettings.displayName = "SituationThresholdSettings";
