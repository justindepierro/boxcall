// Simple stub functions for formation flipping - simplified from complex diagram logic
export const getOppositeFormationVariant = async (
  _formationId: string
): Promise<{
  id: string;
  name: string;
  direction: string;
} | null> => {
  // Simplified: just return null for now
  return null;
};

export const flipPlayName = (playName: string): string => {
  // Simple flip: replace Left/Right in names
  return playName
    .replace(/Left/g, "TEMP")
    .replace(/Right/g, "Left")
    .replace(/TEMP/g, "Right");
};

export const flipFormationDirection = (direction: string): string => {
  const raw = (direction || "").trim();
  const upper = raw.toUpperCase();

  // Preserve the incoming format when possible
  if (upper === "LEFT") return raw === "LEFT" ? "RIGHT" : "Right";
  if (upper === "RIGHT") return raw === "RIGHT" ? "LEFT" : "Left";
  if (upper === "L") return "R";
  if (upper === "R") return "L";
  if (upper === "LT") return raw === "LT" ? "RT" : "Rt";
  if (upper === "RT") return raw === "RT" ? "LT" : "Lt";

  return direction;
};

export const flipDiagramPositions = (diagramData: any) => {
  // Simplified: return original data unchanged
  return diagramData;
};
