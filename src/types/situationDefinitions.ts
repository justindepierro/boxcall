export type FieldZoneThresholds = {
  backed_up_max: number;
  plus_min: number;
  red_zone_min: number;
  goal_line_min: number;
};

export type FieldZoneDefinition = {
  /** Stable identifier used for bucketing & analytics grouping */
  id: string;
  /** Coach-editable display label */
  label: string;
  /** Optional badge tone for chips/badges (maps to UI Badge variants). */
  tone?: SituationBadgeTone;
  /** Optional badge color scheme for chips/badges (overrides tone colors). */
  color?: import("./badge").BadgeColorScheme;
  /** Inclusive range boundaries in canonical 0..100 yard_line */
  start_yard_line: number;
  end_yard_line: number;
};

export type CustomSituationDefinition = {
  id: string;
  label: string;
  /** Optional badge tone for chips/badges (maps to UI Badge variants). */
  tone?: SituationBadgeTone;
  /** Optional badge color scheme for chips/badges (overrides tone colors). */
  color?: import("./badge").BadgeColorScheme;
};

export type SituationBadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "premium";

export type DistanceBadgeTones = {
  short: SituationBadgeTone;
  medium: SituationBadgeTone;
  long: SituationBadgeTone;
  very_long: SituationBadgeTone;
};

export type DistanceBadgeColors = Partial<
  Record<keyof DistanceBadgeTones, import("./badge").BadgeColorScheme>
>;

export type DownDistanceThresholds = {
  short_max: number;
  medium_max: number;
  long_max: number;
};

export type SituationDefinitions = {
  field_zones: FieldZoneThresholds;
  /**
   * Optional v2 field zones list. When present, bucketing should prefer this
   * over legacy threshold-based zones.
   */
  field_zones_v2?: FieldZoneDefinition[];
  /** Optional coach-defined situations list (labels are editable; ids are stable). */
  custom_situations?: CustomSituationDefinition[];
  /** Optional tone mapping used for distance chips/badges (Short/Medium/Long/Very Long). */
  distance_badges?: Partial<DistanceBadgeTones>;
  /** Optional color scheme mapping used for distance chips/badges (overrides tone colors). */
  distance_badge_colors?: DistanceBadgeColors;
  down_distance: DownDistanceThresholds;
};

export const DEFAULT_SITUATION_DEFINITIONS: SituationDefinitions = {
  field_zones: {
    backed_up_max: 20,
    plus_min: 50,
    red_zone_min: 80,
    goal_line_min: 95,
  },
  distance_badges: {
    short: "success",
    medium: "info",
    long: "warning",
    very_long: "danger",
  },
  down_distance: {
    short_max: 3,
    medium_max: 7,
    long_max: 10,
  },
};
