/**
 * Game Plan Constants - Billick Situational Method
 * 
 * Defines the 12 standard Billick situations for organizing game plans
 * by down, distance, and field position.
 */

export const BILLICK_SITUATIONS = {
  FIRST_AND_10: 'first_and_10',
  SECOND_AND_SHORT: 'second_and_short',
  SECOND_AND_MEDIUM: 'second_and_medium',
  SECOND_AND_LONG: 'second_and_long',
  THIRD_AND_SHORT: 'third_and_short',
  THIRD_AND_MEDIUM: 'third_and_medium',
  THIRD_AND_LONG: 'third_and_long',
  RED_ZONE: 'red_zone',
  GOAL_LINE: 'goal_line',
  TWO_MINUTE_DRILL: 'two_minute_drill',
  SHORT_YARDAGE: 'short_yardage',
  SITUATIONAL: 'situational',
} as const;

export type BillickSituationType = typeof BILLICK_SITUATIONS[keyof typeof BILLICK_SITUATIONS];

export interface BillickSituationConfig {
  type: BillickSituationType;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  color: string;
  displayOrder: number;
}

export const BILLICK_SITUATION_CONFIGS: Record<BillickSituationType, BillickSituationConfig> = {
  [BILLICK_SITUATIONS.FIRST_AND_10]: {
    type: BILLICK_SITUATIONS.FIRST_AND_10,
    label: '1st & 10',
    shortLabel: '1st',
    description: 'First down and 10 yards to go',
    icon: '1️⃣',
    color: 'blue',
    displayOrder: 1,
  },
  [BILLICK_SITUATIONS.SECOND_AND_SHORT]: {
    type: BILLICK_SITUATIONS.SECOND_AND_SHORT,
    label: '2nd & Short',
    shortLabel: '2S',
    description: 'Second down, 1-3 yards to go',
    icon: '2️⃣',
    color: 'green',
    displayOrder: 2,
  },
  [BILLICK_SITUATIONS.SECOND_AND_MEDIUM]: {
    type: BILLICK_SITUATIONS.SECOND_AND_MEDIUM,
    label: '2nd & Medium',
    shortLabel: '2M',
    description: 'Second down, 4-7 yards to go',
    icon: '2️⃣',
    color: 'yellow',
    displayOrder: 3,
  },
  [BILLICK_SITUATIONS.SECOND_AND_LONG]: {
    type: BILLICK_SITUATIONS.SECOND_AND_LONG,
    label: '2nd & Long',
    shortLabel: '2L',
    description: 'Second down, 8+ yards to go',
    icon: '2️⃣',
    color: 'orange',
    displayOrder: 4,
  },
  [BILLICK_SITUATIONS.THIRD_AND_SHORT]: {
    type: BILLICK_SITUATIONS.THIRD_AND_SHORT,
    label: '3rd & Short',
    shortLabel: '3S',
    description: 'Third down, 1-3 yards to go',
    icon: '3️⃣',
    color: 'green',
    displayOrder: 5,
  },
  [BILLICK_SITUATIONS.THIRD_AND_MEDIUM]: {
    type: BILLICK_SITUATIONS.THIRD_AND_MEDIUM,
    label: '3rd & Medium',
    shortLabel: '3M',
    description: 'Third down, 4-7 yards to go',
    icon: '3️⃣',
    color: 'yellow',
    displayOrder: 6,
  },
  [BILLICK_SITUATIONS.THIRD_AND_LONG]: {
    type: BILLICK_SITUATIONS.THIRD_AND_LONG,
    label: '3rd & Long',
    shortLabel: '3L',
    description: 'Third down, 8+ yards to go',
    icon: '3️⃣',
    color: 'red',
    displayOrder: 7,
  },
  [BILLICK_SITUATIONS.RED_ZONE]: {
    type: BILLICK_SITUATIONS.RED_ZONE,
    label: 'Red Zone',
    shortLabel: 'RZ',
    description: 'Inside opponent 20-yard line',
    icon: '🎯',
    color: 'red',
    displayOrder: 8,
  },
  [BILLICK_SITUATIONS.GOAL_LINE]: {
    type: BILLICK_SITUATIONS.GOAL_LINE,
    label: 'Goal Line',
    shortLabel: 'GL',
    description: 'Inside opponent 5-yard line',
    icon: '🏈',
    color: 'purple',
    displayOrder: 9,
  },
  [BILLICK_SITUATIONS.TWO_MINUTE_DRILL]: {
    type: BILLICK_SITUATIONS.TWO_MINUTE_DRILL,
    label: 'Two-Minute Drill',
    shortLabel: '2M',
    description: 'End of half/game situations',
    icon: '⏱️',
    color: 'indigo',
    displayOrder: 10,
  },
  [BILLICK_SITUATIONS.SHORT_YARDAGE]: {
    type: BILLICK_SITUATIONS.SHORT_YARDAGE,
    label: 'Short Yardage',
    shortLabel: 'SY',
    description: '4th & 1-2, critical conversions',
    icon: '💪',
    color: 'gray',
    displayOrder: 11,
  },
  [BILLICK_SITUATIONS.SITUATIONAL]: {
    type: BILLICK_SITUATIONS.SITUATIONAL,
    label: 'Situational',
    shortLabel: 'SIT',
    description: 'Trick plays, special situations',
    icon: '🎭',
    color: 'pink',
    displayOrder: 12,
  },
};

/**
 * Get ordered list of all Billick situations
 */
export function getAllBillickSituations(): BillickSituationConfig[] {
  return Object.values(BILLICK_SITUATION_CONFIGS).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

/**
 * Get situation config by type
 */
export function getBillickSituation(type: BillickSituationType): BillickSituationConfig {
  return BILLICK_SITUATION_CONFIGS[type];
}

/**
 * Get situation label by type
 */
export function getBillickSituationLabel(type: BillickSituationType): string {
  return BILLICK_SITUATION_CONFIGS[type].label;
}

/**
 * Validate situation type
 */
export function isValidBillickSituation(type: string): type is BillickSituationType {
  return Object.values(BILLICK_SITUATIONS).includes(type as BillickSituationType);
}

/**
 * Get Tailwind color classes for situation
 */
export function getBillickSituationColorClasses(type: BillickSituationType): {
  bg: string;
  text: string;
  border: string;
  hover: string;
} {
  const color = BILLICK_SITUATION_CONFIGS[type].color;
  
  const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      hover: 'hover:bg-blue-200',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      hover: 'hover:bg-green-200',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      hover: 'hover:bg-yellow-200',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      hover: 'hover:bg-orange-200',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      hover: 'hover:bg-red-200',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-300',
      hover: 'hover:bg-purple-200',
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      hover: 'hover:bg-indigo-200',
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      hover: 'hover:bg-gray-200',
    },
    pink: {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      border: 'border-pink-300',
      hover: 'hover:bg-pink-200',
    },
  };
  
  return colorMap[color] || colorMap.blue;
}
