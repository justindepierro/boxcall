export function formatFieldName(field: string): string {
  // Convert snake_case / kebab-case / dot.notation into Title Case
  const normalized = field
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return field;

  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
