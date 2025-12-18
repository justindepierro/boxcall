/**
 * Utility for merging className strings with conditional logic
 * Similar to clsx but lightweight
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

function flattenClassValues(input: ClassValue[], out: unknown[]): void {
  for (const value of input) {
    if (Array.isArray(value)) {
      flattenClassValues(value, out);
      continue;
    }
    out.push(value);
  }
}

export function cn(...classes: ClassValue[]): string {
  const flat: unknown[] = [];
  flattenClassValues(classes, flat);
  return flat.filter((c) => typeof c === "string" && c.length > 0).join(" ");
}
