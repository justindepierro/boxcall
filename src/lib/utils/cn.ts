/**
 * Utility for merging className strings with conditional logic
 * Similar to clsx but lightweight
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  return classes
    .flat(Infinity)
    .filter((c) => typeof c === "string" && c.length > 0)
    .join(" ");
}
