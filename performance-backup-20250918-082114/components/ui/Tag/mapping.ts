import type { TagVariant } from "./Tag";

export function mapCategoryToTagVariant(category: string): TagVariant {
  switch (category?.toLowerCase()) {
    case "offense":
    case "offensive":
      return "success";
    case "defense":
    case "defensive":
      return "danger";
    case "meeting":
      return "info";
    case "conditioning":
    case "training":
      return "warning";
    case "special-teams":
    case "special teams":
      return "accent";
    case "break":
    case "rest":
      return "outline";
    default:
      return "neutral";
  }
}

export function mapEventTypeToTagVariant(type: string): TagVariant {
  switch (type?.toLowerCase()) {
    case "game":
      return "danger";
    case "practice":
      return "info";
    case "meeting":
      return "warning";
    case "film":
    case "film session":
      return "accent";
    case "scrimmage":
      return "success";
    default:
      return "neutral";
  }
}
