export function clampYardLine(yardLine: number): number {
  if (!Number.isFinite(yardLine)) return 50;
  return Math.min(100, Math.max(0, Math.round(yardLine)));
}

/**
 * Convert canonical yard line (0..100, where 100 is opponent goal line)
 * into coach-friendly "ball on" format:
 * - Own side: `-30` (ball on your 30)
 * - Midfield: `50`
 * - Opp side: `+20` (ball on opponent 20)
 * - Own goal line: `-0`
 * - Opp goal line: `+0`
 */
export function yardLineToBallOn(yardLine: number): string {
  const yl = clampYardLine(yardLine);

  if (yl === 50) return "50";
  if (yl === 0) return "-0";
  if (yl === 100) return "+0";

  if (yl < 50) return `-${yl}`;
  return `+${100 - yl}`;
}

/**
 * Parse coach-friendly ball-on strings into canonical yard line (0..100).
 * Supports:
 * - `-30`, `+20`, `50`
 * - `-0`, `+0` for goal lines
 * - `0..100` as a fallback (treated as canonical yard line)
 */
export function parseBallOnToYardLine(input: string): number | null {
  const raw = input.trim();
  if (!raw) return null;

  // Signed "ball on" format
  const signed = raw.match(/^([+-])\s*(\d{1,2})$/);
  if (signed) {
    const sign = signed[1];
    const val = Number.parseInt(signed[2], 10);
    if (!Number.isFinite(val) || val < 0 || val > 50) return null;

    if (sign === "-") return clampYardLine(val);
    return clampYardLine(100 - val);
  }

  // Unsigned "50" special case
  if (raw === "50") return 50;

  // Fallback: allow canonical 0..100
  const canonical = raw.match(/^\d{1,3}$/);
  if (canonical) {
    const val = Number.parseInt(raw, 10);
    if (!Number.isFinite(val) || val < 0 || val > 100) return null;
    return clampYardLine(val);
  }

  return null;
}
