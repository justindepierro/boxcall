/**
 * 🏈 FootballField Class
 * -----------------------
 * Handles the math for mapping football yardlines (-50 to +50)
 * to a normalized slider range (0–100%).
 *
 * Visual Mapping (Slider):
 *   0%   10%   20%   30%   40%   50%   60%   70%   80%   90%  100%
 *   0   -10   -20   -30   -40    50    40    30    20    10     0
 *
 * Key Points:
 * - The "0%" position represents the left endzone (our goal line).
 * - "50%" represents midfield (yardline 50).
 * - "100%" represents the opponent's goal line (their 0).
 *
 * Conversion Steps:
 *   1. Yardline → X-Axis (−5 to +5)
 *   2. X-Axis → Slider Percent (0–100)
 *
 * Example:
 *   yardToPercent(-20) -> 20%
 *   yardToPercent(40)  -> 60%
 */
export class FootballField {
  constructor() {
    this.maxYard = 50; // Max yards from midfield to each goal line
  }

  /**
   * Clamp yardline between -50 and +50.
   * Ensures we never exceed the field bounds.
   */
  clamp(val) {
    const clamped = Math.max(-this.maxYard, Math.min(this.maxYard, val));
    console.log(`[clamp] Input=${val} → ${clamped}`);
    return clamped;
  }

  /**
   * Snap yardline to the nearest 5-yard increment.
   */
  snap(val) {
    const snapped = Math.round(val / 5) * 5;
    console.log(`[snap] Input=${val} → ${snapped}`);
    return snapped;
  }

  /**
   * Normalize a range so that start < end.
   * (This is useful for calculating widths.)
   */
  normalizeRange(a, b) {
    const norm = a < b ? [a, b] : [b, a];
    console.log(`[normalizeRange] Input=(${a}, ${b}) → ${norm}`);
    return norm;
  }

  /**
   * Convert a football yardline (-50 to +50)
   * to a slider percentage (0–100).
   *
   * @param {number} yard - Yardline value.
   * @returns {number} Slider percentage (0–100).
   */
  yardToPercent(yard) {
    yard = this.clamp(yard);

    let percent;

    if (yard < 0) {
      // Our side: 0% to 50%
      percent = (Math.abs(yard) / 50) * 50; // -10 -> 10%, -40 -> 40%
    } else if (yard > 0) {
      // Opponent side: 50% to 100%
      percent = 50 + ((50 - yard) / 50) * 50; // 40 -> 60%, 10 -> 90%
    } else {
      // Special cases: 0 or midfield
      percent = yard === 0 ? 100 : 50; // Opponent goal line or midfield
    }

    console.log(`[yardToPercent] yard=${yard} → ${percent.toFixed(2)}%`);
    return percent;
  }

  /**
   * Reverse: Convert slider percent (0–100)
   * back to a football yardline (-50 to +50).
   *
   * @param {number} percent
   * @returns {number} Yardline.
   */
  percentToYard(percent) {
    let yard;

    if (percent <= 50) {
      // Our side: 0% to 50%
      yard = -(percent / 50) * 50; // 20% → -20
    } else {
      // Opponent side: 50% to 100%
      yard = 50 - ((percent - 50) / 50) * 50; // 70% → 30
    }

    console.log(`[percentToYard] percent=${percent} → yard=${yard}`);
    return this.clamp(this.snap(yard));
  }

  /**
   * Map a start and end yardline to { left, width } in percentages.
   *
   * @param {number} start - Start yardline.
   * @param {number} end - End yardline.
   * @returns {{ left: number, width: number }}
   */
  mapRangeToPercent(start, end) {
    const [s, e] = this.normalizeRange(start, end);
    const sPercent = this.yardToPercent(s);
    const ePercent = this.yardToPercent(e);

    const left = Math.min(sPercent, ePercent);
    const width = Math.abs(ePercent - sPercent);

    console.log(
      `[mapRangeToPercent] start=${start}, end=${end}, s%=${sPercent}, e%=${ePercent}, left=${left}, width=${width}`
    );

    return { left, width };
  }

  /**
   * Distance (in yards) between two yardlines.
   * Handles crossing midfield correctly.
   */
  distance(start, end) {
    const sameSide = (start < 0 && end < 0) || (start > 0 && end > 0);
    const dist = sameSide
      ? Math.abs(Math.abs(start) - Math.abs(end))
      : this.maxYard - Math.abs(start) + (this.maxYard - Math.abs(end));

    console.log(`[distance] start=${start}, end=${end} → ${dist} yards`);
    return dist;
  }

  /**
   * Human-readable yardline label.
   */
  describeYardLine(yard) {
    if (yard === 50) return 'Midfield';
    if (yard === 0) return 'Goal Line';
    return yard < 0 ? `Own ${Math.abs(yard)} yd` : `Opp ${yard} yd`;
  }

  /**
   * Human-readable range label.
   */
  describeRange(start, end) {
    return `${this.describeYardLine(start)} → ${this.describeYardLine(end)}`;
  }
}

// Export singleton
export const field = new FootballField();
