// Central layout & density primitives
import { densityTokens } from "./tokens";

export const layout = {
  containerX: "mx-auto w-full",
  // Horizontal padding responsive (paired with containerX)
  containerPadding: "px-4 sm:px-6 lg:px-8",
  gaps: {
    compact: "gap-4",
    comfortable: "gap-5",
  },
  cardPadding: {
    compact: "p-3",
    comfortable: "p-4",
  },
  headerPadding: {
    compact: "p-3",
    comfortable: "p-4",
  },
};

export function densityClass<T extends string>(
  map: Record<"compact" | "comfortable", T>,
  current: "compact" | "comfortable"
) {
  return map[current];
}

export const densityVars = {
  "--bc-card-padding-compact": densityTokens.compact.cardPadding,
  "--bc-card-padding-comfortable": densityTokens.comfortable.cardPadding,
};
