/**
 * 🏈 FootballField Class
 * ----------------------
 * Utility class for handling football field math and yardline → slider mapping.
 *
 * Field Layout:
 *  - Left side (own goal line):  0, -10, -20, -30, -40
 *  - Midfield:                   50
 *  - Right side (opp goal line): 40, 30, 20, 10, 0
 *
 * Slider Mapping:
 *  - 0 (own)   → 0%
 *  -10         → 10%
 *  -20         → 20%
 *  -30         → 30%
 *  -40         → 40%
 *  50 (mid)    → 50%
 *  40          → 60%
 *  30          → 70%
 *  20          → 80%
 *  10          → 90%
 *  0 (opp)     → 100%
 */
export class FootballField {
  constructor() {
    this.maxYard = 50; // 50 yards each side of midfield
  }

  // =========================================================================
  // BASIC UTILITIES
  // =========================================================================

  /**
   * Clamp a yardline to the valid range (-49 to +50).
   * -50 is NOT allowed, because crossing to midfield (50) is handled manually.
   */
  clamp(val) {
    if (val <= -50) return -49;
    if (val > 50) return 50;
    return val;
  }

  /**
   * Snap to nearest 5-yard increment by default.
   */
  snap(val) {
    return Math.round(val / 5) * 5;
  }

  /**
   * Snap to a specified interval (e.g., 5 or 10 yards).
   */
  snapTo(val, interval = 5) {
    if (interval <= 0) return val;
    return Math.round(val / interval) * interval;
  }

  /**
   * Normalize a range so [start, end] are sorted left-to-right.
   */
  normalizeRange(a, b) {
    return a < b ? [a, b] : [b, a];
  }

  // =========================================================================
  // YARDLINE ↔ SLIDER PERCENT
  // =========================================================================

  /**
   * Convert yardline to slider percentage.
   * @param {number} yard
   */
  yardToPercent(yard) {
    yard = this.clamp(yard);

    if (yard === 50) return 50; // Midfield
    if (yard === 0) return 0; // Own goal line (leftmost)
    if (yard < 0) return Math.abs(yard); // Left side: -10 → 10%, -40 → 40%

    // Opponent side (right side)
    return 50 + (50 - yard); // 40 → 60%, 10 → 90%, 0 (opp) → 100
  }

  /**
   * Convert slider percentage (0–100) to yardline.
   */
  percentToYard(percent) {
    percent = Math.max(0, Math.min(100, percent));

    if (percent === 50) return 50;
    if (percent < 50) return -percent;
    return 100 - percent;
  }

  /**
   * Convert yardline range to { left, width }.
   */
  mapRangeToPercent(start, end) {
    const sPercent = this.yardToPercent(start);
    const ePercent = this.yardToPercent(end);
    return {
      left: Math.min(sPercent, ePercent),
      width: Math.abs(ePercent - sPercent),
    };
  }

  // =========================================================================
  // STEP & CROSSING LOGIC
  // =========================================================================

  /**
   * Step a yardline left/right across the field.
   * - UP (direction=+1) always moves right (slider →).
   * - DOWN (direction=-1) always moves left (slider ←).
   * - When moving right from -49, jump to 50 (midfield).
   * - When moving left from 50, jump to -49 (own side).
   */
  stepYardline(val, direction, step = 1) {
    console.log(`🟢 stepYardline called: val=${val}, direction=${direction}, step=${step}`);

    if (direction > 0) {
      // Moving right →
      if (val < 0) {
        // If we hit -49 and go further right, jump to 50.
        if (val + step > -49) {
          console.log(`➡ Crossing midfield: ${val} → 50`);
          return 50;
        }
      } else if (val >= 0) {
        // Normal increment on right side
        return this.clamp(val - step);
      }
    } else if (direction < 0) {
      // Moving left ←
      if (val > 0) {
        // If we're at 50 and moving left, jump to -49
        if (val - step < 50) {
          console.log(`⬅ Crossing midfield: ${val} → -49`);
          return -49;
        }
      } else if (val <= 0) {
        // Normal decrement on left side
        return this.clamp(val + step);
      }
    }

    // Default step + clamp
    let newVal = val + (direction > 0 ? step : -step);
    return this.clamp(newVal);
  }

  // =========================================================================
  // DISTANCE & LABELS
  // =========================================================================

  distance(start, end) {
    const sameSide = (start < 0 && end < 0) || (start > 0 && end > 0);
    return sameSide
      ? Math.abs(Math.abs(start) - Math.abs(end))
      : this.maxYard - Math.abs(start) + (this.maxYard - Math.abs(end));
  }

  describeYardLine(yard) {
    if (yard === 50) return 'Midfield';
    if (yard === 0) return 'Goal Line';
    return yard < 0 ? `Own ${Math.abs(yard)} yd` : `Opp ${yard} yd`;
  }

  describeRange(start, end) {
    return `${this.describeYardLine(start)} → ${this.describeYardLine(end)}`;
  }
}

export const field = new FootballField();
