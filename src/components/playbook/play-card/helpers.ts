export const normalizePlayText = (value: string): string =>
  value
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const getPlayTypeColor = (type: string): string => {
  switch (type) {
    case "Pass":
      return "bg-interactive-accent text-inverse";
    case "Run":
      return "bg-brand-primary text-inverse";
    case "RPO":
      return "bg-brand-secondary text-inverse";
    case "Play Action":
      return "bg-status-warning text-gray-900";
    default:
      return "bg-gray-600 text-inverse";
  }
};

export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 85)
    return "text-text-inverse bg-brand-primary px-1.5 py-0.5 rounded font-semibold";
  if (confidence >= 70)
    return "text-jade-800 bg-jade-100 px-1.5 py-0.5 rounded font-medium";
  if (confidence >= 60)
    return "text-amber-800 bg-status-warning-bg px-1.5 py-0.5 rounded font-medium";
  if (confidence >= 50)
    return "text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded font-medium";
  return "text-text-inverse bg-status-error px-1.5 py-0.5 rounded font-semibold";
};

export const getTileGradient = (type: string): string => {
  switch (type) {
    case "Pass":
      return "from-electric-500 to-purple-500";
    case "Run":
      return "from-jade-500 to-emerald-500";
    case "RPO":
      return "from-navy-600 to-blue-600";
    case "Play Action":
      return "from-amber-500 to-orange-500";
    default:
      return "from-gray-500 to-slate-500";
  }
};

type TileIcon = "zap" | "trending-up" | "activity" | "target" | "circle";

export const getTileIcon = (type: string): TileIcon => {
  switch (type) {
    case "Pass":
      return "zap";
    case "Run":
      return "trending-up";
    case "RPO":
      return "activity";
    case "Play Action":
      return "target";
    default:
      return "circle";
  }
};

export const getTileConfidenceClasses = (confidence: number): {
  stroke: string;
  text: string;
} => {
  if (confidence >= 85) {
    return { stroke: "stroke-jade-500", text: "text-jade-600" };
  }
  if (confidence >= 70) {
    return { stroke: "stroke-emerald-500", text: "text-emerald-600" };
  }
  if (confidence >= 60) {
    return { stroke: "stroke-amber-500", text: "text-amber-700" };
  }
  return { stroke: "stroke-red-500", text: "text-red-600" };
};
